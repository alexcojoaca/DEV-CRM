"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getAgencyAgentSettings,
  setAgencyAgentSettings,
  type AgencySettings,
  type AgentSettings,
} from "@/features/settings/agencyAgentSettings";
import { FullScreenSignatureModal } from "@/components/documents/FullScreenSignatureModal";
import { Building2, User, Upload, Eraser, Smartphone } from "lucide-react";

/** true = telefon/tabletă (max-width 1024px), false = PC */
function useIsMobileOrTablet() {
  const [is, setIs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    setIs(mq.matches);
    const fn = () => setIs(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return is;
}

export default function SettingsPage() {
  const isMobileOrTablet = useIsMobileOrTablet();
  const [agency, setAgency] = useState<AgencySettings>({
    denumire: "",
    sediu_social: "",
    orc: "",
    cui: "",
    iban: "",
    banca: "",
    reprezentat_prin: "",
    calitate: "Administrator",
  });
  const [agent, setAgent] = useState<AgentSettings>({
    nume: "",
    telefon: "",
    semnatura_dataurl: "",
  });
  const [savedAgency, setSavedAgency] = useState(false);
  const [savedAgent, setSavedAgent] = useState(false);
  const [agentSignModalOpen, setAgentSignModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = getAgencyAgentSettings();
    setAgency(stored.agency);
    setAgent(stored.agent);
  }, []);

  const handleSaveAgency = () => {
    setAgencyAgentSettings({ agency });
    setSavedAgency(true);
    setTimeout(() => setSavedAgency(false), 2000);
  };

  const handleSaveAgent = () => {
    setAgencyAgentSettings({ agent });
    setSavedAgent(true);
    setTimeout(() => setSavedAgent(false), 2000);
  };

  const handleSignatureFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAgent((prev) => ({ ...prev, semnatura_dataurl: dataUrl }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearSignature = () => {
    setAgent((prev) => ({ ...prev, semnatura_dataurl: "" }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Setări"
        description="Datele agenției și ale agentului folosite în documente (completare automată)"
      />

      {/* Datele agenției */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Datele agenției
          </CardTitle>
          <CardDescription>
            Aceste date vor apărea automat în documente (ex: „Agenție Imobiliară ___, cu sediul social în ___, înregistrată la ORC sub ___, CUI ___, IBAN ___, Banca ___, reprezentată legal prin ___, în calitate de ___”).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="denumire">Denumire agenție</Label>
              <Input
                id="denumire"
                value={agency.denumire}
                onChange={(e) => setAgency((a) => ({ ...a, denumire: e.target.value }))}
                placeholder="Ex: S.C. Exemplu Imobiliar S.R.L."
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sediu">Sediul social</Label>
              <Input
                id="sediu"
                value={agency.sediu_social}
                onChange={(e) => setAgency((a) => ({ ...a, sediu_social: e.target.value }))}
                placeholder="Adresa completă a sediului"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orc">Înregistrată la ORC sub nr.</Label>
              <Input
                id="orc"
                value={agency.orc}
                onChange={(e) => setAgency((a) => ({ ...a, orc: e.target.value }))}
                placeholder="Ex: J40/123/2020"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cui">CUI</Label>
              <Input
                id="cui"
                value={agency.cui}
                onChange={(e) => setAgency((a) => ({ ...a, cui: e.target.value }))}
                placeholder="CUI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">Cont IBAN</Label>
              <Input
                id="iban"
                value={agency.iban}
                onChange={(e) => setAgency((a) => ({ ...a, iban: e.target.value }))}
                placeholder="RO00..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banca">Bancă</Label>
              <Input
                id="banca"
                value={agency.banca}
                onChange={(e) => setAgency((a) => ({ ...a, banca: e.target.value }))}
                placeholder="Ex: Banca Transilvania"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reprezentat">Reprezentată legal prin</Label>
              <Input
                id="reprezentat"
                value={agency.reprezentat_prin}
                onChange={(e) => setAgency((a) => ({ ...a, reprezentat_prin: e.target.value }))}
                placeholder="Nume administrator"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calitate">În calitate de</Label>
              <Input
                id="calitate"
                value={agency.calitate}
                onChange={(e) => setAgency((a) => ({ ...a, calitate: e.target.value }))}
                placeholder="Ex: Administrator"
              />
            </div>
          </div>
          <Button onClick={handleSaveAgency}>
            {savedAgency ? "Salvat ✓" : "Salvează datele agenției"}
          </Button>
        </CardContent>
      </Card>

      {/* Date agent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Date agent
          </CardTitle>
          <CardDescription>
            Nume, telefon și semnătura agentului (desen cu degetul sau încărcare imagine). Vor completa automat câmpurile în documente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agent-nume">Nume agent</Label>
              <Input
                id="agent-nume"
                value={agent.nume}
                onChange={(e) => setAgent((a) => ({ ...a, nume: e.target.value }))}
                placeholder="Nume și prenume"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-telefon">Nr. de telefon</Label>
              <Input
                id="agent-telefon"
                value={agent.telefon}
                onChange={(e) => setAgent((a) => ({ ...a, telefon: e.target.value }))}
                placeholder="07xx xxx xxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Semnătura agentului</Label>
            {!isMobileOrTablet && (
              <p className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 mb-3">
                <Smartphone className="h-5 w-5 shrink-0" />
                Pe telefon sau tabletă poți semna cu degetul în chenar. Pe PC încarcă o imagine cu semnătura (PNG sau JPG).
              </p>
            )}
            {isMobileOrTablet && (
              <p className="text-sm text-muted-foreground mb-2">
                Apasă „Semnează” pentru ecran complet cu degetul sau încarcă o imagine (PNG/JPG).
              </p>
            )}
            <div className="rounded-lg border-2 border-dashed border-muted bg-muted/20 p-4">
              {isMobileOrTablet && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-2 border-dashed border-gray-300 py-6"
                    onClick={() => setAgentSignModalOpen(true)}
                  >
                    {agent.semnatura_dataurl ? "Semnătură salvată — apasă pentru a modifica" : "Semnează"}
                  </Button>
                  <FullScreenSignatureModal
                    open={agentSignModalOpen}
                    onClose={() => setAgentSignModalOpen(false)}
                    onSave={(dataUrl) => {
                      setAgent((a) => ({ ...a, semnatura_dataurl: dataUrl }));
                      setAgentSignModalOpen(false);
                    }}
                    value={agent.semnatura_dataurl ?? ""}
                    title="Semnătura agentului"
                  />
                </>
              )}
              <div className={isMobileOrTablet ? "mt-3 flex flex-wrap gap-2" : "flex flex-wrap gap-2"}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSignatureFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Încarcă imagine
                </Button>
                {agent.semnatura_dataurl && (
                  <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                    <Eraser className="h-4 w-4 mr-1" />
                    Șterge semnătura
                  </Button>
                )}
              </div>
              {agent.semnatura_dataurl && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-green-600">Semnătură salvată</span>
                  <img
                    src={agent.semnatura_dataurl}
                    alt="Semnătură"
                    className="h-10 border rounded"
                  />
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleSaveAgent}>
            {savedAgent ? "Salvat ✓" : "Salvează datele agentului"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
