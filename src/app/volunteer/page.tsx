"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Campaign = { id: string; title: string };

export default function VolunteerPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", campaign_id: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [trackEmail, setTrackEmail] = useState("");
  const [myApplications, setMyApplications] = useState<Array<{ id: string; status: string; campaign_title: string; certificate_issued: boolean }>>([]);

  useEffect(() => {
    fetch("/api/volunteer/campaigns").then(r => r.json()).then(d => setCampaigns(d || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/volunteer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setStatus(res.ok ? "success" : "error");
    if (res.ok) setForm({ name: "", email: "", phone: "", campaign_id: "", message: "" });
  };

  const handleTrack = async () => {
    if (!trackEmail) return;
    const res = await fetch(`/api/volunteer?email=${encodeURIComponent(trackEmail)}`);
    if (res.ok) setMyApplications(await res.json());
  };

  const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Volunteer With Us</h1>
      <p className="mt-2 text-muted-foreground">
        Join our campaigns, contribute your skills, and earn a certificate of participation.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Register as Volunteer</h2>
          <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} required />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inp} required />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} required />
          <select value={form.campaign_id} onChange={e => setForm({ ...form, campaign_id: e.target.value })} className={inp} required>
            <option value="">Select Campaign</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <textarea placeholder="Why do you want to volunteer? (optional)" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={inp} rows={3} />
          <Button type="submit" disabled={status === "loading"} className="btn-shimmer w-full rounded-full">
            {status === "loading" ? "Submitting..." : "Apply to Volunteer"}
          </Button>
          {status === "success" && <p className="text-sm text-green-600">Application submitted! You&apos;ll be notified once approved.</p>}
          {status === "error" && <p className="text-sm text-red-600">Something went wrong. Try again.</p>}
        </form>

        <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Track Your Application</h2>
          <p className="text-sm text-muted-foreground">Enter your email to check status & download certificate.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Your email" value={trackEmail} onChange={e => setTrackEmail(e.target.value)} className={`flex-1 ${inp}`} />
            <Button onClick={handleTrack} variant="outline" className="rounded-full">Track</Button>
          </div>
          {myApplications.length > 0 && (
            <div className="mt-4 space-y-3">
              {myApplications.map(app => (
                <div key={app.id} className="rounded-xl border p-3">
                  <p className="font-medium text-sm">{app.campaign_title}</p>
                  <p className="text-xs text-muted-foreground">
                    Status: <span className={app.status === "approved" || app.status === "completed" ? "text-green-600" : app.status === "rejected" ? "text-red-600" : "text-yellow-600"}>{app.status}</span>
                  </p>
                  {app.certificate_issued && (
                    <a href={`/volunteer/certificate?id=${app.id}`} target="_blank" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                      📜 Download Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
