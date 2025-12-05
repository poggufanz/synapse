import React from 'react';

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-rest-cream p-10 font-sans text-slate-700">
      <h1 className="text-4xl font-bold mb-10 text-rest-sage-dark">Design System Showcase</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-rest-sage-dark">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-focus-blue shadow-md"></div>
            <p className="font-bold">Focus Blue</p>
            <p className="text-sm opacity-70">#3B82F6</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-focus-orange shadow-md"></div>
            <p className="font-bold">Focus Orange</p>
            <p className="text-sm opacity-70">#F97316</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-rest-cream border border-slate-200"></div>
            <p className="font-bold">Rest Cream</p>
            <p className="text-sm opacity-70">#FDFBF7</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-rest-sage shadow-md"></div>
            <p className="font-bold">Rest Sage</p>
            <p className="text-sm opacity-70">#8DA399</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-2xl bg-rest-sage-dark shadow-md"></div>
            <p className="font-bold">Sage Dark</p>
            <p className="text-sm opacity-70">#4A5D53</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-rest-sage-dark">Claymorphism</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="clay-md p-8 flex flex-col items-center justify-center h-64">
            <p className="text-xl font-bold mb-2">Clay Card</p>
            <p className="text-center opacity-70">Soft shadows and inner highlights create a tactile feel.</p>
          </div>
          <div className="clay-blue p-8 flex flex-col items-center justify-center h-64 rounded-3xl">
            <p className="text-xl font-bold mb-2">Clay Blue</p>
            <p className="text-center opacity-90">Vibrant and tactile.</p>
          </div>
          <div className="flex flex-col gap-4 justify-center items-center">
             <button className="btn-clay btn-clay-blue py-4 px-8 text-lg">
                Clay Button
             </button>
             <button className="btn-clay btn-clay-white py-4 px-8 text-lg">
                White Clay
             </button>
          </div>
        </div>
      </section>

      <section className="mb-12 relative overflow-hidden rounded-3xl p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-focus-blue to-purple-600 opacity-20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-focus-orange rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-40"></div>
        
        <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6 text-rest-sage-dark">Glassmorphism</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-2xl h-64 flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-2">Glass Panel</h3>
                <p>Backdrop blur with a subtle white tint and border.</p>
            </div>
            <div className="glass-card p-8 rounded-2xl h-64 flex flex-col justify-center text-slate-800">
                <h3 className="text-xl font-bold mb-2">Glass Card</h3>
                <p>Gradient overlay with blur for a frostier look.</p>
            </div>
            </div>
        </div>
      </section>
    </div>
  );
}
