"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

type CertData = { name: string; campaign_title: string; date: string };

function CertificateContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [data, setData] = useState<CertData | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/volunteer/certificate?id=${id}`).then(r => r.json()).then(setData).catch(() => {});
    }
  }, [id]);

  if (!data) return <p className="p-12 text-center text-muted-foreground">Loading certificate...</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button onClick={() => window.print()} className="mb-4 print:hidden rounded-full">Print Certificate</Button>
      <div className="rounded-2xl border-4 border-primary/30 bg-white p-12 text-center print:border-2">
        <div className="mx-auto h-1 w-32 rounded" style={{ background: "linear-gradient(90deg, #4f46e5, #ca8a04)" }} />
        <p className="mt-6 text-sm uppercase tracking-widest text-muted-foreground">Certificate of Participation</p>
        <h1 className="mt-2 text-3xl font-bold gradient-text">Viksit Chetna</h1>
        <p className="text-sm text-muted-foreground">Intellectual Club</p>
        <p className="mt-8 text-lg text-muted-foreground">This is to certify that</p>
        <p className="mt-2 text-2xl font-bold">{data.name}</p>
        <p className="mt-4 text-muted-foreground">has successfully volunteered for the campaign</p>
        <p className="mt-2 text-xl font-semibold text-primary">{data.campaign_title}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          We appreciate your dedication and contribution towards advancing knowledge and society.
        </p>
        <div className="mt-12 flex justify-between text-sm">
          <div>
            <p className="font-medium">Date: {data.date}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Club Leadership</p>
            <p className="text-xs text-muted-foreground">Viksit Chetna</p>
          </div>
        </div>
        <div className="mx-auto mt-6 h-1 w-32 rounded" style={{ background: "linear-gradient(90deg, #4f46e5, #ca8a04)" }} />
      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={<p className="p-12 text-center text-muted-foreground">Loading...</p>}>
      <CertificateContent />
    </Suspense>
  );
}
