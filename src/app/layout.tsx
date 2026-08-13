import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://viksitchetna.org"),
  title: {
    default: "Viksit Chetna | Intellectual Club",
    template: "%s | Viksit Chetna",
  },
  description:
    "Viksit Chetna — A club for mindful intellectuals to share scientific thoughts, organise ideas, and collectively advance society.",
  keywords: ["Viksit Chetna", "intellectual club", "science", "mindfulness", "society", "India", "knowledge"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://viksitchetna.org",
    siteName: "Viksit Chetna",
    title: "Viksit Chetna | Intellectual Club",
    description: "A club for mindful intellectuals to share scientific thoughts and advance society.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Viksit Chetna" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viksit Chetna | Intellectual Club",
    description: "A club for mindful intellectuals to share scientific thoughts and advance society.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
