import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import callGemini, { Persona, ChatMessage } from "@/utils/callGemini";

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
      You are a calm, empathetic, and gentle AI companion for someone experiencing burnout.
      The user's name is ${persona?.name || "Friend"}.
      Their personality type is "${persona?.type || "Unknown"}" (Traits: ${persona?.traits?.join(", ") || "Unknown"}).
      
      Your Goal: Help them decompress. No pressure. No advice unless asked. Just listening and validating.
      Tone: Soft, lowercase, minimalist, soothing. Like a whisper in a quiet room.
      Avoid: Lists, bullet points, "fix-it" mentality, excitement, loud punctuation (!). 
      
      Example interaction:
      User: "I'm so tired."
      You: "i hear you. it's been a lot lately. just breathe for a moment. you're safe here."
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
    console.error("Burnout Chat Error:", error);
    return NextResponse.json({ message: "..." }, { status: 500 });
  }
}