"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "cosmic" | "solar";
type MsgVariant = "normal" | "error" | "system";

type Msg = {
  id: number;
  role: "user" | "assistant";
  text: string;
  variant?: MsgVariant;
};

type ChatSummary = {
  id: number;
  title: string;
  createdAt: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>("cosmic");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState("mock-grok-small");
  const [chats, setChats] = useState<ChatSummary[]>([
    {
      id: 1,
      title: "New cosmic session",
      createdAt: new Date().toLocaleTimeString(),
    },
  ]);
  const [activeChatId, setActiveChatId] = useState<number>(1);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // AUTOSCROLL
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  function createNewChat() {
    const id = Date.now();
    const summary: ChatSummary = {
      id,
      title: "New chat",
      createdAt: new Date().toLocaleTimeString(),
    };
    setChats((prev) => [summary, ...prev]);
    setActiveChatId(id);
    setMessages([]);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Msg = {
      id: Date.now(),
      role: "user",
      text: input.trim(),
      variant: "normal",
    };

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages.concat(userMsg).map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        return handleServerError(data?.error || "UNKNOWN", data?.message);
      }

      const data = await res.json();
      if (!data.tokens) {
        return handleServerError("INVALID", "No tokens returned.");
      }

      const tokens: string[] = data.tokens;
      let streamed = "";
      const assistantId = Date.now() + 1;

      for (let i = 0; i < tokens.length; i++) {
        streamed += (i === 0 ? "" : " ") + tokens[i];

        await new Promise((r) => setTimeout(r, 40));

        setMessages((prev) => {
          const exists = prev.find((m) => m.id === assistantId);

          if (exists) {
            return prev.map((m) =>
              m.id === assistantId ? { ...m, text: streamed } : m
            );
          }
          return [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              text: streamed,
              variant: "normal",
            },
          ];
        });
      }
    } catch (e) {
      handleServerError("NETWORK", "Network error (mock).");
    } finally {
      setLoading(false);
    }
  }

  function handleServerError(type: string, message: string) {
    setMessages((p) => [
      ...p,
      {
        id: Date.now(),
        role: "assistant",
        text: `⚠️ ${type}: ${message}\nRecovering with fallback…`,
        variant: "error",
      },
    ]);

    setTimeout(() => fallbackResponse(), 700);
    setLoading(false);
  }

  function fallbackResponse() {
    const text =
      "Fallback mock response: the system gracefully recovered from a simulated issue. All good.";

    let streamed = "";
    const id = Date.now();

    (async () => {
      const tokens = text.split(" ");
      for (let i = 0; i < tokens.length; i++) {
        streamed += (i === 0 ? "" : " ") + tokens[i];
        await new Promise((r) => setTimeout(r, 25));

        setMessages((p) => {
          const exists = p.find((m) => m.id === id);
          return exists
            ? p.map((m) =>
                m.id === id ? { ...m, text: streamed } : m
              )
            : [
                ...p,
                {
                  id,
                  role: "assistant",
                  text: streamed,
                  variant: "system",
                },
              ];
        });
      }
    })();
  }

  function handleKeyDown(e: any) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const cosmicBg =
    "bg-gradient-to-b from-black via-slate-950 to-black";
  const solarBg =
    "bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950";

  const pageBg = theme === "cosmic" ? cosmicBg : solarBg;

  return (
    <div
      className={`h-screen w-full text-slate-100 ${pageBg} flex items-stretch relative overflow-hidden`}
    >
      {/* BIG BACKGROUND GLOWS */}
      <div className="pointer-events-none absolute inset-0">
        {theme === "cosmic" ? (
          <>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700/40 blur-3xl rounded-full" />
            <div className="absolute top-10 right-0 w-80 h-80 bg-indigo-600/25 blur-3xl rounded-full" />
            <div className="absolute bottom-40 left-1/3 w-md h-112 bg-pink-600/25 blur-3xl rounded-full" />
          </>
        ) : (
          <>
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500/40 blur-3xl rounded-full" />
            <div className="absolute top-24 right-0 w-80 h-80 bg-sky-500/30 blur-3xl rounded-full" />
            <div className="absolute bottom-32 left-1/4 w-104 h-104 bg-red-500/25 blur-3xl rounded-full" />
          </>
        )}
      </div>

      {/* SIDEBAR */}
      <aside className="relative z-10 hidden md:flex flex-col w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shadow-lg">
            GX
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Grok-like Studio
            </div>
            <div className="text-[11px] text-slate-400">
              Frontend mock · v0.3.1
            </div>
          </div>
        </div>

        {/* CHAT HISTORY */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Conversations</span>
            <button
              onClick={createNewChat}
              className="text-[11px] px-1.5 py-0.5 rounded-full border border-white/10 hover:border-white/30 hover:text-slate-200 transition"
            >
              + New
            </button>
          </div>

          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveChatId(c.id);
                setMessages([]);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs mb-1 border
                ${
                  c.id === activeChatId
                    ? "bg-white/10 border-white/30 text-slate-50"
                    : "bg-black/20 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/20"
                } transition`}
            >
              <div className="truncate">{c.title}</div>
              <div className="text-[10px] text-slate-400">{c.createdAt}</div>
            </button>
          ))}
        </div>

        {/* CONTROLS BOTTOM */}
        <div className="border-t border-white/10 px-3 py-3 space-y-3 text-[11px]">
          <div className="space-y-1">
            <div className="text-slate-400">Model</div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="mock-grok-small">mock-grok-small</option>
              <option value="mock-grok-large">mock-grok-large</option>
              <option value="mock-experimental">mock-experimental</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400">Theme</div>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("cosmic")}
                className={`flex-1 px-2 py-1 rounded-md border text-[11px] ${
                  theme === "cosmic"
                    ? "bg-purple-600/70 border-purple-300 text-white"
                    : "bg-black/40 border-white/20 text-slate-300"
                }`}
              >
                Cosmic
              </button>
              <button
                onClick={() => setTheme("solar")}
                className={`flex-1 px-2 py-1 rounded-md border text-[11px] ${
                  theme === "solar"
                    ? "bg-amber-500/80 border-amber-200 text-slate-900"
                    : "bg-black/40 border-white/20 text-slate-300"
                }`}
              >
                Solar
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Animations</span>
            <button
              onClick={() => setAnimationsEnabled((v) => !v)}
              className={`px-2 py-1 rounded-full border text-[11px] ${
                animationsEnabled
                  ? "bg-emerald-500/80 border-emerald-200 text-slate-900"
                  : "bg-black/40 border-white/20 text-slate-300"
              }`}
            >
              {animationsEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="relative z-10 flex-1 flex flex-col max-w-full md:max-w-[calc(100%-16rem)]">
        {/* HEADER TOP (MOBILE + MAIN INFO) */}
        <header className="px-4 md:px-6 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                xAI • FRONTEND MOCK
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[10px] text-emerald-300">
                LIVE
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight mt-1">
              {theme === "cosmic" ? "Cosmic Grok Console" : "Solar Storm Console"}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mock backend</span>
            </div>
            <div>v0.3.1</div>
          </div>
        </header>

        {/* CHAT WINDOW */}
        <section className="flex-1 flex flex-col px-3 md:px-6 py-4">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto rounded-2xl border border-white/15 bg-black/50 backdrop-blur-xl p-4 md:p-6 space-y-4 shadow-[0_0_45px_rgba(15,23,42,0.8)]"
          >
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-sm text-slate-400">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    READY
                  </div>
                  <p className="text-sm">
                    Start typing to see <span className="font-semibold">mock LLM streaming</span>,
                    error recovery, and a fully designed Grok-like chat UI.
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const isUser = m.role === "user";
                const variant = m.variant || "normal";

                const baseClasses =
                  "max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm whitespace-pre-wrap";

                let bubbleClasses = "";

                if (isUser) {
                  bubbleClasses =
                    "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/40";
                } else if (variant === "error") {
                  bubbleClasses =
                    "bg-red-900/70 border border-red-400/50 text-red-50 shadow-red-500/40";
                } else if (variant === "system") {
                  bubbleClasses =
                    "bg-emerald-900/70 border border-emerald-400/60 text-emerald-50 shadow-emerald-500/40";
                } else {
                  bubbleClasses =
                    "bg-white/10 border border-white/15 text-slate-50 shadow-purple-500/20";
                }

                const animateProps = animationsEnabled
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: 0 };

                return (
                  <motion.div
                    key={m.id}
                    initial={
                      animationsEnabled
                        ? { opacity: 0, y: 6 }
                        : { opacity: 1, y: 0 }
                    }
                    animate={animateProps}
                    exit={animationsEnabled ? { opacity: 0, y: -4 } : {}}
                    transition={{ duration: 0.16 }}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className={`${baseClasses} ${bubbleClasses}`}>
                      {m.text}
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <motion.div
                  initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-slate-200 text-xs inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Model is thinking…</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* INPUT BAR */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-300 shadow-[0_0_25px_rgba(129,140,248,0.35)]"
                placeholder={
                  theme === "cosmic"
                    ? "Ask something about the universe, UX, or AI…"
                    : "Ask under the Solar Storm…"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium bg-linear-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 shadow-lg shadow-purple-500/40 active:scale-95 transition-transform"
            >
              Send
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
