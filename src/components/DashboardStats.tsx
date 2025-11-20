"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function DashboardStats() {
    // Energy Rhythm Data
    const energyData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "Energy Level",
                data: [3, 4, 8, 9, 2, 4, 6],
                borderColor: "rgb(99, 102, 241)",
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
                    gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");
                    return gradient;
                },
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: "rgb(99, 102, 241)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
            },
        ],
    };

    const energyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                titleColor: "#fff",
                bodyColor: "#fff",
                padding: 12,
                displayColors: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                ticks: {
                    color: "#94a3b8",
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.1)",
                },
            },
            x: {
                ticks: {
                    color: "#94a3b8",
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    // Task Balance Data
    const taskBalanceData = {
        labels: ["Deep Work", "Shallow Work", "Recovery"],
        datasets: [
            {
                data: [40, 30, 30],
                backgroundColor: [
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                ],
                borderColor: [
                    "rgb(239, 68, 68)",
                    "rgb(59, 130, 246)",
                    "rgb(34, 197, 94)",
                ],
                borderWidth: 2,
            },
        ],
    };

    const taskBalanceOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    color: "#94a3b8",
                    padding: 15,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                titleColor: "#fff",
                bodyColor: "#fff",
                padding: 12,
            },
        },
    };

    return (
        <div className="space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Energy Rhythm Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Energy Rhythm</h3>
                    <div className="h-64">
                        <Line data={energyData} options={energyOptions} />
                    </div>
                </div>

                {/* Task Balance Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Task Balance</h3>
                    <div className="h-64">
                        <Doughnut data={taskBalanceData} options={taskBalanceOptions} />
                    </div>
                </div>
            </div>

            {/* AI Insight Card */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-indigo-200">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">🧠</div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-indigo-900 mb-2">AI Analysis</h4>
                        <p className="text-indigo-800 leading-relaxed">
                            You crashed on Thursday because you did too much Deep Work on Wednesday. Pace yourself!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
