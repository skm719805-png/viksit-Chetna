import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { emailCampaignParticipation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { campaign_id, responses } = await req.json();
  if (!campaign_id || !responses) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { error } = await supabase.from("campaign_participations").insert({ campaign_id, responses });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: campaign } = await supabase.from("campaigns").select("title").eq("id", campaign_id).single();
  const name = responses.name || responses.full_name || "Participant";
  const email = responses.email;
  if (email) await emailCampaignParticipation(name, email, campaign?.title || "Campaign");
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const campaign_id = req.nextUrl.searchParams.get("campaign_id");
  if (req.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  let q = supabase.from("campaign_participations").select("*").order("created_at", { ascending: false });
  if (campaign_id) q = q.eq("campaign_id", campaign_id);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
