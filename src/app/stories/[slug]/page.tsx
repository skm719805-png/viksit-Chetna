import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function getStory(slug: string) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("stories").select("*").eq("slug", slug).eq("published", true).single();
  return data;
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/stories" className="text-sm text-muted-foreground hover:text-primary">← Back to Articles</Link>

      {story.cover_image_url && (
        <img src={story.cover_image_url} alt={story.title} className="mt-4 h-64 w-full rounded-2xl object-cover sm:h-80" />
      )}

      <h1 className="mt-6 text-3xl font-bold">{story.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        By {story.author} • {new Date(story.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-6 whitespace-pre-wrap leading-relaxed text-foreground/90">{story.content}</div>
    </article>
  );
}
