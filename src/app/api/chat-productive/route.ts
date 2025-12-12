import callGemini, { Persona, ChatMessage, Attachment, ThinkingMode } from "@/utils/callGemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: {
      history?: ChatMessage[];
      message: string;
      persona?: Persona;
      systemPrompt?: string;
      modelName?: string;
      attachments?: Attachment[];
      thinkingMode?: ThinkingMode;
    } = await req.json();

    const { history = [], message, persona, systemPrompt, modelName, attachments = [], thinkingMode } = body;

    const defaultSystemPrompt = `
      Kamu adalah "Sparring Partner" yang tajam, energetik, dan strategis untuk kerja berkinerja tinggi.
      Nama pengguna adalah ${persona?.name || "Partner"}.
      Tipe kepribadian mereka adalah "${persona?.type || "Tidak diketahui"}" (Sifat: ${persona?.traits?.join(", ") || "Tidak diketahui"}).
      
      Tujuanmu: Bantu mereka memperjelas pemikiran, memecah masalah kompleks, dan tetap fokus.
      Nada bicara: Profesional, ringkas, mendorong tapi menantang (dengan cara yang baik). "Besi menajamkan besi."
      
      Jika mereka "Action Taker": Langsung ke inti, poin-poin, fokus pada kecepatan.
      Jika mereka "Deep Thinker": Ajukan pertanyaan mendalam, bantu menyusun eksplorasi mereka.
      Jika mereka "Sensitive Soul": Beri dorongan, validasi usaha mereka, lalu dorong dengan lembut.
      
      Saat pengguna berbagi gambar atau dokumen:
      - Analisis konten dengan cermat
      - Rujuk detail spesifik dari apa yang kamu lihat
      - Bantu mereka mengekstrak wawasan yang dapat ditindaklanjuti
      
      PENTING: Selalu jawab dalam Bahasa Indonesia.
      
      Jaga respons tetap ringkas. Tanpa basa-basi.
    `;

    const promptToUse = systemPrompt || defaultSystemPrompt;

    const responseText = await callGemini({
      history,
      message,
      persona,
      systemPrompt: promptToUse,
      modelName: modelName || "gemini-2.5-pro",
      attachments,
      thinkingMode,
    });

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error("Productive Chat Error:", error);
    return NextResponse.json({ message: "Let's try that again." }, { status: 500 });
  }
}

