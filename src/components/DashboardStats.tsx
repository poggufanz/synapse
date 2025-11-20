
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Activity, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardStats() {
  // Scientific Energy Rhythm (Circadian-like)
  const lineData = {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'],
    datasets: [
      {
        label: 'Predicted Cognitive Energy',
        data: [40, 85, 70, 60, 80, 50, 30],
        borderColor: 'rgb(59, 130, 246)', // Blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4, // Smooth curve
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Circadian Energy Rhythm',
        color: '#a1a1aa', // Zinc-400
        font: { family: 'Inter, sans-serif', size: 12 },
      },
    },
    scales: {
      y: {
        grid: { color: '#27272a' }, // Zinc-800
        ticks: { color: '#71717a' }, // Zinc-500
        min: 0,
        max: 100,
      },
      x: {
        grid: { display: false },
        ticks: { color: '#71717a' },
      },
    },
  };

  // Focus State Distribution
  const doughnutData = {
    labels: ['Super Focus', 'Low Focus', 'Recovery'],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green-500 (Super Focus)
          'rgba(234, 179, 8, 0.8)', // Yellow-500 (Low Focus)
          'rgba(59, 130, 246, 0.8)', // Blue-500 (Recovery)
        ],
        borderColor: '#18181b', // Zinc-950
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#a1a1aa', usePointStyle: true, pointStyle: 'circle' },
      },
    },
  };

  return (
    <div className="w-full mb-8 animate-in fade-in zoom-in duration-500 delay-150">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-blue-400" />
            <h3 className="text-sm font-medium text-zinc-400">Energy Projection</h3>
          </div>
          <div className="h-48">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-yellow-400" />
            <h3 className="text-sm font-medium text-zinc-400">Focus Distribution</h3>
          </div>
          <div className="h-48 flex justify-center relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center mt-[-20px]">
                <span className="text-2xl font-bold text-white">45%</span>
                <p className="text-[10px] text-zinc-500 uppercase">Peak</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="mt-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 p-4 rounded-xl flex items-start gap-4">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
          <Activity size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-200 mb-1">Neural Analysis</h4>
          <p className="text-xs text-blue-100/70 leading-relaxed">
            Your circadian rhythm suggests a cognitive peak at <strong>09:00 AM</strong>. 
            Currently in a <span className="text-green-400">High Performance</span> window. 
            Recommended: Tackle complex logic now, save administrative tasks for 3 PM.
          </p>
        </div>
      </div>
    </div>
  );
}
