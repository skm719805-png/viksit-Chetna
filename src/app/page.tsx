import { buttonVariants } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LeadershipSection } from "@/components/leadership-section";

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function getLatestCampaigns() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("campaigns").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(6);
  return data ?? [];
}

async function getTopLeaders() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("leaders").select("*").order("display_order", { ascending: true }).limit(3);
  return data ?? [];
}

export default async function Home() {
  const [latestCampaigns, leaders] = await Promise.all([getLatestCampaigns(), getTopLeaders()]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-section relative flex min-h-[92vh] items-center justify-center overflow-hidden px-4 text-center">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-accent/15 blur-3xl animate-pulse" style={{ animationDelay: "1.2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-2xl animate-pulse" style={{ animationDelay: "0.6s" }} />
        </div>

        <div className="max-w-4xl animate-fade-in">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="hero-logo-ring p-1">
              <Image
                src="/logo.png"
                alt="Viksit Chetna"
                width={96}
                height={96}
                className="rounded-full object-cover"
                priority
              />
            </div>
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-5 py-2 text-sm font-medium text-primary shadow-sm">
            🔬 Where Minds Meet &amp; Ideas Ignite
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-8xl leading-[1.05]">
            <span className="gradient-text">Viksit Chetna</span>
            <br />
            <span className="text-foreground text-4xl sm:text-5xl lg:text-6xl font-bold">Intellectual Club</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            A gathering of scientists, thinkers, and curious minds — united to share knowledge, debate ideas, and drive society forward.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/membership" className={cn(buttonVariants({ size: "lg" }), "btn-shimmer rounded-full px-10 py-3 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40")}>
              🧠 Join the Club
            </Link>
            <Link href="/campaigns" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-10 py-3 text-base border-primary/30 hover:border-primary hover:bg-primary/5")}>
              Our Campaigns →
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 text-center">
            {[
              { number: "500+", label: "Members" },
              { number: "20+", label: "Campaigns" },
              { number: "10+", label: "Cities" },
              { number: "100+", label: "Volunteers" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold gradient-text">{s.number}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="mt-12 flex justify-center">
            <div className="flex flex-col items-center gap-1 text-muted-foreground/40">
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <div className="h-10 w-px bg-gradient-to-b from-primary/40 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest Campaigns (right after hero) ── */}
      <section className="px-4 py-20 bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-primary/10 px-5 py-1.5 text-sm font-semibold text-primary mb-4 tracking-wide">Active Initiatives</span>
            <h2 className="text-3xl font-bold sm:text-4xl">Our Campaigns</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Organised initiatives where knowledge meets real-world action.</p>
          </div>

          {latestCampaigns.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-primary/20 bg-primary/3">
              <div className="text-5xl mb-3">📡</div>
              <p className="text-muted-foreground">Campaigns launching soon. Stay tuned!</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestCampaigns.map((campaign) => (
                  <div key={campaign.id} className="campaign-card group overflow-hidden rounded-2xl border bg-card shadow-sm flex flex-col">
                    {campaign.image_url ? (
                      <div className="overflow-hidden h-48 flex-shrink-0">
                        <img src={campaign.image_url} alt={campaign.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="h-48 flex-shrink-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15 flex items-center justify-center text-5xl">📡</div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg leading-snug">{campaign.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground flex-1">{campaign.description}</p>
                      {campaign.goal_amount > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>₹{Number(campaign.raised_amount).toLocaleString("en-IN")} raised</span>
                            <span>Goal: ₹{Number(campaign.goal_amount).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                      <Link href={`/campaigns/${campaign.slug}`} className={cn(buttonVariants({ size: "sm" }), "btn-shimmer mt-4 rounded-full w-full justify-center")}>
                        Learn More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link href="/campaigns" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-10 border-primary/30 hover:border-primary hover:bg-primary/5")}>
                  View All Campaigns
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Why Viksit Chetna ── */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <span className="inline-block rounded-full bg-accent/15 px-5 py-1.5 text-sm font-semibold text-foreground mb-4">Our Purpose</span>
        <h2 className="text-3xl font-bold sm:text-4xl">Why Viksit Chetna?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
          Society progresses when its thinkers connect. We are a space where intellectuals gather, debate ideas, share discoveries, and organise campaigns that create real-world impact.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { icon: "🔭", title: "Scientific Discourse", desc: "Share research, discoveries, and ideas in an open, respectful intellectual environment." },
            { icon: "🌐", title: "Organised Campaigns", desc: "Turn ideas into action through structured campaigns that address societal challenges." },
            { icon: "🧩", title: "Mindful Community", desc: "Connect with like-minded people who value curiosity, reason, and collective growth." },
          ].map((item) => (
            <div key={item.title} className="card-hover rounded-2xl border bg-card p-7 text-left shadow-sm group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">{item.icon}</div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Leadership ── */}
      {leaders.length > 0 && <LeadershipSection leaders={leaders} />}

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-4 py-28 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Image src="/logo.png" alt="Viksit Chetna" width={64} height={64} className="rounded-full ring-4 ring-primary/20 shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to Think Together?</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Join Viksit Chetna and be part of a movement that values knowledge, reason, and collective progress.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/membership" className={cn(buttonVariants({ size: "lg" }), "btn-shimmer rounded-full px-10 shadow-lg shadow-primary/25")}>
              Become a Member
            </Link>
            <Link href="/volunteer" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-10 border-primary/30 hover:border-primary hover:bg-primary/5")}>
              Volunteer With Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
