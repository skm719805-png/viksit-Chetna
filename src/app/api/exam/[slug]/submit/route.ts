import { NextRequest, NextResponse } from "next/server";
import { submitExamAttempt, getExamBySlug } from "@/lib/exam-data";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await req.json();
    const { registration_id, answers, roll_number, student_name, institution } = body;

    const exam = await getExamBySlug(slug);
    if (!exam) {
      return NextResponse.json({ success: false, error: "Exam not found." }, { status: 404 });
    }

    const result = await submitExamAttempt({
      exam_id: exam.id,
      registration_id: registration_id || "direct-candidate",
      answers: answers || {},
      roll_number,
      student_name,
      institution,
    });

    return NextResponse.json({
      success: true,
      result,
      message: result.passed
        ? "Congratulations! You have successfully passed the examination."
        : "Exam completed. Keep striving and learning with Viksit Chetna!",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
