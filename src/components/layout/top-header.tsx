"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/appointments": "Appointments",
  "/services": "Services",
  "/customers": "Clients",
  "/settings": "Settings",
};

export function TopHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Appointments";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center h-14 px-4">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
