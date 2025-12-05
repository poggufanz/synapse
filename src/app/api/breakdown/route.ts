import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      console.error("API Key is missing in server environment variables.");
      throw new Error("API Key not configured on server.");
    }
    
    const { task } = await req.json();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    console.log("Generating tasks for:", task);

    const prompt = `
      You are an expert productivity assistant.
      Goal: Break down the user's objective: "${task}" into 3-5 concrete micro-tasks.
      
      Rules based on psychology:
      1. The first task MUST be a "Quick Win" (under 5 mins) to overcome inertia (Zeigarnik Effect).
      2. Other tasks should fit into a Pomodoro cycle (max 25 mins).
      3. Use simple, action-oriented language.
      
      Response MUST be a raw JSON Array following this exact schema:
      [
        {
          "title": "Task name",
          "duration": "e.g., 5 min",
          "tag": "Quick Win" | "Deep Work" | "Learning"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log("Gemini Response:", response);

    // Clean up markdown code blocks if present (Gemini sometimes adds them even in JSON mode)
    const cleanResponse = response.replace(/```json/g, "").replace(/```/g, "").trim();
    const generatedTasks = JSON.parse(cleanResponse);

    // Map to FocusCockpit Task interface
    const enrichedTasks = generatedTasks.map((t: any, index: number) => {
      // Parse duration string "5 min" to number 5
      const durationNum = parseInt(t.duration) || 25;
      
      return {
        id: Date.now().toString() + index,
        title: t.title,
        duration: durationNum,
        isCompleted: false,
        isAIGenerated: true,
        tags: t.tag ? [t.tag] : []
      };
    });

    return NextResponse.json(enrichedTasks);
  } catch (error: any) {
    console.error("Breakdown Error Details:", error);
    return NextResponse.json({ error: error.message || "Failed to break down task" }, { status: 500 });
  }
}
