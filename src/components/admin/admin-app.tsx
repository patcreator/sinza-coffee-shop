"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Coffee,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  Settings as SettingsIcon,
  Share2,
  ShoppingBag,
  Users,
  Languages,
} from "lucide-react";
import { ResourceManager, type FieldDef } from "@/components/admin/resource-manager";
import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminOrders } from "@/components/admin/orders";
import { EmailStudio } from "@/components/admin/email-studio";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

type Tab =
  | "dashboard"
  | "orders"
  | "menu"
  | "content"
  | "media"
  | "email"
  | "people"
  | "social"
  | "i18n"
  | "settings";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "menu", label: "Menu", icon: Coffee },
  { id: "content", label: "Blog & offers", icon: FileText },
  { id: "media", label: "Gallery & FAQ", icon: ImageIcon },
  { id: "email", label: "Email studio", icon: Mail },
  { id: "people", label: "People", icon: Users },
  { id: "social", label: "Social sync", icon: Share2 },
  { id: "i18n", label: "Languages", icon: Languages },
  { id: "settings", label: "Site settings", icon: SettingsIcon },
];

const itemFields: FieldDef[] = [
  { name: "name", label: "Name" },
  { name: "categoryId", label: "Category ID", type: "number" },
  { name: "price", label: "Price (RWF)", type: "number" },
  { name: "description", label: "Short description", type: "textarea" },
  { name: "longDescription", label: "Full description", type: "textarea" },
  { name: "image", label: "Image", type: "image" },
  { name: "available", label: "Available", type: "checkbox" },
  { name: "featured", label: "Featured", type: "checkbox" },
  { name: "position", label: "Position", type: "number" },
];

