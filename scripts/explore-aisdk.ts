import { requireQwenModel } from "@/lib/ai-model";
import type { Category, Tag } from "@/sanity.types";
import { createClient } from "@sanity/client";
import { generateObject, generateText } from "ai";
import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

// make sure you have set the environment variables in .env file
const client = createClient({
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-08-01",
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_TOKEN,
});

/**
 * AI SDK API Integration (using Qwen through DashScope)
 *
 * This module provides functions to interact with the AI SDK,
 * allowing you to fetch metadata from a given URL.
 *
 * Available functions:
 * - aisdkFetch: Fetch data from AI SDK for the specified message
 */

// https://sdk.vercel.ai/docs/foundations/overview
// https://sdk.vercel.ai/docs/getting-started/nodejs
// test successfully: pnpm run aisdk:fetch "https://mkdirs.com"
export const aisdkFetch = async (url: string) => {
  try {
    const response = await fetch(url);
    const htmlContent = await response.text();

    const prompt = `Analyze the following webpage content and URL: ${url}

    Webpage content:
    ${htmlContent}

    Based on the above content, provide the following information in a structured format:
    1. Title of the page (extract from content if possible, just return the short name, no description)
    2. Brief description (1 sentence summarizing the main content, no more than 160 characters)
    3. Detailed introduction (in markdown format, include the key features and prices of the product)
    
    Format your response as follows:
    {
      "title": "...",
      "description": "...",
      "introduction": "... (in markdown)"
    }`;

    const { text } = await generateText({
      model: requireQwenModel(),
      prompt: prompt,
    });

    console.log("aisdkFetch, url:", url, "response:", text);
    return text;
  } catch (error) {
    console.error(`Error fetching data for URL ${url}:`, error);
    return null;
  }
};

// https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai#schema-limitations
// test successfully: pnpm run aisdk:structure "https://mkdirs.com"
export const aisdkStructure = async (url: string) => {
  try {
    // 获取实际的分类和标签数据
    const categories = await client.fetch<Category[]>(`*[_type == "category"]`);
    const tags = await client.fetch<Tag[]>(`*[_type == "tag"]`);

    const schema = z.object({
      title: z.string().describe("A short, concise name without description"),
      description: z
        .string()
        .max(160)
        .describe("One sentence summary, max 160 characters"),
      introduction: z
        .string()
        .describe("Detailed introduction in markdown format"),
    });

    const response = await fetch(url);
    const htmlContent = await response.text();

    const result = await generateObject({
      model: requireQwenModel(),
      schema,
      prompt: `Analyze the following content and provide structured information:
      
      Content to analyze:
      ${htmlContent}
      
      Please provide a concise title, brief description, and detailed introduction.
      The introduction should be in markdown format, include the key features and prices of the product.`,
    });

    console.log(
      "aisdkStructure, url:",
      url,
      "structured response:",
      result,
    );
    return result;
  } catch (error) {
    console.error(`Error processing url for ${url}:`, error);
    return null;
  }
};

// get operation from command line
const operation = process.argv[2];
// get message from command line (new)
const url = process.argv[3];

// run operation based on command line argument
const runOperation = async () => {
  switch (operation) {
    case "fetch": {
      if (!url) {
        console.error("Please provide a url as the second argument");
        return;
      }
      const result = await aisdkFetch(url);
      console.log("aisdkFetch, url:", url, "result:", result);
      break;
    }

    case "structure": {
      if (!url) {
        console.error("Please provide a url as the second argument");
        return;
      }
      const result = await aisdkStructure(url);
      console.log("aisdkStructure, url:", url, "result:", result);
      break;
    }

    default:
      console.log(`
Available commands:
- fetch <url>: Fetch data for the specified url
- structure <url>: Fetch data for the specified url and return structured data
      `);
  }
};

// run operation
runOperation().catch(console.error);
