import { NextRequest, NextResponse } from "next/server";
import { knowledgeBase } from "@/data/knowledge-base";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

const SYSTEM_PROMPT = `You are an expert AI assistant for Dar Global and Wasalt — two interconnected companies in luxury real estate and proptech.

Your role is to help potential property buyers, investors, and curious visitors by answering questions about:
- Dar Global's projects, locations, brand partnerships, and company details
- Wasalt's platform features and digital services
- Property types, locations, pricing concepts, and investment opportunities
- Recent company news and developments
- Contact information and how to get in touch

Guidelines:
1. Be professional, warm, and knowledgeable — like a premium real estate concierge.
2. Always base your answers on the provided knowledge base. If you don't have specific information, say so honestly and suggest contacting the team directly.
3. When mentioning projects, include their location and brand partner if applicable.
4. Format your responses using markdown for readability (bold, lists, etc.).
5. Keep responses concise but informative. Use bullet points for listing multiple items.
6. If asked about pricing, explain that prices vary and recommend contacting the sales team.
7. Always be helpful in guiding users to the right resources.

Here is your knowledge base:
${knowledgeBase}
`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable." },
        { status: 500 }
      );
    }

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
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://darglobal-wasalt-chatbot.vercel.app",
        "X-Title": "DarGlobal & Wasalt AI Chatbot",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", response.status, errorData);
      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I apologize, but I was unable to generate a response. Please try again.";

    return NextResponse.json({
      message: assistantMessage,
      model: data.model,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again." },
      { status: 500 }
    );
  }
}
