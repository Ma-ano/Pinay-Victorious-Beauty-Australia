import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI chat is not configured. Set OPENAI_API_KEY in environment variables." },
        { status: 501 }
      );
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: `You are a helpful assistant for Pinay Victorious Beauty Australia, a beauty and wellness store. 
Answer questions about: products, skincare routines, ingredients, orders, shipping to Australia, 
and general beauty advice. Be friendly, knowledgeable, and concise. If you don't know something, 
say so honestly.`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}
