"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

type Campaign = { id: string; title: string; description: string; image_url: string | null; goal_amount: number; is_active: boolean };
type Story = { id: string; title: string; author: string; content: string; cover_image_url: string | null; published: boolean };
type Volunteer = { id: string; name: string; email: string; phone: string; status: string; certificate_issued: boolean; campaigns: { title: string } | null };
type Member = { id: string; name: string; email: string; phone: string; city: string; state: string; status: string; member_id: string | null; photo_url: string | null };
type Leader = { id: string; name: string; role: string; bio: string | null; photo_url: string | null; social_facebook: string | null; social_instagram: string | null; social_twitter: string | null; display_order: number };
type Settings = Record<string, string>;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<"leadership" | "campaigns" | "stories" | "volunteers" | "members" | "settings">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [settings, setSettings] = useState<Settings>({});

  const headers = { "x-admin-password": password, "Content-Type": "application/json" };

  const fetchData = useCallback(async () => {
    const h = { "x-admin-password": password };
    const [c, s, v, m, l, st] = await Promise.all([
      fetch("/api/admin/campaigns", { headers: h }),
      fetch("/api/admin/stories", { headers: h }),
      fetch("/api/admin/volunteers", { headers: h }),
      fetch("/api/admin/members", { headers: h }),
      fetch("/api/admin/leaders", { headers: h }),
      fetch("/api/admin/settings"),
    ]);
    if (c.ok) setCampaigns(await c.json());
    if (s.ok) setStories(await s.json());
    if (v.ok) setVolunteers(await v.json());
    if (m.ok) setMembers(await m.json());
    if (l.ok) setLeaders(await l.json());
    if (st.ok) setSettings(await st.json());
  }, [password]);

  useEffect(() => { if (authenticated) fetchData(); }, [authenticated, fetchData]);

  const handleLogin = async () => {
    const res = await fetch("/api/admin/campaigns", { headers: { "x-admin-password": password } });
    if (res.ok) setAuthenticated(true);
    else alert("Invalid password");
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-8 shadow-lg">
          <div className="text-center">
            <img src="/logo.png" alt="Viksit Chetna" className="mx-auto h-14 w-14 rounded-full ring-2 ring-primary/30" />
            <h1 className="mt-3 text-2xl font-bold gradient-text">Admin Login</h1>
            <p className="text-xs text-muted-foreground mt-1">Viksit Chetna</p>
          </div>
          <input type="password" placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <Button onClick={handleLogin} className="btn-shimmer w-full rounded-full">Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["campaigns", "stories", "volunteers", "members", "leadership", "settings"] as const).map(t => (
          <Button key={t} variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)} className="capitalize rounded-full">{t}</Button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "leadership" && <LeadershipManager leaders={leaders} password={password} headers={headers} onRefresh={fetchData} />}
        {tab === "campaigns" && <CampaignManager campaigns={campaigns} headers={headers} password={password} onRefresh={fetchData} />}
        {tab === "stories" && <StoryManager stories={stories} headers={headers} password={password} onRefresh={fetchData} />}
        {tab === "volunteers" && <VolunteerManager volunteers={volunteers} headers={headers} onRefresh={fetchData} />}
        {tab === "members" && <MemberManager members={members} headers={headers} onRefresh={fetchData} />}
        {tab === "settings" && <SettingsManager settings={settings} headers={headers} onRefresh={fetchData} />}
      </div>
    </div>
  );
}

