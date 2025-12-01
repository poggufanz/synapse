"use client";

import { useEffect, useState } from "react";
import { X, Moon } from "lucide-react";

export default function TimeWarning() {
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const hour = new Date().getHours();
            // Warning between 12 AM (0) and 5 AM (5)
            if (hour >= 0 && hour < 5) {
                setShowWarning(true);
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    if (!showWarning) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 animate-slideDown">
            <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-center justify-between max-w-xl mx-auto">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <Moon className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Dunia masih ada besok ✨</h3>
                        <p className="text-xs text-slate-300">Istirahat itu produktif. You deserve rest.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowWarning(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
