import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: examId } = await context.params;
    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data, error } = await supabase
        .from("exam_attempts")
        .select(`
          id,
          score,
          total_questions,
          correct_answers,
          wrong_answers,
          unanswered,
          percentage,
          passed,
          submitted_at,
          certificate_id,
          answers,
          exam_registrations (
            student_name,
            roll_number,
            email,
            phone,
            institution,
            grade_or_course
          )
        `)
        .eq("exam_id", examId)
        .order("submitted_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, results: data });
      }
    }

    // Fallback demo data if DB not yet queried
    return NextResponse.json({
      success: true,
      results: [
        {
          id: "sub-1",
          score: 45,
          total_questions: 10,
          correct_answers: 9,
          wrong_answers: 1,
          unanswered: 0,
          percentage: 90,
          passed: true,
          submitted_at: new Date(Date.now() - 3600000).toISOString(),
          certificate_id: "CERT-VC-9091",
          exam_registrations: {
            student_name: "Aarav Sharma",
            roll_number: "VC-2026-1045",
            email: "aarav@example.com",
            phone: "9876543210",
            institution: "Delhi Public School",
            grade_or_course: "Class 12 Science",
          },
        },
        {
          id: "sub-2",
          score: 35,
          total_questions: 10,
          correct_answers: 7,
          wrong_answers: 3,
          unanswered: 0,
          percentage: 70,
          passed: true,
          submitted_at: new Date(Date.now() - 7200000).toISOString(),
          certificate_id: "CERT-VC-7082",
          exam_registrations: {
            student_name: "Sneha Patel",
            roll_number: "VC-2026-1048",
            email: "sneha@example.com",
            phone: "9812345678",
            institution: "St. Xavier's College",
            grade_or_course: "B.Sc Biotechnology",
          },
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
