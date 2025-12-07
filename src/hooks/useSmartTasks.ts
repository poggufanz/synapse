import { useAppStore } from "@/store/useAppStore";

export const useSmartTasks = () => {
    const tasks = useAppStore((state) => state.tasks);
    const moodState = useAppStore((state) => state.moodState);

    if (moodState === "anxious") {
        return tasks.filter((task) => {
            // Hide "Deep Work" (from tags or energy field)
            if (task.tags?.includes("Deep Work")) return false;
            if (task.energy === "Deep Work") return false;

            // Hide Low Priority (often clutter)
            if (task.priority === "low") return false;

            // Show Quick Wins or Short Tasks
            const isQuickWin = task.tags?.includes("Quick Win");
            const isRecovery = task.energy === "Recovery" || task.energy === "Shallow Work";
            const isShort = task.duration <= 25;

            return isQuickWin || isRecovery || isShort;
        });
    }

    if (moodState === "exhausted") {
        // Soft Lock: Show nothing or a single "Rest" task
        return [];
    }

    // Default: Show all
    return tasks;
};
