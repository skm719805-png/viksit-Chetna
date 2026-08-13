import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description: "Read scientific articles and thought pieces from Viksit Chetna members.",
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function getStories() {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("stories").select("*").eq("published", true).order("created_at", { ascending: false });
  return data ?? [];
}

export default async function StoriesPage() {
  const stories = await getStories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Articles & Insights</h1>
      <p className="mt-2 text-muted-foreground">Scientific thoughts and ideas from our members.</p>

      {stories.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">Articles coming soon. Stay tuned!</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.slug}`}
              className="card-hover group overflow-hidden rounded-2xl border bg-card shadow-sm"
            >
              {story.cover_image_url ? (
                <img src={story.cover_image_url} alt={story.title} className="h-44 w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="h-44 w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-5xl">🔬</div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold group-hover:text-primary">{story.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  By {story.author} • {new Date(story.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{story.content}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
