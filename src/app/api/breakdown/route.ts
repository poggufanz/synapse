import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert project manager and gamification master.
      Deconstruct the following user input (Brain Dump) into 3-6 actionable "Micro-missions".
      
      Input: "${task}"
      
      For each mission, provide:
      1. "action": A short, punchy verb phrase (e.g., "Draft Outline", "Email Client"). Max 4 words.
      2. "summary": A 1-sentence explanation of what to do.
      3. "energy": "Deep Work", "Shallow Work", or "Recovery".
      4. "source": Where this came from (e.g., "User Input").
      
      Return ONLY a JSON array of objects.
      Example:
      [
        {
          "action": "Research Competitors",
          "summary": "Look at top 3 competitors and note their pricing.",
          "energy": "Shallow Work",
          "source": "User Input"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Clean up markdown code blocks if present
    const cleanResponse = response.replace(/```json/g, "").replace(/```/g, "").trim();
    const tasks = JSON.parse(cleanResponse);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Breakdown Error:", error);
    return NextResponse.json({ error: "Failed to break down task" }, { status: 500 });
  }
}
