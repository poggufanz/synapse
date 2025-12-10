import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert project manager and gamification master. Your job is to deconstruct a user's broad learning topic (Brain Dump) into 3-6 actionable, sequential “Micro-missions” that promote focused, incremental learning.

      Input: "${task}"

      The Micro-missions MUST be concrete, starting from the most fundamental/easy step, and progress logically towards the main topic. They must specify a clear action related to learning content (e.g., 'Define Key Terms', 'Watch Intro Video', 'Solve 5 Practice Problems').

      For each mission, provide:
      1. "action": A short, punchy verb phrase describing the learning step (e.g., "Define Limit Terms"). Max 4 words.
      2. "summary": A 1-sentence explanation of the specific learning goal and content (e.g., "Quickly search and note the formal and informal definitions of a mathematical limit.").
      3. "energy": "Deep Work" (complex problem-solving, synthesis), "Shallow Work" (reading definitions, watching introductory videos), or "Recovery" (reviewing notes, organizing files).
      4. "source": Where this came from (always "User Learning Goal").

      Return ONLY a JSON array of objects. The first mission should always be Shallow Work and focus on a very quick, fundamental introduction (e.g., '5-minute intro').

      Example for Input: "aku mau belajar kalkulus materi limit"
      [
        {
          "action": "Define Limit Terms",
          "summary": "Quickly search and note the formal and informal definitions of a mathematical limit.",
          "energy": "Shallow Work",
          "source": "User Learning Goal"
        },
        {
          "action": "Watch Limit Intro",
          "summary": "Find a short (under 10 min) introductory video explaining the concept of limits graphically.",
          "energy": "Shallow Work",
          "source": "User Learning Goal"
        },
        {
          "action": "Review Limit Properties",
          "summary": "Read the textbook or course notes chapter detailing the fundamental properties of limits (sum, product, quotient).",
          "energy": "Deep Work",
          "source": "User Learning Goal"
        },
        {
          "action": "Solve Basic Problems",
          "summary": "Work through the first 5 practice problems applying the basic limit properties.",
          "energy": "Deep Work",
          "source": "User Learning Goal"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Clean up markdown code blocks if present
    const cleanResponse = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const tasks = JSON.parse(cleanResponse);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Breakdown Error:", error);
    return NextResponse.json({ error: "Failed to break down task" }, { status: 500 });
  }
}