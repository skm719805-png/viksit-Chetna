import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://viksitchetna.in"),
  title: {
    default: "Viksit Chetna | Intellectual Club India",
    template: "%s | Viksit Chetna",
  },
  description:
    "Viksit Chetna — India's intellectual club for scientists, thinkers and curious minds. Join campaigns, volunteer, and advance society through knowledge.",
  keywords: [
    "Viksit Chetna", "intellectual club India", "science club", "mindfulness",
    "youth club India", "knowledge community", "membership club", "volunteer India",
    "viksitchetna.in", "Prayagraj club", "intellectual society",
  ],
  authors: [{ name: "Viksit Chetna", url: "https://viksitchetna.in" }],
  creator: "Viksit Chetna",
  publisher: "Viksit Chetna",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
  alternates: { canonical: "https://viksitchetna.in" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://viksitchetna.in",
    siteName: "Viksit Chetna",
    title: "Viksit Chetna | Intellectual Club India",
    description: "India's intellectual club — join campaigns, volunteer, and advance society through knowledge.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Viksit Chetna" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viksit Chetna | Intellectual Club India",
    description: "India's intellectual club — join campaigns, volunteer, and advance society through knowledge.",
    images: ["/logo.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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
