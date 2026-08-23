import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { emailMemberApproved, emailMemberRejected } from "@/lib/email";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
  const mapped = (data || []).map(({ dob, ...rest }) => ({ ...rest, age: dob }));
  return NextResponse.json(mapped);
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const body = await req.json();
  const { id, status, promote_to_leader, age, ...rest } = body;

  if (promote_to_leader) {
    const { data: member } = await supabase.from("members").select("*").eq("id", id).single();
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    const { error } = await supabase.from("leaders").insert({
      name: member.name,
      role: promote_to_leader.role || "Leader",
      bio: promote_to_leader.bio || null,
      photo_url: promote_to_leader.photo_url ?? member.photo_url ?? null,
      display_order: promote_to_leader.display_order ?? 0,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (status !== undefined && Object.keys(rest).length === 0 && age === undefined) {
    if (status === "approved") {
      const year = new Date().getFullYear();
      const { count } = await supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "approved");
      const num = String((count || 0) + 1).padStart(5, "0");
      const member_id = `VC-${year}-${num}`;
      const { error } = await supabase.from("members").update({ status, member_id }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const { data: member } = await supabase.from("members").select("name, email").eq("id", id).single();
      if (member) await emailMemberApproved(member.name, member.email, member_id, id);
      return NextResponse.json({ success: true, member_id });
    }
    if (status === "rejected") {
      const { data: member } = await supabase.from("members").select("name, email").eq("id", id).single();
      const { error } = await supabase.from("members").update({ status }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (member) await emailMemberRejected(member.name, member.email);
      return NextResponse.json({ success: true });
    }
    const { error } = await supabase.from("members").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const allowed = ["name", "email", "phone", "address", "city", "state", "pincode", "status"];
  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (age !== undefined) updates["dob"] = age;
  const { error } = await supabase.from("members").update(updates).eq("id", id);
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
