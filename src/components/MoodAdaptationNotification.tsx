"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useEnergyStore } from "@/store/useEnergyStore";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function MoodAdaptationNotification() {
    const moodState = useAppStore((state) => state.moodState);
    // Use EnergyStore for mode to sync with page navigation
    const mode = useEnergyStore((state) => state.mode);
    const prevModeRef = useRef(mode);

    useEffect(() => {
        // Trigger only when switching TO productive mode FROM burnout/null
        // AND mood is anxious
        if (mode === "productive" && moodState === "anxious") {
            // We can check if we just came from burnout if needed, 
            // but generally if we are in productive mode and anxious, we should notify.
            // To avoid spamming, we might want to check if the toast was already shown or use a session flag.
            // For now, let's just show it.

            toast.custom((t) => (
                <div className="bg-white/80 backdrop-blur-md border border-purple-100 p-4 rounded-2xl shadow-xl flex items-start gap-3 max-w-md animate-slideDown">
                    <div className="bg-purple-100 p-2 rounded-full shrink-0">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Adaptive Mode Active</h3>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                            I noticed you're feeling anxious. I've hidden the heavy tasks for now.
                            Let's just focus on these small wins. 🌿
                        </p>
                    </div>
                </div>
            ), { duration: 5000 });
        }

        prevModeRef.current = mode;
    }, [mode, moodState]);

    return null; // Headless component
}
