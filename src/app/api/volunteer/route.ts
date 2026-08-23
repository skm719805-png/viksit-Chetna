import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { emailVolunteerRegistered } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { name, email, phone, campaign_id, message } = await req.json();
  if (!name || !email || !phone || !campaign_id) return NextResponse.json({ error: "All fields required" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { error } = await supabase.from("volunteers").insert({ name, email, phone, campaign_id, message });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: campaign } = await supabase.from("campaigns").select("title").eq("id", campaign_id).single();
  await emailVolunteerRegistered(name, email, campaign?.title || "Campaign");
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { data } = await supabase.from("volunteers").select("id, status, certificate_issued, campaigns(title)").eq("email", email).order("created_at", { ascending: false });
  const result = (data || []).map((v: Record<string, unknown>) => ({
    id: v.id,
    status: v.status,
    certificate_issued: v.certificate_issued,
    campaign_title: (v.campaigns as { title: string } | null)?.title || "Unknown",
  }));
  return NextResponse.json(result);
}
