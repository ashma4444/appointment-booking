"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { changePin } from "@/actions/auth-actions";
import { toast } from "sonner";

export function ChangePin() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPin !== confirmPin) {
      toast.error("New PINs do not match");
      return;
    }

    startTransition(async () => {
      const result = await changePin(currentPin, newPin);
      if (result.success) {
        toast.success("PIN changed successfully");
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
      } else {
        toast.error(result.error ?? "Failed to change PIN");
      }
    });
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Security</h2>
      <Card>
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">Change PIN</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label>Current PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={currentPin}
                onChange={(e) =>
                  setCurrentPin(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Current PIN"
              />
            </div>
            <div className="space-y-2">
              <Label>New PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="New PIN"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Confirm New PIN"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                isPending ||
                currentPin.length < 4 ||
                newPin.length < 4 ||
                confirmPin.length < 4
              }
            >
              {isPending ? "Changing..." : "Change PIN"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
