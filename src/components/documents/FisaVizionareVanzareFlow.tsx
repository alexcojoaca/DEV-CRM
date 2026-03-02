"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { getDocumentTypeBySlug } from "@/features/documents/documentTypes";
import { useSession } from "@/features/session/useSession";
import {
  getAgencyAgentSettings,
  agencyToFormFields,
  agentToFormFields,
} from "@/features/settings/agencyAgentSettings";
import Link from "next/link";
import { PenLine, Send, Copy, MessageCircle, FileCheck, Smartphone, FileText } from "lucide-react";

const FISA_SLUG = "fisa-vizionare-vanzare";
const docType = getDocumentTypeBySlug(FISA_SLUG)!;
const STORAGE_KEY_MODE = "fisa-vizionare-mode";

/** true = telefon/tabletă (max-width 1024px), false = PC */
function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    setIsMobileOrTablet(mq.matches);
    const fn = () => setIsMobileOrTablet(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return isMobileOrTablet;
}

function getStoredMode(): "sign-now" | "send-link" {
  if (typeof window === "undefined") return "send-link";
  try {
    const v = sessionStorage.getItem(STORAGE_KEY_MODE);
    if (v === "sign-now" || v === "send-link") return v;
  } catch {}
  return "send-link";
}

function formatScheduledAt(iso: string): { data: string; ora: string; dataForInput: string } {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { data: "", ora: "", dataForInput: "" };
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      data: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`,
      ora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      dataForInput: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    };
  } catch {
    return { data: "", ora: "", dataForInput: "" };
  }
}

export function FisaVizionareVanzareFlow() {
  const searchParams = useSearchParams();
  const { user } = useSession();
  const isMobileOrTablet = useIsMobileOrTablet();
  const [mode, setMode] = useState<"sign-now" | "send-link">("send-link");
  const [linkResult, setLinkResult] = useState<{ link: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [agentForm, setAgentForm] = useState({
    data_vizionarii: "",
    ora_vizionarii: "",
    tip_imobil: "",
    adresa_completa: "",
    adresa_publica: "",
    comision_procent: "",
  });

  useEffect(() => {
    setMode(getStoredMode());
  }, []);

  useEffect(() => {
    const scheduledAt = searchParams.get("scheduledAt");
    const tipImobil = searchParams.get("tipImobil");
    setAgentForm((prev) => {
      let next = { ...prev };
      if (scheduledAt) {
        const { dataForInput, ora } = formatScheduledAt(scheduledAt);
        if (dataForInput || ora) next = { ...next, data_vizionarii: dataForInput, ora_vizionarii: ora };
      }
      if (tipImobil?.trim()) next = { ...next, tip_imobil: tipImobil.trim() };
      return next;
    });
  }, [searchParams]);

  const setModeAndStore = (m: "sign-now" | "send-link") => {
    setMode(m);
    try {
      sessionStorage.setItem(STORAGE_KEY_MODE, m);
    } catch {}
  };

  const handleCreateLink = async () => {
    if (!isMobileOrTablet) {
      if (!agentForm.data_vizionarii?.trim() || !agentForm.tip_imobil?.trim() || !agentForm.adresa_completa?.trim() || !agentForm.adresa_publica?.trim() || !agentForm.comision_procent?.trim()) {
        alert("Completează toate câmpurile obligatorii: Data, Tip imobil, Adresa completă, Adresa publică, Comision.");
        return;
      }
    }
    setSending(true);
    setLinkResult(null);
    try {
      const settings = getAgencyAgentSettings();
      const res = await fetch("/api/documents/fisa-vizionare-vanzare/remote/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? "anonymous",
          ...agentForm,
          ...agencyToFormFields(settings.agency),
          ...agentToFormFields(settings.agent),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare");
      setLinkResult({ link: data.link });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Eroare la generare link.");
    } finally {
      setSending(false);
    }
  };

  const copyLink = () => {
    if (linkResult?.link) {
      navigator.clipboard.writeText(linkResult.link);
      alert("Link copiat în clipboard.");
    }
  };

  const handlePreviewPdf = async () => {
    setPreviewing(true);
    try {
      const settings = getAgencyAgentSettings();
      const res = await fetch("/api/documents/fisa-vizionare-vanzare/remote/preview-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...agentForm,
          ...agencyToFormFields(settings.agency),
          ...agentToFormFields(settings.agent),
        }),
      });
      if (!res.ok) throw new Error("Eroare la previzualizare.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Eroare la previzualizare.");
    } finally {
      setPreviewing(false);
    }
  };

  const whatsappUrl = linkResult?.link
    ? `https://wa.me/?text=${encodeURIComponent("Te invit să semnezi fișa de vizionare: " + linkResult.link)}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-purple-100 pb-4">
        {isMobileOrTablet && (
          <Button
            variant={mode === "sign-now" ? "default" : "outline"}
            className={mode === "sign-now" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
            onClick={() => {
              setModeAndStore("sign-now");
              setLinkResult(null);
            }}
          >
            <PenLine className="mr-2 h-4 w-4" />
            Semnează acum
          </Button>
        )}
        <Button
          variant={mode === "send-link" ? "default" : "outline"}
          className={mode === "send-link" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
          onClick={() => setModeAndStore("send-link")}
        >
          <Send className="mr-2 h-4 w-4" />
          Trimite către client să semneze
        </Button>
      </div>

      {!isMobileOrTablet && (
        <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Smartphone className="h-5 w-5 shrink-0" />
          Funcția „Semnează acum” este disponibilă doar pe telefon sau tabletă. Pe PC folosește „Trimite către client să semneze”.
        </p>
      )}

      {mode === "sign-now" && isMobileOrTablet && <DocumentForm documentType={docType} />}

      {mode === "send-link" && (
        <>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href="/documents/signed">
                <FileCheck className="mr-2 h-4 w-4" />
                Documente semnate
              </Link>
            </Button>
          </div>
        <Card className="border-purple-100 bg-white">
          <CardHeader>
            <h2 className="text-lg font-semibold">DETALII VIZIONARE (COMPLETATE DE AGENT)</h2>
            <p className="text-sm text-muted-foreground">
              Completează detaliile; linkul generat îl trimiți clientului pentru semnare. Adresa completă va apărea în PDF-ul semnat; clientul vede doar adresa publică până la semnare.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data vizionării</Label>
                <Input
                  type="date"
                  value={agentForm.data_vizionarii}
                  onChange={(e) => setAgentForm((f) => ({ ...f, data_vizionarii: e.target.value }))}
                  placeholder="ex: 28.01.2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Ora vizionării</Label>
                <Input
                  type="time"
                  value={agentForm.ora_vizionarii}
                  onChange={(e) => setAgentForm((f) => ({ ...f, ora_vizionarii: e.target.value }))}
                  placeholder="ex: 18:30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tip imobil</Label>
              <Input
                value={agentForm.tip_imobil}
                onChange={(e) => setAgentForm((f) => ({ ...f, tip_imobil: e.target.value }))}
                placeholder="ex: Apartament 2 camere"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresa COMPLETĂ</Label>
              <Input
                value={agentForm.adresa_completa}
                onChange={(e) => setAgentForm((f) => ({ ...f, adresa_completa: e.target.value }))}
                placeholder="ex: București, Sector 1, Strada X, nr. Y, ap. Z"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresa PUBLICĂ (ce vede clientul pe pagină)</Label>
              <Input
                value={agentForm.adresa_publica}
                onChange={(e) => setAgentForm((f) => ({ ...f, adresa_publica: e.target.value }))}
                placeholder="ex: București, Sector 1 (zonă)"
              />
              <p className="text-xs text-muted-foreground">
                Aici completezi zona sau strada (fără număr și fără apartament), pentru a nu divulga adresa completă înainte de semnare. Adresa completă va fi vizibilă clientului doar în documentul PDF după semnare.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Comision</Label>
              <Input
                value={agentForm.comision_procent}
                onChange={(e) => setAgentForm((f) => ({ ...f, comision_procent: e.target.value }))}
                placeholder="ex: 2% / 3% + TVA / negociabil"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Datele agenției și ale agentului se completează automat din Setări și apar în PDF-ul semnat. La generarea linkului se înregistrează IP-ul și data/ora pentru semnătura agentului.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewPdf}
                disabled={previewing}
              >
                <FileText className="mr-2 h-4 w-4" />
                {previewing ? "Se încarcă..." : "Vizualizează contractul (PDF)"}
              </Button>
            </div>
            {!linkResult ? (
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={handleCreateLink}
                disabled={sending}
              >
                {sending ? "Se generează linkul..." : "Trimite către client"}
              </Button>
            ) : (
              <div className="rounded-lg border-2 border-green-200 bg-green-50/50 p-4 space-y-3">
                <p className="text-sm font-semibold text-green-800">Link generat</p>
                <p className="text-xs text-gray-600 break-all">{linkResult.link}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiază link
                  </Button>
                  {whatsappUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Trimite pe WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLinkResult(null)}>
                  Generează alt link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
