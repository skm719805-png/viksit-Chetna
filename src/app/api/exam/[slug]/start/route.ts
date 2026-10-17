import { NextRequest, NextResponse } from "next/server";
import { getExamBySlug, findRegistration, getExamQuestions } from "@/lib/exam-data";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { roll_number } = await req.json();

    if (!roll_number || !roll_number.trim()) {
      return NextResponse.json({ success: false, error: "Roll Number is required to enter the examination." }, { status: 400 });
    }

    const exam = await getExamBySlug(slug);
    if (!exam) {
      return NextResponse.json({ success: false, error: "Exam not found." }, { status: 404 });
    }

    const registration = await findRegistration(roll_number);
    if (!registration) {
      return NextResponse.json({
        success: false,
        error: "Roll Number not found. Please register first or verify your roll number from your Admit Card.",
      }, { status: 404 });
    }

    // Get sanitized questions (without answers)
    const questions = await getExamQuestions(exam.id, false);

    return NextResponse.json({
      success: true,
      exam,
      candidate: {
        id: registration.id,
        roll_number: registration.roll_number,
        student_name: registration.student_name,
        institution: registration.institution,
      },
      questions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
