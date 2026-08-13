import { buttonVariants } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LeadershipSection } from "@/components/leadership-section";

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function getLatestCampaigns() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("campaigns").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(3);
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
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-4 text-center hero-pattern">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-primary/5 blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        <div className="max-w-4xl animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            🔬 Where Minds Meet & Ideas Ignite
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            <span className="gradient-text">Viksit Chetna</span>
            <br />
            <span className="text-foreground">Intellectual Club</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            A gathering of mindful people — scientists, thinkers, and curious minds — united to share knowledge and drive society forward.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/membership" className={cn(buttonVariants({ size: "lg" }), "btn-shimmer rounded-full px-8 shadow-lg hover:shadow-primary/30")}>
              🧠 Join the Club
            </Link>
            <Link href="/campaigns" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8")}>
              Our Campaigns →
            </Link>
          </div>
          <div className="mt-16 flex justify-center">
            <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
              <span className="text-xs">Scroll</span>
              <div className="h-8 w-px bg-gradient-to-b from-muted-foreground/30 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { number: "500+", label: "Club Members", icon: "🧑‍🔬" },
              { number: "20+", label: "Campaigns", icon: "📡" },
              { number: "10+", label: "Cities", icon: "🏙️" },
              { number: "100+", label: "Volunteers", icon: "🤝" },
            ].map((stat) => (
              <div key={stat.label} className="card-hover rounded-2xl border bg-card p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-3xl font-bold gradient-text">{stat.number}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <div className="inline-block rounded-full bg-accent/10 px-4 py-1 text-sm font-medium text-foreground mb-4">Our Purpose</div>
        <h2 className="text-3xl font-bold sm:text-4xl">Why Viksit Chetna?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
          We believe that a society progresses when its thinkers connect. Viksit Chetna is a space where intellectuals gather, debate ideas, share scientific discoveries, and organise campaigns that create real-world impact.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { icon: "🔭", title: "Scientific Discourse", desc: "Share research, discoveries, and ideas in an open, respectful intellectual environment." },
            { icon: "🌐", title: "Organised Campaigns", desc: "Turn ideas into action through structured campaigns that address societal challenges." },
            { icon: "🧩", title: "Mindful Community", desc: "Connect with like-minded people who value curiosity, reason, and collective growth." },
          ].map((item) => (
            <div key={item.title} className="card-hover rounded-2xl border bg-card p-6 text-left shadow-sm">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership */}
      {leaders.length > 0 && <LeadershipSection leaders={leaders} />}

      {/* Latest Campaigns */}
      {latestCampaigns.length > 0 && (
        <section className="bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-4">Active Initiatives</div>
              <h2 className="text-3xl font-bold sm:text-4xl">Latest Campaigns</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestCampaigns.map((campaign) => (
                <div key={campaign.id} className="card-hover group overflow-hidden rounded-2xl border bg-card shadow-sm">
                  {campaign.image_url ? (
                    <div className="overflow-hidden">
                      <img src={campaign.image_url} alt={campaign.title} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-5xl">📡</div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{campaign.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{campaign.description}</p>
                    <Link href={`/campaigns/${campaign.slug}`} className={cn(buttonVariants({ size: "sm" }), "btn-shimmer mt-4 rounded-full")}>
                      Learn More →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/campaigns" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-8")}>
                View All Campaigns
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden px-4 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8" />
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="text-5xl mb-4">🔬</div>
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to Think Together?</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Join Viksit Chetna and be part of a movement that values knowledge, reason, and collective progress.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/membership" className={cn(buttonVariants({ size: "lg" }), "btn-shimmer rounded-full px-8 shadow-lg")}>
              Become a Member
            </Link>
            <Link href="/volunteer" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8")}>
              Volunteer With Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
