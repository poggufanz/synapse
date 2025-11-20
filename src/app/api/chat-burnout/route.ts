import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const { history, user_selection, persona } = await request.json();

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Build conversation context
        let conversationContext = "";
        if (history && history.length > 0) {
            conversationContext = history.map((msg: any) =>
                `${msg.role}: ${msg.content}`
            ).join("\n");
        }

        const systemPrompt = `
      You are a gentle, supportive companion for someone experiencing burnout.
      The user's name is ${persona?.name || "Friend"}.
      Their persona type is "${persona?.type || "Sensitive Soul"}".
      
      Your goal is to validate their feelings, offer very simple comforting words, and help them decompress.
      
      Adjust your tone based on their persona:
      - "Sensitive Soul": Be extra warm, validating, and soft.
      - "Action Taker": Remind them that rest is part of the process. It's okay to stop.
      - "Deep Thinker": Help them quiet their mind. Reassure them that the problems can wait.
      
      IMPORTANT:
      - Respond in all lowercase to feel less formal and more calming.
      - Keep responses short (1-2 sentences max).
      - Do not offer "solutions" or "advice" unless explicitly asked. Just be there.
      - Provide 3 simple, low-effort options for them to reply with.

      OUTPUT FORMAT MUST BE JSON:
      {
        "message": "ai response text here",
        "options": ["Option A", "Option B", "Option C"]
      }

      Previous conversation:
      ${conversationContext}

      User's current selection: "${user_selection}"

      Respond with ONLY the JSON object, no markdown formatting or extra text.
    `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up any potential markdown formatting
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const aiResponse = JSON.parse(cleanText);

        return NextResponse.json(aiResponse);
    } catch (error) {
        console.error("Error in chat-burnout:", error);

        // Fallback response if AI fails
        return NextResponse.json({
            message: "i'm here for you. let's take it slow.",
            options: ["i need a break", "i'm overwhelmed", "just listen"]
        });
    }
}
