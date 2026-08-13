import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { data } = await supabase.from("members").select("name, member_id, phone, city, state, photo_url, dob, created_at").eq("id", id).eq("status", "approved").single();
  if (!data) return NextResponse.json({ error: "Member not found or not approved" }, { status: 404 });
  return NextResponse.json(data);
}
