"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, Loader2, Send, X } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What coffee do you recommend?",
  "How much is the King Size Rolex?",
  "Where exactly are you located?",
  "Can I pay with MoMo?",
];

export function AiAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Muraho 👋 I'm the Sinza assistant. Ask me about our menu, prices, opening hours, reservations or how to order.",
    },
  ]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef<string>(Math.random().toString(36).slice(2));
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (pathname?.startsWith("/admin")) return null;

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setValue("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, sessionId: sessionRef.current, history: messages }),
      });
      const json = await res.json();
      setMessages([...next, { role: "assistant", content: json.answer || "Sorry, try again." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Network hiccup — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open the Sinza AI assistant"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-espresso text-cream shadow-lg transition hover:scale-105 dark:bg-cinnamon"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[min(94vw,23rem)] flex-col overflow-hidden rounded-3xl border border-espresso/15 bg-ivory shadow-2xl dark:border-cream/15 dark:bg-[#1e0e06]">
          <div className="flex items-center gap-2 bg-espresso px-4 py-3 text-cream dark:bg-cinnamon">
            <Bot className="h-4 w-4" />
            <span className="text-sm font-semibold">Sinza Assistant</span>
            <span className="ml-auto text-[10px] opacity-70">Powered by Patcreator</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-cinnamon px-3 py-2 text-ivory"
                    : "mr-auto max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-espresso/10 px-3 py-2 dark:bg-cream/10"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl bg-espresso/10 px-3 py-2 dark:bg-cream/10">
                <Loader2 className="h-4 w-4 animate-spin" /> thinking…
              </div>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="rounded-full border border-espresso/20 px-3 py-1 text-xs transition hover:bg-espresso/10 dark:border-cream/20 dark:hover:bg-cream/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(value);
            }}
            className="flex items-center gap-2 border-t border-espresso/10 p-3 dark:border-cream/10"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask about the menu…"
              className="flex-1 rounded-full border border-espresso/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-cinnamon dark:border-cream/15"
            />
            <button type="submit" className="grid h-9 w-9 place-items-center rounded-full bg-cinnamon text-ivory">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
