"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Field = { label: string; type: string; required: boolean; options?: string[] };
type Campaign = {
  id: string; title: string; description: string; image_url: string | null;
  goal_amount: number; raised_amount: number; show_funding: boolean;
  form_title: string; participation_fields: Field[];
};

export default function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    fetch(`/api/campaigns/${slug}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) setCampaign(d); });
  }, [slug]);

  if (notFound) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <p className="text-5xl mb-4">📡</p>
      <h1 className="text-2xl font-bold">Campaign not found</h1>
      <Link href="/campaigns" className="mt-4 text-primary hover:underline">← Back to Campaigns</Link>
    </div>
  );

  if (!campaign) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="spinner spinner-lg text-primary" />
    </div>
  );

  const progress = campaign.goal_amount > 0
    ? Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100)
    : 0;

  const fields: Field[] = Array.isArray(campaign.participation_fields)
    ? campaign.participation_fields
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/campaign-participate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign_id: campaign.id, responses }),
    });
    setStatus(res.ok ? "success" : "error");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        ← Back to Campaigns
      </Link>

      {campaign.image_url && (
        <img src={campaign.image_url} alt={campaign.title} className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-md" />
      )}

      <h1 className="mt-6 text-3xl font-bold">{campaign.title}</h1>

      {campaign.show_funding && campaign.goal_amount > 0 && (
        <div className="mt-5 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-primary">₹{Number(campaign.raised_amount).toLocaleString("en-IN")} raised</span>
            <span className="text-muted-foreground">Goal: ₹{Number(campaign.goal_amount).toLocaleString("en-IN")}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{progress.toFixed(0)}% funded</p>
          <Link href="/donate" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground btn-shimmer hover:bg-primary/90 transition-colors">
            ❤️ Support this Campaign
          </Link>
        </div>
      )}

      <div className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-wrap">{campaign.description}</div>

      {/* Participation Form */}
      {fields.length > 0 && (
        <div className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-1">{campaign.form_title || "Participate in this Campaign"}</h2>
          <p className="text-sm text-muted-foreground mb-6">Fill in the details below to participate.</p>

          {status === "success" ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center animate-fade-in">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="font-semibold text-green-700">Submitted Successfully!</h3>
              <p className="text-sm text-green-600 mt-1">Thank you for participating. We will get in touch with you.</p>
              <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setStatus("idle"); setResponses({}); }}>
                Submit Another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field, i) => (
                <div key={i}>
                  <label className="text-sm font-medium">
                    {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      required={field.required}
                      value={responses[field.label] || ""}
                      onChange={e => setResponses({ ...responses, [field.label]: e.target.value })}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  ) : field.type === "select" && field.options ? (
                    <select
                      required={field.required}
                      value={responses[field.label] || ""}
                      onChange={e => setResponses({ ...responses, [field.label]: e.target.value })}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      value={responses[field.label] || ""}
                      onChange={e => setResponses({ ...responses, [field.label]: e.target.value })}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  )}
                </div>
              ))}
              {status === "error" && <p className="text-sm text-destructive">Something went wrong. Please try again.</p>}
              <Button type="submit" disabled={status === "loading"} className="btn-shimmer w-full rounded-full">
                {status === "loading" ? "Submitting..." : "Submit"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
