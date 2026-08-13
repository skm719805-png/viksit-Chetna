import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({}, { status: 503 });
  const { data } = await supabase.from("site_settings").select("key, value");
  const settings: Record<string, string> = {};
  (data || []).forEach((r: { key: string; value: string }) => { settings[r.key] = r.value; });
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const body: Record<string, string> = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
  }
  return NextResponse.json({ success: true });
}
