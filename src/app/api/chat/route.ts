import { NextRequest, NextResponse } from "next/server";
import { knowledgeBase } from "@/data/knowledge-base";

const DEFAULT_MODEL = "z-ai/glm-5.3-flash";

const SYSTEM_PROMPT = `You are the official AI Luxury Real Estate Assistant for Dar Global and Wasalt.
Dar Global PLC is a prestigious London-listed luxury real estate developer, and Wasalt is its proptech digital platform.

Your mission:
Provide refined, accurate, and knowledgeable assistance to potential investors, home buyers, and clients interested in Dar Global luxury properties and Wasalt digital services.

Knowledge Base Reference:
${knowledgeBase}

Guidelines:
1. Always be professional, courteous, and inspiring—embodying ultra-luxury real estate standards.
2. Rely accurately on the facts in the knowledge base (portfolio value of $23B, 32-year track record, 7 countries including UAE, Saudi Arabia, Oman, Qatar, Spain, UK, Maldives).
3. Detail landmark projects when asked (e.g., Trump International Hotel & Tower Dubai, Da Vinci Tower by Pagani, The Astera by Aston Martin, Tierra Viva by Lamborghini, AIDA Oman, Rayana Trump Mansions, Amaya Trump Plaza Jeddah).
4. Use clean Markdown with headings, bullet points, and bold text for readability.
5. If the user asks about booking, viewings, or specific pricing, guide them to contact via Phone (+97145629666) or WhatsApp (97180040409).
`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model: reqModel } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const model = reqModel || process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    const apiMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://darglobal-wasalt-chatbot.vercel.app",
        "X-Title": "DarGlobal & Wasalt AI Assistant",
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", response.status, errorData);
      return NextResponse.json(
        { error: `AI service error: ${response.status}. Please check API key or model.` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const choiceMessage = data.choices?.[0]?.message;
    const assistantMessage =
      choiceMessage?.content ||
      choiceMessage?.reasoning ||
      "I am ready to assist you with Dar Global and Wasalt luxury properties. What would you like to explore?";

    return NextResponse.json({
      message: assistantMessage,
      model: data.model || model,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again." },
      { status: 500 }
    );
  }
}
