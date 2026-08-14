"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusColor, getStatusLabel } from "@/lib/constants";
import { formatNepaliDateShort } from "@/lib/nepali-date";
import type { AppointmentWithRelations } from "@/types";

interface CustomerSearchProps {
  query: string;
  appointments: AppointmentWithRelations[];
}

export function CustomerSearch({ query, appointments }: CustomerSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState(query);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`${pathname}?q=${encodeURIComponent(searchValue.trim())}`);
    }
  }

  // Group by phone number
  const grouped = appointments.reduce<Record<string, AppointmentWithRelations[]>>((acc, apt) => {
    const key = apt.phoneNumber;
    if (!acc[key]) acc[key] = [];
    acc[key].push(apt);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Customer History</h2>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by phone or name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </form>

      {query && appointments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No appointments found for &quot;{query}&quot;
        </p>
      )}

      {Object.entries(grouped).map(([phone, appts]) => {
        const name = appts.find((a) => a.customerName)?.customerName;
        return (
          <Card key={phone}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  {name && <p className="text-sm font-medium">{name}</p>}
                  <p className="text-xs text-muted-foreground font-mono">{phone}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {appts.length} visit{appts.length > 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="space-y-1.5">
                {appts.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-2 text-xs border-l-2 border-muted pl-3 py-1"
                  >
                    <span className="text-muted-foreground shrink-0">
                      {formatNepaliDateShort(apt.date)}
                    </span>
                    <span className="text-muted-foreground">&mdash;</span>
                    <span>{apt.branch.name}</span>
                    <span className="text-muted-foreground">&mdash;</span>
                    <span className="font-medium">{apt.service.name}</span>
                    <Badge className={`text-[10px] h-4 px-1 ml-auto ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {!query && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Search by phone number or customer name to see appointment history.
        </p>
      )}
    </div>
  );
}
