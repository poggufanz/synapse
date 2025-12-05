"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import EnergyGate from "@/components/EnergyGate";
import FocusCockpit from "@/components/FocusCockpit";
import BurnoutView from "@/components/BurnoutView";
import Onboarding from "@/components/Onboarding";
import TimeWarning from "@/components/TimeWarning";
import LoadingScreen from "@/components/LoadingScreen";
import { useState, useEffect } from "react";

export default function Home() {
    const mode = useEnergyStore((state) => state.mode);
    const persona = useEnergyStore((state) => state.persona);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial app loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    // If no persona is set, show Onboarding
    if (!persona) {
        return <Onboarding />;
    }

    return (
        <main className="min-h-screen font-sans">
            <TimeWarning />

            {!mode && <EnergyGate />}
            {mode === "productive" && <FocusCockpit />}
            {mode === "burnout" && <BurnoutView />}
        </main>
    );
}
