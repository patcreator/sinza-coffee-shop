# ☕ Sinza Coffee Shop — Fullstack Ordering & CMS Platform

> ☕ **Sinza Coffee Shop** ☕ — ✨ Coffee, Meals ✨ — 📍 **Gisozi (Kwa Gakire), Kigali, Rwanda**
>
> Instagram: <https://www.instagram.com/sinzacoffeeshop/> · Threads: <https://www.threads.com/@sinzacoffeeshop>
> Map: <https://www.google.com/maps/@-1.9286899,30.0643295,1386a,75y,100.2h,90t>

A complete Next.js (App Router) application for the coffee shop: a cinematic video welcome page, a full
searchable menu, guest or account ordering, waiter selection behind a QR gate, online payments
(MoMo/Airtel via PawaPay, cards via Pesapal), a WhatsApp order hand-off, a full CMS/admin dashboard with
sales analytics, a blog/offers engine, an email studio, newsletter, gallery, multi-language content and a
Gemini-powered AI assistant grounded on the site's own data.

---

## 1. Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Route Handlers) |
| Styling | Tailwind CSS v4 + shadcn-style primitives, full dark/light mode (`dark:` classes, `next-themes`, no hydration warnings) |
| Icons | `lucide-react` + `react-icons` (never emojis for UI icons) |
| Database | PostgreSQL (Neon-ready) + Drizzle ORM |
| Auth | Passwordless **email magic link** (activate account + sign-in) with JWT cookie sessions (`jose`); optional Clerk SSO hook |
| Email | Resend (`RESEND_API_KEY`) with HTML templates + delivery log |
| Storage | Cloudflare R2 multi-file uploads (S3 API), inline fallback in dev |
| Payments | PawaPay (MTN MoMo, Airtel Money) + Pesapal (cards) + pay-after-eating |
| AI | Google Gemini (`GEMINI_API_KEY`), grounded on menu/FAQ/settings, with offline keyword fallback |
| Social sync | Apify actors for Instagram / Threads / TikTok |
| Charts | Recharts (bar, line, pie) |
| API docs | OpenAPI 3 document at `/api/docs`, Swagger UI at `/docs` |
| QR | `qrcode` (order QR) + `html5-qrcode` (table QR scanner) |

### Brand palette

`#35180B` espresso · `#2C150A` bean · `#923F0C` cinnamon · `#F7F0EB` cream · `#FBFBEC` ivory · `#000000` ink
(exposed as Tailwind colours `espresso, bean, cinnamon, cream, ivory, ink, latte, mocha`).

---

## 2. Quick start

```bash
# 1. install
npm install

# 2. configure (see section 3)
cp .env .env.local   # or edit .env directly

# 3. create the tables
npx drizzle-kit push

# 4. seed the full Sinza menu, waiters, tables/QR, FAQs, posts, templates…
npx tsx src/db/seed.ts

# 5. run
npm run dev      # http://localhost:3000
npm run build && npm run start   # production
```

### Add your welcome video

Drop your file at **`public/welcome.mp4`**. The home page plays it full-bleed, muted and looping, behind a
dark gradient + radial overlay so all text stays readable. `public/brand/hero.jpg` is the poster shown while
the video loads (or if the file is missing). You can change both from **Admin → Site settings**.

---

## 3. Environment variables

All of these live in `.env` (already scaffolded with empty values):

```env
DATABASE_URL=postgresql://…            # Neon or local Postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=250788000000
AUTH_SECRET=long-random-string
ADMIN_EMAILS=admin@sinzacoffee.rw      # comma separated → auto-promoted to admin

RESEND_API_KEY=                        # emails (receipts, magic links, newsletter)
EMAIL_FROM=Sinza Coffee Shop <hello@yourdomain.rw>

GEMINI_API_KEY=                        # AI assistant
GEMINI_MODEL=gemini-2.0-flash

PAWAPAY_API_TOKEN=                     # MoMo + Airtel
PAWAPAY_BASE_URL=https://api.sandbox.pawapay.io
PESAPAL_CONSUMER_KEY=                  # cards
PESAPAL_CONSUMER_SECRET=
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3
PESAPAL_IPN_ID=

R2_ACCOUNT_ID=                         # Cloudflare R2 uploads
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=https://cdn.yourdomain.rw

APIFY_TOKEN=                           # Instagram / Threads / TikTok sync

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=     # optional Clerk SSO
CLERK_SECRET_KEY=
```

