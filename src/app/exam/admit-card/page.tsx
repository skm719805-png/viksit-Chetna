"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function AdmitCardContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<any | null>(null);

  const fetchAdmitCard = async (q: string) => {
    if (!q || !q.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/exam/admit-card?query=${encodeURIComponent(q.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No admit card found.");
      }

      setRegistration(data.registration);
    } catch (err: any) {
      setError(err.message || "Failed to locate admit card.");
      setRegistration(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchAdmitCard(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdmitCard(query);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Search Header - Hidden during print */}
      <div className="print:hidden rounded-2xl border bg-card p-6 shadow-sm mb-8">
        <div className="text-center">
          <span className="text-3xl">🎫</span>
          <h1 className="mt-2 text-2xl font-extrabold text-foreground">Official Admit Card Portal</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Search and print your hall ticket using your Roll Number or Mobile Number
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Enter Roll Number (e.g. VC-2026-1001) or Mobile Number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-6 text-sm font-bold shadow-md hover:bg-primary/90"
          >
            {loading ? "Searching..." : "Search Hall Ticket"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Render Admit Card */}
      {registration && (
        <div className="space-y-6">
          {/* Action bar (hidden in print) */}
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-4 rounded-xl border">
            <span className="text-xs font-semibold text-muted-foreground">Hall ticket ready for download</span>
            <div className="flex gap-2">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="gap-1.5 text-xs font-semibold"
              >
                🖨️ Print / Save as PDF
              </Button>
              {registration.exam && (
                <Link
                  href={`/exam/${registration.exam.slug}/test?roll=${registration.roll_number}`}
                  className="btn-shimmer inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  🚀 Enter Exam Hall
                </Link>
              )}
            </div>
          </div>

          {/* Printable Official Admit Card */}
          <div className="admit-card-container rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-8 shadow-lg print:border-black print:shadow-none print:m-0 print:p-6">
            {/* Header with Club Logo & Watermark */}
            <div className="flex items-center justify-between border-b-2 border-primary/20 pb-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Viksit Chetna" className="h-12 w-12 rounded-full ring-2 ring-primary/30" />
                <div>
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">VIKSIT CHETNA</h2>
                  <p className="text-[11px] font-bold text-primary tracking-widest uppercase">Intellectual Club • India</p>
                  <p className="text-[10px] text-muted-foreground">National Talent Assessment & Scientific Olympiad 2026</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block rounded-lg border-2 border-primary bg-primary/5 px-3 py-1 font-mono text-xs font-extrabold text-primary">
                  HALL TICKET
                </div>
                <p className="mt-1 text-[10px] font-mono text-muted-foreground">Ref: {registration.admit_card_key}</p>
              </div>
            </div>

            {/* Candidate Details Grid */}
            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Roll Number</span>
                    <p className="text-lg font-mono font-extrabold text-primary mt-0.5">{registration.roll_number}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Admit Key</span>
                    <p className="text-sm font-mono font-bold text-foreground mt-0.5">{registration.admit_card_key}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Candidate Name</span>
                  <p className="text-base font-bold text-foreground mt-0.5">{registration.student_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Phone Number</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{registration.phone}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Email Address</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{registration.email}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">School / Institution</span>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{registration.institution}</p>
                </div>

                {registration.grade_or_course && (
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Course / Grade</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{registration.grade_or_course}</p>
                  </div>
                )}
              </div>

              {/* Photo & Barcode Box */}
              <div className="flex flex-col items-center justify-between border-l pl-6 text-center">
                <div className="h-32 w-28 rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/20 flex flex-col items-center justify-center p-2 text-muted-foreground">
                  <span className="text-2xl">👤</span>
                  <span className="text-[10px] mt-1 font-medium">Candidate Photo</span>
                  <span className="text-[9px] text-muted-foreground/70">Verified Online</span>
                </div>

                {/* Simulated Barcode */}
                <div className="mt-4 w-full text-center">
                  <div className="font-mono text-xs tracking-[4px] font-bold text-foreground opacity-80 select-none">
                    |||||||||||||||||||||
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">{registration.roll_number}</span>
                </div>
              </div>
            </div>

            {/* Examination Details Banner */}
            <div className="mt-6 rounded-xl border bg-muted/40 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Examination</span>
              <p className="text-base font-bold text-foreground mt-0.5">
                {registration.exam?.title || "Viksit Chetna National Olympiad"}
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>⏱️ Duration: <strong>{registration.exam?.duration_minutes || 20} Mins</strong></span>
                <span>📊 Max Marks: <strong>{registration.exam?.total_marks || 50}</strong></span>
                <span>🎯 Passing Mark: <strong>{registration.exam?.passing_percentage || 40}%</strong></span>
              </div>
            </div>

            {/* Instructions & Signatures */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-xs font-bold text-foreground">Candidate Guidelines & Protocols</h4>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                <li>Keep this Hall Ticket and Roll Number safe for entering the online test hall.</li>
                <li>Ensure a stable internet connection before beginning the timer.</li>
                <li>Digital merit certificate will be awarded upon scoring passing percentage.</li>
              </ul>

              <div className="mt-8 flex items-end justify-between pt-4 border-t border-dashed">
                <div className="text-center">
                  <div className="w-32 border-b border-muted-foreground/60 mb-1" />
                  <span className="text-[10px] text-muted-foreground">Candidate Signature</span>
                </div>

                <div className="text-center">
                  <div className="text-xs font-bold font-serif text-primary italic">Viksit Chetna Examination Cell</div>
                  <div className="w-36 border-b border-muted-foreground/60 mb-1 mt-1" />
                  <span className="text-[10px] text-muted-foreground">Controller of Examinations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdmitCardPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading hall ticket portal...</div>}>
        <AdmitCardContent />
      </Suspense>
    </div>
  );
}
