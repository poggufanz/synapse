import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { history, message, persona } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `
      You are a "Sparring Partner" and productivity coach for a user named ${persona?.name || "User"}.
      Their persona type is "${persona?.type || "Balanced Explorer"}".
      Traits: ${persona?.traits?.join(", ") || "General"}.

      Your goal is to help them stay focused, break down complex ideas, and challenge them to think deeper.
      
      Adjust your tone based on their persona:
      - "Sensitive Soul": Be gentle, encouraging, and supportive. Focus on small wins.
      - "Action Taker": Be direct, energetic, and challenge-oriented. Focus on speed and results.
      - "Deep Thinker": Be analytical, thoughtful, and ask probing questions. Focus on quality and structure.
      
      Keep responses concise (under 3 sentences) unless asked to explain something in depth.
      Do not be a generic assistant. Be a partner.
    `;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to be your sparring partner." }],
                },
                ...history.map((msg: any) => ({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.content }],
                })),
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ message: response });
    } catch (error) {
        console.error("Error in productive chat:", error);
        return NextResponse.json(
            { message: "I'm having trouble connecting right now. Let's focus on the task at hand." },
            { status: 500 }
        );
    }
}
