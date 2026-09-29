import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiConversations, categories, faqs, menuItems, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSettings } from "@/lib/settings";
import { frw } from "@/lib/utils";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* =========================================================
   CONTEXT BUILDER
   ========================================================= */

async function buildContext(): Promise<string> {
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

  const faqBlock = faqRows.length
    ? faqRows.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n")
    : "(no FAQs yet)";

  const newsBlock = postRows.length
    ? postRows
        .map(
          (p) =>
            `- [${p.type}] ${p.title}: ${p.excerpt ?? ""} ${
              p.discount ? `(${p.discount} off)` : ""
            }`,
        )
        .join("\n")
    : "(no news yet)";

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
${byCat || "(menu empty)"}

FAQ
${faqBlock}

NEWS & OFFERS
${newsBlock}`;
}

/* =========================================================
   GREETING / SMALL-TALK SHORTCUTS
   ========================================================= */

const GREETINGS =
  /^(hi|hey+|hello+|yo|hola|bonjour|salut|muraho|amakuru|bite|good\s+(morning|afternoon|evening))\b/i;
const THANKS = /^(thanks|thank\s+you|thx|merci|murakoze)\b/i;
const HOW_ARE_YOU =
  /(how\s+are\s+you|how'?s\s+it\s+going|amakuru|umeze\s+nte|ça\s+va)/i;

function smallTalk(question: string): string | null {
  const q = question.trim();
  if (GREETINGS.test(q)) {
    return "Muraho! 👋 Welcome to Sinza Coffee Shop in Gisozi. I can help with our menu, prices, opening hours, reservations, payments or today's offers — what would you like to know?";
  }
  if (THANKS.test(q)) {
    return "You're welcome! 😊 Anything else — menu, hours, or a reservation?";
  }
  if (HOW_ARE_YOU.test(q)) {
    return "I'm doing great, murakoze! 😊 How can I help you today — menu, hours, or a table reservation?";
  }
  return null;
}

/* =========================================================
   FALLBACK — keyword-scored search over context
   ========================================================= */

function fallbackAnswer(question: string, context: string): string {
  const q = question.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 3);

  if (!words.length) {
    return "I'm the Sinza assistant — ask me about our menu, prices, hours, location, reservations, payments or offers.";
  }

  const lines = context.split("\n").filter((l) => l.trim());
  const scored = lines
    .map((line) => {
      const lower = line.toLowerCase();
      const score = words.reduce((s, w) => s + (lower.includes(w) ? 1 : 0), 0);
      return { line, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length) {
    return `Here's what I found on our site:\n\n${scored
      .slice(0, 5)
      .map((x) => x.line)
      .join("\n")}`;
  }

  return "I couldn't find that in our site info. I can help with our menu, prices, opening hours, location in Gisozi (Kwa Gakire), reservations, payments and offers. For anything else, message us on WhatsApp and our team will reply.";
}

/* =========================================================
   OPENAI CALL (with retries + model rotation)
   ========================================================= */

type HistoryItem = { role: string; content: string };

// Models are tried in order. First one that works wins.
const OPENAI_MODELS = [
  process.env.OPENAI_MODEL || "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
];

function isTransientOpenAI(status: number, msg: string): boolean {
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  return /high demand|overloaded|try again|temporarily|unavailable|rate limit/i.test(
    msg,
  );
}

async function callOpenAIWithRotation(
  apiKey: string,
  systemPrompt: string,
  history: HistoryItem[],
  question: string,
): Promise<{ text: string; model: string | null; errors: string[] }> {
  const errors: string[] = [];
  const client = new OpenAI({ apiKey });

  // Built once, with explicit types so `role` is a literal, not a plain string.
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map(
      (h): ChatCompletionMessageParam => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      }),
    ),
    { role: "user", content: question },
  ];

  for (const model of OPENAI_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const completion = await client.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        });

        const text = completion.choices[0]?.message?.content ?? "";

        if (text) {
          console.log(`[chat] ✅ answered by ${model} (attempt ${attempt})`);
          return { text, model, errors };
        }

        errors.push(`${model}: empty response`);
        console.warn(`[chat] ❌ ${model}: empty response (attempt ${attempt})`);
        break; // move to next model
      } catch (e: any) {
        const status = e?.status || e?.response?.status || 0;
        const msg = e?.message || "unknown error";
        const errorMsg = `${model}: ${msg}`;
        errors.push(errorMsg);
        console.warn(`[chat] ❌ ${errorMsg} (attempt ${attempt})`);

        // If it's not a transient error (bad model name, auth failure, etc.),
        // don't retry the same model — move to the next one.
        if (!isTransientOpenAI(status, msg)) {
          break;
        }

        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 700 * attempt));
        }
      }
    }
  }

  return { text: "", model: null, errors };
}

/* =========================================================
   POST HANDLER
   ========================================================= */

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.message || "").trim();
  const sessionId = String(body.sessionId || "anon");

  const history: HistoryItem[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (h: any) =>
            h && typeof h.content === "string" && h.content.trim().length > 0,
        )
        .slice(-8)
    : [];

  if (!question) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  /* ---- 1. Quick greeting / thanks — no AI needed ---- */
  const quick = smallTalk(question);
  if (quick && history.length === 0) {
    try {
      await db
        .insert(aiConversations)
        .values({ sessionId, question, answer: quick });
    } catch {
      /* ignore */
    }
    return NextResponse.json({
      answer: quick,
      grounded: false,
      source: "smalltalk",
    });
  }

  /* ---- 2. Build the context ---- */
  let context = "";
  try {
    context = await buildContext();
  } catch (e: any) {
    console.error("[chat] buildContext failed:", e?.message);
  }

  /* ---- 3. Ask OpenAI ---- */
  const apiKey = process.env.OPENAI_API_KEY;
  let answer = "";
  let source: "ai" | "fallback" | "smalltalk" = "fallback";
  let usedModel: string | null = null;
  let errors: string[] = [];

  if (apiKey) {
    const systemPrompt = `You are "Sinza Assistant" — the friendly, warm chat helper for Sinza Coffee Shop in Gisozi, Kigali, Rwanda.

