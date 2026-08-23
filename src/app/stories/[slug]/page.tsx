import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type MediaItem = { type: "image" | "video" | "youtube" | "instagram"; url: string; caption?: string };

function getYouTubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getInstagramId(url: string) {
  const m = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

function MediaBlock({ item }: { item: MediaItem }) {
  if (item.type === "youtube") {
    const vid = getYouTubeId(item.url);
    if (!vid) return null;
    return (
      <figure className="my-6">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
          <iframe src={`https://www.youtube.com/embed/${vid}`} className="absolute inset-0 h-full w-full" allowFullScreen title={item.caption || "YouTube video"} />
        </div>
        {item.caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{item.caption}</figcaption>}
      </figure>
    );
  }
  if (item.type === "instagram") {
    const id = getInstagramId(item.url);
    if (!id) return null;
    return (
      <figure className="my-6 flex flex-col items-center">
        <iframe src={`https://www.instagram.com/p/${id}/embed`} className="w-full max-w-lg rounded-2xl border" height="540" scrolling="no" title={item.caption || "Instagram post"} />
        {item.caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{item.caption}</figcaption>}
      </figure>
    );
  }
  if (item.type === "video") {
    return (
      <figure className="my-6">
        <video src={item.url} controls className="w-full rounded-2xl bg-black" />
        {item.caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{item.caption}</figcaption>}
      </figure>
    );
  }
  if (item.type === "image") {
    return (
      <figure className="my-6">
        <img src={item.url} alt={item.caption || ""} className="w-full rounded-2xl object-cover max-h-[500px]" />
        {item.caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{item.caption}</figcaption>}
      </figure>
    );
  }
  return null;
}

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

  const media: MediaItem[] = story.media || [];

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

      {media.length > 0 && (
        <div className="mt-8 border-t pt-8">
          <h2 className="text-lg font-semibold mb-4">📸 Media Gallery</h2>
          {media.map((item, i) => <MediaBlock key={i} item={item} />)}
        </div>
      )}
    </article>
  );
}
