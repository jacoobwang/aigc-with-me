"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Logo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const logoLight = siteConfig.logo;
  const logoDark = siteConfig.logoDark ?? logoLight;

  // During server-side rendering and initial client render, always use logoLight
  // This prevents hydration mismatch
  const logo = mounted && resolvedTheme === "dark" ? logoDark : logoLight;

  // Only show theme-dependent UI after hydration to prevent mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Image
      src={logo}
      alt="Logo"
      title="Logo"
      width={96}
      height={96}
      className={cn("size-8 rounded-md", className)}
    />
  );
}
