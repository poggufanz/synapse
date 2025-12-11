/**
 * Google Calendar API Integration
 * Uses Google Identity Services for OAuth and Calendar API for event creation
 */

// Google's client library types
declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: TokenClientConfig) => TokenClient;
                };
            };
        };
    }
}

interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: ErrorResponse) => void;
}

interface TokenClient {
    requestAccessToken: (options?: { prompt?: string }) => void;
}

interface TokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    error?: string;
}

interface ErrorResponse {
    type: string;
    message: string;
}

interface CalendarEvent {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const STORAGE_KEY = "synapse_google_token";

let tokenClient: TokenClient | null = null;
let isGsiLoaded = false;

/**
 * Load Google Identity Services script
 */
export async function loadGoogleScript(): Promise<void> {
    if (isGsiLoaded) return;

    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google?.accounts?.oauth2) {
            isGsiLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            isGsiLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
        document.head.appendChild(script);
    });
}

/**
 * Initialize Google OAuth token client
 */
export function initTokenClient(onSuccess: (token: string) => void, onError?: (error: string) => void): void {
    if (!window.google?.accounts?.oauth2) {
        onError?.("Google Identity Services not loaded");
        return;
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: CALENDAR_SCOPE,
        callback: (response: TokenResponse) => {
            if (response.error) {
                onError?.(response.error);
                return;
            }
            // Store token with expiry
            const tokenData = {
                access_token: response.access_token,
                expires_at: Date.now() + response.expires_in * 1000,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenData));
            onSuccess(response.access_token);
        },
        error_callback: (error: ErrorResponse) => {
            onError?.(error.message || "OAuth error");
        },
    });
}

/**
 * Request access token (triggers OAuth popup)
 */
export function requestAccessToken(): void {
    if (!tokenClient) {
        console.error("Token client not initialized");
        return;
    }
    tokenClient.requestAccessToken({ prompt: "" });
}

/**
 * Get stored access token if valid
 */
export function getStoredToken(): string | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const tokenData = JSON.parse(stored);
        // Check if expired (with 5 min buffer)
        if (tokenData.expires_at < Date.now() + 300000) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return tokenData.access_token;
    } catch {
        return null;
    }
}

/**
 * Check if user is connected to Google Calendar
 */
export function isConnected(): boolean {
    return getStoredToken() !== null;
}

/**
 * Disconnect from Google Calendar
 */
export function disconnect(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(event: CalendarEvent): Promise<{ success: boolean; eventId?: string; error?: string }> {
    const token = getStoredToken();
    if (!token) {
        return { success: false, error: "Not authenticated" };
    }

    const calendarEvent = {
        summary: event.title,
        description: event.description || "Created by Synapse",
        start: {
            dateTime: event.startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
            dateTime: event.endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
    };

    try {
        const response = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(calendarEvent),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.error?.message || "Failed to create event" };
        }

        const data = await response.json();
        return { success: true, eventId: data.id };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

/**
 * Create event from parsed task
 */
export async function syncTaskToCalendar(
    title: string,
    date: Date,
    time: string,
    durationMinutes: number
): Promise<{ success: boolean; eventId?: string; error?: string }> {
    // Parse time string (HH:MM)
    const [hours, minutes] = time.split(":").map(Number);

    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    return createCalendarEvent({
        title,
        startTime,
        endTime,
    });
}
