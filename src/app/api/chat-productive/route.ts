import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { history, message, userProfile } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are 'PACE', a rational, stoic productivity partner.
    The user is ${userProfile?.name || 'Student'}, a "${userProfile?.personalityType || 'Unknown'}" type.
    Traits: ${userProfile?.traits?.join(', ') || 'General'}.
    RULES:
    1. Be concise, logical, and slightly witty/sarcastic. Use slang like 'Bro' or 'Cok'.
    2. If the user complains, challenge their logic with data or facts (CBT approach).
    3. Do not be overly emotional. Focus on solutions.
    4. Adapt your coaching style to their personality traits.
    5. Max 2-3 sentences.
    
    Chat History:
    ${history.map((msg: any) => `${msg.role}: ${msg.text}`).join('\n')}
    
    User: ${message}
    PACE:`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Error in productive chat:", error);
    return NextResponse.json(
      { message: "Logic circuits busy. Try again." },
      { status: 500 }
    );
  }
}
