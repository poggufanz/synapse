import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { task, userProfile } = await request.json();

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an expert Productivity Architect.
    The user is ${userProfile?.name || 'Student'}, a "${userProfile?.personalityType || 'Unknown'}" type.
    Break down the user's vague task into 3-5 small, actionable micro-steps.
    Adapt the steps to their personality (e.g., detailed for Planners, bite-sized for Procrastinators).
    Assign an 'energy_tag' (Deep Work, Shallow Work, or Recovery) to each.
    Return ONLY a raw JSON array. No markdown formatting.
    
    User Task: "${task}"
    
    Example Output:
    [
      { "step": "Draft outline", "energy_tag": "Deep Work" },
      { "step": "Email team", "energy_tag": "Shallow Work" }
    ]`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // Clean up potential markdown code blocks
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const steps = JSON.parse(cleanText);

    return NextResponse.json(steps);
  } catch (error) {
    console.error("Error breaking down task:", error);
    return NextResponse.json(
      { error: "Failed to break down task" },
      { status: 500 }
    );
  }
}
