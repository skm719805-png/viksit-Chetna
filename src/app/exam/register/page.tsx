"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ExamItem {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number;
  total_marks: number;
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedExamId = searchParams.get("examId") || "";

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const [examId, setExamId] = useState(preselectedExamId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [grade, setGrade] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredData, setRegisteredData] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/exam/list")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.exams) {
          setExams(data.exams);
          if (!examId && data.exams.length > 0) {
            setExamId(data.exams[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load exams:", err))
      .finally(() => setLoadingExams(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/exam/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: examId,
          student_name: name,
          email,
          phone,
          institution,
          grade_or_course: grade,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to complete registration");
      }

      setRegisteredData(data.registration);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedExam = exams.find((e) => e.id === (registeredData?.exam_id || examId));

  if (registeredData) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border-2 border-emerald-500/30 bg-card p-6 sm:p-8 shadow-xl">
          <div className="text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              ✓
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-foreground">Registration Confirmed!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your official Viksit Chetna candidate hall ticket has been generated.
            </p>
          </div>

          {/* Admit Card Ticket Summary */}
          <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Candidate Roll Number</span>
                <p className="text-xl font-mono font-extrabold text-foreground">{registeredData.roll_number}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Admit Pass</span>
                <p className="text-xs font-mono font-bold text-muted-foreground">{registeredData.admit_card_key}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Candidate Name:</span>
                <p className="font-bold text-foreground mt-0.5">{registeredData.student_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Registered Phone:</span>
                <p className="font-bold text-foreground mt-0.5">{registeredData.phone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Institution:</span>
                <p className="font-bold text-foreground mt-0.5">{registeredData.institution}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Examination:</span>
                <p className="font-bold text-foreground mt-0.5">{selectedExam?.title || "Viksit Chetna Examination"}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {selectedExam && (
              <Link
                href={`/exam/${selectedExam.slug}/test?roll=${registeredData.roll_number}`}
                className="btn-shimmer flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 text-center"
              >
                🚀 Proceed to Exam Hall
              </Link>
            )}
            <Link
              href={`/exam/admit-card?query=${registeredData.roll_number}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted text-center"
            >
              🖨️ View & Print Full Admit Card
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
        <div className="text-center">
          <span className="text-3xl">📝</span>
          <h1 className="mt-2 text-2xl font-extrabold text-foreground">Candidate Registration</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Register free for Viksit Chetna National Examinations & Competitions
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Select Examination <span className="text-destructive">*</span>
            </label>
            {loadingExams ? (
              <div className="h-10 rounded-lg border bg-muted/40 animate-pulse" />
            ) : (
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.duration_minutes} Mins • {ex.total_marks} Marks)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar / Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="candidate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Mobile Number <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              School / College / Institution <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kendriya Vidyalaya / Delhi University / Independent"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Class / Course / Grade (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Class 11 / B.Sc Physics / Competitive Aspirant"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            By registering, you affirm to uphold scientific honesty and abide by the test rules.
          </p>

          <Button
            type="submit"
            disabled={submitting || loadingExams}
            className="w-full h-11 rounded-xl bg-primary text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
          >
            {submitting ? "Generating Admit Card..." : "Generate Admit Card & Register"}
          </Button>
        </form>

        <div className="mt-6 border-t pt-4 text-center">
          <Link href="/exam/admit-card" className="text-xs text-primary font-medium hover:underline">
            Already registered? Retrieve your Admit Card here →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ExamRegisterPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading registration portal...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
