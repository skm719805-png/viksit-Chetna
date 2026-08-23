"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

type MediaItem = { type: "image" | "video" | "youtube" | "instagram"; url: string; caption?: string };
type Campaign = { id: string; title: string; slug: string; description: string; image_url: string | null; goal_amount: number; is_active: boolean; show_funding: boolean; form_title: string; participation_fields: ParticipationField[] };
type ParticipationField = { name: string; label: string; type: string; required: boolean; options?: string[] };
type Participation = { id: string; created_at: string; responses: Record<string, string> };
type Story = { id: string; title: string; author: string; content: string; cover_image_url: string | null; published: boolean; media: MediaItem[] };
type Volunteer = { id: string; name: string; email: string; phone: string; status: string; certificate_issued: boolean; campaigns: { title: string } | null };
type Member = { id: string; name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string; age: string; status: string; member_id: string | null; photo_url: string | null; created_at: string };
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});
  const [leaderModal, setLeaderModal] = useState<Member | null>(null);
  const [leaderRole, setLeaderRole] = useState("");
  const [leaderBio, setLeaderBio] = useState("");
  const [leaderRank, setLeaderRank] = useState("0");
  const [useExistingPhoto, setUseExistingPhoto] = useState(true);
  const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  const update = async (id: string, body: Record<string, unknown>) => {
    await fetch("/api/admin/members", { method: "PUT", headers, body: JSON.stringify({ id, ...body }) });
    onRefresh();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    await fetch("/api/admin/members", { method: "DELETE", headers, body: JSON.stringify({ id }) });
    onRefresh();
  };
  const startEdit = (m: Member) => { setEditingId(m.id); setEditForm({ name: m.name, email: m.email, phone: m.phone, address: m.address, city: m.city, state: m.state, pincode: m.pincode, age: m.age }); };
  const saveEdit = async () => { await update(editingId!, editForm); setEditingId(null); };
  const promoteLeader = async () => {
    if (!leaderRole || !leaderModal) return;
    await update(leaderModal.id, { promote_to_leader: { role: leaderRole, bio: leaderBio, display_order: Number(leaderRank), photo_url: useExistingPhoto ? leaderModal.photo_url : null } });
    setLeaderModal(null); setLeaderRole(""); setLeaderBio(""); setLeaderRank("0"); setUseExistingPhoto(true);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Members ({members.length})</h3>
      {members.map(m => (
        <div key={m.id} className={`rounded-xl border p-3 space-y-3 ${editingId === m.id ? "border-primary bg-primary/5" : ""}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.name} className="h-12 w-10 rounded border object-cover flex-shrink-0" />
              ) : (
                <div className="flex h-12 w-10 items-center justify-center rounded border bg-muted text-sm font-bold flex-shrink-0">{m.name[0]}</div>
              )}
              <div className="space-y-0.5">
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">📧 {m.email} | 📞 {m.phone}</p>
                <p className="text-xs text-muted-foreground">📍 {m.address}, {m.city}, {m.state} - {m.pincode}</p>
                <p className="text-xs text-muted-foreground">Age: {m.age} | Joined: {new Date(m.created_at).toLocaleDateString()}</p>
                <p className="text-xs">Status: <span className={m.status === "approved" ? "text-green-600 font-medium" : m.status === "rejected" ? "text-red-600" : "text-yellow-600"}>{m.status}</span>
                  {m.member_id && <span className="ml-2 font-mono text-primary">🪪 {m.member_id}</span>}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {m.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => update(m.id, { status: "approved" })}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => update(m.id, { status: "rejected" })}>Reject</Button>
                </>
              )}
              <Button size="sm" variant="outline" onClick={() => startEdit(m)}>Edit</Button>
              <Button size="sm" variant="outline" className="text-purple-600 border-purple-300" onClick={() => { setLeaderModal(m); setLeaderRole(""); setLeaderBio(""); setLeaderRank("0"); setUseExistingPhoto(true); }}>👑 Make Leader</Button>
              <Button size="sm" variant="destructive" onClick={() => del(m.id)}>Delete</Button>
            </div>
          </div>

          {editingId === m.id && (
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t">
              <div><label className="text-xs font-medium text-muted-foreground">Name</label><input value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className={`mt-1 ${inp}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Email</label><input value={editForm.email || ""} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className={`mt-1 ${inp}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Phone</label><input value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={`mt-1 ${inp}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Age</label><input type="number" value={editForm.age || ""} onChange={e => setEditForm({ ...editForm, age: e.target.value })} className={`mt-1 ${inp}`} /></div>
              <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground">Address</label><input value={editForm.address || ""} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className={`mt-1 ${inp}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">City</label><input value={editForm.city || ""} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className={`mt-1 ${inp}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">State</label><input value={editForm.state || ""} onChange={e => setEditForm({ ...editForm, state: e.target.value })} className={`mt-1 ${inp}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Pincode</label><input value={editForm.pincode || ""} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} className={`mt-1 ${inp}`} /></div>
              <div className="sm:col-span-2 flex gap-2">
                <Button size="sm" onClick={saveEdit}>Save Changes</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          )}

          {leaderModal?.id === m.id && (
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-3">
                {m.photo_url
                  ? <img src={m.photo_url} alt={m.name} className="h-14 w-14 rounded-full object-cover border-2 border-purple-300" />
                  : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-600">{m.name[0]}</div>
                }
                <p className="text-sm font-semibold text-purple-700">👑 Promote {m.name} to Leadership</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="text-xs font-medium text-muted-foreground">Role / Title *</label><input placeholder="e.g. President, Secretary" value={leaderRole} onChange={e => setLeaderRole(e.target.value)} className={`mt-1 ${inp}`} /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Ranking (lower = higher priority)</label><input type="number" min="0" placeholder="0" value={leaderRank} onChange={e => setLeaderRank(e.target.value)} className={`mt-1 ${inp}`} /></div>
                <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground">Bio (optional)</label><input placeholder="Short bio" value={leaderBio} onChange={e => setLeaderBio(e.target.value)} className={`mt-1 ${inp}`} /></div>
              </div>
              {m.photo_url && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={useExistingPhoto} onChange={e => setUseExistingPhoto(e.target.checked)} />
                  Use member&apos;s profile photo as leader photo
                </label>
              )}
              <div className="flex gap-2">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={promoteLeader} disabled={!leaderRole}>Confirm Promotion</Button>
                <Button size="sm" variant="outline" onClick={() => setLeaderModal(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      ))}
      {members.length === 0 && <p className="text-sm text-muted-foreground">No membership applications yet.</p>}
    </div>
  );
}

const DEFAULT_FIELDS: ParticipationField[] = [
  { name: "name", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel", required: false },
];

function CampaignManager({ campaigns, headers, password, onRefresh }: { campaigns: Campaign[]; headers: Record<string, string>; password: string; onRefresh: () => void }) {
  const emptyForm = { title: "", description: "", goal_amount: "", form_title: "Participate in this Campaign", show_funding: true };
  const [form, setForm] = useState(emptyForm);
  const [fields, setFields] = useState<ParticipationField[]>(DEFAULT_FIELDS);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingParticipations, setViewingParticipations] = useState<string | null>(null);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [movingToStory, setMovingToStory] = useState<Campaign | null>(null);
  const [storyAuthor, setStoryAuthor] = useState("");

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-password": password }, body: fd });
    const data = await res.json();
    setImageUrl(data.url || ""); setUploading(false);
  };

  const startEdit = (c: Campaign) => {
    setEditingId(c.id);
    setForm({ title: c.title, description: c.description, goal_amount: String(c.goal_amount), form_title: c.form_title || "Participate in this Campaign", show_funding: c.show_funding ?? true });
    setFields(c.participation_fields?.length ? c.participation_fields : DEFAULT_FIELDS);
    setImageUrl(c.image_url || "");
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setFields(DEFAULT_FIELDS); setImageUrl(""); };

  const moveToStory = async () => {
    if (!movingToStory || !storyAuthor) return;
    await fetch("/api/admin/stories", { method: "POST", headers, body: JSON.stringify({
      title: movingToStory.title,
      author: storyAuthor,
      content: movingToStory.description,
      cover_image_url: movingToStory.image_url || null,
      media: [],
    }) });
    setMovingToStory(null); setStoryAuthor("");
    onRefresh();
    alert(`✅ "${movingToStory.title}" moved to Stories (as draft). Go to Stories tab to publish and add media.`);
  };

  const handleSave = async () => {
    const body = { title: form.title, description: form.description, goal_amount: Number(form.goal_amount), image_url: imageUrl || null, form_title: form.form_title, show_funding: form.show_funding, participation_fields: fields };
    if (editingId) {
      await fetch("/api/admin/campaigns", { method: "PUT", headers, body: JSON.stringify({ id: editingId, ...body }) });
      cancelEdit();
    } else {
      await fetch("/api/admin/campaigns", { method: "POST", headers, body: JSON.stringify(body) });
      setForm(emptyForm); setFields(DEFAULT_FIELDS); setImageUrl("");
    }
    onRefresh();
  };

  const addField = () => setFields(f => [...f, { name: `field_${Date.now()}`, label: "", type: "text", required: false }]);
  const removeField = (i: number) => setFields(f => f.filter((_, idx) => idx !== i));
  const updateField = (i: number, patch: Partial<ParticipationField>) => setFields(f => f.map((x, idx) => idx === i ? { ...x, ...patch } : x));

  const viewParticipations = async (campaignId: string) => {
    const res = await fetch(`/api/campaign-participate?campaign_id=${campaignId}`, { headers: { "x-admin-password": password } });
    if (res.ok) { setParticipations(await res.json()); setViewingParticipations(campaignId); }
  };

  if (viewingParticipations) {
    const campaign = campaigns.find(c => c.id === viewingParticipations);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setViewingParticipations(null)}>← Back</Button>
          <h3 className="font-semibold">Participations: {campaign?.title} ({participations.length})</h3>
        </div>
        {participations.length === 0 && <p className="text-sm text-muted-foreground">No participations yet.</p>}
        {participations.map(p => (
          <div key={p.id} className="rounded-xl border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
            {Object.entries(p.responses).map(([k, v]) => (
              <p key={k} className="text-sm"><span className="font-medium capitalize">{k.replace(/_/g, " ")}:</span> {v}</p>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{editingId ? "Edit Campaign" : "Create Campaign"}</h3>
          {editingId && <button onClick={cancelEdit} className="text-xs text-muted-foreground hover:text-foreground">✕ Cancel</button>}
        </div>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" rows={3} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Goal Amount (₹)" type="number" value={form.goal_amount} onChange={e => setForm({ ...form, goal_amount: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input placeholder="Form Title" value={form.form_title} onChange={e => setForm({ ...form, form_title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.show_funding} onChange={e => setForm({ ...form, show_funding: e.target.checked })} className="rounded" />
          Show funding/donation section
        </label>
        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} className="text-sm" />
        {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
        {imageUrl && <p className="text-xs text-green-600">Image ready ✓</p>}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Participation Form Fields</p>
            <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={addField}>+ Add Field</Button>
          </div>
          {fields.map((f, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
              <input placeholder="Label" value={f.label} onChange={e => updateField(i, { label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })} className="rounded-lg border px-2 py-1.5 text-sm" />
              <select value={f.type} onChange={e => updateField(i, { type: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm bg-background">
                {["text", "email", "tel", "textarea", "select"].map(t => <option key={t}>{t}</option>)}
              </select>
              <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                <input type="checkbox" checked={f.required} onChange={e => updateField(i, { required: e.target.checked })} /> Req
              </label>
              <button onClick={() => removeField(i)} className="text-red-500 hover:text-red-700 text-sm px-1">✕</button>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={!form.title || !form.description} className="rounded-full">
          {editingId ? "Update Campaign" : "Create Campaign"}
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">All Campaigns ({campaigns.length})</h3>
        {campaigns.map(c => (
          <div key={c.id} className="rounded-xl border p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">Goal: ₹{c.goal_amount} | {c.is_active ? "🟢 Active" : "⚫ Inactive"} | Funding: {c.show_funding ? "On" : "Off"}</p>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(c)}>Edit</Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => viewParticipations(c.id)}>Participations</Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={async () => { await fetch("/api/admin/campaigns", { method: "PUT", headers, body: JSON.stringify({ id: c.id, is_active: !c.is_active }) }); onRefresh(); }}>{c.is_active ? "Deactivate" : "Activate"}</Button>
                <Button variant="outline" size="sm" className="rounded-full text-green-700 border-green-300" onClick={() => { setMovingToStory(c); setStoryAuthor(""); }}>📖 Move to Story</Button>
                <Button variant="destructive" size="sm" className="rounded-full" onClick={async () => { if (!confirm("Delete?")) return; await fetch("/api/admin/campaigns", { method: "DELETE", headers, body: JSON.stringify({ id: c.id }) }); onRefresh(); }}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && <p className="text-sm text-muted-foreground">No campaigns yet.</p>}
      </div>

      {movingToStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-lg">📖 Move to Story</h3>
            <p className="text-sm text-muted-foreground">Campaign: <strong>{movingToStory.title}</strong></p>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Author Name *</label>
              <input placeholder="e.g. Viksit Chetna Team" value={storyAuthor} onChange={e => setStoryAuthor(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <p className="text-xs text-muted-foreground">The campaign title, description and cover image will be copied as a story draft. You can add more media from the Stories tab.</p>
            <div className="flex gap-2">
              <Button onClick={moveToStory} disabled={!storyAuthor} className="rounded-full flex-1">Confirm</Button>
              <Button variant="outline" onClick={() => setMovingToStory(null)} className="rounded-full">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StoryManager({ stories, headers, password, onRefresh }: { stories: Story[]; headers: Record<string, string>; password: string; onRefresh: () => void }) {
  const [form, setForm] = useState({ title: "", author: "", content: "" });
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [newMedia, setNewMedia] = useState<{ type: MediaItem["type"]; url: string; caption: string }>({ type: "youtube", url: "", caption: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-password": password }, body: fd });
    const data = await res.json();
    setImageUrl(data.url || ""); setUploading(false);
  };

  const uploadMediaFile = async (file: File, type: "image" | "video") => {
    setMediaUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-password": password }, body: fd });
    const data = await res.json();
    if (data.url) setNewMedia(m => ({ ...m, type, url: data.url }));
    setMediaUploading(false);
  };

  const addMedia = () => {
    if (!newMedia.url) return;
    setMedia(m => [...m, { type: newMedia.type, url: newMedia.url, caption: newMedia.caption }]);
    setNewMedia({ type: "youtube", url: "", caption: "" });
  };

  const removeMedia = (i: number) => setMedia(m => m.filter((_, idx) => idx !== i));

  const startEdit = (s: Story) => {
    setEditingId(s.id);
    setForm({ title: s.title, author: s.author, content: s.content });
    setImageUrl(s.cover_image_url || "");
    setMedia(s.media || []);
  };

  const cancelEdit = () => { setEditingId(null); setForm({ title: "", author: "", content: "" }); setImageUrl(""); setMedia([]); };

  const handleSave = async () => {
    const body = { title: form.title, author: form.author, content: form.content, cover_image_url: imageUrl || null, media };
    if (editingId) {
      await fetch("/api/admin/stories", { method: "PUT", headers, body: JSON.stringify({ id: editingId, ...body }) });
      cancelEdit();
    } else {
      await fetch("/api/admin/stories", { method: "POST", headers, body: JSON.stringify(body) });
      setForm({ title: "", author: "", content: "" }); setImageUrl(""); setMedia([]);
    }
    onRefresh();
  };

  const MEDIA_TYPES: { value: MediaItem["type"]; label: string; placeholder: string }[] = [
    { value: "youtube", label: "🎥 YouTube", placeholder: "https://youtube.com/watch?v=..." },
    { value: "instagram", label: "📸 Instagram", placeholder: "https://instagram.com/p/..." },
    { value: "image", label: "🖼️ Image URL", placeholder: "https://... or upload below" },
    { value: "video", label: "🎦 Video URL", placeholder: "https://... or upload below" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{editingId ? "Edit Article" : "Create Article"}</h3>
          {editingId && <button onClick={cancelEdit} className="text-xs text-muted-foreground hover:text-foreground">✕ Cancel</button>}
        </div>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp} />
        <input placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className={inp} />
        <textarea placeholder="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={inp} rows={5} />

        <div>
          <label className="text-xs font-medium text-muted-foreground">Cover Image</label>
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} className="mt-1 text-sm" />
          {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
          {imageUrl && <img src={imageUrl} className="mt-2 h-24 rounded-lg object-cover" />}
        </div>

        {/* Media Gallery Builder */}
        <div className="space-y-3 rounded-xl border p-4 bg-muted/30">
          <p className="text-sm font-semibold">🎨 Media Gallery</p>

          {/* Existing media items */}
          {media.length > 0 && (
            <div className="space-y-2">
              {media.map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
                  <span className="text-base">{item.type === "youtube" ? "🎥" : item.type === "instagram" ? "📸" : item.type === "video" ? "🎦" : "🖼️"}</span>
                  <span className="flex-1 truncate text-xs text-muted-foreground">{item.caption || item.url}</span>
                  <button onClick={() => removeMedia(i)} className="text-red-500 hover:text-red-700 text-xs px-1">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Add new media item */}
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground">+ Add Media Item</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <select value={newMedia.type} onChange={e => setNewMedia(m => ({ ...m, type: e.target.value as MediaItem["type"], url: "" }))} className={`${inp} bg-background`}>
                {MEDIA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input
                placeholder={MEDIA_TYPES.find(t => t.value === newMedia.type)?.placeholder}
                value={newMedia.url}
                onChange={e => setNewMedia(m => ({ ...m, url: e.target.value }))}
                className={inp}
              />
            </div>
            <input placeholder="Caption (optional)" value={newMedia.caption} onChange={e => setNewMedia(m => ({ ...m, caption: e.target.value }))} className={inp} />
            {(newMedia.type === "image" || newMedia.type === "video") && (
              <div>
                <label className="text-xs text-muted-foreground">Or upload file:</label>
                <input type="file" accept={newMedia.type === "image" ? "image/*" : "video/*"} onChange={e => e.target.files?.[0] && uploadMediaFile(e.target.files[0], newMedia.type as "image" | "video")} className="mt-1 text-sm" />
                {mediaUploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
              </div>
            )}
            <Button size="sm" variant="outline" onClick={addMedia} disabled={!newMedia.url} className="rounded-full">+ Add to Gallery</Button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={!form.title || !form.content} className="rounded-full">
          {editingId ? "Update Article" : "Create Article"}
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">All Articles ({stories.length})</h3>
        {stories.map(s => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">By {s.author} | {s.published ? "Published" : "Draft"} | {(s.media || []).length} media items</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(s)}>Edit</Button>
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