export function AdminApp({ user }: { user: { email: string; role: string; name: string | null } }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => setCats(j.rows ?? []))
      .catch(() => {});
  }, []);

  async function syncSocial(platform: string) {
    setLoading(true);
    const res = await fetch("/api/admin/social-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    const json = await res.json();
    setLoading(false);
    alert(json.error ? `Error: ${json.error}` : `Synced ${json.saved} ${platform} posts.`);
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-[#170b04]">
      <header className="sticky top-0 z-40 border-b border-espresso/10 bg-espresso text-cream dark:border-cream/10 dark:bg-[#1e0e06]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href="/" className="font-semibold">
            ☕ Sinza · Staff
          </Link>
          <span className="ml-2 hidden text-xs opacity-70 sm:block">
            {user.email} · {user.role}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle className="border-cream/30 text-cream" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                tab === id
                  ? "border-cinnamon bg-cinnamon text-ivory"
                  : "border-espresso/15 hover:bg-espresso/10 dark:border-cream/15 dark:hover:bg-cream/10",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && <AdminDashboard />}
        {tab === "orders" && <AdminOrders />}

        {tab === "menu" && (
          <div className="space-y-6">
            <ResourceManager
              resource="menus"
              title="Menus"
              columns={["id", "name", "slug", "description", "active"]}
              fields={[
                { name: "name", label: "Menu name" },
                { name: "description", label: "Description" },
                { name: "position", label: "Position", type: "number" },
                { name: "active", label: "Active", type: "checkbox" },
              ]}
            />
            <ResourceManager
              resource="categories"
              title="Categories"
              columns={["id", "name", "slug", "group", "position", "active"]}
              fields={[
                { name: "name", label: "Category name" },
                {
                  name: "group",
                  label: "Group",
                  type: "select",
                  options: [
                    { value: "drinks", label: "Drinks" },
                    { value: "food", label: "Food" },
                    { value: "bar", label: "Bar" },
                  ],
                },
                { name: "menuId", label: "Menu ID", type: "number" },
                { name: "position", label: "Position", type: "number" },
                { name: "active", label: "Active", type: "checkbox" },
              ]}
            />
            <ResourceManager
              resource="items"
              title={`Menu items${cats.length ? ` — categories: ${cats.map((c) => `${c.id}:${c.name}`).join(", ")}` : ""}`}
              columns={["id", "name", "categoryId", "price", "available", "featured"]}
              fields={itemFields}
            />
          </div>
        )}

        {tab === "content" && (
          <ResourceManager
            resource="posts"
            title="Blog posts, offers, events & news"
            columns={["id", "title", "type", "discount", "published", "notified"]}
            fields={[
              { name: "title", label: "Title" },
              {
                name: "type",
                label: "Type",
                type: "select",
                options: [
                  { value: "blog", label: "Blog" },
                  { value: "offer", label: "Offer" },
                  { value: "event", label: "Event" },
                  { value: "news", label: "News" },
                ],
              },
              { name: "discount", label: "Discount (e.g. 20%)" },
              { name: "excerpt", label: "Short explanation", type: "textarea" },
              { name: "body", label: "Body", type: "textarea" },
              { name: "cover", label: "Picture", type: "image" },
              { name: "video", label: "Video (R2 URL)", type: "image" },
              { name: "link", label: "Link" },
              { name: "published", label: "Published", type: "checkbox" },
            ]}
          />
        )}

        {tab === "media" && (
          <div className="space-y-6">
            <ResourceManager
              resource="galleries"
              title="Gallery"
              columns={["id", "title", "type", "kind", "position"]}
              fields={[
                { name: "title", label: "Title" },
                { name: "description", label: "Description", type: "textarea" },
                { name: "url", label: "File", type: "image" },
                {
                  name: "kind",
                  label: "Kind",
                  type: "select",
                  options: [
                    { value: "image", label: "Image" },
                    { value: "video", label: "Video" },
                  ],
                },
                { name: "type", label: "Type / album" },
                { name: "position", label: "Position", type: "number" },
              ]}
            />
            <ResourceManager
              resource="faqs"
              title="FAQ"
              columns={["id", "question", "position", "active"]}
              fields={[
                { name: "question", label: "Question" },
                { name: "answer", label: "Answer", type: "textarea" },
                { name: "position", label: "Position", type: "number" },
                { name: "active", label: "Active", type: "checkbox" },
              ]}
            />
          </div>
        )}

        {tab === "email" && <EmailStudio />}

        {tab === "people" && (
          <div className="space-y-6">
            <ResourceManager
              resource="waiters"
              title="Waiters & waitresses"
              columns={["id", "name", "shift", "available"]}
              fields={[
                { name: "name", label: "Name" },
                { name: "phone", label: "Phone" },
                { name: "shift", label: "Shift" },
                { name: "photo", label: "Photo", type: "image" },
                { name: "available", label: "Available", type: "checkbox" },
              ]}
            />
            <ResourceManager
              resource="tables"
              title="Tables & QR tokens"
              columns={["id", "label", "qrToken", "active"]}
              fields={[
                { name: "label", label: "Label" },
                { name: "qrToken", label: "QR token" },
                { name: "active", label: "Active", type: "checkbox" },
              ]}
            />
            <ResourceManager
              resource="users"
              title="Users & roles"
              columns={["id", "email", "name", "role", "activated"]}
              fields={[
                { name: "email", label: "Email" },
                { name: "name", label: "Name" },
                {
                  name: "role",
                  label: "Role",
                  type: "select",
                  options: [
                    { value: "customer", label: "Customer" },
                    { value: "editor", label: "Editor" },
                    { value: "admin", label: "Admin" },
                  ],
                },
              ]}
            />
            <ResourceManager resource="subscribers" title="Newsletter subscribers" columns={["id", "email", "frequency", "active"]} fields={[{ name: "email", label: "Email" }, { name: "frequency", label: "Frequency" }]} />
            <ResourceManager resource="reservations" title="Reservations" columns={["id", "name", "phone", "date", "time", "guests", "status"]} fields={[{ name: "status", label: "Status" }]} />
            <ResourceManager resource="messages" title="Contact messages" columns={["id", "name", "email", "subject", "handled"]} fields={[{ name: "handled", label: "Handled", type: "checkbox" }]} />
            <ResourceManager resource="feedback" title="Feedback" columns={["id", "name", "rating", "message"]} fields={[]} readOnly />
          </div>
        )}

        {tab === "social" && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-espresso/12 bg-ivory p-5 dark:border-cream/12 dark:bg-white/5">
              <h2 className="text-lg font-semibold">Sync social feeds (Apify)</h2>
              <p className="mt-1 text-sm opacity-70">
                Pulls the latest posts from Instagram, Threads and TikTok into the website. Requires APIFY_TOKEN.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["instagram", "threads", "tiktok"].map((p) => (
                  <button
                    key={p}
                    onClick={() => syncSocial(p)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-cinnamon px-5 py-2.5 text-sm font-semibold text-ivory"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} Sync {p}
                  </button>
                ))}
              </div>
            </section>
            <ResourceManager resource="social" title="Synced posts" columns={["id", "platform", "caption", "permalink", "likes"]} fields={[]} readOnly />
          </div>
        )}

        {tab === "i18n" && (
          <div className="space-y-6">
            <ResourceManager
              resource="languages"
              title="Languages"
              columns={["code", "label", "active"]}
              fields={[
                { name: "code", label: "Code (en, fr, rw)" },
                { name: "label", label: "Label" },
                { name: "active", label: "Active", type: "checkbox" },
              ]}
            />
            <ResourceManager
              resource="translations"
              title="Translations"
              columns={["id", "locale", "key", "value"]}
              fields={[
                { name: "locale", label: "Locale" },
                { name: "key", label: "Key" },
                { name: "value", label: "Value" },
              ]}
            />
          </div>
        )}

        {tab === "settings" && <SettingsEditor />}
      </div>
    </div>
  );
}
