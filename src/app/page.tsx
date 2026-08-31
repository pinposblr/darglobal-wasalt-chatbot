"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface QuickTopic {
  title: string;
  category: string;
  prompt: string;
  icon: string;
}

const FEATURED_PROMPTS: QuickTopic[] = [
  {
    title: "Trump Tower Dubai",
    category: "Dubai, UAE",
    prompt: "Tell me about the Trump International Hotel & Tower Dubai, its podium contractor, and timeline.",
    icon: "🏙️",
  },
  {
    title: "Lamborghini Villas",
    category: "Benahavís, Spain",
    prompt: "What are the Tierra Viva luxury villas designed by Automobili Lamborghini in Spain?",
    icon: "🏎️",
  },
  {
    title: "AIDA Oman & FENDI Casa",
    category: "Muscat, Oman",
    prompt: "Explain the AIDA masterplan in Oman and the Azure Oceanfront Villas by FENDI Casa.",
    icon: "🌊",
  },
  {
    title: "Wasalt Proptech Platform",
    category: "Digital Platform",
    prompt: "What services and property search features does Wasalt provide for luxury buyers and investors?",
    icon: "📱",
  },
  {
    title: "Saudi Arabia Projects",
    category: "Riyadh & Jeddah",
    prompt: "What are Dar Global's developments in Saudi Arabia like Rayana Trump Mansions and Amaya Jeddah?",
    icon: "🇸🇦",
  },
  {
    title: "Brand Partnerships",
    category: "Global Portfolio",
    prompt: "Which 12+ luxury brands partner with Dar Global (Pagani, Aston Martin, Missoni, Trump, etc.)?",
    icon: "💎",
  },
];

const MARKET_PILLS = [
  { label: "All Markets", prompt: "Summarize Dar Global's properties across all 7 international markets." },
  { label: "Dubai, UAE", prompt: "List all luxury residences and towers by Dar Global in Dubai." },
  { label: "Oman (AIDA)", prompt: "What villas, hotels, and golf communities are located in AIDA Muscat, Oman?" },
  { label: "Saudi Arabia", prompt: "Tell me about the Rayana community in Wadi Safar and Amaya in Jeddah." },
  { label: "Spain", prompt: "What projects does Dar Global have in Spain (Tierra Viva & Marea)?" },
  { label: "Qatar", prompt: "Tell me about Les Vagues by Elie Saab and Sea La Vie in Doha, Qatar." },
  { label: "Investor Info", prompt: "What is Dar Global's LSE listing info, $23B portfolio, and financing updates?" },
];

