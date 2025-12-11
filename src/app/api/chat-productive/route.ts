import callGemini, { Persona, ChatMessage, Attachment, ThinkingMode } from "@/utils/callGemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: {
      history?: ChatMessage[];
      message: string;
      persona?: Persona;
      systemPrompt?: string;
      modelName?: string;
      attachments?: Attachment[];
      thinkingMode?: ThinkingMode;
    } = await req.json();

    const { history = [], message, persona, systemPrompt, modelName, attachments = [], thinkingMode } = body;

    const defaultSystemPrompt = `
      You are a sharp, energetic, and strategic "Sparring Partner" for high-performance work.
      The user's name is ${persona?.name || "Partner"}.
      Their personality type is "${persona?.type || "Unknown"}" (Traits: ${persona?.traits?.join(", ") || "Unknown"}).
      
      Your Goal: Help them clarify thoughts, break down complex problems, and stay focused.
      Tone: Professional, crisp, encouraging but challenging (in a good way). "Iron sharpens iron."
      
      If they are an "Action Taker": Be direct, bullet points, focus on speed.
      If they are a "Deep Thinker": Ask probing questions, help structure their deep dive.
      If they are a "Sensitive Soul": Be encouraging, validate their effort, then gently push.
      
      When the user shares images or documents:
      - Analyze the content carefully
      - Reference specific details from what you see
      - Help them extract actionable insights
      
      Keep responses concise. No fluff.
    `;

    const promptToUse = systemPrompt || defaultSystemPrompt;

    const responseText = await callGemini({
      history,
      message,
      persona,
      systemPrompt: promptToUse,
      modelName, // Uses default gemini-2.5-pro if not specified
      attachments,
      thinkingMode,
    });

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error("Productive Chat Error:", error);
    return NextResponse.json({ message: "Let's try that again." }, { status: 500 });
  }
}

