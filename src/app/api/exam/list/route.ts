import { NextResponse } from "next/server";
import { getAllExams } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const exams = await getAllExams();
    return NextResponse.json({ success: true, exams });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
