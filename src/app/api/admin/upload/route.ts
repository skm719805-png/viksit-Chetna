import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(fileName, file, { contentType: file.type });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
  return NextResponse.json({ url: urlData.publicUrl });
}
