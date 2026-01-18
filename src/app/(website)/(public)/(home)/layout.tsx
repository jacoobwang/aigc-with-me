import Container from "@/components/container";
import HomeHero from "@/components/home/home-hero";

export default function HomeLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Container className="mt-12 mb-16 flex flex-col gap-12">
      <HomeHero />

      <div className="flex flex-col md:flex-row gap-8">
        {/* right content: item grid */}
        <div className="flex-1">
          <div className="flex flex-col gap-8">
            {children}
          </div>
        </div>
      </div>
    </Container >
  );
}
