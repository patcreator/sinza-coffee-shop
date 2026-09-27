import {
  categories,
  emailTemplates,
  faqs,
  galleries,
  languages,
  menuItems,
  menus,
  posts,
  reservations,
  contactMessages,
  socialPosts,
  subscribers,
  tables,
  translations,
  users,
  waiters,
  feedback,
  emailLogs,
} from "@/db/schema";
import type { PgTable } from "drizzle-orm/pg-core";

export const RESOURCES: Record<string, PgTable> = {
  menus,
  categories,
  items: menuItems,
  waiters,
  tables,
  posts,
  galleries,
  faqs,
  subscribers,
  reservations,
  messages: contactMessages,
  feedback,
  templates: emailTemplates,
  emails: emailLogs,
  translations,
  languages,
  users,
  social: socialPosts,
};

export function getResource(name: string) {
  return RESOURCES[name] ?? null;
}
