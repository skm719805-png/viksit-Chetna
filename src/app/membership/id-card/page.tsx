"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

type MemberCard = {
  name: string;
  member_id: string;
  phone: string;
  city: string;
  state: string;
  photo_url: string | null;
  dob: string;
  created_at: string;
};

function IDCardContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [data, setData] = useState<MemberCard | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/membership/id-card?id=${id}`).then(r => r.json()).then(setData).catch(() => {});
    }
  }, [id]);

  if (!data) return <p className="p-12 text-center text-muted-foreground">Loading ID card...</p>;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Button onClick={() => window.print()} className="mb-4 print:hidden rounded-full">Print ID Card</Button>
      <div className="overflow-hidden rounded-2xl border-2 border-primary/40 bg-white shadow-lg print:shadow-none">
        <div className="bg-gradient-to-r from-primary to-primary/70 px-6 py-4 text-center text-white">
          <p className="text-xs uppercase tracking-wider opacity-80">Member Identity Card</p>
          <h2 className="text-lg font-bold">Viksit Chetna</h2>
          <p className="text-xs opacity-70">Intellectual Club</p>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            {data.photo_url ? (
              <img src={data.photo_url} alt={data.name} className="h-24 w-20 rounded-lg border object-cover" />
            ) : (
              <div className="flex h-24 w-20 items-center justify-center rounded-lg border bg-primary/10 text-2xl font-bold text-primary">
                {data.name[0]}
              </div>
            )}
            <div className="flex-1 space-y-1">
              <p className="text-lg font-bold">{data.name}</p>
              <p className="text-xs text-muted-foreground">Member ID</p>
              <p className="font-mono text-sm font-semibold text-primary">{data.member_id}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{data.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">DOB</p>
              <p className="font-medium">{data.dob}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{data.city}, {data.state}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Since</p>
              <p className="font-medium">{new Date(data.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
            </div>
          </div>
        </div>
        <div className="border-t bg-muted/50 px-6 py-3 text-center text-xs text-muted-foreground">
          viksitchetna.org • Intellectual Club, India
        </div>
      </div>
    </div>
  );
}

export default function IDCardPage() {
  return (
    <Suspense fallback={<p className="p-12 text-center">Loading...</p>}>
      <IDCardContent />
    </Suspense>
  );
}
