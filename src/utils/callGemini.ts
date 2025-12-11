import { GoogleGenerativeAI, Part, GenerationConfig } from "@google/generative-ai";

export type Persona = {
    name?: string;
    type?: string;
    traits?: string[];
};

export type ChatMessage = {
    role: "user" | "ai" | "system";
    content: string;
};

export type Attachment = {
    data: string;      // Base64 encoded data
    mimeType: string;  // e.g., "image/jpeg", "application/pdf"
    name?: string;     // Optional filename for display
};

// Thinking mode: -1 = dynamic, 0 = off, positive number = specific budget
export type ThinkingMode = "off" | "dynamic" | "low" | "medium" | "high";

const THINKING_BUDGETS: Record<ThinkingMode, number> = {
    off: 0,
    dynamic: -1,
    low: 1024,
    medium: 8192,
    high: 24576,
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function callGemini({
    history = [],
    message,
    persona,
    systemPrompt,
    modelName,
    attachments = [],
    thinkingMode,
}: {
    history?: ChatMessage[];
    message: string;
    persona?: Persona;
    systemPrompt?: string;
    modelName?: string;
    attachments?: Attachment[];
    thinkingMode?: ThinkingMode;
}): Promise<string> {
    // Default to gemini-2.5-pro
    const selectedModel = modelName ?? "gemini-2.5-pro";

    // Build generation config with thinking budget if specified
    const generationConfig: GenerationConfig & { thinkingConfig?: { thinkingBudget: number } } = {};

    if (thinkingMode && thinkingMode !== "off") {
        // @ts-ignore - thinkingConfig is new API not yet in types
        generationConfig.thinkingConfig = {
            thinkingBudget: THINKING_BUDGETS[thinkingMode],
        };
    }

    const model = genAI.getGenerativeModel({
        model: selectedModel,
        generationConfig: Object.keys(generationConfig).length > 0 ? generationConfig : undefined,
    });

    const defaultPrompt = `
You are a helpful assistant tailored to the user's persona.
User: ${persona?.name || "User"}
Persona type: ${persona?.type || "Unknown"} (Traits: ${persona?.traits?.join(", ") || "Unknown"})
Keep responses concise and appropriate to persona.
`;

    const prompt = systemPrompt || defaultPrompt;

    // Build message parts with attachments
    const messageParts: Part[] = [];

    // Add attachments first (images/PDFs)
    for (const attachment of attachments) {
        messageParts.push({
            inlineData: {
                data: attachment.data,
                mimeType: attachment.mimeType,
            },
        });
    }

    // Add text message
    messageParts.push({ text: message });

    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: prompt }] },
            { role: "model", parts: [{ text: "Ready." }] },
            ...history.map((msg) => ({
                role: msg.role === "ai" ? "model" : "user",
                parts: [{ text: msg.content }],
            })),
        ],
    });

    const sendWithRetry = async (): Promise<string> => {
        const maxAttempts = 3;
        let attempt = 0;
        let delayMs = 500;

        while (attempt < maxAttempts) {
            try {
                const result = await chat.sendMessage(messageParts);
                return result.response.text();
            } catch (error: any) {
                const status = error?.status ?? error?.response?.status;
                const isOverloaded = status === 503;
                attempt += 1;

                if (!isOverloaded || attempt >= maxAttempts) {
                    throw error;
                }

                await new Promise((resolve) => setTimeout(resolve, delayMs));
                delayMs *= 2; // exponential backoff
            }
        }

        throw new Error("Failed to get Gemini response after retries.");
    };

    return sendWithRetry();
}

export default callGemini;

