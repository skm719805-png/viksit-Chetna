import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { data } = await supabase.from("leaders").select("*").order("display_order", { ascending: true });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const bio = formData.get("bio") as string | null;
  const social_facebook = formData.get("social_facebook") as string | null;
  const social_instagram = formData.get("social_instagram") as string | null;
  const social_twitter = formData.get("social_twitter") as string | null;
  const display_order = Number(formData.get("display_order") || 0);
  const photo = formData.get("photo") as File | null;
  let photo_url: string | null = null;
  if (photo && photo.size > 0) {
    const ext = photo.name.split(".").pop();
    const fileName = `leaders/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("images").upload(fileName, photo, { contentType: photo.type });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
      photo_url = urlData.publicUrl;
    }
  }
  const { data, error } = await supabase.from("leaders").insert({ name, role, bio: bio || null, photo_url, social_facebook: social_facebook || null, social_instagram: social_instagram || null, social_twitter: social_twitter || null, display_order }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const formData = await req.formData();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const bio = formData.get("bio") as string | null;
  const social_facebook = formData.get("social_facebook") as string | null;
  const social_instagram = formData.get("social_instagram") as string | null;
  const social_twitter = formData.get("social_twitter") as string | null;
  const display_order = Number(formData.get("display_order") || 0);
  const photo = formData.get("photo") as File | null;
  const existing_photo_url = formData.get("existing_photo_url") as string | null;
  let photo_url = existing_photo_url;
  if (photo && photo.size > 0) {
    const ext = photo.name.split(".").pop();
    const fileName = `leaders/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("images").upload(fileName, photo, { contentType: photo.type });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
      photo_url = urlData.publicUrl;
    }
  }
  const { data, error } = await supabase.from("leaders").update({ name, role, bio: bio || null, photo_url, social_facebook: social_facebook || null, social_instagram: social_instagram || null, social_twitter: social_twitter || null, display_order, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { id } = await req.json();
  const { error } = await supabase.from("leaders").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
