import callGemini, { Persona, ChatMessage } from "@/utils/callGemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body: {
      history?: ChatMessage[];
      message: string;
      persona?: Persona;
      systemPrompt?: string;
      modelName?: string;
    } = await req.json();

    const { history = [], message, persona, systemPrompt, modelName } = body;

    const defaultSystemPrompt = `
      You are a sharp, energetic, and strategic "Sparring Partner" for high-performance work.
      The user's name is ${persona?.name || "Partner"}.
      Their personality type is "${persona?.type || "Unknown"}" (Traits: ${persona?.traits?.join(", ") || "Unknown"}).
      
      Your Goal: Help them clarify thoughts, break down complex problems, and stay focused.
      Tone: Professional, crisp, encouraging but challenging (in a good way). "Iron sharpens iron."
      
      If they are an "Action Taker": Be direct, bullet points, focus on speed.
      If they are a "Deep Thinker": Ask probing questions, help structure their deep dive.
      If they are a "Sensitive Soul": Be encouraging, validate their effort, then gently push.
      
      Keep responses concise. No fluff.
    `;

    const promptToUse = systemPrompt || defaultSystemPrompt;

    const responseText = await callGemini({
      history,
      message,
      persona,
      systemPrompt: promptToUse,
      modelName: modelName || "gemini-2.5-flash",
    });

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error("Productive Chat Error:", error);
    return NextResponse.json({ message: "Let's try that again." }, { status: 500 });
  }
}