import Container from "@/components/container";
import HomeHero from "@/components/home/home-hero";

export default function HomeLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-[-5rem] h-[34rem] bg-[radial-gradient(circle_at_50%_30%,rgba(103,232,249,0.18),rgba(224,242,254,0.12)_32%,rgba(248,250,252,0.48)_62%,rgba(255,255,255,0)_82%)] dark:bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.12),rgba(15,23,42,0.22)_36%,rgba(2,6,23,0)_76%)]" />
      <Container className="relative mt-12 mb-16 flex flex-col gap-12">
        <HomeHero />

        <div className="flex flex-col md:flex-row gap-8">
          {/* right content: item grid */}
          <div className="flex-1">
            <div className="flex flex-col gap-8">
              {children}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
