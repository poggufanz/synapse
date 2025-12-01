import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MoodState = "neutral" | "focused" | "anxious" | "exhausted";
export type EnergyMode = "productive" | "burnout" | null;

export interface Task {
    id: string;
    title: string;
    duration: number; // minutes
    isCompleted: boolean;
    isAIGenerated?: boolean;
    tags?: string[];
    priority?: "low" | "medium" | "high";
}

interface AppStore {
    // Mood & Energy
    moodState: MoodState;
    setMoodState: (mood: MoodState) => void;
    energyLevel: number;
    setEnergyLevel: (level: number) => void;

    // Mode (Synced with useEnergyStore conceptually, but managed here for new logic)
    mode: EnergyMode;
    setMode: (mode: EnergyMode) => void;

    // Tasks
    tasks: Task[];
    addTask: (task: Task) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    setTasks: (tasks: Task[]) => void;

    // Actions
    reset: () => void;
}

export const useAppStore = create<AppStore>()(
    persist(
        (set) => ({
            moodState: "neutral",
            setMoodState: (mood) => set({ moodState: mood }),
            energyLevel: 80,
            setEnergyLevel: (level) => set({ energyLevel: level }),

            mode: null,
            setMode: (mode) => set({ mode }),

            tasks: [
                {
                    id: "1",
                    title: "Read Chapter 1: Introduction to React",
                    duration: 25,
                    isCompleted: false,
                    isAIGenerated: true,
                    tags: ["Deep Work"],
                    priority: "high"
                },
                {
                    id: "2",
                    title: "Take notes on key concepts",
                    duration: 15,
                    isCompleted: false,
                    isAIGenerated: true,
                    tags: ["Shallow Work"],
                    priority: "medium"
                },
                {
                    id: "3",
                    title: "Review email inbox",
                    duration: 10,
                    isCompleted: false,
                    isAIGenerated: false,
                    tags: ["Personal"],
                    priority: "low"
                },
            ],
            addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
            toggleTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
                    ),
                })),
            deleteTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                })),
            setTasks: (tasks) => set({ tasks }),

            reset: () => set({ moodState: "neutral", energyLevel: 80, mode: null }),
        }),
        {
            name: "synapse-app-storage",
        }
    )
);
