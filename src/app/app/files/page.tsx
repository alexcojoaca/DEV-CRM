"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FilesPage() {
  const [bytesUsed, setBytesUsed] = useState(0);
  const [bytesLimit, setBytesLimit] = useState(1073741824);

  useEffect(() => {
    fetch("/api/files/usage")
      .then((r) => r.json())
      .then((data) => {
        if (data.bytesUsed != null) setBytesUsed(data.bytesUsed);
        if (data.bytesLimit != null) setBytesLimit(data.bytesLimit);
      })
      .catch(() => {});
  }, []);

  const usedMB = (bytesUsed / (1024 * 1024)).toFixed(1);
  const limitMB = (bytesLimit / (1024 * 1024)).toFixed(0);
  const pct = bytesLimit > 0 ? Math.min(100, (bytesUsed / bytesLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Spațiu de stocare" description="Utilizare spațiu pentru fișiere încărcate" />
      <Card>
        <CardHeader>
          <CardTitle>Spațiu utilizat</CardTitle>
          <CardDescription>
            Limită implicită: 1 GB per utilizator. Fișierele încărcate la liste, clienți sau documente se contorizează aici.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{usedMB} MB / {limitMB} MB</span>
            <span className="font-medium">{pct.toFixed(0)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-purple-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
