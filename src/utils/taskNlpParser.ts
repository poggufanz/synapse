// Task NLP Parser - Parse natural language task input

export interface ParsedTask {
    title: string;
    duration?: number; // in minutes
    date?: Date;
    time?: string; // time string like "14:00"
    dateText?: string; // human readable date like "Tomorrow"
    timeText?: string; // human readable time like "2:00 PM"
    tag?: string; // primary tag like "#Work"
    tags?: string[];
    priority?: "low" | "medium" | "high";
    hasScheduledTime?: boolean;
}

// Duration patterns
const DURATION_PATTERNS = [
    { pattern: /(\d+)\s*(m|min|mins|minutes?)/i, multiplier: 1 },
    { pattern: /(\d+)\s*(h|hr|hrs|hours?)/i, multiplier: 60 },
    { pattern: /(\d+(?:\.\d+)?)\s*h/i, multiplier: 60 },
];

// Time patterns
const TIME_PATTERNS = [
    { pattern: /(?:by|at|before|due)\s+(\d{1,2}):(\d{2})\s*(am|pm)?/i },
    { pattern: /(?:by|at|before|due)\s+(\d{1,2})\s*(am|pm)/i },
];

// Date patterns
const DATE_PATTERNS = [
    { pattern: /\b(today)\b/i, dayOffset: 0 },
    { pattern: /\b(tomorrow)\b/i, dayOffset: 1 },
    { pattern: /\b(monday|mon)\b/i, weekday: 1 },
    { pattern: /\b(tuesday|tue|tues)\b/i, weekday: 2 },
    { pattern: /\b(wednesday|wed)\b/i, weekday: 3 },
    { pattern: /\b(thursday|thu|thurs)\b/i, weekday: 4 },
    { pattern: /\b(friday|fri)\b/i, weekday: 5 },
    { pattern: /\b(saturday|sat)\b/i, weekday: 6 },
    { pattern: /\b(sunday|sun)\b/i, weekday: 0 },
];

// Priority keywords
const PRIORITY_KEYWORDS = {
    high: ['urgent', 'important', 'critical', 'asap', 'priority', '!'],
    low: ['later', 'sometime', 'when possible', 'low priority'],
};

// Tag patterns (words starting with #)
const TAG_PATTERN = /#(\w+)/g;

/**
 * Parse a natural language task input into structured data
 */
export function parseTaskInput(input: string): ParsedTask {
    let title = input.trim();
    let duration: number | undefined;
    let date: Date | undefined;
    let time: string | undefined;
    let dateText: string | undefined;
    let timeText: string | undefined;
    let tags: string[] = [];
    let priority: "low" | "medium" | "high" | undefined;
    let hasScheduledTime = false;

    // Extract tags
    const tagMatches = Array.from(input.matchAll(TAG_PATTERN));
    for (const match of tagMatches) {
        tags.push(`#${match[1]}`);
        title = title.replace(match[0], '').trim();
    }

    // Extract duration
    for (const { pattern, multiplier } of DURATION_PATTERNS) {
        const match = input.match(pattern);
        if (match) {
            duration = parseFloat(match[1]) * multiplier;
            title = title.replace(match[0], '').trim();
            break;
        }
    }

    // Extract time
    for (const { pattern } of TIME_PATTERNS) {
        const match = input.match(pattern);
        if (match) {
            let hours = parseInt(match[1]);
            const minutes = match[2] ? parseInt(match[2]) : 0;
            const period = (match[3] || match[2])?.toLowerCase();

            // Handle AM/PM
            if (period && period.includes('pm') && hours < 12) hours += 12;
            if (period && period.includes('am') && hours === 12) hours = 0;

            time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

            // Format for display
            const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
            const displayPeriod = hours >= 12 ? 'PM' : 'AM';
            timeText = `${displayHours}:${minutes.toString().padStart(2, '0')} ${displayPeriod}`;

            hasScheduledTime = true;
            title = title.replace(match[0], '').trim();
            break;
        }
    }

    // Extract date
    for (const datePattern of DATE_PATTERNS) {
        const match = input.match(datePattern.pattern);
        if (match) {
            const now = new Date();
            date = new Date(now);

            if ('dayOffset' in datePattern && datePattern.dayOffset !== undefined) {
                date.setDate(now.getDate() + datePattern.dayOffset);
                dateText = datePattern.dayOffset === 0 ? 'Today' : 'Tomorrow';
            } else if ('weekday' in datePattern && datePattern.weekday !== undefined) {
                const currentDay = now.getDay();
                let daysUntil = datePattern.weekday - currentDay;
                if (daysUntil <= 0) daysUntil += 7;
                date.setDate(now.getDate() + daysUntil);
                dateText = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            }

            title = title.replace(match[0], '').trim();
            break;
        }
    }

    // Detect priority
    const lowerInput = input.toLowerCase();
    for (const keyword of PRIORITY_KEYWORDS.high) {
        if (lowerInput.includes(keyword)) {
            priority = 'high';
            title = title.replace(new RegExp(keyword, 'gi'), '').trim();
            break;
        }
    }
    if (!priority) {
        for (const keyword of PRIORITY_KEYWORDS.low) {
            if (lowerInput.includes(keyword)) {
                priority = 'low';
                title = title.replace(new RegExp(keyword, 'gi'), '').trim();
                break;
            }
        }
    }
    if (!priority) {
        priority = 'medium';
    }

    // Clean up title - remove extra spaces and punctuation
    title = title.replace(/\s+/g, ' ').trim();
    title = title.replace(/^[,.\-:;]+|[,.\-:;]+$/g, '').trim();

    return {
        title,
        duration,
        date,
        time,
        dateText,
        timeText,
        tag: tags.length > 0 ? tags[0] : undefined,
        tags: tags.length > 0 ? tags : undefined,
        priority,
        hasScheduledTime,
    };
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
}

/**
 * Format deadline for display
 */
export function formatDeadline(date: Date): string {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    if (isToday) {
        return `Today at ${timeStr}`;
    }

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${timeStr}`;
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    }) + ` at ${timeStr}`;
}