function SettingsManager({ settings, headers, onRefresh }: { settings: Settings; headers: Record<string, string>; onRefresh: () => void }) {
  const SOCIALS = [
    { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
    { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/yourhandle" },
    { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
    { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/91XXXXXXXXXX" },
    { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourpage" },
  ];
  const [form, setForm] = useState<Settings>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  const handleSave = async () => {
    await fetch("/api/admin/settings", { method: "POST", headers, body: JSON.stringify(form) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onRefresh();
  };

  return (
    <div className="space-y-6 rounded-2xl border p-6">
      <h3 className="font-semibold text-lg">Social Media Links</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {SOCIALS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-sm font-medium">{label}</label>
            <input value={form[key] || ""} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} className="btn-shimmer rounded-full">{saved ? "✓ Saved!" : "Save Settings"}</Button>
    </div>
  );
}

function VolunteerManager({ volunteers, headers, onRefresh }: { volunteers: Volunteer[]; headers: Record<string, string>; onRefresh: () => void }) {
  const update = async (id: string, updates: Record<string, unknown>) => {
    await fetch("/api/admin/volunteers", { method: "PUT", headers, body: JSON.stringify({ id, ...updates }) });
    onRefresh();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this volunteer?")) return;
    await fetch("/api/admin/volunteers", { method: "DELETE", headers, body: JSON.stringify({ id }) });
    onRefresh();
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Volunteers ({volunteers.length})</h3>
      {volunteers.map(v => (
        <div key={v.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{v.name} <span className="text-xs text-muted-foreground">({v.email})</span></p>
            <p className="text-xs text-muted-foreground">Campaign: {v.campaigns?.title || "N/A"} | Status: <span className={v.status === "approved" || v.status === "completed" ? "text-green-600" : v.status === "rejected" ? "text-red-600" : "text-yellow-600"}>{v.status}</span></p>
          </div>
          <div className="flex flex-wrap gap-1">
            {v.status === "pending" && (
              <>
                <Button size="sm" onClick={() => update(v.id, { status: "approved" })}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => update(v.id, { status: "rejected" })}>Reject</Button>
              </>
            )}
            {v.status === "approved" && (
              <Button size="sm" onClick={() => update(v.id, { status: "completed", certificate_issued: true })}>Complete & Issue Cert</Button>
            )}
            {v.certificate_issued && <span className="text-xs text-green-600 font-medium px-2 py-1">📜 Cert Issued</span>}
            <Button size="sm" variant="destructive" onClick={() => del(v.id)}>Delete</Button>
          </div>
        </div>
      ))}
      {volunteers.length === 0 && <p className="text-sm text-muted-foreground">No volunteer applications yet.</p>}
    </div>
  );
}

function MemberManager({ members, headers, onRefresh }: { members: Member[]; headers: Record<string, string>; onRefresh: () => void }) {
  const update = async (id: string, status: string) => {
    await fetch("/api/admin/members", { method: "PUT", headers, body: JSON.stringify({ id, status }) });
    onRefresh();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    await fetch("/api/admin/members", { method: "DELETE", headers, body: JSON.stringify({ id }) });
    onRefresh();
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Members ({members.length})</h3>
      {members.map(m => (
        <div key={m.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            {m.photo_url ? (
              <img src={m.photo_url} alt={m.name} className="h-12 w-10 rounded border object-cover" />
            ) : (
              <div className="flex h-12 w-10 items-center justify-center rounded border bg-muted text-sm font-bold">{m.name[0]}</div>
            )}
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.email} | {m.city}, {m.state}</p>
              <p className="text-xs">Status: <span className={m.status === "approved" ? "text-green-600 font-medium" : m.status === "rejected" ? "text-red-600" : "text-yellow-600"}>{m.status}</span>
                {m.member_id && <span className="ml-2 font-mono text-primary">{m.member_id}</span>}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {m.status === "pending" && (
              <>
                <Button size="sm" onClick={() => update(m.id, "approved")}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => update(m.id, "rejected")}>Reject</Button>
              </>
            )}
            {m.status === "approved" && m.member_id && (
              <span className="text-xs text-green-600 font-medium px-2 py-1">🪪 {m.member_id}</span>
            )}
            <Button size="sm" variant="destructive" onClick={() => del(m.id)}>Delete</Button>
          </div>
        </div>
      ))}
      {members.length === 0 && <p className="text-sm text-muted-foreground">No membership applications yet.</p>}
    </div>
  );
}

function CampaignManager({ campaigns, headers, password, onRefresh }: { campaigns: Campaign[]; headers: Record<string, string>; password: string; onRefresh: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", goal_amount: "" });
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-password": password }, body: fd });
    const data = await res.json();
    setImageUrl(data.url || ""); setUploading(false);
  };

  const handleCreate = async () => {
    await fetch("/api/admin/campaigns", { method: "POST", headers, body: JSON.stringify({ title: form.title, description: form.description, goal_amount: Number(form.goal_amount), image_url: imageUrl || null }) });
    setForm({ title: "", description: "", goal_amount: "" }); setImageUrl(""); onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-4 space-y-3">
        <h3 className="font-semibold">Create Campaign</h3>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" rows={3} />
        <input placeholder="Goal Amount (₹)" type="number" value={form.goal_amount} onChange={e => setForm({ ...form, goal_amount: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} className="text-sm" />
        {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
        {imageUrl && <p className="text-xs text-green-600">Image uploaded ✓</p>}
        <Button onClick={handleCreate} disabled={!form.title || !form.description} className="rounded-full">Create</Button>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold">All Campaigns ({campaigns.length})</h3>
        {campaigns.map(c => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border p-3">
            <div><p className="font-medium">{c.title}</p><p className="text-xs text-muted-foreground">Goal: ₹{c.goal_amount} | {c.is_active ? "Active" : "Inactive"}</p></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={async () => { await fetch("/api/admin/campaigns", { method: "PUT", headers, body: JSON.stringify({ id: c.id, is_active: !c.is_active }) }); onRefresh(); }}>{c.is_active ? "Deactivate" : "Activate"}</Button>
              <Button variant="destructive" size="sm" className="rounded-full" onClick={async () => { if (!confirm("Delete?")) return; await fetch("/api/admin/campaigns", { method: "DELETE", headers, body: JSON.stringify({ id: c.id }) }); onRefresh(); }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryManager({ stories, headers, password, onRefresh }: { stories: Story[]; headers: Record<string, string>; password: string; onRefresh: () => void }) {
  const [form, setForm] = useState({ title: "", author: "", content: "" });
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-password": password }, body: fd });
    const data = await res.json();
    setImageUrl(data.url || ""); setUploading(false);
  };

  const handleCreate = async () => {
    await fetch("/api/admin/stories", { method: "POST", headers, body: JSON.stringify({ title: form.title, author: form.author, content: form.content, cover_image_url: imageUrl || null }) });
    setForm({ title: "", author: "", content: "" }); setImageUrl(""); onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-4 space-y-3">
        <h3 className="font-semibold">Create Article</h3>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <input placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea placeholder="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" rows={5} />
        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} className="text-sm" />
        {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
        {imageUrl && <p className="text-xs text-green-600">Image uploaded ✓</p>}
        <Button onClick={handleCreate} disabled={!form.title || !form.content} className="rounded-full">Create</Button>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold">All Articles ({stories.length})</h3>
        {stories.map(s => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border p-3">
            <div><p className="font-medium">{s.title}</p><p className="text-xs text-muted-foreground">By {s.author} | {s.published ? "Published" : "Draft"}</p></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={async () => { await fetch("/api/admin/stories", { method: "PUT", headers, body: JSON.stringify({ id: s.id, published: !s.published }) }); onRefresh(); }}>{s.published ? "Unpublish" : "Publish"}</Button>
              <Button variant="destructive" size="sm" className="rounded-full" onClick={async () => { if (!confirm("Delete?")) return; await fetch("/api/admin/stories", { method: "DELETE", headers, body: JSON.stringify({ id: s.id }) }); onRefresh(); }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadershipManager({ leaders, headers, password, onRefresh }: { leaders: Leader[]; headers: Record<string, string>; password: string; onRefresh: () => void }) {
  const emptyForm = { name: "", role: "", bio: "", social_facebook: "", social_instagram: "", social_twitter: "", display_order: "0" };
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState("");

  const startEdit = (l: Leader) => {
    setEditingId(l.id);
    setForm({ name: l.name, role: l.role, bio: l.bio || "", social_facebook: l.social_facebook || "", social_instagram: l.social_instagram || "", social_twitter: l.social_twitter || "", display_order: String(l.display_order) });
    setExistingPhotoUrl(l.photo_url || "");
    setPhotoFile(null);
    setPhotoPreview(l.photo_url || "");
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setPhotoFile(null); setPhotoPreview(""); setExistingPhotoUrl(""); };

  const handleSave = async () => {
    if (!form.name || !form.role) return;
    setUploading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photoFile) fd.append("photo", photoFile);
    if (editingId) {
      fd.append("id", editingId);
      fd.append("existing_photo_url", existingPhotoUrl);
      await fetch("/api/admin/leaders", { method: "PUT", headers: { "x-admin-password": password }, body: fd });
    } else {
      await fetch("/api/admin/leaders", { method: "POST", headers: { "x-admin-password": password }, body: fd });
    }
    setUploading(false);
    cancelEdit();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{editingId ? "Edit Leader" : "Add New Leader"}</h3>
          {editingId && <button onClick={cancelEdit} className="text-xs text-muted-foreground hover:text-foreground">✕ Cancel</button>}
        </div>
        <div className="flex items-center gap-4">
          {photoPreview ? (
            <img src={photoPreview} alt="preview" className="h-20 w-20 rounded-full object-cover border-2 border-primary/20" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground border-2 border-dashed">
              {form.name ? form.name[0] : "?"}
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Photo</label>
            <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} className="mt-1 block text-sm" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input placeholder="Role / Position *" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <textarea placeholder="Bio (optional)" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" rows={2} />
        <div className="grid gap-3 sm:grid-cols-3">
          <input placeholder="Facebook URL" value={form.social_facebook} onChange={e => setForm({ ...form, social_facebook: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input placeholder="Instagram URL" value={form.social_instagram} onChange={e => setForm({ ...form, social_instagram: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input placeholder="Twitter/X URL" value={form.social_twitter} onChange={e => setForm({ ...form, social_twitter: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <input placeholder="Display Order" type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: e.target.value })} className="w-40 rounded-lg border px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!form.name || !form.role || uploading} className="rounded-full">
            {uploading ? "Saving..." : editingId ? "Update Leader" : "Add Leader"}
          </Button>
          {editingId && <Button variant="outline" onClick={cancelEdit} className="rounded-full">Cancel</Button>}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold">Current Leaders ({leaders.length})</h3>
        {leaders.map(l => (
          <div key={l.id} className={`rounded-2xl border p-4 ${editingId === l.id ? "border-primary bg-primary/5" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {l.photo_url
                  ? <img src={l.photo_url} alt={l.name} className="h-14 w-14 rounded-full object-cover border-2 border-primary/20 flex-shrink-0" />
                  : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary flex-shrink-0">{l.name[0]}</div>
                }
                <div>
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-sm text-primary">{l.role}</p>
                  {l.bio && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{l.bio}</p>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(l)}>Edit</Button>
                <Button variant="destructive" size="sm" className="rounded-full" onClick={async () => { if (!confirm(`Remove ${l.name}?`)) return; await fetch("/api/admin/leaders", { method: "DELETE", headers, body: JSON.stringify({ id: l.id }) }); onRefresh(); }}>Remove</Button>
              </div>
            </div>
          </div>
        ))}
        {leaders.length === 0 && <p className="text-sm text-muted-foreground">No leaders added yet.</p>}
      </div>
    </div>
  );
}
