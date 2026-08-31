"use client";

import {
  BriefcaseBusiness,
  Building2,
  Check,
  Copy,
  ExternalLink,
  Gem,
  Globe2,
  Landmark,
  Menu,
  MessageSquarePlus,
  Pencil,
  Phone,
  Send,
  Sparkles,
  Square,
  Trash2,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message as ChatMessage,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SavedConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface QuickTopic {
  title: string;
  category: string;
  prompt: string;
  icon: LucideIcon;
}

const FEATURED_PROMPTS: QuickTopic[] = [
  {
    title: "Trump Tower Dubai",
    category: "Dubai, UAE",
    prompt:
      "Tell me about the Trump International Hotel & Tower Dubai, its podium contractor, and timeline.",
    icon: Building2,
  },
  {
    title: "Lamborghini villas",
    category: "Benahavís, Spain",
    prompt:
      "What are the Tierra Viva luxury villas designed by Automobili Lamborghini in Spain?",
    icon: Gem,
  },
  {
    title: "AIDA Oman",
    category: "Muscat, Oman",
    prompt:
      "Explain the AIDA masterplan in Oman and the Azure Oceanfront Villas by FENDI Casa.",
    icon: Waves,
  },
  {
    title: "Investment overview",
    category: "Global portfolio",
    prompt:
      "Give me an investor overview of Dar Global's international portfolio, brand partners, and market presence.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Saudi developments",
    category: "Riyadh & Jeddah",
    prompt:
      "What are Dar Global's developments in Saudi Arabia, including Rayana Trump Mansions and Amaya Jeddah?",
    icon: Landmark,
  },
  {
    title: "Wasalt platform",
    category: "Digital services",
    prompt:
      "What services and property search features does Wasalt provide for luxury buyers and investors?",
    icon: Globe2,
  },
];

const MARKET_PROMPTS = [
  {
    label: "Dubai",
    prompt: "List Dar Global's luxury residences and towers in Dubai.",
  },
  {
    label: "Oman",
    prompt: "What villas, hotels, and golf communities are located in AIDA, Oman?",
  },
  {
    label: "Saudi Arabia",
    prompt: "Compare Dar Global's Rayana and Amaya developments in Saudi Arabia.",
  },
  {
    label: "Spain",
    prompt: "Compare Dar Global's Tierra Viva and Marea projects in Spain.",
  },
];

const CONVERSATION_STORAGE_KEY = "dar-global-conversations:v1";
const MAX_SAVED_CONVERSATIONS = 100;

function getCurrentTimestamp() {
  return Date.now();
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;

  const message = value as Record<string, unknown>;

  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

function loadSavedConversations(): SavedConversation[] {
  try {
    const storedValue = window.localStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (!storedValue) return [];

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue
      .filter((value): value is SavedConversation => {
        if (!value || typeof value !== "object") return false;

        const conversation = value as Record<string, unknown>;

        return (
          typeof conversation.id === "string" &&
          typeof conversation.title === "string" &&
          Array.isArray(conversation.messages) &&
          conversation.messages.every(isMessage) &&
          typeof conversation.createdAt === "number" &&
          typeof conversation.updatedAt === "number"
        );
      })
      .sort((first, second) => second.updatedAt - first.updatedAt)
      .slice(0, MAX_SAVED_CONVERSATIONS);
  } catch {
    return [];
  }
}

function createConversationTitle(messages: Message[]) {
  const firstQuestion = messages
    .find((message) => message.role === "user")
    ?.content.replace(/\s+/g, " ")
    .trim();

  if (!firstQuestion) return "New conversation";
  if (firstQuestion.length <= 46) return firstQuestion;

  return `${firstQuestion.slice(0, 45).trimEnd()}…`;
}

function getHistoryGroup(updatedAt: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const conversationDate = new Date(updatedAt);
  conversationDate.setHours(0, 0, 0, 0);
  const daysAgo = Math.round(
    (today.getTime() - conversationDate.getTime()) / 86_400_000,
  );

  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo < 7) return "Previous 7 days";
  if (daysAgo < 30) return "Previous 30 days";

  return "Older";
}

function groupSavedConversations(conversations: SavedConversation[]) {
  const groups = new Map<string, SavedConversation[]>();

  conversations.forEach((conversation) => {
    const label = getHistoryGroup(conversation.updatedAt);
    const group = groups.get(label) ?? [];
    group.push(conversation);
    groups.set(label, group);
  });

  return Array.from(groups.entries());
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-[#20201f] text-white shadow-sm ${
        compact ? "size-8" : "size-11"
      }`}
    >
      <Sparkles className={compact ? "size-4" : "size-5"} strokeWidth={1.8} />
    </span>
  );
}

function WelcomeScreen({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center py-8 text-center md:py-12">
      <BrandMark />
      <h1 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.035em] text-foreground md:text-[2.15rem]">
        How can I help you invest globally?
      </h1>
      <p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-muted-foreground md:text-[15px]">
        Explore Dar Global residences, destinations, brand partnerships, and Wasalt services with a specialist luxury property concierge.
      </p>

      <div className="mt-9 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {FEATURED_PROMPTS.slice(0, 4).map((topic) => {
          const Icon = topic.icon;

          return (
            <button
              className="group flex min-h-24 items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              key={topic.title}
              onClick={() => onSelect(topic.prompt)}
              type="button"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors group-hover:text-foreground">
                <Icon className="size-4" strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {topic.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {topic.category} · Ask for the complete overview
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedConversations, setSavedConversations] = useState<
    SavedConversation[]
  >([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setSavedConversations(loadSavedConversations());
      setHistoryLoaded(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!historyLoaded) return;

    try {
      window.localStorage.setItem(
        CONVERSATION_STORAGE_KEY,
        JSON.stringify(savedConversations),
      );
    } catch {
      // The current chat remains usable if browser storage is unavailable or full.
    }
  }, [historyLoaded, savedConversations]);

  const saveConversation = (
    conversationId: string,
    nextMessages: Message[],
    updatedAt: number,
  ) => {
    setSavedConversations((current) => {
      const existing = current.find(
        (conversation) => conversation.id === conversationId,
      );
      const updatedConversation: SavedConversation = {
        id: conversationId,
        title: createConversationTitle(nextMessages),
        messages: nextMessages,
        createdAt: existing?.createdAt ?? updatedAt,
        updatedAt,
      };

      return [
        updatedConversation,
        ...current.filter(
          (conversation) => conversation.id !== conversationId,
        ),
      ].slice(0, MAX_SAVED_CONVERSATIONS);
    });
  };

  const resetComposer = () => {
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleNewChat = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setActiveConversationId(null);
    setMessages([]);
    setEditingMessageId(null);
    setEditingContent("");
    setError(null);
    setIsLoading(false);
    setSidebarOpen(false);
    resetComposer();
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelectConversation = (conversation: SavedConversation) => {
    requestRef.current?.abort();
    requestRef.current = null;
    setActiveConversationId(conversation.id);
    setMessages(conversation.messages);
    setEditingMessageId(null);
    setEditingContent("");
    setError(null);
    setIsLoading(false);
    setSidebarOpen(false);
    resetComposer();
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleDeleteConversation = (conversationId: string) => {
    setSavedConversations((current) =>
      current.filter((conversation) => conversation.id !== conversationId),
    );

    if (activeConversationId === conversationId) {
      requestRef.current?.abort();
      requestRef.current = null;
      setActiveConversationId(null);
      setMessages([]);
      setEditingMessageId(null);
      setEditingContent("");
      setError(null);
      setIsLoading(false);
      resetComposer();
    }
  };

  const handleStop = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsLoading(false);
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const requestAssistantResponse = async (
    conversationId: string,
    nextMessages: Message[],
  ) => {
    const chatHistory = nextMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
    const controller = new AbortController();

    requestRef.current = controller;
    setError(null);
    setIsLoading(true);
    setSidebarOpen(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `The concierge returned status ${response.status}.`,
        );
      }

      if (!controller.signal.aborted) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
        };
        const completedMessages = [...nextMessages, assistantMessage];

        setMessages(completedMessages);
        saveConversation(
          conversationId,
          completedMessages,
          getCurrentTimestamp(),
        );
      }
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "I couldn't reach the concierge. Please try again.",
      );
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsLoading(false);
        window.setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  };

  const sendMessage = async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedContent,
    };
    const conversationId = activeConversationId ?? crypto.randomUUID();
    const nextMessages = [...messages, userMessage];

    setActiveConversationId(conversationId);
    setMessages(nextMessages);
    saveConversation(conversationId, nextMessages, getCurrentTimestamp());
    resetComposer();
    await requestAssistantResponse(conversationId, nextMessages);
  };

  const handleStartEditing = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const handleCancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = editingContent.trim();
    if (!trimmedContent || !editingMessageId || !activeConversationId) return;

    const messageIndex = messages.findIndex(
      (message) => message.id === editingMessageId,
    );
    if (messageIndex < 0 || messages[messageIndex].role !== "user") return;

    const editedMessage: Message = {
      ...messages[messageIndex],
      content: trimmedContent,
    };
    const nextMessages = [
      ...messages.slice(0, messageIndex),
      editedMessage,
    ];

    setEditingMessageId(null);
    setEditingContent("");
    setMessages(nextMessages);
    saveConversation(
      activeConversationId,
      nextMessages,
      getCurrentTimestamp(),
    );
    await requestAssistantResponse(activeConversationId, nextMessages);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancelEditing();
    } else if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-3">
          <button
            className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            onClick={handleNewChat}
            type="button"
          >
            <BrandMark compact />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight">
                Dar Global AI
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Powered by Wasalt
              </span>
            </span>
          </button>
          <Button
            aria-label="Close menu"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="px-3 pt-2">
          <Button
            className="h-10 w-full justify-start gap-3 border-sidebar-border bg-background px-3 shadow-none hover:bg-sidebar-accent"
            onClick={handleNewChat}
            type="button"
            variant="outline"
          >
            <MessageSquarePlus className="size-4" />
            New conversation
          </Button>
        </div>

        <nav
          aria-label="Conversation history and property topics"
          className="flex-1 overflow-y-auto px-3 py-6"
        >
          {savedConversations.length > 0 ? (
            <section aria-labelledby="history-heading">
              <h2
                className="px-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
                id="history-heading"
              >
                History
              </h2>
              <div className="mt-2 space-y-4">
                {groupSavedConversations(savedConversations).map(
                  ([label, conversations]) => (
                    <div key={label}>
                      <p className="px-2 pb-1 text-[11px] font-medium text-muted-foreground/80">
                        {label}
                      </p>
                      <div className="space-y-0.5">
                        {conversations.map((conversation) => (
                          <div
                            className={`group/history relative flex items-center rounded-lg transition-colors hover:bg-sidebar-accent focus-within:bg-sidebar-accent ${
                              activeConversationId === conversation.id
                                ? "bg-sidebar-accent"
                                : ""
                            }`}
                            key={conversation.id}
                          >
                            <button
                              aria-current={
                                activeConversationId === conversation.id
                                  ? "page"
                                  : undefined
                              }
                              className="min-w-0 flex-1 truncate rounded-lg py-2 pl-2.5 pr-9 text-left text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
                              onClick={() =>
                                handleSelectConversation(conversation)
                              }
                              title={conversation.title}
                              type="button"
                            >
                              {conversation.title}
                            </button>
                            <Button
                              aria-label={`Delete ${conversation.title}`}
                              className="absolute right-1 size-7 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/history:opacity-100 sm:group-focus-within/history:opacity-100"
                              onClick={() =>
                                handleDeleteConversation(conversation.id)
                              }
                              size="icon"
                              title="Delete conversation"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>
          ) : null}

          <section
            aria-labelledby="explore-heading"
            className={savedConversations.length > 0 ? "mt-7" : ""}
          >
            <h2
              className="px-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
              id="explore-heading"
            >
              Explore
            </h2>
            <div className="mt-2 space-y-0.5">
              {FEATURED_PROMPTS.map((topic) => {
                const Icon = topic.icon;

                return (
                  <button
                    className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    key={topic.title}
                    onClick={() => void sendMessage(topic.prompt)}
                    type="button"
                  >
                    <Icon
                      className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                      strokeWidth={1.8}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">
                        {topic.title}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {topic.category}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-xl border border-sidebar-border bg-background p-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="size-2 rounded-full bg-emerald-500" />
              Sales concierge available
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
              Continue with a specialist for availability, pricing, and private viewings.
            </p>
            <div className="mt-3 flex gap-2">
              <Button asChild className="flex-1" size="sm" variant="secondary">
                <a href="tel:+97145629666">
                  <Phone className="size-3.5" />
                  Call
                </a>
              </Button>
              <Button asChild className="flex-1" size="sm" variant="secondary">
                <a
                  href="https://api.whatsapp.com/send?phone=97180040409"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] md:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <section className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between px-3 md:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              aria-label="Open menu"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Menu className="size-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">Luxury Concierge</span>
                <span className="hidden items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Dar Global portfolio specialist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 ? (
              <Button
                aria-label="Start new conversation"
                onClick={handleNewChat}
                size="icon"
                title="Start new conversation"
                type="button"
                variant="ghost"
              >
                <MessageSquarePlus className="size-4" />
              </Button>
            ) : null}
            <Button asChild className="hidden sm:inline-flex" size="sm" variant="ghost">
              <a href="https://www.darglobal.co.uk" rel="noopener noreferrer" target="_blank">
                View portfolio
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          </div>
        </header>

        <Conversation className="min-h-0">
          <ConversationContent
            className={`mx-auto w-full max-w-3xl px-4 md:px-8 ${
              messages.length === 0 ? "min-h-full justify-center py-4" : "py-10"
            }`}
          >
            {messages.length === 0 ? <WelcomeScreen onSelect={sendMessage} /> : null}

            {messages.map((message) =>
              message.role === "user" ? (
                <ChatMessage
                  className="max-w-[88%] sm:max-w-[78%]"
                  from="user"
                  key={message.id}
                >
                  {editingMessageId === message.id ? (
                    <form
                      className="w-full rounded-2xl bg-secondary p-3 shadow-sm"
                      onSubmit={handleSaveEdit}
                    >
                      <textarea
                        aria-label="Edit your message"
                        autoFocus
                        className="max-h-52 min-h-20 w-full resize-y bg-transparent px-1 text-[15px] leading-6 text-foreground outline-none"
                        onChange={(event) => setEditingContent(event.target.value)}
                        onKeyDown={handleEditKeyDown}
                        rows={3}
                        value={editingContent}
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <Button
                          onClick={handleCancelEditing}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={!editingContent.trim()}
                          size="sm"
                          type="submit"
                        >
                          Save & submit
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <MessageContent className="user-message text-[15px] leading-6">
                        {message.content}
                      </MessageContent>
                      {!isLoading ? (
                        <MessageActions className="justify-end opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                          <MessageAction
                            aria-label="Edit message"
                            onClick={() => handleStartEditing(message)}
                            tooltip="Edit message"
                          >
                            <Pencil className="size-3.5" />
                          </MessageAction>
                        </MessageActions>
                      ) : null}
                    </>
                  )}
                </ChatMessage>
              ) : (
                <ChatMessage className="max-w-full" from="assistant" key={message.id}>
                  <div className="flex items-start gap-3.5">
                    <BrandMark compact />
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-semibold tracking-tight">Luxury Concierge</p>
                      <MessageContent className="mt-2 w-full max-w-none overflow-visible text-[15px] leading-7">
                        <MessageResponse className="chat-response">
                          {message.content}
                        </MessageResponse>
                      </MessageContent>
                      <MessageActions className="-ml-1 mt-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <MessageAction
                          aria-label="Copy response"
                          onClick={() => void handleCopy(message.id, message.content)}
                          tooltip={copiedId === message.id ? "Copied" : "Copy response"}
                        >
                          {copiedId === message.id ? (
                            <Check className="size-4" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </MessageAction>
                      </MessageActions>
                    </div>
                  </div>
                </ChatMessage>
              ),
            )}

            {isLoading ? (
              <ChatMessage aria-live="polite" className="max-w-full" from="assistant">
                <div className="flex items-start gap-3.5">
                  <BrandMark compact />
                  <div className="pt-1">
                    <p className="text-sm font-semibold tracking-tight">Luxury Concierge</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Reviewing the portfolio</span>
                      <span className="flex items-center gap-1" aria-hidden="true">
                        <span className="loading-dot" />
                        <span className="loading-dot" />
                        <span className="loading-dot" />
                      </span>
                    </div>
                  </div>
                </div>
              </ChatMessage>
            ) : null}

            {error ? (
              <div
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">The concierge is unavailable</p>
                    <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
                  </div>
                  <Button
                    aria-label="Dismiss error"
                    className="-mr-1 -mt-1 text-red-700 hover:bg-red-100 hover:text-red-900"
                    onClick={() => setError(null)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton className="bottom-3 shadow-sm" />
        </Conversation>

        <footer className="shrink-0 bg-background px-3 pb-3 pt-2 md:px-6 md:pb-5">
          <div className="mx-auto w-full max-w-3xl">
            {messages.length > 0 && !isLoading ? (
              <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
                {MARKET_PROMPTS.map((market) => (
                  <button
                    className="whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    key={market.label}
                    onClick={() => void sendMessage(market.prompt)}
                    type="button"
                  >
                    {market.label}
                  </button>
                ))}
              </div>
            ) : null}

            <form className="composer-shell flex items-end gap-2 rounded-[26px] border border-border bg-background p-2 pl-4" onSubmit={handleSubmit}>
              <textarea
                aria-label="Message the luxury concierge"
                className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground/80 disabled:cursor-not-allowed"
                disabled={isLoading}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a property..."
                ref={inputRef}
                rows={1}
                value={input}
              />
              {isLoading ? (
                <Button
                  aria-label="Stop response"
                  className="size-10 rounded-full bg-foreground text-background hover:bg-foreground/85"
                  onClick={handleStop}
                  size="icon-lg"
                  type="button"
                >
                  <Square className="size-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  aria-label="Send message"
                  className="size-10 rounded-full bg-foreground text-background hover:bg-foreground/85"
                  disabled={!input.trim()}
                  size="icon-lg"
                  type="submit"
                >
                  <Send className="size-4" />
                </Button>
              )}
            </form>
            <p className="mt-2 text-center text-[11px] leading-4 text-muted-foreground">
              AI responses are based on public Dar Global and Wasalt information. Confirm pricing and availability with a sales advisor.
            </p>
          </div>
        </footer>
      </section>
    </div>
  );
}
