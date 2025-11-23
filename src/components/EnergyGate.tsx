"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowRight } from "lucide-react";

export default function EnergyGate() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 relative overflow-hidden">
            {/* Productive Side */}
            <div
                className="flex-1 relative group cursor-pointer overflow-hidden transition-all duration-700 ease-out hover:flex-[2] bg-gradient-to-br from-blue-50 via-white to-blue-100"
                onClick={() => setMode("productive")}
            >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/0 via-blue-200/20 to-blue-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Glow effect */}
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(59,130,246,0.1)] group-hover:shadow-[inset_0_0_150px_rgba(59,130,246,0.3)] transition-all duration-700" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 transition-all duration-700 group-hover:scale-105">
                    {/* Massive Emoji Icon */}
                    <div className="mb-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                        <span className="text-[160px] leading-none drop-shadow-2xl filter group-hover:drop-shadow-[0_20px_40px_rgba(59,130,246,0.4)]">⚡</span>
                    </div>

                    <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight transition-all duration-500 group-hover:text-blue-700 group-hover:scale-110">
                        I have energy
                    </h2>

                    <p className="text-slate-600 text-xl max-w-md font-medium leading-relaxed transition-opacity duration-500 group-hover:opacity-80">
                        Let's crush some goals{persona?.name ? `, ${persona.name}` : ""}.
                    </p>

                    {/* Enhanced CTA */}
                    <div className="mt-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <div className="inline-flex items-center gap-3 bg-blue-600 text-white font-black text-lg px-8 py-4 rounded-full shadow-xl border-b-4 border-blue-800 hover:border-b-0 hover:translate-y-1 transition-all">
                            Enter Focus Mode <ArrowRight size={24} className="animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Dimming overlay for non-hovered state when other side is hovered */}
                <div className="absolute inset-0 bg-black/0 transition-all duration-700 peer-hover:bg-black/20 pointer-events-none" />
            </div>

            {/* Burnout Side */}
            <div
                className="flex-1 relative group cursor-pointer overflow-hidden transition-all duration-700 ease-out hover:flex-[2] bg-gradient-to-br from-orange-50 via-[#F5F0E6] to-amber-100 peer"
                onClick={() => setMode("burnout")}
            >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/0 via-orange-200/20 to-orange-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Warm glow effect */}
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(249,115,22,0.1)] group-hover:shadow-[inset_0_0_150px_rgba(249,115,22,0.3)] transition-all duration-700" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 transition-all duration-700 group-hover:scale-105">
                    {/* Massive Emoji Icon */}
                    <div className="mb-8 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6">
                        <span className="text-[160px] leading-none drop-shadow-2xl filter group-hover:drop-shadow-[0_20px_40px_rgba(249,115,22,0.4)]">🔋</span>
                    </div>

                    <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight transition-all duration-500 group-hover:text-orange-700 group-hover:scale-110">
                        I'm drained
                    </h2>

                    <p className="text-slate-600 text-xl max-w-md font-medium leading-relaxed transition-opacity duration-500 group-hover:opacity-80">
                        It's okay to rest. Let's recharge.
                    </p>

                    {/* Enhanced CTA */}
                    <div className="mt-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <div className="inline-flex items-center gap-3 bg-orange-600 text-white font-black text-lg px-8 py-4 rounded-full shadow-xl border-b-4 border-orange-800 hover:border-b-0 hover:translate-y-1 transition-all">
                            Enter The Cave <ArrowRight size={24} className="animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
