import Container from "@/components/container";
import { StackBuilder } from "@/components/stack-builder/stack-builder";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "AI Stack Builder",
  description:
    "Describe your workflow and get an AI-planned tool stack matched with tools from the directory.",
  canonicalUrl: `${siteConfig.url}/stack-builder`,
});

export default function StackBuilderPage() {
  return (
    <Container className="my-12">
      <StackBuilder />
    </Container>
  );
}
