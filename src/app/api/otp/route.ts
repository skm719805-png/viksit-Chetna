import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { generateOtp, setOtp, verifyOtp } from "@/lib/otp";
import { emailIdCardOtp, emailCertificateOtp } from "@/lib/email";

// POST /api/otp  { type: "idcard"|"certificate", id: string }
export async function POST(req: NextRequest) {
  const { type, id } = await req.json();
  if (!type || !id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const otp = generateOtp();
  const key = `${type}:${id}`;
  setOtp(key, otp);

  if (type === "idcard") {
    const { data } = await supabase.from("members").select("name, email").eq("id", id).eq("status", "approved").single();
    if (!data) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    await emailIdCardOtp(data.name, data.email, otp);
    return NextResponse.json({ success: true, email: data.email.replace(/(.{2}).+(@.+)/, "$1***$2") });
  }

  if (type === "certificate") {
    const { data } = await supabase.from("volunteers").select("name, email").eq("id", id).eq("certificate_issued", true).single();
    if (!data) return NextResponse.json({ error: "Certificate not available" }, { status: 404 });
    await emailCertificateOtp(data.name, data.email, otp);
    return NextResponse.json({ success: true, email: data.email.replace(/(.{2}).+(@.+)/, "$1***$2") });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// GET /api/otp?type=idcard&id=xxx&otp=123456
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");
  const otp = req.nextUrl.searchParams.get("otp");
  if (!type || !id || !otp) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const valid = verifyOtp(`${type}:${id}`, otp);
  if (!valid) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
  return NextResponse.json({ success: true });
}
