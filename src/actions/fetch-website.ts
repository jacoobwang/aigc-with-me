"use server";

import { slugify } from "@/lib/utils";
import type { Category, Tag } from "@/sanity.types";
import { sanityClient } from "@/sanity/lib/client";
import { deepseek } from '@ai-sdk/deepseek';
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateObject } from "ai";
import { z } from "zod";

/**
 * Website info schema
 *
 * 1. when AI generates the image and icon, it will return the image URL and icon URL
 * 2. when the image and icon are uploaded to Sanity, the image reference Id and icon reference Id will be set to the image and icon
 * 3. when this server action is called, it will return the image url and icon url, and the image reference Id and icon reference Id
 */
const WebsiteInfoSchema = z.object({
  name: z.string().describe("A short, concise name without description"),
  description: z
    .string()
    .max(160)
    .describe("One sentence summary, max 160 characters"),
  introduction: z.string().describe("Detailed introduction in markdown format"),
  categories: z
    .array(z.string())
    .describe("Array of category names that best match the content"),
  tags: z
    .array(z.string())
    .describe("Array of tag names that best match the content"),
  image: z.string().describe("Website screenshot image URL"),
  icon: z.string().describe("Website logo image URL"),
  imageId: z
    .string()
    .optional()
    .describe("Website screenshot image reference Id"),
  iconId: z.string().optional().describe("Website logo image reference Id"),
});

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
  data?: z.infer<typeof WebsiteInfoSchema>;
};

/**
 * fetch info for the specified url
 */
export async function fetchWebsite(url: string): Promise<ServerActionResponse> {
  try {
    // 标准化 URL 以便匹配
    const normalizeUrl = (urlString: string) => {
      try {
        // 移除协议、www 和尾部斜杠，以便更灵活地匹配
        return urlString
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .replace(/\/$/, '');
      } catch (error) {
        return urlString;
      }
    };
    
    const normalizedUrl = normalizeUrl(url);
    console.log("Searching for normalized URL in Sanity:", normalizedUrl);
    
    // 查询 Sanity CMS，使用更灵活的匹配方式
    const existingItems = await sanityClient.fetch(
      `*[_type == "item"]{
        _id,
        name,
        link,
        description,
        introduction,
        "categories": categories[]->{_id, name},
        "tags": tags[]->{_id, name},
        "image": image.asset->{_id, url},
        "icon": icon.asset->{_id, url}
      }`
    );
    
    // 手动过滤匹配的项目
    const existingItem = existingItems.find((item: any) => 
      item.link && normalizeUrl(item.link) === normalizedUrl
    );

    if (existingItem) {
      console.log("Found existing item in Sanity CMS:", existingItem);
      // 如果已有数据，直接返回
      return {
        status: "success",
        data: {
          name: existingItem.name,
          description: existingItem.description,
          introduction: existingItem.introduction,
          categories: existingItem.categories.map((c: any) => c.name),
          tags: existingItem.tags.map((t: any) => t.name),
          image: existingItem.image?.url || "",
          icon: existingItem.icon?.url || "",
          imageId: existingItem.image?._id || "",
          iconId: existingItem.icon?._id || ""
        }
      };
    }

    console.log("No existing item found in Sanity CMS, fetching with AI...");

    if (!process.env.DEFAULT_AI_PROVIDER) {
      return {
        status: "error",
        message: "AI submit is not supported",
      };
    }
    
    const data = await fetchWebsiteInfo(url);
    if (data === null) {
      return {
        status: "error",
        message: "Failed to fetch website info",
      };
    }
    return {
      status: "success",
      message: "Successfully fetched website info",
      data,
    };
  } catch (error) {
    console.error("fetchWebsite, fetch website:", url, "error:", error);
    return {
      status: "error",
      message: "Failed to fetch website info",
    };
  }
}

/**
 * fetch website info for the specified url with Microlink and AI SDK
 */
