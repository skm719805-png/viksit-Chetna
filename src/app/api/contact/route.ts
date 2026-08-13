import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();
  if (!name || !email || !message) return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { error } = await supabase.from("contacts").insert({ name, email, subject, message });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
