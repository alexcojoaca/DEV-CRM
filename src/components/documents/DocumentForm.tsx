"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DocumentType, DocumentTypeId } from "@/features/documents/documentTypes";
import { FullScreenSignatureModal } from "@/components/documents/FullScreenSignatureModal";
import { FileDown, FileText } from "lucide-react";
import {
  getAgencyAgentSettings,
  agencyToFormFields,
  agentToFormFields,
} from "@/features/settings/agencyAgentSettings";

interface DocumentFormProps {
  documentType: DocumentType;
}

/** Câmpuri comune pentru fișe de vizionare */
function ViewingFormFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Nume client</Label>
        <Input
          value={values.clientName ?? ""}
          onChange={(e) => onChange("clientName", e.target.value)}
          placeholder="Nume și prenume"
        />
      </div>
      <div className="space-y-2">
        <Label>Telefon client</Label>
        <Input
          value={values.clientPhone ?? ""}
          onChange={(e) => onChange("clientPhone", e.target.value)}
          placeholder="07xx xxx xxx"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Adresă imobil vizionat</Label>
        <Input
          value={values.propertyAddress ?? ""}
          onChange={(e) => onChange("propertyAddress", e.target.value)}
          placeholder="Strada, nr., oraș"
        />
      </div>
      <div className="space-y-2">
        <Label>Data vizionării</Label>
        <Input
          type="date"
          value={values.viewingDate ?? ""}
          onChange={(e) => onChange("viewingDate", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Agent</Label>
        <Input
          value={values.agentName ?? ""}
          onChange={(e) => onChange("agentName", e.target.value)}
          placeholder="Numele agentului"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Observații</Label>
        <Textarea
          value={values.notes ?? ""}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Notițe din timpul vizionării"
          rows={3}
        />
      </div>
    </div>
  );
}

/** True pe telefon/tabletă (max-width 1024px), false pe desktop – pentru a afișa chenarul de semnătură doar pe mobil/tabletă */
function useShowSignaturePad() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    setShow(mq.matches);
    const fn = () => setShow(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return show;
}

