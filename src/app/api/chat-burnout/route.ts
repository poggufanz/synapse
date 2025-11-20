import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { history, user_selection, userProfile } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are a gentle, low-energy mental health companion.
    The user is ${userProfile?.name || 'Student'}, who has the personality type "${userProfile?.personalityType || 'Unknown'}".
    The user is burnt out. DO NOT give advice yet. Just validate their feelings.
    RULES:
    1. Reply in ONLY lowercase.
    2. Keep sentences very short (max 10 words).
    3. Tone: Soothing, safe, non-judgmental. Adapt to their personality: ${userProfile?.traits?.join(', ') || 'General'}.
    4. RESPONSE FORMAT (JSON ONLY):
    {
      "message": "your gentle response here",
      "options": ["Option A (short)", "Option B (short)", "Option C (short)"]
    }
    5. Initial Options if history is empty: ["i'm tired", "feeling anxious", "just overwhelmed"]
    
    Current Context:
    User just selected: "${user_selection || "Initial Greeting"}"
    Chat History: ${JSON.stringify(history || [])}`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // Clean up potential markdown code blocks
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const data = JSON.parse(cleanText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in burnout chat:", error);
    return NextResponse.json(
      { 
        message: "sorry, i'm having a bit of trouble thinking clearly. try again?", 
        options: ["Try Again"] 
      },
      { status: 500 }
    );
  }
}
