"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth-actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.push("/login");
    });
  }

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
