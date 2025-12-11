/**
 * NLP Parser for Indonesian Task Input
 * Parses natural language task input like "Meeting marketing senin jam 9 pagi"
 * Extracts: date, time, tag, and cleaned task title
 */

export interface ParsedTask {
    title: string;           // Cleaned task title
    date: Date | null;       // Parsed date
    time: string | null;     // Parsed time (HH:MM format)
    tag: string | null;      // Inferred tag
    duration: number;        // Suggested duration in minutes
    dateText: string | null; // Human readable date text (e.g., "Senin, 9 Des")
    timeText: string | null; // Human readable time text (e.g., "09:00 Pagi")
    hasScheduledTime: boolean; // True if task has specific date/time (should sync to calendar)
}

// Indonesian day names to day index (0 = Sunday, 6 = Saturday)
const DAY_NAMES: Record<string, number> = {
    "minggu": 0,
    "senin": 1,
    "selasa": 2,
    "rabu": 3,
    "kamis": 4,
    "jumat": 5,
    "jum'at": 5,
    "sabtu": 6,
};

// Relative day keywords
const RELATIVE_DAYS: Record<string, number> = {
    "hari ini": 0,
    "harini": 0,
    "sekarang": 0,
    "besok": 1,
    "besuk": 1,
    "lusa": 2,
};

// Time patterns and keywords
const TIME_PATTERNS = [
    // "jam 9 pagi", "jam 14", "jam 9.30"
    { regex: /jam\s*(\d{1,2})[.:,]?(\d{0,2})?\s*(pagi|siang|sore|malam)?/gi, handler: parseTimeMatch },
    // "9 pagi", "14.00", "9:30 sore"
    { regex: /(\d{1,2})[.:](\d{2})\s*(pagi|siang|sore|malam)?/gi, handler: parseTimeMatch },
    // "pukul 9", "pkl 14"
    { regex: /(?:pukul|pkl)\s*(\d{1,2})[.:,]?(\d{0,2})?\s*(pagi|siang|sore|malam)?/gi, handler: parseTimeMatch },
];

// Tag inference keywords
const TAG_KEYWORDS: Record<string, string[]> = {
    "#Work": ["meeting", "rapat", "call", "zoom", "project", "deadline", "kerja", "kantor", "client", "klien", "presentasi", "laporan", "report"],
    "#Personal": ["olahraga", "gym", "jalan", "belanja", "makan", "tidur", "main", "nonton", "baca", "buku"],
    "#Health": ["dokter", "obat", "vitamin", "checkup", "cek kesehatan", "rumah sakit", "rs", "klinik"],
    "#Study": ["belajar", "tugas", "kuliah", "kelas", "ujian", "quiz", "pr", "homework", "study"],
    "#Social": ["teman", "sahabat", "keluarga", "family", "gather", "hangout", "ketemu", "nongkrong"],
};

function parseTimeMatch(match: RegExpMatchArray): { hours: number; minutes: number } | null {
    const hourStr = match[1];
    const minuteStr = match[2] || "0";
    const period = match[3]?.toLowerCase();

    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10) || 0;

    if (isNaN(hours)) return null;

    // Adjust for period (pagi, siang, sore, malam)
    if (period) {
        if ((period === "sore" || period === "malam") && hours < 12) {
            hours += 12;
        } else if (period === "pagi" && hours === 12) {
            hours = 0;
        }
    }

    // Clamp to valid hours
    if (hours >= 24) hours = hours % 24;

    return { hours, minutes };
}

function getNextDayOfWeek(dayIndex: number, fromDate: Date = new Date()): Date {
    const result = new Date(fromDate);
    const currentDay = result.getDay();
    let daysToAdd = dayIndex - currentDay;

    // If the day has passed this week, get next week's day
    if (daysToAdd <= 0) {
        daysToAdd += 7;
    }

    result.setDate(result.getDate() + daysToAdd);
    return result;
}