Everything degrades gracefully: without Resend the emails are logged (and the magic link is returned in dev),
without payment keys a sandbox intent is created so you can test the whole checkout, without R2 small uploads
are inlined, without Gemini the assistant answers from a keyword search over the same grounded context.

---

## 4. The three user types

| User | What they can do |
| --- | --- |
| **Visitor (no account)** | Browse the welcome page, menu, events, offers, blog, gallery; search & filter; add to cart; order as a guest; pay online or after eating; WhatsApp order; reserve; contact; subscribe; feedback; use the AI assistant. |
| **Visitor with account** | Everything above plus saved order history at `/account`. Registration = enter email → activation link (Resend) → signed-in session. Clerk SSO can be plugged in with the env keys. |
| **Admin / Editor** | `/admin` dashboard: analytics, orders, menus/categories/items, blog & offers, gallery & FAQ, email studio, people (waiters, tables/QR, users & roles, subscribers, reservations, messages, feedback), social sync, languages & translations, and full site settings (logo, name, colours, images, carousels, contact info, socials). |

> The first sign-in with an address listed in `ADMIN_EMAILS` is automatically an **admin**.
> Roles can then be changed from **Admin → People → Users & roles** (`customer`, `editor`, `admin`).

---

## 5. Ordering flow

1. **Menu** (`/menu`) — menu name + creation date on top, category chips (`All` first, then every category:
   soft drinks, local beers, coffee, tea, iced drinks & frappes, fresh juice, shakes, smoothies, Rolex
   (incl. *King Size — extra egg + toppings +1,500*), wraps, burgers, sandwiches, chicken, omelettes,
   famous chips, pasta, fresh salads, breakfast, snacks, other sides, whiskies & spirits, tequila & liquors,
   champagnes & sparkling, cognac, gin & vodka, white & red wine, cocktails, mocktails).
   A **search icon** opens an inline search (items *and* categories) and closes with the ✕.
   Every filter/search lives in the URL (`/menu?category=coffee&q=latte&menu=all-day`) so a visitor can
   share or restore exactly where they were.
2. **Item card** — image · name · price in RWF · round **add-to-cart** icon button (react-icons/lucide, no emoji).
   Click the card to read the full description at `/item/[slug]` (with add-ons, quantity and share links).
3. **Cart** (`/cart`) — quantities, add-ons, guest contact fields, then **Order now** with three options:
   1. **Choose your waiter** — shows the gate: *“To choose a waiter or waitress, please scan the restaurant's
      menu QR code…”* → **OK, Scan Menu** opens the camera (`html5-qrcode`), validates the table token against
      the `tables` table, then lists **available** waiters. (You can also type the printed code.)
   2. **Order direct to the restaurant.**
   3. **Send the order to WhatsApp** — builds exactly:
      ```
      *Sinza Coffee Shop Order*

      I would like to place this order:

      1 × Water(small) — 1,000 RWF
      1 × BBQ Chicken Wings — 8,500 RWF

      Subtotal: 9,500 RWF
      ```
4. **Order page** (`/order/[code]`) — receipt, status, a **QR code + shareable link** so anybody can open and
   pay the order from a phone, plus the payment panel (MoMo / Airtel / Card) or “pay after eating”.
   Receipts are emailed automatically when an email address is given.

Payments: `POST /api/payments/initiate` → PawaPay deposit (MoMo/Airtel) or Pesapal redirect (card);
providers call back on `POST /api/payments/webhook` (the sandbox button simulates it).

---

## 6. Admin dashboard (`/admin`)

* **Dashboard** — revenue per **day**, sold per **week**, sold per **month** (bar + line charts), a **pie chart
  of the most-bought items with %**, KPI cards (orders, revenue, paid, pending, subscribers, reservations) and
  order-channel breakdown. Range selector: 7 / 30 / 90 / 365 days.
* **Orders** — live list, change status (`pending → confirmed → preparing → served → completed / cancelled`)
  and payment status.
* **Menu** — create/edit/delete **menus**, **categories** and **items** (image upload to R2, price, add-ons,
  availability, featured, ordering).
* **Blog & offers** — write posts, offers (“20%”, “10%”…) with picture, video (R2), title, small explanation
  and link. Publishing + “notify subscribers” via the email studio.
