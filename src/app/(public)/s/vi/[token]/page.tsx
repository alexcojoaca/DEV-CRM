"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FisaVizionareInchiriereFullText } from "@/components/documents/FisaVizionareInchiriereFullText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface SessionInfo {
  token: string;
  data_vizionarii: string;
  ora_vizionarii: string;
  tip_imobil: string;
  adresa_publica: string;
  comision_procent: string;
  comision_termen_plata_zile: string;
  agency_denumire?: string;
  agency_sediu?: string;
  agency_nr_orc?: string;
  agency_cui?: string;
  agency_iban?: string;
  agency_banca?: string;
  agency_reprezentat_prin?: string;
  agency_functia?: string;
  agent_name?: string;
}

export default function SignViewingInchirierePage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [form, setForm] = useState({
    nume: "",
    telefon: "",
    email: "",
    ci_serie: "",
    ci_numar: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Link invalid.");
      setLoading(false);
      return;
    }
    fetch(`/api/documents/fisa-vizionare-inchiriere/remote/${token}`)
      .then((r) => {
        if (r.status === 404 || r.status === 410) return r.json().then((j) => ({ err: j.error ?? "Link invalid sau expirat." }));
        if (!r.ok) throw new Error("Eroare la încărcare.");
        return r.json();
      })
      .then((data) => {
        if (data.err) {
          setError(data.err);
          setInfo(null);
        } else {
          setInfo(data);
          setError(null);
        }
      })
      .catch(() => setError("Eroare la încărcare."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSign = async () => {
    if (!info || !form.nume.trim()) {
      alert("Completează numele.");
      return;
    }
    setSigning(true);
    try {
      const res = await fetch(`/api/documents/fisa-vizionare-inchiriere/remote/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nume: form.nume.trim(),
          telefon: form.telefon.trim(),
          email: form.email.trim(),
          ci_serie: form.ci_serie.trim(),
          ci_numar: form.ci_numar.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Eroare la semnare.");
      }
      const data = await res.json();
      if (data.downloadToken) {
        setSigned(true);
        window.location.href = `/api/documents/temp-download/${data.downloadToken}`;
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Eroare la semnare.");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-gray-600">Se încarcă...</p>
      </div>
    );
  }
  if (error || !info) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-gray-300 bg-white shadow-md">
          <CardHeader>
            <h1 className="text-lg font-semibold text-red-700">Link invalid sau expirat</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{error ?? "Documentul nu a fost găsit."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (signed) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-green-300 bg-green-50 shadow-md">
          <CardHeader>
            <h1 className="text-lg font-semibold text-green-800">Document semnat</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              Mulțumim! PDF-ul s-a descărcat. Poți închide această pagină.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Fișă de vizionare — Închiriere</h1>
          <p className="text-sm text-gray-600 mt-1">
            Citește documentul mai jos, completează datele și apasă „Semnează” (semnătură electronică: dată, oră, IP).
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="border-gray-400 text-gray-700 hover:bg-gray-50"
            onClick={() => window.open(`/api/documents/fisa-vizionare-inchiriere/remote/${token}/preview-pdf`, "_blank", "noopener,noreferrer")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Vizualizează contractul (PDF)
          </Button>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Documentul pe care îl semnezi</p>
          <FisaVizionareInchiriereFullText
            dataVizionarii={info.data_vizionarii}
            oraVizionarii={info.ora_vizionarii}
            tipImobil={info.tip_imobil}
            adresaZona={info.adresa_publica}
            comisionProcent={info.comision_procent}
            comisionTermenZile={info.comision_termen_plata_zile ?? ""}
            agency_denumire={info.agency_denumire}
            agency_sediu={info.agency_sediu}
            agency_nr_orc={info.agency_nr_orc}
            agency_cui={info.agency_cui}
            agency_iban={info.agency_iban}
            agency_banca={info.agency_banca}
            agency_reprezentat_prin={info.agency_reprezentat_prin}
            agency_functia={info.agency_functia}
            agent_name={info.agent_name}
          />
        </div>

        <Card className="border border-gray-300 bg-white shadow-md">
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Datele tale (Vizitator)</h2>
            <p className="text-xs text-gray-600">
              Completează și apasă „Semnează”. Semnătura este electronică (dată, oră, IP).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-800">Nume complet *</Label>
                <Input
                  className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                  value={form.nume}
                  onChange={(e) => setForm((f) => ({ ...f, nume: e.target.value }))}
                  placeholder="Nume și prenume"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-800">Telefon</Label>
                <Input
                  className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                  value={form.telefon}
                  onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))}
                  placeholder="07xx xxx xxx"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-800">E-mail</Label>
              <Input
                type="email"
                className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@exemplu.ro"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-800">CI – Serie</Label>
                <Input
                  className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                  value={form.ci_serie}
                  onChange={(e) => setForm((f) => ({ ...f, ci_serie: e.target.value }))}
                  placeholder="Ex: XR"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-800">CI – Număr</Label>
                <Input
                  className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                  value={form.ci_numar}
                  onChange={(e) => setForm((f) => ({ ...f, ci_numar: e.target.value }))}
                  placeholder="Ex: 123456"
                />
              </div>
            </div>
            <Button
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              onClick={handleSign}
              disabled={signing}
            >
              {signing ? "Se generează PDF..." : "Semnează (semnătură electronică)"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
