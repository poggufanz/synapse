"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import EnergyGate from "@/components/EnergyGate";
import ProductiveView from "@/components/ProductiveView";
import BurnoutView from "@/components/BurnoutView";
import TimeWarning from "@/components/TimeWarning";
import Onboarding from "@/components/Onboarding";

export default function Home() {
  const mode = useEnergyStore((state) => state.mode);
  const persona = useEnergyStore((state) => state.persona);

  // Onboarding Flow
  if (!persona) {
    return <Onboarding />;
  }

  // Show EnergyGate if mode is null
  if (mode === null) {
    return (
      <>
        <TimeWarning />
        <EnergyGate />
      </>
    );
  }

  // Productive mode
  if (mode === "productive") {
    return (
      <>
        <TimeWarning />
        <ProductiveView />
      </>
    );
  }

  // Burnout mode
  return <BurnoutView />;
}
