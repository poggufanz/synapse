import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const body: { characterName: string } = await req.json();
        const { characterName } = body;

        if (!characterName || characterName.trim().length === 0) {
            return NextResponse.json(
                { error: "Character name is required" },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a persona generator. Given a character name, generate a JSON object with the following fields:
- "name": The full name of the character (cleaned up if needed).
- "type": A short title/role for this character (e.g., "Detective & Logician", "Jedi Master", "Friendly Neighborhood Hero"). Max 3 words.
- "interactionStyle": A short paragraph (2-3 sentences) describing how this character would interact with someone who is stressed or burned out. Write in first person as if the character is introducing themselves. Be creative and capture their essence.

Character name: "${characterName}"

Respond ONLY with valid JSON, no markdown code blocks, no explanation. Example format:
{"name": "Sherlock Holmes", "type": "Detective & Logician", "interactionStyle": "I will analyze your problems with logical precision..."}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse JSON from response
        let parsed;
        try {
            // Try to extract JSON if wrapped in code blocks
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                parsed = JSON.parse(responseText);
            }
        } catch {
            // Fallback if parsing fails
            parsed = {
                name: characterName,
                type: "Wise Companion",
                interactionStyle: `I am ${characterName}, and I'm here to help you navigate through challenging times with patience and understanding.`,
            };
        }

        return NextResponse.json({
            name: parsed.name || characterName,
            type: parsed.type || "Wise Companion",
            interactionStyle: parsed.interactionStyle || `I am here to guide you.`,
        });
    } catch (error) {
        console.error("Generate Persona Error:", error);
        return NextResponse.json(
            { error: "Failed to generate persona" },
            { status: 500 }
        );
    }
}
