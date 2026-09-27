import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Users & auth                                                        */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    phone: text("phone"),
    role: text("role").notNull().default("customer"), // customer | editor | admin
    clerkId: text("clerk_id"),
    activated: boolean("activated").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const loginTokens = pgTable("login_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */

export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  group: text("group").notNull().default("food"), // drinks | food | bar
  description: text("description"),
  image: text("image"),
  position: integer("position").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  longDescription: text("long_description"),
  price: integer("price").notNull().default(0), // RWF
  image: text("image"),
  available: boolean("available").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  position: integer("position").notNull().default(0),
  options: jsonb("options").$type<{ name: string; price: number }[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Staff / waiters                                                     */
/* ------------------------------------------------------------------ */

export const waiters = pgTable("waiters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  photo: text("photo"),
  phone: text("phone"),
  available: boolean("available").notNull().default(true),
  shift: text("shift").default("all-day"),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  qrToken: text("qr_token").notNull(),
  active: boolean("active").notNull().default(true),
});

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  userId: integer("user_id"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  channel: text("channel").notNull().default("restaurant"), // waiter | restaurant | whatsapp
  waiterId: integer("waiter_id"),
  tableLabel: text("table_label"),
  note: text("note"),
  subtotal: integer("subtotal").notNull().default(0),
  total: integer("total").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending | confirmed | preparing | served | completed | cancelled
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid | pending | paid | failed
  paymentMethod: text("payment_method"), // momo | airtel | card | cash
  paymentRef: text("payment_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  itemId: integer("item_id"),
  name: text("name").notNull(),
  unitPrice: integer("unit_price").notNull().default(0),
  quantity: integer("quantity").notNull().default(1),
  options: jsonb("options").$type<{ name: string; price: number }[]>().default([]),
  lineTotal: integer("line_total").notNull().default(0),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  provider: text("provider").notNull(), // pawapay | pesapal
  method: text("method").notNull(), // momo | airtel | card
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  reference: text("reference").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Reservations, contact, newsletter                                   */
/* ------------------------------------------------------------------ */

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  guests: integer("guests").notNull().default(2),
  note: text("note"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscribers = pgTable(
  "subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    frequency: text("frequency").notNull().default("weekly"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("subscribers_email_idx").on(t.email)],
);

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  rating: integer("rating").notNull().default(5),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Content / CMS                                                       */
/* ------------------------------------------------------------------ */

export const settings = pgTable(
  "settings",
  {
    key: text("key").primaryKey(),
    value: jsonb("value"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  excerpt: text("excerpt"),
  body: text("body"),
  cover: text("cover"),
  video: text("video"),
  type: text("type").notNull().default("blog"), // blog | offer | news | event
  discount: text("discount"),
  link: text("link"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  published: boolean("published").notNull().default(true),
  notified: boolean("notified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  kind: text("kind").notNull().default("image"), // image | video
  type: text("type").notNull().default("interior"),
  takenAt: timestamp("taken_at", { withTimezone: true }).defaultNow(),
  position: integer("position").notNull().default(0),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  position: integer("position").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // instagram | threads | tiktok
  externalId: text("external_id").notNull(),
  caption: text("caption"),
  media: text("media"),
  permalink: text("permalink"),
  likes: integer("likes").default(0),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow().notNull(),
});

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  locale: text("locale").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

export const languages = pgTable("languages", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  active: boolean("active").notNull().default(true),
});

/* ------------------------------------------------------------------ */
/* Email studio                                                        */
/* ------------------------------------------------------------------ */

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  category: text("category").notNull().default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  toAddress: text("to_address").notNull(),
  subject: text("subject").notNull(),
  html: text("html"),
  status: text("status").notNull().default("sent"),
  error: text("error"),
  templateId: integer("template_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Analytics helper                                                    */
/* ------------------------------------------------------------------ */

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  score: real("score").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Post = typeof posts.$inferSelect;
