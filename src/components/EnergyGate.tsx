"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowRight, Zap, BatteryWarning, Brain, Target, Sparkles, Sun, Coffee, Moon, Cloud, Smile } from "lucide-react";

export default function EnergyGate() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 relative overflow-hidden font-sans">
            {/* Floating Greeting - Responsive Positioning */}
            <div className="absolute top-4 md:top-6 left-0 right-0 z-30 text-center pointer-events-none px-4">
                <div className="inline-block bg-white/90 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-2xl md:rounded-3xl shadow-lg border border-white/50 animate-fadeIn max-w-full">
                    <h1 className="text-sm md:text-xl font-bold text-slate-700 truncate">
                        Halo {persona?.name || "Teman"}, bagaimana kabarmu?
                    </h1>
                </div>
            </div>

            {/* Productive Side */}
            <div
                className="flex-1 relative group cursor-pointer overflow-hidden transition-all duration-700 ease-out hover:flex-[1.5] bg-gradient-to-br from-blue-50 via-white to-blue-100 border-b-4 md:border-b-0 md:border-r-4 border-white/50 flex flex-col justify-center"
                onClick={() => setMode("productive")}
            >
                {/* Decor: Blue Blobs */}
                <div className="absolute top-[-20%] left-[-20%] w-48 h-48 md:w-96 md:h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
                <div className="absolute bottom-[10%] right-[10%] w-32 h-32 md:w-48 md:h-48 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-2000" />
                
                {/* Decor: Geometric Accents & Icons */}
                <div className="absolute top-20 left-10 opacity-20 group-hover:opacity-40 transition-opacity hidden md:block animate-float">
                    <Zap size={48} className="text-blue-300 rotate-12" />
                </div>
                <div className="absolute bottom-20 right-10 opacity-20 group-hover:opacity-40 transition-opacity hidden md:block animate-float animation-delay-2000">
                    <div className="w-12 h-12 border-4 border-blue-300 rounded-full" />
                </div>
                <div className="absolute top-[15%] right-[20%] opacity-10 group-hover:opacity-30 transition-opacity animate-float animation-delay-1000">
                    <Brain size={64} className="text-blue-400 -rotate-12" />
                </div>
                <div className="absolute bottom-[30%] left-[15%] opacity-10 group-hover:opacity-30 transition-opacity animate-float animation-delay-3000">
                    <Target size={56} className="text-blue-400 rotate-6" />
                </div>
                <div className="absolute top-[40%] left-[5%] opacity-10 group-hover:opacity-30 transition-opacity animate-pulse">
                    <Sun size={40} className="text-yellow-400" />
                </div>
                <div className="absolute bottom-[10%] right-[30%] opacity-10 group-hover:opacity-30 transition-opacity animate-float animation-delay-1500">
                    <Sparkles size={32} className="text-cyan-400" />
                </div>

                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/0 via-blue-200/20 to-blue-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center pt-20 pb-10 md:py-0">
                    {/* Massive Emoji Icon */}
                    <div className="mb-4 md:mb-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                        <span className="text-[80px] md:text-[180px] leading-none filter drop-shadow-2xl group-hover:drop-shadow-[0_30px_50px_rgba(59,130,246,0.5)] transition-all duration-500">
                            ⚡
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-5xl font-black text-slate-800 mb-2 md:mb-4 tracking-tight transition-all duration-500 group-hover:text-blue-700">
                        Aku Punya Energi
                    </h2>

                    <p className="text-slate-600 text-sm md:text-xl max-w-[250px] md:max-w-md font-medium leading-relaxed opacity-90 md:opacity-80 group-hover:opacity-100 transition-opacity">
                        Siap bergerak dan menyelesaikan hal penting.
                    </p>

                    {/* Enhanced CTA */}
                    <div className="mt-6 md:mt-12 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-500 md:translate-y-8 group-hover:translate-y-0">
                        <div className="inline-flex items-center gap-2 md:gap-3 bg-blue-600 text-white font-black text-sm md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-2xl shadow-xl shadow-blue-200 border-b-4 border-blue-800 hover:border-b-0 hover:translate-y-1 transition-all">
                            Mulai Fokus <ArrowRight size={20} className="animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Burnout Side */}
            <div
                className="flex-1 relative group cursor-pointer overflow-hidden transition-all duration-700 ease-out hover:flex-[1.5] bg-gradient-to-br from-orange-50 via-[#F5F0E6] to-amber-100 flex flex-col justify-center"
                onClick={() => setMode("burnout")}
            >
                {/* Decor: Warm Blobs */}
                <div className="absolute top-[10%] right-[-10%] w-48 h-48 md:w-96 md:h-96 bg-orange-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
                <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 md:w-56 md:h-56 bg-amber-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob" />

                {/* Decor: Geometric Accents & Icons */}
                <div className="absolute top-20 right-10 opacity-20 group-hover:opacity-40 transition-opacity hidden md:block animate-float">
                    <BatteryWarning size={48} className="text-orange-300 -rotate-12" />
                </div>
                <div className="absolute bottom-20 left-10 opacity-20 group-hover:opacity-40 transition-opacity hidden md:block animate-float animation-delay-2000">
                    <div className="w-12 h-12 border-4 border-orange-300 rounded-xl rotate-45" />
                </div>
                <div className="absolute top-[15%] left-[20%] opacity-10 group-hover:opacity-30 transition-opacity animate-float animation-delay-1000">
                    <Coffee size={64} className="text-amber-500 rotate-12" />
                </div>
                <div className="absolute bottom-[30%] right-[15%] opacity-10 group-hover:opacity-30 transition-opacity animate-float animation-delay-3000">
                    <Moon size={56} className="text-indigo-400 -rotate-6" />
                </div>
                <div className="absolute top-[40%] right-[5%] opacity-10 group-hover:opacity-30 transition-opacity animate-pulse">
                    <Cloud size={40} className="text-slate-400" />
                </div>
                <div className="absolute bottom-[10%] left-[30%] opacity-10 group-hover:opacity-30 transition-opacity animate-float animation-delay-1500">
                    <Smile size={32} className="text-orange-400" />
                </div>

                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/0 via-orange-200/20 to-orange-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center pt-10 pb-20 md:py-0">
                    {/* Massive Emoji Icon */}
                    <div className="mb-4 md:mb-8 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6">
                        <span className="text-[80px] md:text-[180px] leading-none filter drop-shadow-2xl group-hover:drop-shadow-[0_30px_50px_rgba(249,115,22,0.5)] transition-all duration-500">
                            🔋
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-5xl font-black text-slate-800 mb-2 md:mb-4 tracking-tight transition-all duration-500 group-hover:text-orange-700">
                        Aku Sedang Lelah
                    </h2>

                    <p className="text-slate-600 text-sm md:text-xl max-w-[250px] md:max-w-md font-medium leading-relaxed opacity-90 md:opacity-80 group-hover:opacity-100 transition-opacity">
                        Tidak apa-apa untuk beristirahat.
                    </p>

                    {/* Enhanced CTA */}
                    <div className="mt-6 md:mt-12 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-500 md:translate-y-8 group-hover:translate-y-0">
                        <div className="inline-flex items-center gap-2 md:gap-3 bg-orange-600 text-white font-black text-sm md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-2xl shadow-xl shadow-orange-200 border-b-4 border-orange-800 hover:border-b-0 hover:translate-y-1 transition-all">
                            Masuk ke "Gua" <ArrowRight size={20} className="animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
