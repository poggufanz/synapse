"use client";

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { TrendingUp } from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function DashboardStats() {
    const data = {
        labels: ["9AM", "12PM", "3PM", "6PM", "9PM"],
        datasets: [
            {
                label: "Energy",
                data: [65, 85, 45, 70, 50],
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                tension: 0.4,
                pointRadius: 0, // Hide points for cleaner look
                borderWidth: 4, // Thicker line
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                display: false, // Hide Y axis
                beginAtZero: true,
            },
            x: {
                grid: {
                    display: false, // Hide grid lines
                },
                ticks: {
                    font: {
                        family: "'Nunito', sans-serif",
                        weight: "bold" as const,
                    },
                },
            },
        },
        elements: {
            bar: {
                borderRadius: 20, // Chunky rounded bars
            }
        }
    };

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-soft-blue border border-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl">
                        <TrendingUp className="text-blue-600" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Energy Rhythm</h3>
                </div>
                <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold">+12%</span>
                </div>
            </div>

            <div className="flex-1 min-h-[120px]">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}
