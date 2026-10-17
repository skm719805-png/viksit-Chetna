import { NextRequest, NextResponse } from "next/server";
import { createRegistration } from "@/lib/exam-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exam_id, student_name, email, phone, institution, grade_or_course } = body;

    if (!exam_id || !student_name || !email || !phone || !institution) {
      return NextResponse.json(
        { success: false, error: "Please fill all required registration fields." },
        { status: 400 }
      );
    }

    const registration = await createRegistration({
      exam_id,
      student_name: student_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      institution: institution.trim(),
      grade_or_course: grade_or_course ? grade_or_course.trim() : "",
    });

    return NextResponse.json({
      success: true,
      registration,
      message: "Registration successful! Keep your Roll Number and Admit Card safe.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
