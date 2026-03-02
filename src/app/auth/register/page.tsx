"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName: fullName || undefined }),
      });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        setError(res.ok ? "Răspuns invalid de la server." : `Eroare server (${res.status}). Verifică că baza de date rulează și că ai rulat: npx prisma generate`);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Înregistrarea a eșuat.");
        return;
      }
      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      setError("Eroare de rețea. Verifică că serverul rulează (npm run dev) și că baza de date este pornită și DATABASE_URL este setat corect în .env.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-purple-200 bg-white p-6 shadow-lg">
        <h1 className="text-center text-xl font-semibold text-foreground">Înregistrare</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border-purple-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nume (opțional)</Label>
            <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="border-purple-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Parolă (min. 8)</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required className="border-purple-200" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
            {loading ? "Se încarcă…" : "Creează cont"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Ai cont? <Link href="/auth/login" className="text-purple-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
