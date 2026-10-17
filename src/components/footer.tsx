import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const SOCIAL_KEYS = ["facebook", "instagram", "twitter", "youtube", "whatsapp", "linkedin"] as const;

const socialIcons: Record<string, string> = {
  facebook: "f",
  instagram: "📸",
  twitter: "𝕏",
  youtube: "▶",
  whatsapp: "💬",
  linkedin: "in",
};

const socialColors: Record<string, string> = {
  facebook: "hover:text-blue-600",
  instagram: "hover:text-pink-500",
  twitter: "hover:text-sky-500",
  youtube: "hover:text-red-600",
  whatsapp: "hover:text-green-500",
  linkedin: "hover:text-blue-700",
};

async function getSocialLinks(): Promise<Record<string, string>> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return {};
    const { data } = await supabase.from("site_settings").select("key, value");
    const settings: Record<string, string> = {};
    (data || []).forEach((r: { key: string; value: string }) => { settings[r.key] = r.value; });
    return settings;
  } catch {
    return {};
  }
}

export async function Footer() {
  const settings = await getSocialLinks();
  const activeSocials = SOCIAL_KEYS.filter((k) => settings[k]);

  return (
    <footer className="border-t border-primary/12 bg-gradient-to-b from-muted/60 to-muted">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Viksit Chetna" className="h-9 w-9 rounded-full ring-2 ring-primary/30" />
              <div>
                <span className="text-lg font-bold gradient-text leading-tight block">Viksit Chetna</span>
                <span className="text-[10px] text-muted-foreground tracking-wide">Intellectual Club</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              A club for mindful intellectuals to share scientific thoughts and collectively advance society.
            </p>
            {activeSocials.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {activeSocials.map((key) => (
                  <a
                    key={key}
                    href={settings[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    className={`social-icon flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-muted-foreground shadow-sm ${socialColors[key]}`}
                  >
                    {socialIcons[key]}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {[
                { href: "/about", label: "About Us" },
                { href: "/campaigns", label: "Campaigns" },
                { href: "/exam", label: "Online Exams & Olympiads" },
                { href: "/membership", label: "Membership" },
                { href: "/volunteer", label: "Volunteer" },
                { href: "/stories", label: "Articles" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Leadership */}
          <div>
            <h4 className="font-semibold text-foreground">The Club</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/leadership" className="hover:text-primary transition-colors duration-150">Meet Our Leaders →</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground">Stay Updated</h4>
            <p className="mt-3 text-sm text-muted-foreground">
              Subscribe for scientific insights and club updates.
            </p>
            <form className="mt-3 flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="btn-shimmer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-primary/10 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Viksit Chetna Intellectual Club. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
