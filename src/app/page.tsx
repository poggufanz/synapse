"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import EnergyGate from "@/components/EnergyGate";
import ProductiveView from "@/components/ProductiveView";
import BurnoutView from "@/components/BurnoutView";
import Onboarding from "@/components/Onboarding";
import TimeWarning from "@/components/TimeWarning";

export default function Home() {
    const mode = useEnergyStore((state) => state.mode);
    const persona = useEnergyStore((state) => state.persona);

    // If no persona is set, show Onboarding
    if (!persona) {
        return <Onboarding />;
    }

    return (
        <main className="min-h-screen font-sans">
            <TimeWarning />

            {!mode && <EnergyGate />}
            {mode === "productive" && <ProductiveView />}
            {mode === "burnout" && <BurnoutView />}
        </main>
    );
}
