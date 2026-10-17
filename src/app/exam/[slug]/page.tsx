import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamBySlug } from "@/lib/exam-data";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) return { title: "Exam Not Found" };
  return {
    title: `${exam.title} | Viksit Chetna Exam Portal`,
    description: exam.description,
  };
}

export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);

  if (!exam) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          href="/exam"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          ← Back to All Exams
        </Link>

        {/* Hero Card */}
        <div className="rounded-2xl border border-primary/20 bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {exam.category || "General Competition"}
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">
              Status: Open & Active
            </span>
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-foreground">
            {exam.title}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {exam.description}
          </p>

          {/* Key Stats Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border bg-muted/30 p-4 text-center">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Duration</p>
              <p className="text-xl font-extrabold text-foreground mt-1">{exam.duration_minutes} Mins</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Total Marks</p>
              <p className="text-xl font-extrabold text-foreground mt-1">{exam.total_marks}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Pass Criterion</p>
              <p className="text-xl font-extrabold text-foreground mt-1">{exam.passing_percentage}%</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Registration</p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">100% Free</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 border-t pt-6">
            <Link
              href={`/exam/${exam.slug}/test`}
              className="btn-shimmer flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all text-center"
            >
              🚀 Enter Exam Hall & Start Test
            </Link>
            <Link
              href={`/exam/register?examId=${exam.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors text-center"
            >
              📋 Register As Candidate
            </Link>
            <Link
              href="/exam/admit-card"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-center"
            >
              🎫 Find Roll No.
            </Link>
          </div>
        </div>

        {/* Detailed Guidelines & Instructions */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Official Test Instructions</h2>
              <div className="space-y-3 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {exam.instructions || (
                  `1. The exam contains multiple-choice objective questions.\n2. Each question has four choices with one correct answer.\n3. The countdown begins as soon as you confirm candidate entry.\n4. You can navigate freely between questions using the Question Navigator.\n5. Answered questions will be indicated in Green, and Marked for Review in Purple.\n6. Submitting the test locks your responses and delivers instant evaluation and certificate eligibility.`
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-3">Eligibility & Scope</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Open to students, intellectuals, scholars, and curious individuals across all ages. Questions are crafted to test rational thought, empirical understanding, and civic consciousness rather than rote memorization.
              </p>
            </div>
          </div>

          {/* Side Box: Recognition & Certificate */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
              <span className="text-3xl">🏅</span>
              <h3 className="mt-3 text-base font-bold text-foreground">Digital Certificate of Merit</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Candidates scoring {exam.passing_percentage}% or above will be issued an official digital Certificate of Merit with a unique cryptographic verification ID and QR code.
              </p>
              <div className="mt-4 pt-4 border-t border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                Certified by Viksit Chetna Intellectual Club, India
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground">Need Technical Help?</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                If you face issues starting or submitting the test, contact our support team:
              </p>
              <p className="mt-2 text-xs font-semibold text-primary">support@viksitchetna.in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
