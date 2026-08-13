import { getSupabase } from "@/lib/supabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leadership",
  description: "Meet the leadership team of Viksit Chetna Intellectual Club.",
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function getLeaders() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("leaders").select("*").order("display_order", { ascending: true });
  return data ?? [];
}

export default async function LeadershipPage() {
  const leaders = await getLeaders();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent/60 p-10 text-center text-white">
        <h1 className="text-4xl font-bold">Our Leadership</h1>
        <p className="mt-3 max-w-xl mx-auto text-white/80">
          The minds steering Viksit Chetna&apos;s mission of intellectual progress.
        </p>
        <div className="mt-4">
          <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium">{leaders.length} Members</span>
        </div>
      </div>

      {leaders.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">Leadership details coming soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader) => (
            <div key={leader.id} className="card-hover flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="bg-gradient-to-br from-primary/10 to-accent/5 p-6 text-center">
                {leader.photo_url ? (
                  <img src={leader.photo_url} alt={leader.name} className="mx-auto h-28 w-28 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary text-4xl font-bold text-white shadow-md">
                    {leader.name[0]}
                  </div>
                )}
                <span className="mt-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{leader.role}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-center">{leader.name}</h3>
                {leader.bio && (
                  <p className="mt-2 text-sm text-muted-foreground text-center leading-relaxed line-clamp-3">{leader.bio}</p>
                )}
                {(leader.social_facebook || leader.social_instagram || leader.social_twitter) && (
                  <div className="mt-4 flex justify-center gap-3">
                    {leader.social_facebook && (
                      <a href={leader.social_facebook} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs font-bold">f</a>
                    )}
                    {leader.social_instagram && (
                      <a href={leader.social_instagram} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 text-xs font-bold">📸</a>
                    )}
                    {leader.social_twitter && (
                      <a href={leader.social_twitter} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 text-xs font-bold">𝕏</a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