export const fetchWebsiteInfo = async (url: string) => {
  const fetchedData = await fetchWebsiteInfoWithAI(url);
  if (fetchedData === null) {
    console.error("fetchWebsiteInfo, url:", url, "fetchedData is null");
    return null;
  }
  console.log("fetchWebsiteInfo, url:", url, "fetchedData:", fetchedData);

  const websiteInfo = WebsiteInfoSchema.parse({
    name: fetchedData.object.name,
    description: fetchedData.object.description,
    introduction: fetchedData.object.introduction,
    categories: fetchedData.object.categories,
    tags: fetchedData.object.tags,
    // image: microlinkData?.image?.url, // maybe we can use Microlink to get the screenshot as fallback
    image: fetchedData.object.image,
    // icon: microlinkData?.logo?.url, // maybe we can use Microlink to get the logo as fallback
    // TODO: we don't use favicon URL, instead, we use Google API to get the logo
    icon: `https://s2.googleusercontent.com/s2/favicons?domain=${url}&sz=128`,
  });
  console.log("fetchWebsiteInfo, url:", url, "websiteInfo:", websiteInfo);

  if (websiteInfo.image && websiteInfo.icon) {
    // Fetch icon and image
    const [iconResponse, imageResponse] = await Promise.all([
      fetch(websiteInfo.icon),
      fetch(websiteInfo.image),
    ]);

    console.log("fetchWebsiteInfo, start fetching icon and image");
    const [iconArrayBuffer, imageArrayBuffer] = await Promise.all([
      iconResponse.arrayBuffer(),
      imageResponse.arrayBuffer(),
    ]);

    // Convert ArrayBuffer to Buffer for Sanity upload
    const [iconBuffer, imageBuffer] = [
      Buffer.from(iconArrayBuffer),
      Buffer.from(imageArrayBuffer),
    ];

    console.log("fetchWebsiteInfo, start uploading icon and image to sanity");
    // Upload icon and image to sanity
    const [iconAsset, imageAsset] = await Promise.all([
      sanityClient.assets.upload("image", iconBuffer, {
        filename: `${slugify(websiteInfo.name)}_logo.png`,
      }),
      sanityClient.assets.upload("image", imageBuffer, {
        filename: `${slugify(websiteInfo.name)}_image.png`,
      }),
    ]);

    console.log("fetchWebsiteInfo, url:", url, "iconAsset:", iconAsset);
    console.log("fetchWebsiteInfo, url:", url, "imageAsset:", imageAsset);

    websiteInfo.icon = iconAsset.url;
    websiteInfo.image = imageAsset.url;
    websiteInfo.iconId = iconAsset._id;
    websiteInfo.imageId = imageAsset._id;
    console.log("fetchWebsiteInfo, url:", url, "websiteInfo:", websiteInfo);
  }

  return websiteInfo;
};

/**
 * fetch website info for the specified url with AI SDK
 */
export const fetchWebsiteInfoWithAI = async (url: string) => {
  try {
    // get all categories and tags
    const categories = await sanityClient.fetch<Category[]>(
      `*[_type == "category"]`,
    );
    const tags = await sanityClient.fetch<Tag[]>(`*[_type == "tag"]`);
    const availableCategories = categories.map((cat) => cat.name);
    const availableTags = tags.map((tag) => tag.name);

    const response = await fetch(url);
    // TODO: we need to convert htmlContent to simple content for AI to analyze (save time and cost)
    // TODO: if the content is too long, error will be thrown, so sometimes AI submit will fail
    // Google Gemini model support more tokens than DeepSeek model, so we prefer Google Gemini model
    const htmlContent = await response.text();

    let aiModel = null;
    if (process.env.DEFAULT_AI_PROVIDER === "google" && process.env.GOOGLE_GENERATIVE_AI_API_KEY !== undefined) {
      aiModel = google("gemini-3.5-flash-lite", {
        structuredOutputs: true,
      });
    } else if (process.env.DEFAULT_AI_PROVIDER === "deepseek" && process.env.DEEPSEEK_API_KEY !== undefined) {
      aiModel = deepseek("deepseek-chat", {
        // structuredOutputs: true,
      });
    } else if (process.env.DEFAULT_AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY !== undefined) {
      aiModel = openai("gpt-4o-mini", {
        structuredOutputs: true,
      });
    } else if (process.env.DEFAULT_AI_PROVIDER === "xai" && process.env.XAI_API_KEY !== undefined) {
      aiModel = xai("grok-3-beta", {
        // structuredOutputs: true,
      });
    } else if (process.env.DEFAULT_AI_PROVIDER === "openrouter" && process.env.OPENROUTER_API_KEY !== undefined) {
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      aiModel = openrouter.chat(process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet');
    }

    if (aiModel === null) {
      return null;
    }
    console.log("fetchWebsiteInfoWithAI, aiModel:", aiModel);

    const result = await generateObject({
      model: aiModel,
      schema: WebsiteInfoSchema,
      prompt: `Analyze the following webpage content and provide structured information:
      
      Content to analyze:
      ${htmlContent}
      
      Available Categories:
      ${availableCategories.join(", ")}
      
      Available Tags:
      ${availableTags.join(", ")}
      
      Please analyze the content and provide:
      1. A concise title (just the name, no description)
      2. A brief description (one sentence, max 160 characters)
      3. A detailed introduction in markdown format (include key features and use cases)
      4. Select appropriate categories from the available categories list (return array of names)
      5. Select relevant tags from the available tags list (return array of names)
      6. Provide a screenshot image full URL, choose open graph image URL if possible
      7. Provide a website logo full URL, choose website favicon URL if possible
      
      Focus on technical aspects and practical applications. If the content is a tool or service, 
      emphasize its main features, target users, and unique selling points.`,
    });

    // console.log("fetchWebsiteInfoWithAI, url:", url, "result:", result);

    // filter AI generated categories and tags to make sure they are in the available categories and tags
    const filteredCategories = result.object.categories.filter((category) => availableCategories.includes(category));
    const filteredTags = result.object.tags.filter((tag) => availableTags.includes(tag));
    result.object.categories = filteredCategories;
    result.object.tags = filteredTags;

    return result;
  } catch (error) {
    console.error(
      `fetchWebsiteInfoWithAI, error processing url for ${url}:`,
      error,
    );
    return null;
  }
};
