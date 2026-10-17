"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExamAnswerKeyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [exam, setExam] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch exam details and questions with correct answers
    fetch(`/api/exam/${slug}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.success || !data.exam) throw new Error(data.error || "Exam not found");
        setExam(data.exam);

        // Fetch questions from start endpoint or seed questions
        const qRes = await fetch(`/api/exam/${slug}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roll_number: "VC-2026-TEACHER" }),
        });
        const qData = await qRes.json();

        // Also fetch answer key evaluation
        const evalRes = await fetch(`/api/exam/${slug}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registration_id: "teacher-key",
            answers: {},
            student_name: "Teacher Key Copy",
          }),
        });
        const evalData = await evalRes.json();

        if (evalData.success && evalData.result?.questions) {
          setQuestions(evalData.result.questions);
        } else if (qData.questions) {
          setQuestions(qData.questions);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 text-center text-sm text-muted-foreground">
        Generating Answer-Marked Question Paper...
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 text-center">
        <p className="text-destructive font-semibold">{error || "Failed to load exam paper."}</p>
        <Link href="/admin" className="mt-4 inline-block text-xs text-primary underline">
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4">
      {/* Top Action Bar (hidden during print) */}
      <div className="mx-auto max-w-4xl mb-6 print:hidden flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border shadow-sm">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Teacher Master Copy</span>
          <h2 className="text-sm font-extrabold text-foreground">Official Question Paper with Answers Marked</h2>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm flex items-center gap-2"
          >
            🖨️ Download / Print PDF with Answers Marked
          </Button>
          <Link
            href="/admin"
            className="inline-flex rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Admin Panel
          </Link>
        </div>
      </div>

      {/* Printable Master Question Paper with Marked Answers */}
      <div className="mx-auto max-w-4xl rounded-2xl border bg-card p-8 sm:p-12 shadow-md print:shadow-none print:border-none print:m-0 print:p-4">
        {/* Paper Header */}
        <div className="border-b-2 border-primary/20 pb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.png" alt="Viksit Chetna" className="h-12 w-12 rounded-full ring-2 ring-primary/20" />
            <div className="text-left">
              <h1 className="text-xl font-black text-foreground tracking-tight uppercase">VIKSIT CHETNA INTELLECTUAL CLUB</h1>
              <p className="text-[10px] text-primary font-bold tracking-widest uppercase">Department of Examinations & Scientific Assessments</p>
            </div>
          </div>

          <div className="mt-4 inline-block rounded-xl border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-extrabold text-primary uppercase">
            Official Question Paper & Complete Solution Key
          </div>

          <h2 className="mt-3 text-2xl font-extrabold text-foreground">{exam.title}</h2>

          <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground border-t pt-3">
            <span>Subject: <strong className="text-foreground">{exam.category || "General Knowledge"}</strong></span>
            <span>Duration: <strong className="text-foreground">{exam.duration_minutes} Minutes</strong></span>
            <span>Total Questions: <strong className="text-foreground">{questions.length}</strong></span>
            <span>Maximum Marks: <strong className="text-foreground">{exam.total_marks}</strong></span>
            <span>Passing Marks: <strong className="text-foreground">{exam.passing_percentage}%</strong></span>
          </div>
        </div>

        {/* Quick Answer Key Matrix */}
        <div className="mt-6 rounded-xl border bg-muted/30 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Quick Answer Key Index</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-center text-xs">
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-lg border bg-card p-1.5 shadow-2xs">
                <span className="text-[10px] text-muted-foreground block">Q{idx + 1}</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {String.fromCharCode(65 + (q.correct_option >= 0 ? q.correct_option : 0))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Questions with Answers Marked */}
        <div className="mt-8 space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border border-border p-5 space-y-3 break-inside-avoid">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-foreground">
                  Question {idx + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  +{q.marks || 1} Mark{q.marks > 1 ? "s" : ""}
                </span>
              </div>

              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {q.question_text}
              </p>

              {/* Options with marked answer */}
              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                {q.options.map((opt: string, optIdx: number) => {
                  const isCorrect = q.correct_option === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-colors ${
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold ring-1 ring-emerald-500"
                          : "border-border/80 bg-background text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-mono font-bold ${
                          isCorrect
                            ? "bg-emerald-600 text-white"
                            : "border border-muted-foreground/30 text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 mt-0.5">{opt}</span>
                      {isCorrect && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm ml-1 select-none">
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="mt-3 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground border border-primary/10">
                  <strong className="text-primary font-semibold">💡 Scientific Explanation / Solution: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 border-t pt-4 text-center text-xs text-muted-foreground">
          Confidential Answer Key Document • Prepared by Viksit Chetna Examination Cell
        </div>
      </div>
    </div>
  );
}
