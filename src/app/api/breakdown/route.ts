import { NextResponse } from "next/server";
import callGemini, { Attachment } from "@/utils/callGemini";

export async function POST(req: Request) {
  try {
    const { task, attachments = [], reprompt }: { task: string; attachments?: Attachment[]; reprompt?: string } = await req.json();

    const systemPrompt = `
      Kamu adalah ahli dalam memecah tugas yang melelahkan menjadi tugas ULTRA-MIKRO yang hanya membutuhkan 3-5 menit setiap langkah.
      Tujuanmu adalah membuat pengguna merasa "Aku bisa melakukan ini SEKARANG" dengan menciptakan langkah-langkah kecil yang tidak mengintimidasi.

      ATURAN PENTING:
      1. Setiap tugas HARUS bisa diselesaikan dalam 3-5 menit MAKSIMAL
      2. Gunakan kata kerja yang terasa cepat: "Skim", "Catat", "Cari", "Buka", "Baca 1 halaman", "Tonton 2 menit"
      3. Tugas pertama harus tugas "mulai saja" - sesuatu yang sepele untuk membangun momentum
      4. Hindari tugas yang samar - SPESIFIK tentang apa yang harus dilakukan
      5. Maksimal 5-6 tugas total

      Jika pengguna memberikan gambar atau dokumen (seperti silabus, screenshot, atau catatan):
      - Analisis konten dengan cermat
      - Ekstrak topik dan buat langkah pembelajaran ultra-mikro
      - Spesifik tentang nomor halaman, bagian, atau item dari dokumen

      Untuk setiap tugas, berikan:
      1. "action": Frasa kata kerja singkat (2-4 kata). Contoh: "Buka Catatan", "Tulis 3 Kata Kunci"
      2. "summary": Satu kalimat menjelaskan tujuan mikro
      3. "duration": Selalu 5 (mewakili 5 menit)
      4. "energy": "Recovery" (sangat mudah), "Shallow Work" (mudah), atau "Deep Work" (fokus tapi singkat)
      5. "source": "Analisis Dokumen" jika dari lampiran, jika tidak "Tujuan Pengguna"

      ${reprompt ? `UMPAN BALIK PENGGUNA: Pengguna ingin kamu menyesuaikan: "${reprompt}". Harap regenerasi tugas sesuai permintaan.` : ''}

      PENTING: Semua teks dalam JSON harus dalam Bahasa Indonesia.
      Kembalikan HANYA array JSON. Tanpa markdown, tanpa penjelasan.

      Contoh untuk "Saya perlu belajar untuk ujian kalkulus":
      [
        {
          "action": "Buka Catatan",
          "summary": "Buka catatan kalkulus atau buku teks ke bab yang relevan",
          "duration": 5,
          "energy": "Recovery",
          "source": "Tujuan Pengguna"
        },
        {
          "action": "Skim Rumus",
          "summary": "Pindai cepat rumus-rumus utama selama 3 menit - belum perlu menghafal",
          "duration": 5,
          "energy": "Shallow Work",
          "source": "Tujuan Pengguna"
        },
        {
          "action": "Kerjakan 1 Soal",
          "summary": "Pilih soal latihan termudah dan selesaikan",
          "duration": 5,
          "energy": "Deep Work",
          "source": "Tujuan Pengguna"
        },
        {
          "action": "Tulis 3 Pertanyaan",
          "summary": "Catat 3 hal yang membingungkanmu",
          "duration": 5,
          "energy": "Shallow Work",
          "source": "Tujuan Pengguna"
        }
      ]
    `;

    const messageText = attachments.length > 0
      ? `Analisis file terlampir dan pecah menjadi tugas mikro 5 menit. Permintaan pengguna: "${task}"`
      : `Pecah ini menjadi tugas mikro 5 menit: "${task}"`;

    const responseText = await callGemini({
      message: messageText,
      systemPrompt,
      attachments,
      modelName: "gemini-2.5-pro",
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


