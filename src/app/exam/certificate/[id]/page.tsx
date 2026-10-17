"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [cert, setCert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/exam/certificate/${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.certificate) {
          setCert(data.certificate);
        } else {
          setError(data.error || "Certificate could not be verified.");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 text-center text-sm text-muted-foreground">
        Verifying cryptographic certificate credentials...
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <span className="text-4xl">⚠️</span>
          <h2 className="mt-4 text-xl font-bold text-foreground">Certificate Verification Failed</h2>
          <p className="mt-2 text-xs text-muted-foreground">{error || "Invalid Certificate ID."}</p>
          <Link
            href="/exam"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
          >
            ← Return to Exam Portal
          </Link>
        </div>
      </div>
    );
  }

  const isDistinction = cert.percentage >= 75;

  return (
    <div className="min-h-screen bg-muted/20 py-10 px-4">
      {/* Top Action Bar (hidden in print) */}
      <div className="mx-auto max-w-4xl mb-6 print:hidden flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-foreground">Authentic Verified Certificate</span>
          <span className="text-xs font-mono text-muted-foreground">({cert.certificate_id})</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm"
          >
            🖨️ Print / Download Certificate (PDF)
          </Button>
          <Link
            href="/exam"
            className="inline-flex rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Exam Portal
          </Link>
        </div>
      </div>

      {/* Official Certificate Layout (A4 Landscape Print Friendly) */}
      <div className="mx-auto max-w-4xl rounded-2xl border-8 border-double border-amber-600/40 bg-card p-8 sm:p-14 shadow-2xl relative overflow-hidden print:border-black print:m-0 print:p-8 print:shadow-none">
        {/* Background Ornamental Emblem */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <img src="/logo.png" alt="Emblem" className="w-96 h-96 object-contain" />
        </div>

        {/* Certificate Header */}
        <div className="text-center relative z-10">
          <img src="/logo.png" alt="Viksit Chetna" className="mx-auto h-16 w-16 rounded-full ring-4 ring-amber-500/30" />
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-widest text-foreground uppercase font-serif">
            Viksit Chetna Intellectual Club
          </h1>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 tracking-[0.25em] uppercase mt-1">
            National Council for Scientific inquiry & rational education
          </p>

          <div className="my-6 flex items-center justify-center gap-4">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-amber-500" />
            <span className="font-serif italic text-base sm:text-lg font-bold text-primary">
              {isDistinction ? "Certificate of Intellectual Distinction" : "Certificate of Academic Merit"}
            </span>
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
        </div>

        {/* Certificate Body Text */}
        <div className="mt-8 text-center space-y-4 text-sm sm:text-base text-foreground relative z-10 leading-relaxed font-serif">
          <p className="text-xs tracking-wider uppercase text-muted-foreground">This is proudly conferred upon</p>
          <h2 className="text-2xl sm:text-3xl font-black text-primary underline underline-offset-8 decoration-amber-500/50">
            {cert.student_name || "Distinguished Scholar"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Roll Number: <strong className="font-mono text-foreground">{cert.roll_number || "VC-2026-CERT"}</strong> • Institution: <strong className="text-foreground">{cert.institution || "Viksit Chetna Academy"}</strong>
          </p>

          <p className="max-w-2xl mx-auto pt-2 text-xs sm:text-sm text-foreground/90">
            in recognition of outstanding scientific aptitude, analytical dedication, and successful participation in the national examination{" "}
            <span className="font-bold text-primary">"{cert.exam_title || "National Scientific Talent Olympiad"}"</span>, achieving a verified score of{" "}
            <span className="font-bold text-foreground">{cert.score} Marks ({cert.percentage}%)</span> with an accuracy of{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{cert.correct_answers} correct answers</span>.
          </p>
        </div>

        {/* Bottom Signatures & Seal Grid */}
        <div className="mt-14 pt-8 border-t border-amber-600/20 grid grid-cols-3 items-end text-center relative z-10">
          <div>
            <div className="font-serif italic text-sm font-bold text-foreground">Dr. S. K. Mishra</div>
            <div className="w-32 mx-auto border-b border-foreground/40 mt-1 mb-1" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Academic Director</p>
            <p className="text-[9px] text-muted-foreground">Viksit Chetna Council</p>
          </div>

          {/* Central Gold Seal Badge */}
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full border-4 border-amber-500/60 bg-amber-500/10 flex flex-col items-center justify-center p-1 text-center shadow-inner">
              <span className="text-xs font-serif font-black text-amber-700 dark:text-amber-400 uppercase leading-none">
                VERIFIED
              </span>
              <span className="text-[8px] font-bold text-muted-foreground mt-0.5">EXAM 2026</span>
              <span className="text-xs mt-0.5">⭐</span>
            </div>
            <span className="mt-1 font-mono text-[9px] text-muted-foreground">{cert.certificate_id}</span>
          </div>

          <div>
            <div className="font-serif italic text-sm font-bold text-primary">Controller of Exams</div>
            <div className="w-32 mx-auto border-b border-foreground/40 mt-1 mb-1" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Board of Evaluation</p>
            <p className="text-[9px] text-muted-foreground">Govt. Regd. Society</p>
          </div>
        </div>

        {/* Footer Cryptographic Footnote */}
        <div className="mt-8 pt-4 border-t border-dashed border-border/80 text-center text-[10px] text-muted-foreground font-mono">
          Authenticity can be verified online anytime at https://viksitchetna.in/exam/certificate/{cert.certificate_id}
        </div>
      </div>
    </div>
  );
}