function formatDateText(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    };
    return date.toLocaleDateString('id-ID', options);
}

function formatTimeText(hours: number, minutes: number): string {
    const period = hours < 12 ? "Pagi" : hours < 15 ? "Siang" : hours < 18 ? "Sore" : "Malam";
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    return `${h}:${m} ${period}`;
}

function inferTag(text: string): string | null {
    const lowerText = text.toLowerCase();

    for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                return tag;
            }
        }
    }

    return null;
}

function inferDuration(text: string, tag: string | null): number {
    const lowerText = text.toLowerCase();

    // Check for explicit duration
    const durationMatch = lowerText.match(/(\d+)\s*(menit|jam|minutes|hour)/i);
    if (durationMatch) {
        const value = parseInt(durationMatch[1], 10);
        const unit = durationMatch[2].toLowerCase();
        if (unit === "jam" || unit === "hour") {
            return value * 60;
        }
        return value;
    }

    // Infer from tag/keywords
    if (lowerText.includes("meeting") || lowerText.includes("rapat")) return 60;
    if (lowerText.includes("call") || lowerText.includes("zoom")) return 30;
    if (tag === "#Work") return 45;
    if (tag === "#Study") return 45;
    if (tag === "#Health") return 30;

    return 25; // Default pomodoro
}

export function parseTaskInput(input: string): ParsedTask {
    let workingText = input.trim();
    let parsedDate: Date | null = null;
    let parsedTime: { hours: number; minutes: number } | null = null;

    // 1. Parse relative days first
    for (const [keyword, daysToAdd] of Object.entries(RELATIVE_DAYS)) {
        if (workingText.toLowerCase().includes(keyword)) {
            parsedDate = new Date();
            parsedDate.setDate(parsedDate.getDate() + daysToAdd);
            parsedDate.setHours(0, 0, 0, 0);
            // Remove keyword from text
            workingText = workingText.replace(new RegExp(keyword, 'gi'), '').trim();
            break;
        }
    }

    // 2. Parse day names (senin, selasa, etc.)
    if (!parsedDate) {
        for (const [dayName, dayIndex] of Object.entries(DAY_NAMES)) {
            const regex = new RegExp(`\\b${dayName}\\b`, 'gi');
            if (regex.test(workingText)) {
                parsedDate = getNextDayOfWeek(dayIndex);
                workingText = workingText.replace(regex, '').trim();
                break;
            }
        }
    }

    // 3. Parse time
    for (const pattern of TIME_PATTERNS) {
        const match = pattern.regex.exec(input);
        if (match) {
            parsedTime = parseTimeMatch(match);
            if (parsedTime) {
                // Remove time text from working text
                workingText = workingText.replace(match[0], '').trim();
                break;
            }
        }
        pattern.regex.lastIndex = 0; // Reset regex
    }

    // 4. Infer tag
    const tag = inferTag(input);

    // 5. Clean up title
    let title = workingText
        .replace(/\s+/g, ' ')  // Remove extra spaces
        .replace(/^[,.\s]+|[,.\s]+$/g, '')  // Remove leading/trailing punctuation
        .trim();

    // Capitalize first letter
    if (title.length > 0) {
        title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    // 6. Infer duration
    const duration = inferDuration(input, tag);

    // 7. Format readable text
    const dateText = parsedDate ? formatDateText(parsedDate) : null;
    const timeText = parsedTime ? formatTimeText(parsedTime.hours, parsedTime.minutes) : null;
    const timeString = parsedTime
        ? `${parsedTime.hours.toString().padStart(2, '0')}:${parsedTime.minutes.toString().padStart(2, '0')}`
        : null;

    return {
        title: title || input,
        date: parsedDate,
        time: timeString,
        tag,
        duration,
        dateText,
        timeText,
        hasScheduledTime: parsedDate !== null && parsedTime !== null,
    };
}

export default parseTaskInput;
