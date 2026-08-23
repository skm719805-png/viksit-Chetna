import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns",
  description: "Browse and participate in active campaigns by Viksit Chetna Intellectual Club.",
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function getCampaigns() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("campaigns").select("*").eq("is_active", true).order("created_at", { ascending: false });
  return data ?? [];
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <span className="section-badge">Active Initiatives</span>
        <h1 className="text-3xl font-bold mt-3">Our Campaigns</h1>
        <p className="mt-2 text-muted-foreground">Click any campaign to view details and participate.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-primary/20">
          <div className="text-5xl mb-3">📡</div>
          <p className="text-muted-foreground">No active campaigns at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/campaigns/${c.slug || c.id}`} className="campaign-card group overflow-hidden rounded-2xl border bg-card shadow-sm flex flex-col">
              {c.image_url ? (
                <div className="overflow-hidden h-48 flex-shrink-0">
                  <img src={c.image_url} alt={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              ) : (
                <div className="h-48 flex-shrink-0 bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-5xl">📡</div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors">{c.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground flex-1">{c.description}</p>
                {c.show_funding && c.goal_amount > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>₹{Number(c.raised_amount).toLocaleString("en-IN")} raised</span>
                      <span>Goal: ₹{Number(c.goal_amount).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(100, (c.raised_amount / c.goal_amount) * 100)}%` }} />
                    </div>
                  </div>
                )}
                <span className="mt-4 inline-flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                  View &amp; Participate →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
