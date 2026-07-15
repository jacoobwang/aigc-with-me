import type { SiteConfig } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "AigcWith.me",
  tagline: "Real-Time ⚡️ Access to Global AI Tools",
  description:
    "Aigc With Me is the largest Free AI tools directory. Over 1000+ AI Websites and AI Tools.",
  keywords: [
    "Directory",
    "Free AI tools",
    "AI Tools Directory",
    "AI Tools",
    "Real-Time Access AI Tools",
    "AIGC Tools",
  ],
  author: "Mkdirs",
  url: SITE_URL,
  logo: "/logo.svg",
  // set the logoDark if you have put the logo-dark.png in the public folder
  // logoDark: "/logo-dark.png",
  // please increase the version number when you update the image
  image: `${SITE_URL}/og.png?v=1`,
  mail: "support@aigcwith.me",
  utm: {
    source: "aigcwith.me",
    medium: "referral",
    campaign: "navigation",
  },
  links: {
    // leave it blank if you don't want to show the link (don't delete)
    // twitter: "https://x.com/MkdirsHQ",
    // github: "https://github.com/MkdirsHQ",
    // youtube: "https://www.youtube.com/@MkdirsHQ",
  },
};
