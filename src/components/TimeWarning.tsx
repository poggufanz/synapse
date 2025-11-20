"use client";

import { useState, useEffect } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { Moon, BatteryWarning } from "lucide-react";

export default function TimeWarning() {
    const setMode = useEnergyStore((state) => state.setMode);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const hour = now.getHours();
            // Check if time is between 12 AM (0) and 5 AM (5)
            if (hour >= 0 && hour < 5) {
                setShowWarning(true);
            }
        };

        checkTime();
        // Optional: Check every minute if the app is left open
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <Moon className="text-indigo-400" size={40} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">It's late. really late.</h3>
                <p className="text-slate-400 mb-8 leading-relaxed text-lg relative z-10">
                    Your brain needs rest to function tomorrow. Pushing through now usually means burnout later.
                </p>

                <div className="flex flex-col gap-3 relative z-10">
                    <button
                        onClick={() => {
                            setShowWarning(false);
                            setMode("burnout");
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-500/25"
                    >
                        <BatteryWarning size={20} />
                        Aku lemes (I'm tired)
                    </button>
                    <button
                        onClick={() => setShowWarning(false)}
                        className="w-full bg-transparent hover:bg-slate-800 text-slate-500 hover:text-slate-300 py-3 rounded-xl transition-colors text-sm"
                    >
                        I need to finish this one thing
                    </button>
                </div>
            </div>
        </div>
    );
}
