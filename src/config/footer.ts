import type { FooterConfig } from "@/types";

export const footerConfig: FooterConfig = {
  links: [
    {
      title: "Product",
      items: [
        { title: "Search", href: "/search" },
        { title: "AI Stack Builder", href: "/stack-builder" },
        { title: "Task Navigator", href: "/tasks" },
        { title: "Tag", href: "/tag" },
      ],
    },
    {
      title: "Resources",
      items: [
        { title: "Alternatives", href: "/alternatives" },
        { title: "Submit", href: "/submit" },
        { title: "Studio", href: "/studio", external: true },
      ],
    },
    {
      title: "Pages",
      items: [
        { title: "Blog", href: "/blog" },
        { title: "Collection", href: "/collection" },
      ],
    },
    {
      title: "Company",
      items: [
        { title: "Sitemap", href: "/sitemap.xml" },
      ],
    },
  ],
};
