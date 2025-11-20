import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const { task } = await request.json();

        if (!task) {
            return NextResponse.json(
                { error: "Task is required" },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert Productivity Architect. Break down the user's vague task into 3-5 small, actionable micro-steps. Assign an 'energy_tag' (Deep Work, Shallow Work, or Recovery) to each. 
    
    User Task: "${task}"
    
    Return ONLY a raw JSON array with this structure:
    [
      {
        "step": "Actionable step description",
        "energy_tag": "Deep Work" | "Shallow Work" | "Recovery"
      }
    ]
    
    Do not include markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON array.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up any potential markdown formatting just in case
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const microSteps = JSON.parse(cleanText);

        return NextResponse.json(microSteps);
    } catch (error) {
        console.error("Error breaking down task:", error);
        return NextResponse.json(
            { error: "Failed to break down task" },
            { status: 500 }
        );
    }
}
