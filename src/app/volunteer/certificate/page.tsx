"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

type CertData = { name: string; campaign_title: string; date: string };

function CertificateContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [data, setData] = useState<CertData | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  const sendOtp = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "certificate", id }) });
    const d = await res.json();
    if (res.ok) { setMaskedEmail(d.email); setOtpSent(true); }
    else setError(d.error || "Failed to send OTP");
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true); setError("");
    const res = await fetch(`/api/otp?type=certificate&id=${id}&otp=${otp}`);
    if (res.ok) {
      setVerified(true);
      fetch(`/api/volunteer/certificate?id=${id}`).then(r => r.json()).then(setData);
    } else {
      setError("Invalid or expired OTP. Try again.");
    }
    setLoading(false);
  };

  if (!verified) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center space-y-6">
        <div className="text-5xl">📜</div>
        <h1 className="text-2xl font-bold gradient-text">Verify to Print Certificate</h1>
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
              {loading ? "Verifying..." : "Verify & View Certificate"}
            </Button>
            <button onClick={sendOtp} className="text-xs text-primary underline">Resend OTP</button>
          </>
        )}
      </div>
    );
  }

  if (!data) return <p className="p-12 text-center text-muted-foreground">Loading certificate...</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button onClick={() => window.print()} className="mb-4 print:hidden rounded-full">🖨️ Print Certificate</Button>
      <div className="rounded-2xl border-4 border-primary/30 bg-white p-12 text-center print:border-2">
        <div className="mx-auto h-1 w-32 rounded" style={{ background: "linear-gradient(90deg, #4f46e5, #ca8a04)" }} />
        <p className="mt-6 text-sm uppercase tracking-widest text-muted-foreground">Certificate of Participation</p>
        <h1 className="mt-2 text-3xl font-bold gradient-text">Viksit Chetna</h1>
        <p className="text-sm text-muted-foreground">Intellectual Club</p>
        <p className="mt-8 text-lg text-muted-foreground">This is to certify that</p>
        <p className="mt-2 text-2xl font-bold">{data.name}</p>
        <p className="mt-4 text-muted-foreground">has successfully volunteered for the campaign</p>
        <p className="mt-2 text-xl font-semibold text-primary">{data.campaign_title}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          We appreciate your dedication and contribution towards advancing knowledge and society.
        </p>
        <div className="mt-12 flex justify-between text-sm">
          <div><p className="font-medium">Date: {data.date}</p></div>
          <div className="text-right">
            <p className="font-medium">Club Leadership</p>
            <p className="text-xs text-muted-foreground">Viksit Chetna</p>
          </div>
        </div>
        <div className="mx-auto mt-6 h-1 w-32 rounded" style={{ background: "linear-gradient(90deg, #4f46e5, #ca8a04)" }} />
        <p className="mt-4 text-xs text-muted-foreground">viksitchetna.in</p>
      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={<p className="p-12 text-center text-muted-foreground">Loading...</p>}>
      <CertificateContent />
    </Suspense>
  );
}
