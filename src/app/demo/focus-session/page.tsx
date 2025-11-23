"use client";

import FocusSession from "@/components/FocusSession";

export default function FocusSessionDemo() {
    const sampleTasks = [
        {
            id: "1",
            title: "Read the Introduction chapter",
            duration: 25,
            isCompleted: false,
        },
        {
            id: "2",
            title: "Outline key concepts from Chapter 1",
            duration: 15,
            isCompleted: false,
        },
        {
            id: "3",
            title: "Take notes on important definitions",
            duration: 20,
            isCompleted: false,
        },
        {
            id: "4",
            title: "Create flashcards for vocabulary",
            duration: 15,
            isCompleted: false,
        },
        {
            id: "5",
            title: "Review and summarize the chapter",
            duration: 10,
            isCompleted: false,
        },
    ];

    const handleAdjustPlan = () => {
        alert("Adjust Plan clicked! (Would open edit modal)");
    };

    return (
        <FocusSession 
            initialTasks={sampleTasks} 
            onAdjustPlan={handleAdjustPlan}
        />
    );
}
