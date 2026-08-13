import { getSupabase } from "@/lib/supabase";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function getCampaign(slug: string) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("campaigns").select("*").eq("slug", slug).eq("is_active", true).single();
  return data;
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);
  if (!campaign) notFound();

  const progress = Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/campaigns" className="text-sm text-muted-foreground hover:text-primary">← Back to Campaigns</Link>

      {campaign.image_url && (
        <img src={campaign.image_url} alt={campaign.title} className="mt-4 h-64 w-full rounded-2xl object-cover sm:h-80" />
      )}

      <h1 className="mt-6 text-3xl font-bold">{campaign.title}</h1>

      <div className="mt-4 rounded-2xl border p-4">
        <div className="flex justify-between text-sm">
          <span className="font-medium">₹{Number(campaign.raised_amount).toLocaleString("en-IN")} raised</span>
          <span className="text-muted-foreground">Goal: ₹{Number(campaign.goal_amount).toLocaleString("en-IN")}</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{progress.toFixed(0)}% funded</p>
      </div>

      <div className="mt-6 whitespace-pre-wrap text-muted-foreground">{campaign.description}</div>

      <Link href="/donate" className={cn(buttonVariants({ size: "lg" }), "mt-8 rounded-full")}>
        Support this Campaign
      </Link>
    </div>
  );
}