/** Câmpuri pentru Fișă de vizionare — VÂNZARE (draft PDF) */
function FisaVizionareVanzareFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  const showSignaturePad = useShowSignaturePad();
  const [signModalOpen, setSignModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Data vizionării</Label>
          <Input
            type="date"
            value={values.data_vizionarii ?? ""}
            onChange={(e) => onChange("data_vizionarii", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Ora vizionării</Label>
          <Input
            type="time"
            value={values.ora_vizionarii ?? ""}
            onChange={(e) => onChange("ora_vizionarii", e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-4">
        <p className="mb-3 text-sm font-semibold text-purple-800">1. VIZITATOR (CLIENT)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nume</Label>
            <Input
              value={values.nume ?? ""}
              onChange={(e) => onChange("nume", e.target.value)}
              placeholder="Nume și prenume"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input
              value={values.telefon ?? ""}
              onChange={(e) => onChange("telefon", e.target.value)}
              placeholder="07xx xxx xxx"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={values.email ?? ""}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="email@exemplu.ro"
            />
          </div>
          <div className="space-y-2">
            <Label>CI – serie</Label>
            <Input
              value={values.ci_serie ?? ""}
              onChange={(e) => onChange("ci_serie", e.target.value)}
              placeholder="Ex: XR"
            />
          </div>
          <div className="space-y-2">
            <Label>CI – număr</Label>
            <Input
              value={values.ci_numar ?? ""}
              onChange={(e) => onChange("ci_numar", e.target.value)}
              placeholder="Ex: 123456"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-4">
        <p className="mb-3 text-sm font-semibold text-purple-800">2. IMOBIL VIZIONAT</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tip imobil</Label>
            <Input
              value={values.tip_imobil ?? ""}
              onChange={(e) => onChange("tip_imobil", e.target.value)}
              placeholder="Ex: Apartament 2 camere"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Adresă (completă)</Label>
            <Input
              value={values.adresa_locuintei ?? ""}
              onChange={(e) => onChange("adresa_locuintei", e.target.value)}
              placeholder="Strada, nr., oraș"
            />
          </div>
          <div className="space-y-2">
            <Label>Comision (%)</Label>
            <Input
              value={values.comision_procent ?? ""}
              onChange={(e) => onChange("comision_procent", e.target.value)}
              placeholder="Ex: 2"
            />
          </div>
        </div>
      </div>

      {showSignaturePad && (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50/20 p-4">
          <p className="mb-3 text-sm font-semibold text-purple-800">Semnătura client (cu degetul)</p>
          <Button
            type="button"
            variant="outline"
            className="w-full border-2 border-dashed border-purple-300 py-8 text-purple-700 hover:bg-purple-50"
            onClick={() => setSignModalOpen(true)}
          >
            {values.signature_visitor_dataurl ? "Semnătură salvată — apasă pentru a modifica" : "Semnează"}
          </Button>
          <FullScreenSignatureModal
            open={signModalOpen}
            onClose={() => setSignModalOpen(false)}
            onSave={(dataUrl) => {
              onChange("signature_visitor_dataurl", dataUrl);
              setSignModalOpen(false);
            }}
            value={values.signature_visitor_dataurl ?? ""}
            title="Semnătura client"
          />
        </div>
      )}
    </div>
  );
}

/** Câmpuri pentru Fișă de vizionare — ÎNCHIRIERE */
function FisaVizionareInchiriereFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  const showSignaturePad = useShowSignaturePad();
  const [signModalOpen, setSignModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Data vizionării</Label>
          <Input
            type="date"
            value={values.data_vizionarii ?? ""}
            onChange={(e) => onChange("data_vizionarii", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Ora vizionării</Label>
          <Input
            type="time"
            value={values.ora_vizionarii ?? ""}
            onChange={(e) => onChange("ora_vizionarii", e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-4">
        <p className="mb-3 text-sm font-semibold text-purple-800">1. VIZITATOR (CLIENT)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nume</Label>
            <Input
              value={values.nume ?? ""}
              onChange={(e) => onChange("nume", e.target.value)}
              placeholder="Nume și prenume"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input
              value={values.telefon ?? ""}
              onChange={(e) => onChange("telefon", e.target.value)}
              placeholder="07xx xxx xxx"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={values.email ?? ""}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="email@exemplu.ro"
            />
          </div>
          <div className="space-y-2">
            <Label>CI – serie</Label>
            <Input
              value={values.ci_serie ?? ""}
              onChange={(e) => onChange("ci_serie", e.target.value)}
              placeholder="Ex: XR"
            />
          </div>
          <div className="space-y-2">
            <Label>CI – număr</Label>
            <Input
              value={values.ci_numar ?? ""}
              onChange={(e) => onChange("ci_numar", e.target.value)}
              placeholder="Ex: 123456"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-4">
        <p className="mb-3 text-sm font-semibold text-purple-800">2. IMOBIL VIZIONAT (ÎNCHIRIERE)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tip imobil</Label>
            <Input
              value={values.tip_imobil ?? ""}
              onChange={(e) => onChange("tip_imobil", e.target.value)}
              placeholder="Ex: Apartament 2 camere"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Adresa COMPLETĂ</Label>
            <Input
              value={values.adresa_completa ?? ""}
              onChange={(e) => onChange("adresa_completa", e.target.value)}
              placeholder="ex: București, Sector 1, Strada X, nr. Y, ap. Z"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Adresa PUBLICĂ (ce vede clientul pe pagină)</Label>
            <Input
              value={values.adresa_publica ?? ""}
              onChange={(e) => onChange("adresa_publica", e.target.value)}
              placeholder="ex: București, Sector 1 (zonă)"
            />
            <p className="text-xs text-muted-foreground">
              Aici completezi zona sau strada (fără număr și fără apartament), pentru a nu divulga adresa completă înainte de semnare. Adresa completă va fi vizibilă clientului doar în documentul PDF după semnare.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Comision (%)</Label>
            <Input
              value={values.comision_procent ?? ""}
              onChange={(e) => onChange("comision_procent", e.target.value)}
              placeholder="Ex: 50 sau 1 lună chirie"
            />
          </div>
        </div>
      </div>

      {showSignaturePad && (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50/20 p-4">
          <p className="mb-3 text-sm font-semibold text-purple-800">Semnătura client (cu degetul)</p>
          <Button
            type="button"
            variant="outline"
            className="w-full border-2 border-dashed border-purple-300 py-8 text-purple-700 hover:bg-purple-50"
            onClick={() => setSignModalOpen(true)}
          >
            {values.signature_visitor_dataurl ? "Semnătură salvată — apasă pentru a modifica" : "Semnează"}
          </Button>
          <FullScreenSignatureModal
            open={signModalOpen}
            onClose={() => setSignModalOpen(false)}
            onSave={(dataUrl) => {
              onChange("signature_visitor_dataurl", dataUrl);
              setSignModalOpen(false);
            }}
            value={values.signature_visitor_dataurl ?? ""}
            title="Semnătura client"
          />
        </div>
      )}
    </div>
  );
}

/** Variantă contract prestări: chirie sau vânzare */
type PrestariVariant = "chirie" | "vanzare";

/** Câmpuri pentru Contract de prestări servicii – cu selector Chirie / Vânzare */
function PrestariServiciiFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  const variant = (values.prestari_variant === "vanzare" ? "vanzare" : "chirie") as PrestariVariant;
  const isChirie = variant === "chirie";

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Tip tranzacție</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Alege dacă contractul este pentru o tranzacție de închiriere sau de vânzare. Formularul și PDF-ul se adaptează.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={variant === "chirie" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("prestari_variant", "chirie")}
            className={variant === "chirie" ? "bg-amber-600 hover:bg-amber-700" : ""}
          >
            Chirie
          </Button>
          <Button
            type="button"
            variant={variant === "vanzare" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("prestari_variant", "vanzare")}
            className={variant === "vanzare" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            Vânzare
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
        <div className="sm:col-span-2">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">1. Prestator (agenția)</h3>
        </div>
        <div className="space-y-2">
          <Label>Denumire (ex. S.C. ... S.R.L.)</Label>
          <Input
            value={values.agency_denumire ?? ""}
            onChange={(e) => onChange("agency_denumire", e.target.value)}
            placeholder="S.C. Agenție S.R.L."
          />
        </div>
        <div className="space-y-2">
          <Label>Sediul social</Label>
          <Input
            value={values.agency_sediu ?? ""}
            onChange={(e) => onChange("agency_sediu", e.target.value)}
            placeholder="Adresa sediului"
          />
        </div>
        <div className="space-y-2">
          <Label>Nr. ORC</Label>
          <Input
            value={values.agency_nr_orc ?? ""}
            onChange={(e) => onChange("agency_nr_orc", e.target.value)}
            placeholder="Nr. înregistrare ORC"
          />
        </div>
        <div className="space-y-2">
          <Label>CUI</Label>
          <Input
            value={values.agency_cui ?? ""}
            onChange={(e) => onChange("agency_cui", e.target.value)}
            placeholder="CUI"
          />
        </div>
        <div className="space-y-2">
          <Label>IBAN</Label>
          <Input
            value={values.agency_iban ?? ""}
            onChange={(e) => onChange("agency_iban", e.target.value)}
            placeholder="IBAN"
          />
        </div>
        <div className="space-y-2">
          <Label>Reprezentat prin</Label>
          <Input
            value={values.agency_reprezentat_prin ?? ""}
            onChange={(e) => onChange("agency_reprezentat_prin", e.target.value)}
            placeholder="Nume administrator"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
        <div className="sm:col-span-2">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">2. Client</h3>
        </div>
        <div className="space-y-2">
          <Label>Nume / Denumire</Label>
          <Input
            value={values.client_nume ?? ""}
            onChange={(e) => onChange("client_nume", e.target.value)}
            placeholder="Nume și prenume sau denumire firmă"
          />
        </div>
        <div className="space-y-2">
          <Label>CNP / CUI</Label>
          <Input
            value={values.client_cnp_cui ?? ""}
            onChange={(e) => onChange("client_cnp_cui", e.target.value)}
            placeholder="CNP (persoană fizică) sau CUI (firmă)"
          />
        </div>
        <div className="space-y-2">
          <Label>CI / RC (serie și număr sau nr. Reg. Com.)</Label>
          <Input
            value={values.client_ci_rc ?? ""}
            onChange={(e) => onChange("client_ci_rc", e.target.value)}
            placeholder="Ex: XR 123456"
          />
        </div>
        <div className="space-y-2">
          <Label>Domiciliu / Sediu</Label>
          <Input
            value={values.client_domiciliu ?? ""}
            onChange={(e) => onChange("client_domiciliu", e.target.value)}
            placeholder="Adresa"
          />
        </div>
        <div className="space-y-2">
          <Label>Telefon</Label>
          <Input
            value={values.client_telefon ?? ""}
            onChange={(e) => onChange("client_telefon", e.target.value)}
            placeholder="07xx xxx xxx"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={values.client_email ?? ""}
            onChange={(e) => onChange("client_email", e.target.value)}
            placeholder="email@exemplu.ro"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
        <div className="space-y-2">
          <Label>Nr. contract</Label>
          <Input
            value={values.nr_contract ?? ""}
            onChange={(e) => onChange("nr_contract", e.target.value)}
            placeholder="Ex: 1"
          />
        </div>
        <div className="space-y-2">
          <Label>Data contractului</Label>
          <Input
            type="date"
            value={values.data_contract ?? ""}
            onChange={(e) => onChange("data_contract", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Adresa imobilului (obiectul tranzacției)</Label>
          <Input
            value={values.adresa_imobil ?? ""}
            onChange={(e) => onChange("adresa_imobil", e.target.value)}
            placeholder="Strada, nr., oraș, județ"
          />
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Comision (Art. 2)</h3>
        <div className="space-y-2">
          <Label>Tip comision</Label>
          <div className="flex flex-wrap gap-3">
            {isChirie ? (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="comision_tip_prestari"
                    checked={values.comision_tip === "procent_chirie"}
                    onChange={() => onChange("comision_tip", "procent_chirie")}
                    className="rounded-full"
                  />
                  <span className="text-sm">% din chirie lunară</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="comision_tip_prestari"
                    checked={values.comision_tip === "chirii_lunare"}
                    onChange={() => onChange("comision_tip", "chirii_lunare")}
                    className="rounded-full"
                  />
                  <span className="text-sm">Echivalent chirii lunare</span>
                </label>
              </>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="comision_tip_prestari"
                  checked={values.comision_tip === "procent_vanzare"}
                  onChange={() => onChange("comision_tip", "procent_vanzare")}
                  className="rounded-full"
                />
                <span className="text-sm">% din prețul total de vânzare</span>
              </label>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="comision_tip_prestari"
                checked={values.comision_tip === "alta"}
                onChange={() => onChange("comision_tip", "alta")}
                className="rounded-full"
              />
              <span className="text-sm">Altă formulă</span>
            </label>
          </div>
        </div>
        {(values.comision_tip === "procent_chirie" || values.comision_tip === "procent_vanzare" || values.comision_tip === "chirii_lunare") && (
          <div className="space-y-2">
            <Label>
              {values.comision_tip === "chirii_lunare" ? "Număr chirii lunare" : "Procent (%)"}
            </Label>
            <Input
              type="text"
              value={values.comision_valoare ?? ""}
              onChange={(e) => onChange("comision_valoare", e.target.value)}
              placeholder={values.comision_tip === "chirii_lunare" ? "Ex: 1" : "Ex: 3"}
              className="max-w-[120px]"
            />
          </div>
        )}
        {values.comision_tip === "alta" && (
          <div className="space-y-2">
            <Label>Formulă comision</Label>
            <Input
              value={values.comision_alta_formula ?? ""}
              onChange={(e) => onChange("comision_alta_formula", e.target.value)}
              placeholder="Ex: sumă fixă 500 EUR"
            />
          </div>
        )}
      </div>

      {isChirie ? (
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-muted-foreground">Exigibilitate (Art. 2.2)</Label>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={values.exigibilitate_inchiriere !== "false"}
              onChange={(e) => onChange("exigibilitate_inchiriere", e.target.checked ? "true" : "false")}
              className="rounded"
            />
            <span className="text-sm">La semnarea contractului de închiriere</span>
          </label>
        </div>
      ) : (
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-muted-foreground">Exigibilitate (Art. 2.2)</Label>
          <div className="space-y-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values.exigibilitate_antecontract === "true"}
                onChange={(e) => onChange("exigibilitate_antecontract", e.target.checked ? "true" : "false")}
                className="rounded"
              />
              <span className="text-sm">La semnarea antecontractului</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values.exigibilitate_vanzare !== "false"}
                onChange={(e) => onChange("exigibilitate_vanzare", e.target.checked ? "true" : "false")}
                className="rounded"
              />
              <span className="text-sm">La semnarea contractului de vânzare-cumpărare</span>
            </label>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
        <div className="space-y-2">
          <Label>Penalități întârziere (% pe zi) – Art. 4.3</Label>
          <Input
            type="text"
            value={values.penalitati_procent ?? ""}
            onChange={(e) => onChange("penalitati_procent", e.target.value)}
            placeholder="Ex: 0.1"
          />
        </div>
        <div className="space-y-2">
          <Label>Instanțe competente – Art. 7</Label>
          <Input
            value={values.instanta_competenta ?? ""}
            onChange={(e) => onChange("instanta_competenta", e.target.value)}
            placeholder="Ex: Judecătoria X"
          />
        </div>
      </div>
    </div>
  );
}

/** Câmpuri pentru contract de închiriere */
function ContractInchiriereFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Proprietar (închirietor)</Label>
        <Input
          value={values.landlordName ?? ""}
          onChange={(e) => onChange("landlordName", e.target.value)}
          placeholder="Nume și prenume"
        />
      </div>
      <div className="space-y-2">
        <Label>Chiriaș</Label>
        <Input
          value={values.tenantName ?? ""}
          onChange={(e) => onChange("tenantName", e.target.value)}
          placeholder="Nume și prenume"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Adresă imobil</Label>
        <Input
          value={values.propertyAddress ?? ""}
          onChange={(e) => onChange("propertyAddress", e.target.value)}
          placeholder="Strada, nr., oraș"
        />
      </div>
      <div className="space-y-2">
        <Label>Chirie lunară (EUR)</Label>
        <Input
          type="text"
          value={values.rentAmount ?? ""}
          onChange={(e) => onChange("rentAmount", e.target.value)}
          placeholder="ex: 500"
        />
      </div>
      <div className="space-y-2">
        <Label>Perioadă contract</Label>
        <Input
          value={values.contractPeriod ?? ""}
          onChange={(e) => onChange("contractPeriod", e.target.value)}
          placeholder="ex: 12 luni"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Garantie / alte condiții</Label>
        <Textarea
          value={values.otherTerms ?? ""}
          onChange={(e) => onChange("otherTerms", e.target.value)}
          placeholder="Garantie, utilități, etc."
          rows={3}
        />
      </div>
    </div>
  );
}

/** Câmpuri pentru contract de exclusivitate */
function ContractExclusivitateFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Mandant (client)</Label>
        <Input
          value={values.clientName ?? ""}
          onChange={(e) => onChange("clientName", e.target.value)}
          placeholder="Nume / firmă"
        />
      </div>
      <div className="space-y-2">
        <Label>Agent / Agenție</Label>
        <Input
          value={values.agencyName ?? ""}
          onChange={(e) => onChange("agencyName", e.target.value)}
          placeholder="Agenția care primește mandatul"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Imobil (adresă sau descriere)</Label>
        <Input
          value={values.propertyDescription ?? ""}
          onChange={(e) => onChange("propertyDescription", e.target.value)}
          placeholder="Adresa sau identificarea imobilului"
        />
      </div>
      <div className="space-y-2">
        <Label>Tip tranzacție</Label>
        <Input
          value={values.transactionType ?? ""}
          onChange={(e) => onChange("transactionType", e.target.value)}
          placeholder="Vânzare / Închiriere"
        />
      </div>
      <div className="space-y-2">
        <Label>Perioadă exclusivitate</Label>
        <Input
          value={values.exclusivityPeriod ?? ""}
          onChange={(e) => onChange("exclusivityPeriod", e.target.value)}
          placeholder="ex: 90 zile"
        />
      </div>
      <div className="space-y-2">
        <Label>Comision (%)</Label>
        <Input
          type="text"
          value={values.commission ?? ""}
          onChange={(e) => onChange("commission", e.target.value)}
          placeholder="ex: 3"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Observații</Label>
        <Textarea
          value={values.notes ?? ""}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Clauze suplimentare"
          rows={3}
        />
      </div>
    </div>
  );
}

export function DocumentForm({ documentType }: DocumentFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [generateError, setGenerateError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((documentType.id as DocumentTypeId) !== "contract-prestari-servicii") return;
    setValues((prev) => {
      if (prev.agency_denumire !== undefined && prev.agency_denumire !== "") return prev;
      const agency = agencyToFormFields(getAgencyAgentSettings().agency);
      return { prestari_variant: "chirie", ...agency, ...prev };
    });
  }, [documentType.id]);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (generateError) setGenerateError(null);
  };

  const getFisaPayload = () => {
    const settings = getAgencyAgentSettings();
    return {
      data_vizionarii: values.data_vizionarii ?? "",
      ora_vizionarii: values.ora_vizionarii ?? "",
      ...agencyToFormFields(settings.agency),
      ...agentToFormFields(settings.agent),
      signature_agent_dataurl: settings.agent.semnatura_dataurl ?? "",
      nume: values.nume ?? "",
      telefon: values.telefon ?? "",
      email: values.email ?? "",
      ci_serie: values.ci_serie ?? "",
      ci_numar: values.ci_numar ?? "",
      tip_imobil: values.tip_imobil ?? "",
      adresa_locuintei: values.adresa_locuintei ?? "",
      comision_procent: values.comision_procent ?? "",
      signature_visitor_dataurl: values.signature_visitor_dataurl ?? "",
    };
  };

  const getFisaInchirierePayload = () => {
    const settings = getAgencyAgentSettings();
    return {
      data_vizionarii: values.data_vizionarii ?? "",
      ora_vizionarii: values.ora_vizionarii ?? "",
      ...agencyToFormFields(settings.agency),
      ...agentToFormFields(settings.agent),
      signature_agent_dataurl: settings.agent.semnatura_dataurl ?? "",
      nume: values.nume ?? "",
      telefon: values.telefon ?? "",
      email: values.email ?? "",
      ci_serie: values.ci_serie ?? "",
      ci_numar: values.ci_numar ?? "",
      tip_imobil: values.tip_imobil ?? "",
      adresa_completa: values.adresa_completa ?? "",
      adresa_publica: values.adresa_publica ?? "",
      comision_procent: values.comision_procent ?? "",
      signature_visitor_dataurl: values.signature_visitor_dataurl ?? "",
    };
  };

  const getPrestariPayload = () => {
    const settings = getAgencyAgentSettings();
    const agency = agencyToFormFields(settings.agency);
    const variant = values.prestari_variant === "vanzare" ? "vanzare" : "chirie";
    return {
      variant,
      nr_contract: values.nr_contract ?? "",
      data_contract: values.data_contract ?? "",
      agency_denumire: values.agency_denumire ?? agency.agency_denumire ?? "",
      agency_sediu: values.agency_sediu ?? agency.agency_sediu ?? "",
      agency_nr_orc: values.agency_nr_orc ?? agency.agency_nr_orc ?? "",
      agency_cui: values.agency_cui ?? agency.agency_cui ?? "",
      agency_iban: values.agency_iban ?? agency.agency_iban ?? "",
      agency_reprezentat_prin: values.agency_reprezentat_prin ?? agency.agency_reprezentat_prin ?? "",
      client_nume: values.client_nume ?? "",
      client_cnp_cui: values.client_cnp_cui ?? "",
      client_ci_rc: values.client_ci_rc ?? "",
      client_domiciliu: values.client_domiciliu ?? "",
      client_telefon: values.client_telefon ?? "",
      client_email: values.client_email ?? "",
      adresa_imobil: values.adresa_imobil ?? "",
      comision_tip: values.comision_tip || undefined,
      comision_valoare: values.comision_valoare ?? "",
      comision_alta_formula: values.comision_alta_formula ?? "",
      exigibilitate_inchiriere: values.exigibilitate_inchiriere !== "false",
      exigibilitate_antecontract: values.exigibilitate_antecontract === "true",
      exigibilitate_vanzare: values.exigibilitate_vanzare !== "false",
      penalitati_procent: values.penalitati_procent ?? "",
      instanta_competenta: values.instanta_competenta ?? "",
    };
  };

  const handlePreview = async () => {
    const id = documentType.id as DocumentTypeId;
    if (id !== "fisa-vizionare-vanzare" && id !== "fisa-vizionare-inchiriere") return;
    setGenerateError(null);
    try {
      const endpoint = id === "fisa-vizionare-inchiriere"
        ? "/api/documents/fisa-vizionare-inchiriere/generate-pdf"
        : "/api/documents/fisa-vizionare-vanzare/generate-pdf";
      const payload = id === "fisa-vizionare-inchiriere"
        ? { ...getFisaInchirierePayload(), preview: true }
        : { ...getFisaPayload(), preview: true };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setGenerateError(err.error || "Eroare la previzualizare.");
        requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Nu s-a putut încărca previzualizarea.");
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  };

  const handleGenerate = async () => {
    const id = documentType.id as DocumentTypeId;
    setGenerateError(null);

    if (id === "fisa-vizionare-vanzare") {
      try {
        const res = await fetch("/api/documents/fisa-vizionare-vanzare/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getFisaPayload()),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err.error || "Eroare la generare PDF";
          setGenerateError(msg);
          requestAnimationFrame(() => {
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
          return;
        }
        const data = await res.json();
        if (data.downloadToken) {
          window.location.href = `/api/documents/temp-download/${data.downloadToken}`;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Nu s-a putut genera PDF-ul.";
        setGenerateError(msg);
        requestAnimationFrame(() => {
          errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      return;
    }

    if (id === "fisa-vizionare-inchiriere") {
      try {
        const res = await fetch("/api/documents/fisa-vizionare-inchiriere/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getFisaInchirierePayload()),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err.error || "Eroare la generare PDF";
          setGenerateError(msg);
          requestAnimationFrame(() => {
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
          return;
        }
        const data = await res.json();
        if (data.downloadToken) {
          window.location.href = `/api/documents/temp-download/${data.downloadToken}`;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Nu s-a putut genera PDF-ul.";
        setGenerateError(msg);
        requestAnimationFrame(() => {
          errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      return;
    }

    if (id === "contract-prestari-servicii") {
      try {
        const res = await fetch("/api/documents/contract-prestari-servicii/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getPrestariPayload()),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = err.error || "Eroare la generare PDF";
          setGenerateError(msg);
          requestAnimationFrame(() => {
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
          return;
        }
        const data = await res.json();
        if (data.downloadToken) {
          window.location.href = `/api/documents/temp-download/${data.downloadToken}`;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Nu s-a putut genera PDF-ul.";
        setGenerateError(msg);
        requestAnimationFrame(() => {
          errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      return;
    }

    // Alte tipuri: placeholder
    const data = { documentType: documentType.label, ...values };
    console.log("Document data:", data);
    alert(
      "Documentul va fi generat aici. Datele completate:\n\n" +
        JSON.stringify(data, null, 2)
    );
  };

  const id = documentType.id as DocumentTypeId;
  const isFisaVanzare = id === "fisa-vizionare-vanzare";
  const isFisaInchiriere = id === "fisa-vizionare-inchiriere";
  const isPrestari = id === "contract-prestari-servicii";
  const isInchiriere = id === "contract-inchiriere";
  const isExclusivitate = id === "contract-exclusivitate";

  return (
    <Card className="border-purple-100 bg-white">
      <CardHeader>
        <h2 className="text-lg font-semibold">Completează datele</h2>
        <p className="text-sm text-muted-foreground">
          Completați câmpurile de mai jos, apoi apăsați „Generează document” pentru a obține documentul.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {generateError && (
          <div
            ref={errorRef}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {generateError}
          </div>
        )}
        {isFisaVanzare && <FisaVizionareVanzareFields values={values} onChange={handleChange} />}
        {isFisaInchiriere && <FisaVizionareInchiriereFields values={values} onChange={handleChange} />}
        {isPrestari && <PrestariServiciiFields values={values} onChange={handleChange} />}
        {isInchiriere && <ContractInchiriereFields values={values} onChange={handleChange} />}
        {isExclusivitate && <ContractExclusivitateFields values={values} onChange={handleChange} />}

        <div className="flex flex-wrap gap-3 border-t pt-6">
          {(isFisaVanzare || isFisaInchiriere) && (
            <Button variant="outline" type="button" onClick={handlePreview}>
              <FileText className="mr-2 h-4 w-4" />
              Vizualizează contractul (PDF)
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Generează document
          </Button>
          <Button variant="outline" type="button" onClick={() => setValues({})}>
            Resetează formularul
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
