"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">Have questions or want to collaborate? We&apos;d love to hear from you.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="name">Name</label>
            <input id="name" type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="subject">Subject</label>
            <input id="subject" type="text" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="message">Message</label>
            <textarea id="message" placeholder="Your message..." rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
          </div>
          <Button type="submit" disabled={status === "loading"} className="btn-shimmer w-full rounded-full">
            {status === "loading" ? "Sending..." : "Send Message"}
          </Button>
          {status === "success" && <p className="text-sm text-green-600">Message sent! We&apos;ll get back to you soon.</p>}
          {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
        </form>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">Viksit Chetna</h3>
            <p className="mt-1 text-sm text-muted-foreground">Intellectual Club, India</p>
          </div>
          <div>
            <h3 className="font-semibold">Website</h3>
            <p className="mt-1 text-sm text-muted-foreground">viksitchetna.org</p>
          </div>
        </div>
      </div>
    </div>
  );
}
