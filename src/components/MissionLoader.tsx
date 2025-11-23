"use client";

import { Loader2 } from "lucide-react";

export default function MissionLoader() {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-fadeIn">
            <div className="relative">
                {/* Whimsical "Processing" Animation */}
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                    <Loader2 className="text-blue-600 w-12 h-12 animate-spin" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                    Thinking...
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-800">AI lagi bantuin mikir...</h3>
                <p className="text-slate-500 font-medium">Sabar ya, lagi diracik biar gampang.</p>
            </div>

            {/* Skeleton Cards */}
            <div className="w-full max-w-md space-y-3 opacity-50">
                <div className="h-20 bg-slate-100 rounded-3xl animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-3xl animate-pulse delay-100" />
                <div className="h-20 bg-slate-100 rounded-3xl animate-pulse delay-200" />
            </div>
        </div>
    );
}
