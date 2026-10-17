"use client";

import { useState, useEffect, useCallback, use, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  marks: number;
  negative_marks?: number;
  order_index: number;
}

interface ExamInfo {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number;
  total_marks: number;
  passing_percentage: number;
  instructions: string;
}

interface CandidateInfo {
  id: string;
  roll_number: string;
  student_name: string;
  institution: string;
}

function ExamEngine({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const initialRoll = searchParams.get("roll") || "";
  const router = useRouter();

  // Pre-test gate state
  const [rollInput, setRollInput] = useState(initialRoll);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Active test state
  const [testActive, setTestActive] = useState(false);
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers & Review status: question_id -> option index
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});

  // Countdown Timer (in seconds)
  const [timeLeft, setTimeLeft] = useState<number>(1200);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Result state
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  // Start exam session
  const handleStartExam = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rollInput.trim()) {
      setStartError("Please enter your Roll Number.");
      return;
    }
    if (!agreed) {
      setStartError("Please accept the examination rules and ethics declaration.");
      return;
    }

    setStartError(null);
    setStarting(true);

    try {
      const res = await fetch(`/api/exam/${slug}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_number: rollInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to enter exam.");
      }

      setExam(data.exam);
      setCandidate(data.candidate);
      setQuestions(data.questions);
      setTimeLeft((data.exam.duration_minutes || 20) * 60);
      setTestActive(true);
    } catch (err: any) {
      setStartError(err.message || "Failed to start exam.");
    } finally {
      setStarting(false);
    }
  };

  // Submit test
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const res = await fetch(`/api/exam/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_id: candidate?.id,
          roll_number: candidate?.roll_number || rollInput,
          student_name: candidate?.student_name,
          institution: candidate?.institution,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit exam attempt.");
      }

      setSubmissionResult(data.result);
      setTestActive(false);
    } catch (err: any) {
      alert("Submission error: " + err.message);
      setIsSubmitting(false);
    }
  }, [candidate, isSubmitting, rollInput, slug, answers]);

  // Countdown effect
  useEffect(() => {
    if (!testActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testActive, handleSubmitTest]);

  // Format timer HH:MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Answer selection handler
  const handleSelectOption = (qId: string, optIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  // Clear answer
  const handleClearAnswer = (qId: string) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  // Toggle mark for review
  const handleToggleReview = (qId: string) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Stats calculation
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = totalQ - answeredCount;

  // ─────────────────────────────────────────────────────────────
  // 1. RESULT SCREEN
  // ─────────────────────────────────────────────────────────────
  if (submissionResult) {
    const isPassed = submissionResult.passed;
    return (
      <div className="min-h-screen bg-background py-10 px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Top Score Banner */}
          <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 sm:p-8 shadow-xl text-center">
            <span className="text-5xl">{isPassed ? "🎉" : "📚"}</span>
            <h1 className="mt-4 text-3xl font-extrabold text-foreground">
              {isPassed ? "Examination Completed Successfully!" : "Examination Finished"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Candidate: <strong className="text-foreground">{submissionResult.student_name || candidate?.student_name}</strong> • Roll No: <strong className="text-foreground">{submissionResult.roll_number || candidate?.roll_number}</strong>
            </p>

            {/* Scorecard Metric Tiles */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-muted/30 p-4">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Total Score</span>
                <p className="mt-1 text-2xl font-extrabold text-primary">{submissionResult.score} Marks</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Percentage</span>
                <p className="mt-1 text-2xl font-extrabold text-foreground">{submissionResult.percentage}%</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Accuracy</span>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {submissionResult.correct_answers}/{submissionResult.total_questions} Correct
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Status</span>
                <p className={`mt-1 text-2xl font-extrabold ${isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                  {isPassed ? "QUALIFIED" : "COMPLETED"}
                </p>
              </div>
            </div>

            {/* Certificate Box */}
            <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Official Verification ID</span>
              <p className="text-base font-mono font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                {submissionResult.certificate_id}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/exam/certificate/${submissionResult.certificate_id}`}
                  className="btn-shimmer inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
                >
                  🏅 View & Print Merit Certificate
                </Link>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  🖨️ Print Full Scorecard
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Question Review & Answer Explanations */}
          {submissionResult.questions && submissionResult.questions.length > 0 && (
            <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">Question-by-Question Review & Explanations</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Review your answers, see correct solutions, and read scientific explanations.
              </p>

              <div className="mt-6 space-y-6">
                {submissionResult.questions.map((q: any, idx: number) => {
                  const userAns = submissionResult.answers[q.id];
                  const isCorrect = userAns === q.correct_option;
                  const isUnanswered = userAns === undefined || userAns === null || userAns === -1;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-xl border p-5 transition-all ${
                        isCorrect
                          ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                          : isUnanswered
                          ? "border-border bg-muted/10"
                          : "border-rose-500/30 bg-rose-500/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b pb-3">
                        <span className="text-xs font-bold text-muted-foreground">
                          Question {idx + 1} of {submissionResult.questions.length}
                        </span>
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                              ✓ Correct (+{q.marks} Marks)
                            </span>
                          ) : isUnanswered ? (
                            <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-medium">
                              Not Answered (0 Marks)
                            </span>
                          ) : (
                            <span className="rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold">
                              ✗ Incorrect
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm font-semibold text-foreground">{q.question_text}</p>

                      {/* Options breakdown */}
                      <div className="mt-3 space-y-2">
                        {q.options.map((opt: string, oIdx: number) => {
                          const isSelectedByUser = userAns === oIdx;
                          const isOptionCorrect = q.correct_option === oIdx;

                          let badgeClass = "border-border bg-card text-muted-foreground";
                          if (isOptionCorrect) {
                            badgeClass = "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-semibold";
                          } else if (isSelectedByUser && !isOptionCorrect) {
                            badgeClass = "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 line-through";
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`flex items-center justify-between rounded-lg border px-3.5 py-2 text-xs ${badgeClass}`}
                            >
                              <span>
                                <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                                {opt}
                              </span>
                              {isOptionCorrect && (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ✓ Correct Answer
                                </span>
                              )}
                              {isSelectedByUser && !isOptionCorrect && (
                                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Scientific Explanation */}
                      {q.explanation && (
                        <div className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground border border-primary/10">
                          <strong className="text-primary font-semibold">💡 Scientific Explanation: </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/exam"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  ← Return to Exam Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PRE-EXAM ENTRY GATE SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!testActive) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
            <div className="text-center">
              <span className="text-3xl">🏛️</span>
              <h1 className="mt-2 text-2xl font-extrabold text-foreground">Examination Hall Entry</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter your verified Roll Number to authenticate and begin the live examination
              </p>
            </div>

            {startError && (
              <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
                {startError}
              </div>
            )}

            <form onSubmit={handleStartExam} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Candidate Roll Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VC-2026-1001"
                  value={rollInput}
                  onChange={(e) => setRollInput(e.target.value.toUpperCase())}
                  className="w-full font-mono uppercase rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Don't know your roll number?{" "}
                  <Link href="/exam/admit-card" className="text-primary hover:underline">
                    Search your Admit Card
                  </Link>{" "}
                  or{" "}
                  <Link href={`/exam/register`} className="text-primary hover:underline">
                    Register New Candidate
                  </Link>
                </p>
              </div>

              {/* Ethics Agreement */}
              <div className="rounded-xl border bg-muted/30 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed select-none">
                    I solemnly declare that I will attempt this examination independently without unauthorized aids, browser manipulation, or assistance. I understand the timer starts immediately upon entering.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={starting || !agreed || !rollInput.trim()}
                className="w-full h-11 rounded-xl bg-primary text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
              >
                {starting ? "Verifying Credentials..." : "Begin Live Examination →"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. LIVE EXAMINATION PORTAL
  // ─────────────────────────────────────────────────────────────
  const currentQ = questions[currentIndex];
  const isTimerCritical = timeLeft < 300; // less than 5 mins

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Top Fixed Candidate Exam Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Viksit Chetna" className="h-8 w-8 rounded-full ring-2 ring-primary/20" />
            <div>
              <h2 className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                {exam?.title}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Candidate: <strong className="text-foreground">{candidate?.student_name}</strong> ({candidate?.roll_number})
              </p>
            </div>
          </div>

          {/* Center Timer */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 font-mono text-sm font-extrabold shadow-sm ${
                isTimerCritical
                  ? "border-rose-500 bg-rose-500/10 text-rose-600 animate-pulse"
                  : "border-primary/30 bg-primary/5 text-primary"
              }`}
            >
              <span>⏱️</span>
              <span>{formatTime(timeLeft)}</span>
            </div>

            <Button
              onClick={() => setShowConfirmModal(true)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-4 shadow-sm"
            >
              Finish & Submit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 mx-auto max-w-7xl w-full p-4 grid gap-6 lg:grid-cols-4">
        {/* Left Column: Active Question */}
        <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm min-h-[500px]">
          {currentQ ? (
            <div>
              {/* Question Header Bar */}
              <div className="flex items-center justify-between border-b pb-4">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  Question {currentIndex + 1} of {totalQ}
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span>+{currentQ.marks} Marks</span>
                  {currentQ.negative_marks ? (
                    <span className="text-rose-500">-{currentQ.negative_marks} Neg</span>
                  ) : (
                    <span>0 Neg</span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <h3 className="mt-6 text-base sm:text-lg font-bold text-foreground leading-relaxed">
                {currentQ.question_text}
              </h3>

              {/* Multiple Choice Options */}
              <div className="mt-6 space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20 shadow-sm"
                          : "border-border bg-card text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold font-mono transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40 text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-20">Loading question...</div>
          )}

          {/* Question Bottom Action Bar */}
          <div className="mt-8 border-t pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="text-xs font-semibold"
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                disabled={answers[currentQ?.id] === undefined}
                onClick={() => handleClearAnswer(currentQ?.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear Response
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleToggleReview(currentQ?.id)}
                className={`text-xs font-semibold ${
                  markedForReview[currentQ?.id] ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : ""
                }`}
              >
                {markedForReview[currentQ?.id] ? "★ Marked for Review" : "☆ Mark for Review & Next"}
              </Button>
              <Button
                onClick={() => {
                  if (currentIndex < totalQ - 1) {
                    setCurrentIndex((prev) => prev + 1);
                  }
                }}
                disabled={currentIndex === totalQ - 1}
                className="bg-primary text-primary-foreground text-xs font-bold"
              >
                Save & Next →
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Palette */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h4 className="font-bold text-foreground text-sm">Question Navigator</h4>

            {/* Quick Status Legend */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-purple-500" />
                <span>Marked ({reviewCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-muted-foreground/30 border" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-primary" />
                <span>Current</span>
              </div>
            </div>

            {/* Palette Button Grid */}
            <div className="mt-5 grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = markedForReview[q.id];

                let btnStyle = "bg-muted/40 text-muted-foreground border-border";
                if (isMarked) {
                  btnStyle = "bg-purple-500 text-white font-bold border-purple-600";
                } else if (isAnswered) {
                  btnStyle = "bg-emerald-600 text-white font-bold border-emerald-700";
                }

                if (isCurrent) {
                  btnStyle += " ring-2 ring-primary ring-offset-2";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border text-xs font-mono font-bold transition-all ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Submit Button in Sidebar */}
            <div className="mt-6 border-t pt-4">
              <Button
                onClick={() => setShowConfirmModal(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-md"
              >
                Submit Examination Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-foreground">Confirm Final Submission</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Are you sure you want to end the test? You cannot make further modifications after submitting.
            </p>

            <div className="mt-4 rounded-xl border bg-muted/40 p-3 grid grid-cols-3 text-center text-xs">
              <div>
                <span className="text-muted-foreground text-[10px]">Answered</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{answeredCount}</p>
              </div>
              <div className="border-x">
                <span className="text-muted-foreground text-[10px]">Marked</span>
                <p className="font-bold text-purple-600 text-base">{reviewCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px]">Unanswered</span>
                <p className="font-bold text-rose-500 text-base">{unansweredCount}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 text-xs font-semibold"
              >
                Cancel & Continue Test
              </Button>
              <Button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit Exam"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <Suspense fallback={<div className="text-center text-sm py-16 text-muted-foreground">Loading examination environment...</div>}>
      <ExamEngine slug={slug} />
    </Suspense>
  );
}