PERSONALITY
- Talk like a real human barista: casual, kind, short answers.
- If the user greets you (hi, hey, muraho, amakuru…), greet them back warmly and offer help.
- If the user asks "are you a bot / AI", answer honestly but stay in character: you're Sinza's virtual assistant, happy to help.
- Use emojis sparingly (max 1 per message, only when it fits).
- Never say "As a language model" or dump technical caveats.

KNOWLEDGE RULES
- The CONTEXT below is your source of truth for facts about the shop: menu, prices, hours, location, payments, offers, staff, etc.
- You MAY use general knowledge for greetings, small talk, and clarifying questions.
- You MUST NOT invent prices, hours, staff names, offers, or policies that are not in the context.
- If a fact is missing from the context (e.g. someone asks "who is Jado Sinza?" and there's no such info), say warmly that you don't have that detail and offer to connect them to the team on WhatsApp.
- Prices are in RWF.

STYLE
- Keep answers under ~90 words unless the user asks for detail.
- When useful, suggest /menu, /reservation, or /contact.
- Never dump the whole menu — summarise and invite follow-ups.

CONTEXT
${context || "(context unavailable — apologise and offer WhatsApp)"}`;

    const result = await callOpenAIWithRotation(
      apiKey,
      systemPrompt,
      history,
      question,
    );

    if (result.text) {
      answer = result.text;
      source = "ai";
      usedModel = result.model;
    }
    errors = result.errors;
  } else {
    console.warn("[chat] No OPENAI_API_KEY set — using fallback.");
  }

  /* ---- 4. Fallback if AI failed ---- */
  if (!answer) {
    answer = fallbackAnswer(question, context);
    source = "fallback";
  }

  /* ---- 5. Save conversation ---- */
  try {
    await db.insert(aiConversations).values({ sessionId, question, answer });
  } catch {
    /* ignore */
  }

  /* ---- 6. Respond ---- */
  return NextResponse.json({
    answer,
    grounded: source === "ai",
    source,
    ...(usedModel ? { model: usedModel } : {}),
    ...(errors.length && process.env.NODE_ENV !== "production"
      ? { debug: errors }
      : {}),
  });
}