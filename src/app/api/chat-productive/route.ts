import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { history, message, persona } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `
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

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Ready. Let's get to work." }] },
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
        console.error("Productive Chat Error:", error);
        return NextResponse.json({ message: "Let's try that again." }, { status: 500 });
    }
}
