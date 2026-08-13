import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const pincode = formData.get("pincode") as string;
  const dob = formData.get("dob") as string;
  const photo = formData.get("photo") as File | null;
  if (!name || !email || !phone || !address || !city || !state || !pincode || !dob) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { data: existing } = await supabase.from("members").select("id").eq("email", email).single();
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  let photo_url = null;
  if (photo) {
    const ext = photo.name.split(".").pop();
    const fileName = `members/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("images").upload(fileName, photo, { contentType: photo.type });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
      photo_url = urlData.publicUrl;
    }
  }
  const { error } = await supabase.from("members").insert({ name, email, phone, address, city, state, pincode, dob, photo_url });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { data } = await supabase.from("members").select("id, name, status, member_id").eq("email", email).single();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
