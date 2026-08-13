import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Viksit Chetna — our mission, leadership, and vision for a knowledge-driven society.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">About Viksit Chetna</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Viksit Chetna is an intellectual club founded on the belief that society advances when curious, mindful people come together. We provide a platform for scientists, researchers, thinkers, and curious individuals to share ideas, debate concepts, and organise campaigns that create real-world impact.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Our Vision</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        A society where scientific thinking, open discourse, and collective intelligence drive progress — where every curious mind has a community to belong to.
      </p>

      <h2 className="mt-10 text-2xl font-bold">What We Do</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "🔭", title: "Scientific Discourse", desc: "Regular talks, articles, and debates on science, technology, and society." },
          { icon: "📡", title: "Campaigns", desc: "Organised initiatives addressing real societal challenges through knowledge and action." },
          { icon: "🧩", title: "Community", desc: "A network of mindful intellectuals across India, growing together." },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border p-4">
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold">Our Leadership</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { name: "Founder", role: "Club Founder" },
          { name: "President", role: "Club President" },
          { name: "Secretary", role: "Club Secretary" },
        ].map((leader) => (
          <div key={leader.role} className="rounded-lg border p-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              🧑‍🔬
            </div>
            <p className="mt-3 font-semibold">{leader.name}</p>
            <p className="text-sm text-muted-foreground">{leader.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
