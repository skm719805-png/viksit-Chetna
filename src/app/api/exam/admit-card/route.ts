import { NextRequest, NextResponse } from "next/server";
import { findRegistration } from "@/lib/exam-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Please enter a Roll Number or Phone number" }, { status: 400 });
    }

    const registration = await findRegistration(query);

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "No admit card found for the provided details. Please verify and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, registration });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
