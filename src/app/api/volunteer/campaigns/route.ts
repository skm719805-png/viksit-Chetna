import { getSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json([]);
  const { data } = await supabase.from("campaigns").select("id, title").eq("is_active", true).order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}