* **Gallery & FAQ** — media with title, description, date-time and type/album; FAQ entries.
* **Email studio** — pick a Google-style HTML template (tables/concerns, weekly menu table, offer
  announcement), edit it live with a preview, send to **all newsletter subscribers** or custom addresses, save
  new templates, and browse the **sent email log**.
* **People** — waiters (availability/shifts), tables & QR tokens, users & roles, subscribers, reservations,
  contact messages, feedback.
* **Social sync** — one click per platform pulls the latest posts from Instagram, Threads and TikTok through
  Apify into `social_posts`.
* **Languages** — enable locales (en / fr / rw seeded) and edit translation key/value pairs; editors and admins
  are the roles allowed to change site content.
* **Site settings** — site name, tagline, description, logo/favicon/OG image, hero video & poster, brand
  colours, phone, WhatsApp, email, address, opening hours, map embed & link, all social URLs.

---

## 7. API & documentation

* **Swagger UI:** `/docs`
* **OpenAPI JSON:** `/api/docs`
* **Healthcheck:** `/api/health`

Main endpoints: `/api/menu`, `/api/menu/[slug]`, `/api/waiters?token=`, `/api/orders`, `/api/orders/[code]`,
`/api/payments/initiate`, `/api/payments/webhook`, `/api/engage` (reservation | contact | newsletter |
feedback), `/api/posts`, `/api/gallery`, `/api/settings`, `/api/auth`, `/api/auth/verify`, `/api/upload`,
`/api/ai/chat`, `/api/admin/[resource]`, `/api/admin/stats`, `/api/admin/email`, `/api/admin/social-sync`.

---

## 8. SEO & social sharing

`src/app/layout.tsx` generates full metadata from the CMS settings:

* `<title>`, description, author (Patcreator), theme-color, `color-scheme: dark light`
* favicon, `site.webmanifest`, Apple touch icons (180/167/152/120), `apple-mobile-web-app-*`,
  `mobile-web-app-capable`, application-name
* Open Graph (site name, title, description, type, url, 1200×630 image + alt) — great WhatsApp/Facebook cards
* Twitter/X `summary_large_image`
* JSON-LD `CafeOrCoffeeShop` / Organization schema with logo, geo coordinates, opening hours, `sameAs`
  (Instagram, Threads, TikTok) and `acceptsReservations`
* `sitemap.xml` (including every menu item and post) and `robots.txt`

Per-page metadata is generated for menu items and blog posts, and every important page has a **share row**
(WhatsApp, X, Facebook, native share, copy link).

---

## 9. Project structure

```
src/
  app/
    page.tsx                 welcome page (background video + overlay)
    menu/ item/[slug]/ cart/ order/[code]/
    blog/ blog/[slug]/ offers/ events/ gallery/ about/ contact/ reservation/ feedback/
    sign-in/ account/ admin/ docs/
    api/…                    route handlers (see §7)
    sitemap.ts robots.ts not-found.tsx layout.tsx globals.css
  components/
    providers.tsx            theme + cart context (hydration safe)
    site-header.tsx site-footer.tsx theme-toggle.tsx forms.tsx share-row.tsx
    menu-browser.tsx add-to-cart.tsx pay-panel.tsx ai-assistant.tsx logout-button.tsx
    admin/                   admin-app, dashboard, orders, email-studio, settings-editor, resource-manager
  db/  index.ts schema.ts seed.ts
  lib/ settings.ts session.ts email.ts r2.ts resources.ts openapi.ts utils.ts
public/ welcome.mp4 (add yours) brand/ og-image.jpg favicon.png icon-512.png apple-touch-icon.png site.webmanifest
```

## 10. Useful commands

```bash
npm run dev                  # development
npm run build && npm start   # production
npm run typecheck            # TypeScript
npx drizzle-kit push         # apply schema changes
npx tsx src/db/seed.ts       # (re)seed reference data — safe to re-run
psql $DATABASE_URL -c "select code,total,status from orders order by id desc limit 5"
```

Seeded table QR tokens are `SINZA-TABLE-01` … `SINZA-TABLE-12`. Encode them in a QR as either the raw token
or `https://yourdomain/menu?table=SINZA-TABLE-01`; both are accepted by the waiter gate.
#   s i n z a - c o f f e e - s h o p  
 