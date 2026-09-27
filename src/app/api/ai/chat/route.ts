import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiConversations, categories, faqs, menuItems, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSettings } from "@/lib/settings";
import { frw } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function buildContext() {
  const [site, cats, items, faqRows, postRows] = await Promise.all([
    getSettings(),
    db.select().from(categories),
    db.select().from(menuItems).where(eq(menuItems.available, true)).limit(220),
    db.select().from(faqs).where(eq(faqs.active, true)),
    db.select().from(posts).where(eq(posts.published, true)).limit(12),
  ]);

  const byCat = cats
    .map((c) => {
      const list = items.filter((i) => i.categoryId === c.id);
      if (!list.length) return null;
      return `${c.name}: ${list.map((i) => `${i.name} (${frw(i.price)})`).join(", ")}`;
    })
    .filter(Boolean)
    .join("\n");

  return `BUSINESS
Name: ${site.siteName}
Tagline: ${site.tagline}
Location: ${site.address}
Map: ${site.mapLink}
Hours: ${site.openingHours}
Phone/WhatsApp: ${site.phone} / ${site.whatsapp}
Instagram: ${site.instagram} · Threads: ${site.threads} · TikTok: ${site.tiktok}
Payments: MTN MoMo & Airtel Money (PawaPay), cards (Pesapal), or pay after eating.
Ordering: online with or without an account, choose a waiter after scanning the table QR, or send the order to WhatsApp.

MENU
${byCat}

FAQ
${faqRows.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n")}

NEWS & OFFERS
${postRows.map((p) => `- [${p.type}] ${p.title}: ${p.excerpt ?? ""} ${p.discount ? `(${p.discount} off)` : ""}`).join("\n")}`;
}

function fallbackAnswer(question: string, context: string) {
  const q = question.toLowerCase();
  const lines = context.split("\n").filter((l) => l.trim());
  const hits = lines.filter((l) => q.split(/\s+/).some((w) => w.length > 3 && l.toLowerCase().includes(w)));
  if (hits.length) return `Here is what I found on our site:\n\n${hits.slice(0, 6).join("\n")}`;
  return "I'm the Sinza assistant. I can help with our menu, prices, opening hours, location in Gisozi (Kwa Gakire), reservations, payments and offers. Ask me anything about those!";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.message || "").trim();
  const sessionId = String(body.sessionId || "anon");
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  if (!question) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const context = await buildContext();
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  let answer = "";

  if (apiKey) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `You are the friendly assistant of Sinza Coffee Shop in Kigali. Answer ONLY using the context below. Be short, warm and practical, use RWF prices, and suggest ordering links like /menu, /reservation or /contact when useful. If the answer is not in the context, say you will connect them to the team on WhatsApp.\n\n${context}`,
                },
              ],
            },
            contents: [
              ...history.map((h: { role: string; content: string }) => ({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: String(h.content).slice(0, 2000) }],
              })),
              { role: "user", parts: [{ text: question }] },
            ],
          }),
        },
      );
      const json = await res.json();
      answer =
        json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    } catch {
      answer = "";
    }
  }

  if (!answer) answer = fallbackAnswer(question, context);

  try {
    await db.insert(aiConversations).values({ sessionId, question, answer });
  } catch {
    /* ignore */
  }

  return NextResponse.json({ answer, grounded: Boolean(apiKey) });
}
