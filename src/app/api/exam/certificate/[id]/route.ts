import { NextRequest, NextResponse } from "next/server";
import { getAttemptByCertificate } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const attempt = await getAttemptByCertificate(id);

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: "Certificate or scorecard not found. Please verify the Certificate ID." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, certificate: attempt });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
