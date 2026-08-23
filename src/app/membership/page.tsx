"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function Spinner() {
  return <span className="spinner" aria-label="Loading" />;
}

function MembershipContent() {
  const params = useSearchParams();
  const tab = params.get("tab") || "register";
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", age: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [trackEmail, setTrackEmail] = useState("");
  const [tracking, setTracking] = useState(false);
  const [memberData, setMemberData] = useState<{ id: string; name: string; status: string; member_id: string | null } | null>(null);
  const [trackError, setTrackError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append("photo", photo);
    const res = await fetch("/api/membership", { method: "POST", body: fd });
    if (res.ok) {
      setStatus("success");
      setForm({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", age: "" });
      setPhoto(null);
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "Something went wrong");
      setStatus("error");
    }
  };

  const handleTrack = async () => {
    if (!trackEmail) return;
    setTracking(true);
    setTrackError("");
    setMemberData(null);
    const res = await fetch(`/api/membership?email=${encodeURIComponent(trackEmail)}`);
    if (res.ok) setMemberData(await res.json());
    else setTrackError("No membership found for this email.");
    setTracking(false);
  };

  const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Join Viksit Chetna</h1>
        <p className="mt-2 text-muted-foreground">
          Become an official member of the club. Once approved, you&apos;ll receive a digital ID card.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <a href="/membership" className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${tab === "register" ? "bg-primary text-primary-foreground shadow-md" : "border hover:bg-primary/5 text-muted-foreground"}`}>
          📝 Register
        </a>
        <a href="/membership?tab=track" className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${tab === "track" ? "bg-primary text-primary-foreground shadow-md" : "border hover:bg-primary/5 text-muted-foreground"}`}>
          🔍 Track / ID Card
        </a>
      </div>

      {tab === "register" ? (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
          {status === "success" ? (
            <div className="animate-fade-in rounded-xl bg-green-50 border border-green-200 p-6 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-semibold text-green-700">Application Submitted!</h3>
              <p className="mt-1 text-sm text-green-600">You&apos;ll receive your digital ID card once approved by admin.</p>
              <Button className="mt-4" variant="outline" onClick={() => setStatus("idle")}>Submit Another</Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
                  <input placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={`mt-1 ${inp}`} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email *</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={`mt-1 ${inp}`} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Phone *</label>
                  <input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={`mt-1 ${inp}`} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Age *</label>
                  <input type="number" min="1" max="120" placeholder="Your Age" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className={`mt-1 ${inp}`} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Address *</label>
                <input placeholder="House No, Street, Area" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={`mt-1 ${inp}`} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">City *</label>
                  <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={`mt-1 ${inp}`} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">State *</label>
                  <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={`mt-1 ${inp}`} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Pincode *</label>
                  <input placeholder="110001" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className={`mt-1 ${inp}`} required />
                </div>
              </div>
              <div className="rounded-lg border border-dashed p-4">
                <label className="text-sm font-medium">Passport Photo</label>
                <p className="text-xs text-muted-foreground mt-0.5">Upload a clear passport-size photo (JPG/PNG)</p>
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="mt-2 w-full text-sm" />
                {photo && <p className="mt-1 text-xs text-green-600">✓ {photo.name}</p>}
              </div>
              {status === "error" && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{errorMsg}</p>
              )}
              <Button type="submit" disabled={status === "loading"} className="btn-shimmer w-full rounded-full gap-2">
                {status === "loading" ? <><Spinner /> Submitting...</> : "Submit Application"}
              </Button>
            </>
          )}
        </form>
      ) : (
        <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Check Membership Status</h2>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your registered email"
              value={trackEmail}
              onChange={e => setTrackEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              className={`flex-1 ${inp}`}
            />
            <Button onClick={handleTrack} disabled={tracking} variant="outline" className="gap-2 rounded-full">
              {tracking ? <Spinner /> : "Check"}
            </Button>
          </div>
          {trackError && <p className="text-sm text-red-600">{trackError}</p>}
          {memberData && (
            <div className="animate-fade-in rounded-xl border bg-background p-5">
              <p className="text-lg font-semibold">{memberData.name}</p>
              <p className="mt-1 text-sm">
                Status:{" "}
                <span className={`font-medium ${memberData.status === "approved" ? "text-green-600" : memberData.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                  {memberData.status === "approved" ? "✅ Approved" : memberData.status === "rejected" ? "❌ Rejected" : "⏳ Pending Review"}
                </span>
              </p>
              {memberData.member_id && (
                <p className="mt-1 text-sm font-mono text-primary">ID: {memberData.member_id}</p>
              )}
              {memberData.member_id && (
                <a
                  href={`/membership/id-card?id=${memberData.id}`}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  🪪 View Digital ID Card
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <span className="spinner spinner-lg text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <MembershipContent />
    </Suspense>
  );
}
