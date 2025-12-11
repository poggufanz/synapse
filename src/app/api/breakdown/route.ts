import { NextResponse } from "next/server";
import callGemini, { Attachment } from "@/utils/callGemini";

export async function POST(req: Request) {
  try {
    const { task, attachments = [], reprompt }: { task: string; attachments?: Attachment[]; reprompt?: string } = await req.json();

    const systemPrompt = `
      You are an expert at breaking down overwhelming tasks into ULTRA-MICRO tasks that take only 3-5 minutes each.
      Your goal is to make the user feel "I can do this RIGHT NOW" by creating tiny, non-intimidating steps.

      CRITICAL RULES:
      1. Each task MUST be completable in 3-5 minutes MAX
      2. Use action verbs that feel quick: "Skim", "Jot", "Find", "Open", "Read 1 page", "Watch 2 min"
      3. First task should be a "just start" task - something trivial to build momentum
      4. Avoid vague tasks - be SPECIFIC about what to do
      5. Maximum 5-6 tasks total

      If the user provides an image or document (like a syllabus, screenshot, or notes):
      - Carefully analyze the content
      - Extract topics and create ultra-micro learning steps
      - Be specific about page numbers, sections, or items from the document

      For each task, provide:
      1. "action": A punchy verb phrase (2-4 words). E.g., "Skim Chapter 1", "Write 3 Keywords"
      2. "summary": One sentence explaining the micro-goal
      3. "duration": Always 5 (representing 5 minutes)
      4. "energy": "Recovery" (very easy), "Shallow Work" (easy), or "Deep Work" (focused but short)
      5. "source": "Document Analysis" if from attachment, otherwise "User Goal"

      ${reprompt ? `USER FEEDBACK: The user wants you to adjust: "${reprompt}". Please regenerate tasks accordingly.` : ''}

      Return ONLY a JSON array. No markdown, no explanation.

      Example for "I need to study for my calculus exam":
      [
        {
          "action": "Open Notes",
          "summary": "Just open your calculus notes or textbook to the relevant chapter",
          "duration": 5,
          "energy": "Recovery",
          "source": "User Goal"
        },
        {
          "action": "Skim Formulas",
          "summary": "Quickly scan the main formulas for 3 minutes - don't memorize yet",
          "duration": 5,
          "energy": "Shallow Work",
          "source": "User Goal"
        },
        {
          "action": "Solve 1 Problem",
          "summary": "Pick the easiest practice problem and solve it",
          "duration": 5,
          "energy": "Deep Work",
          "source": "User Goal"
        },
        {
          "action": "Write 3 Questions",
          "summary": "Jot down 3 things you're confused about",
          "duration": 5,
          "energy": "Shallow Work",
          "source": "User Goal"
        }
      ]
    `;

    const messageText = attachments.length > 0
      ? `Analyze the attached file(s) and break down into 5-min micro-tasks. User request: "${task}"`
      : `Break down this into 5-min micro-tasks: "${task}"`;

    const responseText = await callGemini({
      message: messageText,
      systemPrompt,
      attachments,
    });

    // Clean up markdown code blocks if present
    const cleanResponse = responseText
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


