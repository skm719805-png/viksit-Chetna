import { getSupabase } from "@/lib/supabase";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns",
  description: "Browse and support active campaigns by Viksit Chetna Intellectual Club.",
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
      <h1 className="text-3xl font-bold">Our Campaigns</h1>
      <p className="mt-2 text-muted-foreground">Organised initiatives where knowledge meets action.</p>

      {campaigns.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">No active campaigns at the moment. Check back soon!</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="card-hover overflow-hidden rounded-2xl border bg-card shadow-sm">
              {campaign.image_url ? (
                <img src={campaign.image_url} alt={campaign.title} className="h-48 w-full object-cover" />
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-5xl">📡</div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold">{campaign.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{campaign.description}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₹{Number(campaign.raised_amount).toLocaleString("en-IN")} raised</span>
                    <span>Goal: ₹{Number(campaign.goal_amount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100)}%` }}
                    />
                  </div>
                </div>
                <Link href={`/campaigns/${campaign.slug}`} className={cn(buttonVariants({ size: "sm" }), "mt-4 w-full rounded-full")}>
                  View Campaign
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
