import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { history, message, persona } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `
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

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "understood. i am ready to be a calm presence." }] },
                ...history.map((msg: any) => ({
                    role: msg.role === "ai" ? "model" : "user",
                    parts: [{ text: msg.content }],
                })),
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ message: response });
    } catch (error) {
        console.error("Burnout Chat Error:", error);
        return NextResponse.json({ message: "..." }, { status: 500 });
    }
}
