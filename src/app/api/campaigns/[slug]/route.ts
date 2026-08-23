import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const isUUID = /^[0-9a-f-]{36}$/.test(slug);
  const query = supabase.from("campaigns").select("*").eq("is_active", true);
  const { data, error } = await (isUUID ? query.eq("id", slug) : query.eq("slug", slug)).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
