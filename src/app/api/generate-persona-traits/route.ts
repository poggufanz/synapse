import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the new GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

        const prompt = `You are a persona generator. Search the web to find accurate information about this character.

SEARCH INSTRUCTIONS:
1. For GAME/ANIME/FICTIONAL characters: Look for their official wiki or fandom page
2. For REAL PEOPLE (actors, celebrities): Look for their wikipedia or biography
3. VERIFY the information from the search results before using it

Character to search: "${characterName}"

From your search results, extract:
- Their EXACT official name (no made-up surnames)
- Their VERIFIED faction/organization/role from official sources
- Their personality traits as described in official sources

Generate JSON with:
- "name": EXACT name from search results. No fake surnames. If only first name is known, use only that.
- "type": Their VERIFIED role + affiliation from search (e.g., "Mockingbird Agent" for Vivian from ZZZ, "Marvel Actor" for RDJ). Max 5 words.
- "interactionStyle": 2-3 sentences in first person based on their VERIFIED personality from search results.

IMPORTANT: Use ONLY information you found in search results. If search doesn't return clear info, keep it simple and generic.

Respond ONLY with valid JSON, no markdown:
{"name": "...", "type": "...", "interactionStyle": "..."}`;

        // Use Google Search grounding tool
        const groundingTool = { googleSearch: {} };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [groundingTool],
            },
        });

        const responseText = response.text || "";

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
    } catch (error: any) {
        console.error("Generate Persona Error:", error);

        // Handle specific error types
        let errorMessage = "Failed to generate persona. Please try again.";
        let statusCode = 500;

        if (error?.status === 503 || error?.message?.includes("overloaded")) {
            errorMessage = "AI model is currently overloaded. Please try again in a few seconds.";
            statusCode = 503;
        } else if (error?.status === 429 || error?.message?.includes("rate limit")) {
            errorMessage = "Too many requests. Please wait a moment and try again.";
            statusCode = 429;
        } else if (error?.status === 400) {
            errorMessage = "Invalid request. Please check the character name.";
            statusCode = 400;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
