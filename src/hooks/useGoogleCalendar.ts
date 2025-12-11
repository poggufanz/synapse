"use client";

import { useState, useEffect, useCallback } from "react";
import {
    loadGoogleScript,
    initTokenClient,
    requestAccessToken,
    isConnected as checkIsConnected,
    disconnect as googleDisconnect,
    syncTaskToCalendar,
} from "@/lib/googleCalendar";
import { toast } from "sonner";

interface UseGoogleCalendarReturn {
    isConnected: boolean;
    isLoading: boolean;
    connect: () => void;
    disconnect: () => void;
    syncTask: (title: string, date: Date, time: string, duration: number) => Promise<boolean>;
}

export function useGoogleCalendar(): UseGoogleCalendarReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isConfigured, setIsConfigured] = useState(true);

    // Initialize on mount
    useEffect(() => {
        const init = async () => {
            try {
                await loadGoogleScript();
                setIsConnected(checkIsConnected());
                setIsInitialized(true);
            } catch (error) {
                console.error("Failed to load Google scripts:", error);
            }
        };
        init();
    }, []);

    // Initialize token client when script is loaded
    useEffect(() => {
        if (!isInitialized) return;

        initTokenClient(
            (token) => {
                setIsConnected(true);
                setIsLoading(false);
                toast.success("📅 Connected to Google Calendar!");
            },
            (error) => {
                setIsLoading(false);
                // Check if it's a configuration error (not user error)
                if (error.includes("not configured")) {
                    setIsConfigured(false);
                    console.warn("Google Calendar not configured - feature disabled");
                } else {
                    toast.error(`Calendar connection failed: ${error}`);
                }
            }
        );
    }, [isInitialized]);

    const connect = useCallback(() => {
        if (!isConfigured) {
            toast.error("Google Calendar not configured. Please set up NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
            return;
        }
        setIsLoading(true);
        requestAccessToken();
    }, [isConfigured]);

    const disconnect = useCallback(() => {
        googleDisconnect();
        setIsConnected(false);
        toast.success("Disconnected from Google Calendar");
    }, []);

    const syncTask = useCallback(
        async (title: string, date: Date, time: string, duration: number): Promise<boolean> => {
            // Check if configured
            if (!isConfigured) {
                toast.error("Google Calendar not configured");
                return false;
            }
            
            // If not connected, prompt to connect first
            if (!isConnected) {
                return new Promise((resolve) => {
                    // Set up one-time listener for connection
                    const checkConnection = () => {
                        if (checkIsConnected()) {
                            // Now sync the task
                            syncTaskToCalendar(title, date, time, duration).then((result) => {
                                if (result.success) {
                                    toast.success(`📅 "${title}" added to Google Calendar!`);
                                    resolve(true);
                                } else {
                                    toast.error(`Failed to sync: ${result.error}`);
                                    resolve(false);
                                }
                            });
                        }
                    };

                    // Request access and handle callback
                    initTokenClient(
                        async () => {
                            setIsConnected(true);
                            setIsLoading(false);
                            checkConnection();
                        },
                        (error) => {
                            setIsLoading(false);
                            toast.error(`Calendar connection failed: ${error}`);
                            resolve(false);
                        }
                    );
                    setIsLoading(true);
                    requestAccessToken();
                });
            }

            // Already connected, sync directly
            const result = await syncTaskToCalendar(title, date, time, duration);
            if (result.success) {
                toast.success(`📅 "${title}" synced to Calendar!`);
                return true;
            } else {
                toast.error(`Sync failed: ${result.error}`);
                return false;
            }
        },
        [isConnected]
    );

    return {
        isConnected,
        isLoading,
        connect,
        disconnect,
        syncTask,
    };
}

export default useGoogleCalendar;
