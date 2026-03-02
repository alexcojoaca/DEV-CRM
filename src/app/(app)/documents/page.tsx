"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ChevronRight, FileCheck } from "lucide-react";
import { DOCUMENT_TYPES } from "@/features/documents/documentTypes";
import { cn } from "@/lib/utils";

export default function DocumentsPage() {
  return (
    <div>
      <PageHeader
        title="Documente"
        description="Alege tipul de document pe care dorești să îl generezi sau completezi."
      />
      <Link href="/documents/signed" className="block mb-6">
        <Card className="border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20 hover:border-emerald-300 hover:shadow-lg transition-all">
          <CardContent className="flex flex-row items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Documente semnate</h3>
              <p className="text-sm text-muted-foreground">Vizualizează și descarcă fișele de vizionare semnate de clienți.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
      </Link>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_TYPES.map((doc) => (
          <Link key={doc.id} href={`/documents/${doc.slug}`}>
            <Card
              className={cn(
                "h-full border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/20",
                "transition-all duration-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10"
              )}
            >
              <CardContent className="flex flex-col p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{doc.label}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{doc.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-purple-600">
                  Deschide
                  <ChevronRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
