"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

type MemberCard = {
  name: string;
  member_id: string;
  phone: string;
  city: string;
  state: string;
  photo_url: string | null;
  dob: string;
  created_at: string;
};

function IDCardContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [data, setData] = useState<MemberCard | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "idcard", id }) });
    const d = await res.json();
    if (res.ok) { setMaskedEmail(d.email); setOtpSent(true); }
    else setError(d.error || "Failed to send OTP");
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true); setError("");
    const res = await fetch(`/api/otp?type=idcard&id=${id}&otp=${otp}`);
    if (res.ok) {
      setVerified(true);
      fetch(`/api/membership/id-card?id=${id}`).then(r => r.json()).then(setData);
    } else {
      setError("Invalid or expired OTP. Try again.");
    }
    setLoading(false);
  };

  const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  if (!verified) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center space-y-6">
        <div className="text-5xl">🪪</div>
        <h1 className="text-2xl font-bold gradient-text">Verify to Print ID Card</h1>
        {!otpSent ? (
          <>
            <p className="text-sm text-muted-foreground">An OTP will be sent to your registered email address.</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={sendOtp} disabled={loading} className="btn-shimmer w-full rounded-full">
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">OTP sent to <strong>{maskedEmail}</strong>. Valid for 10 minutes.</p>
            <input placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} className={inp} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="btn-shimmer w-full rounded-full">
              {loading ? "Verifying..." : "Verify & View ID Card"}
            </Button>
            <button onClick={sendOtp} className="text-xs text-primary underline">Resend OTP</button>
          </>
        )}
      </div>
    );
  }

  if (!data) return <p className="p-12 text-center text-muted-foreground">Loading ID card...</p>;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Button onClick={() => window.print()} className="mb-4 print:hidden rounded-full">🖨️ Print ID Card</Button>
      <div className="overflow-hidden rounded-2xl border-2 border-primary/40 bg-white shadow-lg print:shadow-none">
        <div className="bg-gradient-to-r from-primary to-primary/70 px-6 py-4 text-center text-white">
          <p className="text-xs uppercase tracking-wider opacity-80">Member Identity Card</p>
          <h2 className="text-lg font-bold">Viksit Chetna</h2>
          <p className="text-xs opacity-70">Intellectual Club</p>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            {data.photo_url ? (
              <img src={data.photo_url} alt={data.name} className="h-24 w-20 rounded-lg border object-cover" />
            ) : (
              <div className="flex h-24 w-20 items-center justify-center rounded-lg border bg-primary/10 text-2xl font-bold text-primary">
                {data.name[0]}
              </div>
            )}
            <div className="flex-1 space-y-1">
              <p className="text-lg font-bold">{data.name}</p>
              <p className="text-xs text-muted-foreground">Member ID</p>
              <p className="font-mono text-sm font-semibold text-primary">{data.member_id}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{data.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Age</p>
              <p className="font-medium">{data.dob}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{data.city}, {data.state}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Since</p>
              <p className="font-medium">{new Date(data.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
            </div>
          </div>
        </div>
        <div className="border-t bg-muted/50 px-6 py-3 text-center text-xs text-muted-foreground">
          viksitchetna.in • Intellectual Club, India
        </div>
      </div>
    </div>
  );
}

export default function IDCardPage() {
  return (
    <Suspense fallback={<p className="p-12 text-center">Loading...</p>}>
      <IDCardContent />
    </Suspense>
  );
}
