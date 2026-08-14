"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loginWithPin } from "@/actions/auth-actions";

export function LoginForm() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await loginWithPin(pin);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error ?? "Login failed");
        setPin("");
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Appointment Booking</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your PIN to continue
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN Code</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter PIN"
              autoFocus
              autoComplete="current-password"
              className="text-center text-lg tracking-widest"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || pin.length < 4}
          >
            {isPending ? "Verifying..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
