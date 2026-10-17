import { NextRequest, NextResponse } from "next/server";
import { getExamBySlug } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const exam = await getExamBySlug(slug);

    if (!exam) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
