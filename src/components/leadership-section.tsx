"use client";

import { useState } from "react";
import Link from "next/link";

type Leader = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  display_order: number;
};

export function LeadershipSection({ leaders }: { leaders: Leader[] }) {
  const [selected, setSelected] = useState<Leader | null>(null);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center mb-10">
        <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-4">The Minds</div>
        <h2 className="text-3xl font-bold sm:text-4xl">Our Leadership</h2>
        <p className="mt-3 text-muted-foreground">The thinkers driving Viksit Chetna forward.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {leaders.map((leader) => (
          <button
            key={leader.id}
            onClick={() => setSelected(leader)}
            className="card-hover group text-left overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <div className="bg-gradient-to-br from-primary/10 to-accent/5 p-6 text-center">
              {leader.photo_url ? (
                <img
                  src={leader.photo_url}
                  alt={leader.name}
                  className="mx-auto h-28 w-28 rounded-full object-cover border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary text-4xl font-bold text-white shadow-md">
                  {leader.name[0]}
                </div>
              )}
              <span className="mt-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {leader.role}
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-center">{leader.name}</h3>
              {leader.bio && (
                <p className="mt-2 text-sm text-muted-foreground text-center line-clamp-2 leading-relaxed">{leader.bio}</p>
              )}
              <p className="mt-3 text-center text-xs font-medium text-primary group-hover:underline">View Profile →</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/leadership" className="rounded-full border px-6 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors">
          View All Members →
        </Link>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border bg-card shadow-2xl animate-fade-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-8 text-center">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
              {selected.photo_url ? (
                <img src={selected.photo_url} alt={selected.name} className="mx-auto h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary text-5xl font-bold text-white shadow-lg">
                  {selected.name[0]}
                </div>
              )}
              <h3 className="mt-4 text-2xl font-bold">{selected.name}</h3>
              <span className="mt-2 inline-block rounded-full bg-primary/15 px-4 py-1 text-sm font-semibold text-primary">
                {selected.role}
              </span>
            </div>
            <div className="p-6">
              {selected.bio ? (
                <p className="text-muted-foreground leading-relaxed text-sm">{selected.bio}</p>
              ) : (
                <p className="text-muted-foreground text-sm text-center italic">No bio available.</p>
              )}
              {(selected.social_facebook || selected.social_instagram || selected.social_twitter) && (
                <div className="mt-5 flex justify-center gap-3">
                  {selected.social_facebook && (
                    <a href={selected.social_facebook} target="_blank" rel="noopener noreferrer"
                      className="social-icon flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 text-sm font-bold">f</a>
                  )}
                  {selected.social_instagram && (
                    <a href={selected.social_instagram} target="_blank" rel="noopener noreferrer"
                      className="social-icon flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 border border-pink-100 text-pink-600 hover:bg-pink-100 text-sm">📸</a>
                  )}
                  {selected.social_twitter && (
                    <a href={selected.social_twitter} target="_blank" rel="noopener noreferrer"
                      className="social-icon flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 border border-sky-100 text-sky-600 hover:bg-sky-100 text-sm font-bold">𝕏</a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
