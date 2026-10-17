import Link from "next/link";
import { getAllExams } from "@/lib/exam-data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Examination Portal | Viksit Chetna",
  description: "Participate in Viksit Chetna National Science & Rationality Olympiads, download admit cards, and earn certified credentials.",
};

export const dynamic = "force-dynamic";

export default async function ExamPortalPage() {
  const exams = await getAllExams();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-primary/10 bg-gradient-to-b from-primary/10 via-background to-background py-16 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-4 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Viksit Chetna Examination & Talent Assessment 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Empowering Minds Through <span className="gradient-text">Scientific Inquiry</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Take national-level online assessments, compete with fellow intellectual thinkers, test your rational reasoning, and earn verifiable merit certificates.
          </p>

          {/* Quick Action Navigation */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <a
              href="#exams-list"
              className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
            >
              📝 Browse Available Exams
            </a>
            <Link
              href="/exam/admit-card"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              🎫 Download Admit Card
            </Link>
            <Link
              href="/exam/register"
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              ⚡ Student Registration
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Quick Search & Verification Grid */}
        <section className="mb-14 grid gap-6 md:grid-cols-2">
          {/* Admit Card Lookup Card */}
          <div className="rounded-2xl border border-primary/15 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
                🎫
              </div>
              <div>
                <h3 className="font-bold text-foreground">Admit Card Portal</h3>
                <p className="text-xs text-muted-foreground">Already registered? Find & print your official hall ticket</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Retrieve your roll number, exam center details, schedule, and candidate guidelines by entering your mobile number or roll code.
            </p>
            <div className="mt-6">
              <Link
                href="/exam/admit-card"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
              >
                Search & Download Admit Card →
              </Link>
            </div>
          </div>

          {/* Certificate & Result Lookup Card */}
          <div className="rounded-2xl border border-primary/15 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-600">
                🏆
              </div>
              <div>
                <h3 className="font-bold text-foreground">Verify Scorecard & Certificate</h3>
                <p className="text-xs text-muted-foreground">Authenticate official Viksit Chetna certificates</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Verify scores, view candidate performance analysis, and validate authentic QR-coded certificates issued by the club.
            </p>
            <div className="mt-6">
              <Link
                href="/exam/admit-card"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
              >
                Check Results & Certificates →
              </Link>
            </div>
          </div>
        </section>

        {/* Exams List */}
        <section id="exams-list" className="scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Active Assessments</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Available Examinations</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {exams.length} examinations open for enrollment
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {exam.category || "General"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      Free Entry
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {exam.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {exam.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="mt-5 grid grid-cols-3 gap-2 border-y py-3 text-center text-xs">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase">Duration</p>
                      <p className="font-bold text-foreground mt-0.5">{exam.duration_minutes} Mins</p>
                    </div>
                    <div className="border-x">
                      <p className="text-muted-foreground text-[10px] uppercase">Total Marks</p>
                      <p className="font-bold text-foreground mt-0.5">{exam.total_marks}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase">Pass Criteria</p>
                      <p className="font-bold text-foreground mt-0.5">{exam.passing_percentage}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href={`/exam/${exam.slug}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                  >
                    🚀 View Exam & Start Test
                  </Link>
                  <Link
                    href={`/exam/register?examId=${exam.id}`}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Register New Candidate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Examination Instructions & Code of Conduct */}
        <section className="mt-16 rounded-2xl border border-primary/10 bg-primary/[0.02] p-8">
          <h3 className="text-xl font-bold text-foreground">Examination Rules & Ethics</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please adhere to the following standards of academic and intellectual integrity:
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div className="rounded-xl border bg-card p-4">
              <span className="text-xl">⏱️</span>
              <h4 className="mt-2 font-bold text-foreground">Strict Time Limit</h4>
              <p className="mt-1 text-muted-foreground">Each test has an automated countdown timer. Tests are auto-submitted on expiration.</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <span className="text-xl">🔒</span>
              <h4 className="mt-2 font-bold text-foreground">Anti-Cheat System</h4>
              <p className="mt-1 text-muted-foreground">Tab switches, multiple window instances, and background refreshing are strictly monitored.</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <span className="text-xl">📜</span>
              <h4 className="mt-2 font-bold text-foreground">Instant Merit Certificate</h4>
              <p className="mt-1 text-muted-foreground">Passing candidates receive an official digitally verified Certificate of Intellectual Achievement.</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <span className="text-xl">💡</span>
              <h4 className="mt-2 font-bold text-foreground">Detailed Answer Keys</h4>
              <p className="mt-1 text-muted-foreground">Explanations and comprehensive review for each question are unlocked after completion.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
