import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { data } = await supabase.from("volunteers").select("name, certificate_issued, campaigns(title)").eq("id", id).single();
  if (!data || !data.certificate_issued) return NextResponse.json({ error: "Certificate not available" }, { status: 404 });
  return NextResponse.json({
    name: data.name,
    campaign_title: (data.campaigns as unknown as { title: string } | null)?.title || "Campaign",
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  });
}