function formatMarkdown(text: string): string {
  let html = text
    // Replace markdown tables
    .replace(/\n\|(.+)\|\n\|[-:| ]+\|\n((?:\|.*\|\n?)+)/g, (_, header, body) => {
      const ths = header
        .split("|")
        .filter((cell: string) => cell.trim().length > 0)
        .map((cell: string) => `<th>${cell.trim()}</th>`)
        .join("");
      const trs = body
        .trim()
        .split("\n")
        .map((row: string) => {
          const tds = row
            .split("|")
            .filter((cell: string) => cell.trim().length > 0)
            .map((cell: string) => `<td>${cell.trim()}</td>`)
            .join("");
          return `<tr>${tds}</tr>`;
        })
        .join("");
      return `<div class="overflow-x-auto my-3"><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
    })
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold & Italics
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Horizontal rule
    .replace(/^---$/gim, "<hr/>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Unordered lists
    .replace(/^[-•*]\s+(.+)/gm, "<li>$1</li>")
    // Ordered lists
    .replace(/^\d+\.\s+(.+)/gm, "<li>$1</li>");

  // Wrap lists
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, "<ul>$1</ul>");

  // Paragraphs
  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h1") ||
        trimmed.startsWith("<h2") ||
        trimmed.startsWith("<h3") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<hr")
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");

  return html;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.focus();
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const chatHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to retrieve response. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + "px";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-screen w-screen bg-[#000000] text-white font-sans overflow-hidden">
      {/* ========================================================================= */}
      {/* LEFT SIDEBAR (Desktop & Mobile Drawer)                                    */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#09090b] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black font-bold flex items-center justify-center text-sm tracking-tighter">
              DG
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                DarGlobal <span className="text-zinc-500 font-normal">×</span> Wasalt
              </div>
              <div className="text-[11px] text-zinc-400">AI Luxury Concierge</div>
            </div>
          </div>
          {/* Mobile Close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-zinc-400 hover:text-white p-1 rounded-md"
            aria-label="Close sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              handleNewChat();
              setSidebarOpen(false);
            }}
            className="w-full py-2.5 px-3.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors font-medium text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Conversation
          </button>
        </div>

        {/* Quick Topics Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Curated Portfolio Topics
          </div>
          {FEATURED_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                sendMessage(item.prompt);
                setSidebarOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-xs group flex items-start gap-2.5"
            >
              <span className="text-sm mt-0.5">{item.icon}</span>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium text-zinc-200 group-hover:text-white truncate">
                  {item.title}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">{item.category}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Direct Contact / Concierge Card */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-black/40">
          <div className="text-[11px] font-medium text-zinc-400 px-1">Direct Sales Concierge</div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://api.whatsapp.com/send?phone=97180040409"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>WhatsApp</span>
            </a>
            <a
              href="tel:+97145629666"
              className="py-2 px-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Call Us</span>
            </a>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-zinc-400">z-ai/glm-5.3-flash</span>
            </div>
            <span className="text-zinc-400">LSE: DAR</span>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* ========================================================================= */}
      {/* MAIN CHAT CONTAINER                                                       */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full bg-monochrome-grid overflow-hidden relative">
        {/* Header Bar */}
        <header className="glass-header h-14 px-4 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg border border-white/10"
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                Official AI
              </span>
              <span className="hidden sm:inline-block text-xs text-zinc-400">
                DarGlobal Luxury Real Estate & Wasalt
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-md border border-white/10 hover:border-white/25 transition-colors"
                title="Reset conversation"
              >
                Clear Chat
              </button>
            )}
            <a
              href="https://www.darglobal.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
            >
              <span>Visit Portal</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </header>

        {/* Chat Stream Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* ----------------------------------------------------------------- */}
            {/* WELCOME SCREEN (When zero messages)                               */}
            {/* ----------------------------------------------------------------- */}
            {messages.length === 0 && (
              <div className="py-6 md:py-10 space-y-8 animate-slide-up">
                {/* Hero Title */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    London-Listed Luxury Real Estate · LSE: DAR
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                    Luxury Real Estate, <br className="hidden sm:inline" />
                    <span className="text-zinc-400">Reimagined by AI.</span>
                  </h1>
                  <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                    Explore ultra-luxury branded residences, masterplan communities, and investment opportunities across Dubai, Oman, Saudi Arabia, Spain, Qatar, UK, and Maldives.
                  </p>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
                  <div className="glass-panel p-3 rounded-xl text-center space-y-0.5">
                    <div className="text-lg font-bold text-white">$23B</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Portfolio Value</div>
                  </div>
                  <div className="glass-panel p-3 rounded-xl text-center space-y-0.5">
                    <div className="text-lg font-bold text-white">7 Markets</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Global Presence</div>
                  </div>
                  <div className="glass-panel p-3 rounded-xl text-center space-y-0.5">
                    <div className="text-lg font-bold text-white">12+ Partners</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Luxury Brands</div>
                  </div>
                  <div className="glass-panel p-3 rounded-xl text-center space-y-0.5">
                    <div className="text-lg font-bold text-white">32 Years</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Track Record</div>
                  </div>
                </div>

                {/* Interactive Suggestion Cards */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 text-center">
                    Select a prompt to begin
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FEATURED_PROMPTS.slice(0, 4).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(item.prompt)}
                        className="prompt-card p-3.5 rounded-xl text-left flex items-start gap-3 group"
                      >
                        <span className="text-xl p-2 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-semibold text-white flex items-center justify-between">
                            <span>{item.title}</span>
                            <span className="text-[10px] font-normal text-zinc-400">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[12px] text-zinc-400 mt-1 line-clamp-2 leading-snug">
                            {item.prompt}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country Filter Quick Pills */}
                <div className="space-y-2">
                  <div className="text-[11px] text-zinc-400 text-center">Or explore by destination:</div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xl mx-auto">
                    {MARKET_PILLS.map((pill, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(pill.prompt)}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all"
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* MESSAGE STREAM                                                    */}
            {/* ----------------------------------------------------------------- */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-up ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* AI Avatar */}
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-white text-black font-bold flex items-center justify-center text-xs flex-shrink-0 mt-1 shadow-md">
                    DG
                  </div>
                )}

                <div className={`flex flex-col gap-1.5 max-w-[90%] sm:max-w-[80%]`}>
                  {/* Sender Name & Time */}
                  <div
                    className={`flex items-center gap-2 text-[11px] text-zinc-400 px-1 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="font-medium text-zinc-300">
                      {message.role === "user" ? "You" : "DarGlobal & Wasalt Concierge"}
                    </span>
                    <span>·</span>
                    <span>{formatTime(message.timestamp)}</span>
                  </div>

                  {/* Bubble Container */}
                  <div
                    className={`p-4 text-sm ${
                      message.role === "user" ? "user-bubble" : "assistant-bubble"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div
                        className="prose-custom"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>

                  {/* Actions for Assistant Bubble */}
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 px-1 text-[11px] text-zinc-400">
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedId === message.id ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>Copy response</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator Bubble */}
            {isLoading && (
              <div className="flex gap-3 animate-slide-up">
                <div className="w-8 h-8 rounded-lg bg-white text-black font-bold flex items-center justify-center text-xs flex-shrink-0 mt-1 shadow-md">
                  DG
                </div>
                <div className="assistant-bubble px-4 py-3.5 flex items-center gap-2">
                  <span className="text-xs text-zinc-400 mr-1">Consulting knowledge base</span>
                  <div className="flex items-center gap-1">
                    <span className="typing-dot-bw"></span>
                    <span className="typing-dot-bw"></span>
                    <span className="typing-dot-bw"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs space-y-2 animate-slide-up">
                <div className="flex items-center gap-2 font-semibold">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>Communication Error</span>
                </div>
                <p className="text-red-300/90">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-[11px] underline hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* ----------------------------------------------------------------- */}
        {/* BOTTOM INPUT DOCK                                                 */}
        {/* ----------------------------------------------------------------- */}
        <footer className="p-4 md:px-8 border-t border-white/10 bg-black/90 backdrop-blur-xl z-20">
          <div className="max-w-3xl mx-auto space-y-2.5">
            {/* Quick Context Prompts Carousel */}
            {messages.length > 0 && !isLoading && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[11px] text-zinc-400 whitespace-nowrap">Suggested:</span>
                {MARKET_PILLS.slice(1, 5).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item.prompt)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all text-[11px]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Capsule */}
            <form onSubmit={handleSubmit} className="glass-input rounded-2xl p-2 flex items-end gap-2">
              <div className="flex-1 pl-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about DarGlobal luxury projects, Trump Tower Dubai, AIDA Oman, Wasalt..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none resize-none py-1.5 max-h-36 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition-all flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer disabled:cursor-not-allowed"
                aria-label="Send Message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>

            {/* Disclaimer Subtext */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-2">
              <span>DarGlobal PLC (LSE: DAR) & Wasalt Digital Platform</span>
              <span className="hidden sm:inline">Responses grounded in official public releases</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
