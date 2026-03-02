"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirecționează către documente semnate cu filtrul „Chirie”.
 */
export default function SignedInchiriereRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/documents/signed?type=inchiriere");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
      Redirecționare...
    </div>
  );
}
