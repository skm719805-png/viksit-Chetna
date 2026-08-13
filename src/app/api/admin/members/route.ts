import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id, status } = await req.json();
  if (status === "approved") {
    const year = new Date().getFullYear();
    const { count } = await supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "approved");
    const num = String((count || 0) + 1).padStart(5, "0");
    const member_id = `VC-${year}-${num}`;
    const { error } = await supabase.from("members").update({ status, member_id }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, member_id });
  }
  const { error } = await supabase.from("members").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await req.json();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
