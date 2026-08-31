"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What projects does Dar Global have in Dubai?",
  "Tell me about the Trump International Hotel & Tower Dubai",
  "What brand partners does Dar Global work with?",
  "What is AIDA in Oman?",
  "How can I invest with Dar Global?",
  "What is Wasalt?",
];

function parseMarkdown(text: string): string {
  let html = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Unordered lists
    .replace(/^[-•]\s+(.+)/gm, "<li>$1</li>")
    // Numbered lists
    .replace(/^\d+\.\s+(.+)/gm, "<li>$1</li>");
  
  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, "<ul>$1</ul>");
  
  // Paragraphs
  html = html
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (block.startsWith("<ul>") || block.startsWith("<ol>")) return block;
      return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");
  
  return html;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    // Reset textarea height
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

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get response";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
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
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-gradient-mesh min-h-screen h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-[var(--color-dark-border)] relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--color-gold-dark)] to-[var(--color-gold)] status-ring">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0a0a0f" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                <span className="logo-shimmer">DarGlobal</span>
                <span className="text-[var(--color-text-secondary)]"> & </span>
                <span className="logo-shimmer">Wasalt</span>
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">AI Real Estate Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-[var(--color-text-secondary)]">Online</span>
            </div>
          </div>
        </div>
        <div className="header-line"></div>
      </header>

      {/* Chat Area */}
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Welcome State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
              {/* Decorative Icon */}
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--color-gold-dark)] to-[var(--color-gold)] mb-6 shadow-lg shadow-[rgba(201,169,110,0.2)]">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-center">
                Welcome to <span className="logo-shimmer">DarGlobal & Wasalt</span> AI
              </h2>
              <p className="text-[var(--color-text-secondary)] text-center max-w-md mb-8 leading-relaxed">
                Your personal luxury real estate concierge. Ask me about properties, projects, investment opportunities, and more across 7 international markets.
              </p>

              {/* Suggestion Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-chip rounded-xl px-4 py-3 text-sm text-left"
                    onClick={() => sendMessage(suggestion)}
                  >
                    <span className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-[var(--color-gold)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-6 mt-10 text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[var(--color-gold)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762z"/>
                  </svg>
                  <span>$23B Portfolio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[var(--color-gold)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span>7 Markets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[var(--color-gold)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span>12+ Brand Partners</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-slide-up ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col gap-1 max-w-[85%]">
                {/* Avatar + Name */}
                <div className={`flex items-center gap-2 text-xs text-[var(--color-text-secondary)] ${message.role === "user" ? "justify-end" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--color-gold-dark)] to-[var(--color-gold)] flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0a0a0f"/>
                      </svg>
                    </div>
                  )}
                  <span>{message.role === "user" ? "You" : "AI Assistant"}</span>
                  <span className="opacity-50">·</span>
                  <span className="opacity-50">{formatTime(message.timestamp)}</span>
                </div>
                {/* Message Bubble */}
                <div
                  className={message.role === "user" ? "message-user px-4 py-3 text-sm" : "message-assistant px-4 py-3 text-sm"}
                  dangerouslySetInnerHTML={{
                    __html: message.role === "assistant"
                      ? parseMarkdown(message.content)
                      : message.content.replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--color-gold-dark)] to-[var(--color-gold)] flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0a0a0f"/>
                    </svg>
                  </div>
                  <span>AI Assistant</span>
                </div>
                <div className="message-assistant px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center animate-slide-up">
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm max-w-md text-center">
                <p className="font-medium mb-1">⚠️ Error</p>
                <p className="text-xs opacity-80">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="glass border-t border-[var(--color-dark-border)] relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Dar Global properties, investments, or locations..."
                className="chat-input w-full rounded-xl px-4 py-3 pr-12 text-sm resize-none min-h-[48px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
                id="chat-input-field"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="send-button rounded-xl p-3 flex items-center justify-center flex-shrink-0"
              aria-label="Send message"
              id="send-message-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
          <p className="text-center text-[10px] text-[var(--color-text-secondary)] mt-2 opacity-50">
            Powered by AI · Data sourced from DarGlobal.co.uk & Wasalt.com · Responses may vary
          </p>
        </div>
      </footer>
    </div>
  );
}
