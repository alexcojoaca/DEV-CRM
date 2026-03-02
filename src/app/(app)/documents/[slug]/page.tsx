"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDocumentTypeBySlug } from "@/features/documents/documentTypes";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { FisaVizionareVanzareFlow } from "@/components/documents/FisaVizionareVanzareFlow";
import { FisaVizionareInchiriereFlow } from "@/components/documents/FisaVizionareInchiriereFlow";
import { Button } from "@/components/ui/button";

export default function DocumentBySlugPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const documentType = getDocumentTypeBySlug(slug);
  const isFisaVanzare = slug === "fisa-vizionare-vanzare";
  const isFisaInchiriere = slug === "fisa-vizionare-inchiriere";

  if (!documentType) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Tipul de document nu a fost găsit.</p>
        <Button variant="outline" asChild>
          <Link href="/documents">Înapoi la Documente</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/documents" aria-label="Înapoi la Documente">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {documentType.label}
          </h1>
          <p className="text-sm text-muted-foreground">{documentType.description}</p>
        </div>
      </div>
      {isFisaVanzare && <FisaVizionareVanzareFlow />}
      {isFisaInchiriere && <FisaVizionareInchiriereFlow />}
      {!isFisaVanzare && !isFisaInchiriere && (
        <DocumentForm documentType={documentType} />
      )}
    </div>
  );
}
