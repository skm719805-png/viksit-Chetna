import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Membership",
  description: "Become an official member of Viksit Chetna. Apply for membership and receive your digital ID card upon approval.",
  alternates: { canonical: "https://viksitchetna.org/membership" },
  openGraph: {
    title: "Join Membership | Viksit Chetna",
    description: "Apply to become a member of Viksit Chetna and get your digital ID card.",
    url: "https://viksitchetna.org/membership",
  },
};

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
