"use strict";
import React from "react";

export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-rest-cream p-10 font-sans text-slate-800">
      <h1 className="text-4xl font-bold mb-10 text-center text-focus-blue">Design System Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {/* Claymorphism Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-rest-sage-dark">Claymorphism</h2>
          
          <div className="clay p-8 flex flex-col items-center justify-center h-64 w-full bg-rest-cream">
            <p className="font-bold text-lg mb-4">Base .clay class</p>
            <button className="clay-blue px-6 py-3 font-bold rounded-2xl">
              Clay Button (Blue)
            </button>
          </div>

          <div className="clay p-8 bg-white">
             <p className="mb-4">Clay container with white background</p>
             <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full clay bg-focus-orange flex items-center justify-center text-white font-bold">
                    OR
                </div>
                <div className="w-16 h-16 rounded-full clay bg-rest-sage flex items-center justify-center text-white font-bold">
                    SG
                </div>
             </div>
          </div>
        </section>

        {/* Glassmorphism Section */}
        <section className="space-y-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-focus-blue to-focus-orange opacity-20 rounded-3xl -z-10" />
          <h2 className="text-2xl font-bold text-rest-sage-dark">Glassmorphism</h2>

          <div className="glass p-8 h-64 flex flex-col items-center justify-center rounded-2xl">
            <p className="font-bold text-lg text-slate-800">Base .glass class</p>
            <p className="text-sm text-slate-600 mt-2 text-center">
              This panel should have a backdrop blur and a subtle white border.
              The background gradient behind it should be visible but blurred.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
             <h3 className="font-bold text-xl mb-2">Glass Card</h3>
             <p>This uses the legacy .glass-card class which now extends .glass but adds a specific gradient.</p>
          </div>
        </section>
      </div>

      {/* Color Palette Section */}
      <section className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-rest-sage-dark mb-6">Bimodal Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-focus-blue shadow-lg"></div>
                <p className="text-center font-mono text-sm">focus-blue</p>
            </div>
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-focus-orange shadow-lg"></div>
                <p className="text-center font-mono text-sm">focus-orange</p>
            </div>
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-focus-white border border-slate-200 shadow-lg"></div>
                <p className="text-center font-mono text-sm">focus-white</p>
            </div>
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-rest-cream border border-slate-200 shadow-lg"></div>
                <p className="text-center font-mono text-sm">rest-cream</p>
            </div>
            <div className="space-y-2">
                <div className="h-24 rounded-xl bg-rest-sage shadow-lg"></div>
                <p className="text-center font-mono text-sm">rest-sage</p>
            </div>
        </div>
      </section>
    </div>
  );
}
