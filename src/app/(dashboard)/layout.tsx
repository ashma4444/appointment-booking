import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";
import { Suspense } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense>
        <TopHeader />
      </Suspense>
      <main className="flex-1 pb-20">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
