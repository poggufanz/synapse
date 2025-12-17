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

        // Generate a portrait image using Gemini
        const prompt = `Create a friendly, warm, and approachable portrait of ${characterName}. 
The portrait should be:
- A cheerful, stylized digital illustration
- Warm color tones with soft lighting
- Abstract and artistic interpretation (not photorealistic)
- Suitable as a profile avatar
- Expression should be kind and wise
- Background should be simple and warm-toned

Style: Digital art illustration, friendly character portrait, warm palette`;

        try {
            // Use gemini-2.0-flash-exp with image generation capability
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
                generationConfig: {
                    // @ts-ignore - responseModalities is a new API
                    responseModalities: ["TEXT", "IMAGE"],
                },
            });

            const result = await model.generateContent(prompt);
            const response = result.response;

            // Check if we got an image in the response
            if (response.candidates && response.candidates[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    // @ts-ignore - inlineData with image is a new API
                    if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
                        // Return the base64 image
                        return NextResponse.json({
                            // @ts-ignore
                            image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                            success: true,
                        });
                    }
                }
            }

            // Fallback: return a placeholder URL based on character name
            return NextResponse.json({
                image: `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(characterName)}&backgroundColor=FFEDCC`,
                success: false,
                fallback: true,
            });
        } catch (imageError: any) {
            console.error("Image generation error:", imageError);
            // Fallback to DiceBear if image generation fails
            return NextResponse.json({
                image: `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(characterName)}&backgroundColor=FFEDCC`,
                success: false,
                fallback: true,
            });
        }
    } catch (error) {
        console.error("Generate Avatar Error:", error);
        return NextResponse.json(
            { error: "Failed to generate avatar" },
            { status: 500 }
        );
    }
}

