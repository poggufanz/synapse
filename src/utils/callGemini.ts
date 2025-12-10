import { GoogleGenerativeAI } from "@google/generative-ai";

export type Persona = {
    name?: string;
    type?: string;
    traits?: string[];
};

export type ChatMessage = {
    role: "user" | "ai" | "system";
    content: string;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function callGemini({
    history = [],
    message,
    persona,
    systemPrompt,
    modelName,
}: {
    history?: ChatMessage[];
    message: string;
    persona?: Persona;
    systemPrompt?: string;
    modelName?: string;
}): Promise<string> {
    const model = genAI.getGenerativeModel({ model: modelName ?? "gemini-2.5-flash" });

    const defaultPrompt = `
You are a helpful assistant tailored to the user's persona.
User: ${persona?.name || "User"}
Persona type: ${persona?.type || "Unknown"} (Traits: ${persona?.traits?.join(", ") || "Unknown"})
Keep responses concise and appropriate to persona.
`;

    const prompt = systemPrompt || defaultPrompt;

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
                const result = await chat.sendMessage(message);
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