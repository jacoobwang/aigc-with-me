import assert from "node:assert/strict";
import { rankTargetLinks } from "@/lib/target-url";

const ranked = rankTargetLinks("https://aiwith.me/de/tools/13f-chat", [
  {
    text: "OpenArt",
    href: "https://openart.ai/home/?ref=aiwithme",
  },
  {
    text: "Besuch 13F.chat",
    href: "https://13f.chat?utm_source=aiwith.me&ref=aiwith.me",
  },
]);

assert.equal(ranked[0]?.href, "https://13f.chat?utm_source=aiwith.me&ref=aiwith.me");
