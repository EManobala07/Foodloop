import React from 'react';

interface WeeklyTrendProps {
  data: { day: string; prepared: number; wasted: number; saved: number }[];
}

export const WeeklyWasteChart: React.FC<WeeklyTrendProps> = ({ data }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.prepared, d.wasted, d.saved)), 100);
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 40;
  const barWidth = 14;
  const gap = (chartWidth - paddingX * 2) / (data.length - 1 || 1);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[460px]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 50}`} className="w-full h-52">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight - ratio * (chartHeight - 30) + 10;
            const val = Math.round(ratio * maxVal);
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={chartWidth - 10} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={paddingX - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                  {val}k
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, idx) => {
            const centerX = paddingX + idx * gap;
            const prepH = (item.prepared / maxVal) * (chartHeight - 30);
            const wasteH = (item.wasted / maxVal) * (chartHeight - 30);
            const savedH = (item.saved / maxVal) * (chartHeight - 30);

            const prepY = chartHeight + 10 - prepH;
            const wasteY = chartHeight + 10 - wasteH;
            const savedY = chartHeight + 10 - savedH;

            return (
              <g key={item.day} className="group cursor-pointer">
                {/* Prepared (slate-200) */}
                <rect
                  x={centerX - barWidth * 1.5}
                  y={prepY}
                  width={barWidth}
                  height={prepH}
                  rx="3"
                  className="fill-slate-200 transition-all duration-300 group-hover:fill-slate-300"
                />
                {/* Wasted (orange-500) */}
                <rect
                  x={centerX - barWidth * 0.5}
                  y={wasteY}
                  width={barWidth}
                  height={wasteH}
                  rx="3"
                  className="fill-orange-500 transition-all duration-300 group-hover:fill-orange-600"
                />
                {/* Saved (emerald-500) */}
                <rect
                  x={centerX + barWidth * 0.5}
                  y={savedY}
                  width={barWidth}
                  height={savedH}
                  rx="3"
                  className="fill-emerald-600 transition-all duration-300 group-hover:fill-emerald-700"
                />
                {/* Day label */}
                <text x={centerX} y={chartHeight + 30} textAnchor="middle" fontSize="12" fontWeight="600" fill="#475569">
                  {item.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-1 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200 inline-block"></span>
            <span>Food Prepared (kg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-500 inline-block"></span>
            <span>Food Wasted (kg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
            <span>Food Saved (kg)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MealBreakdownProps {
  data: Record<string, number>;
}

export const MealBreakdownChart: React.FC<MealBreakdownProps> = ({ data }) => {
  const meals = [
    { label: 'Breakfast', color: '#f59e0b', icon: '🌅' },
    { label: 'Lunch', color: '#10b981', icon: '☀️' },
    { label: 'Snacks', color: '#8b5cf6', icon: '☕' },
    { label: 'Dinner', color: '#ea580c', icon: '🌙' }
  ];

  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-3.5">
      {meals.map(m => {
        const value = data[m.label] || 0;
        const pct = Math.round((value / total) * 100);
        return (
          <div key={m.label} className="group">
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </span>
              <span className="text-slate-600">
                {value.toFixed(1)} kg <span className="text-slate-400 font-normal">({pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(4, pct))}%`, backgroundColor: m.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface WasteGaugeProps {
  percentage: number;
}

export const WasteGauge: React.FC<WasteGaugeProps> = ({ percentage }) => {
  const radius = 54;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Semi-circle arc
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * (circumference * 0.75);

  const getStatusColor = (val: number) => {
    if (val < 10) return { text: 'text-emerald-600', ring: '#10b981', label: 'Optimal Control' };
    if (val < 20) return { text: 'text-amber-500', ring: '#f59e0b', label: 'Moderate Waste' };
    return { text: 'text-orange-600', ring: '#ea580c', label: 'High Wastage' };
  };

  const status = getStatusColor(percentage);

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={status.ring}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{percentage}%</span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Waste Ratio</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${percentage < 15 ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
          {status.label}
        </span>
        <p className="text-[11px] text-slate-500 mt-1">
          Formula: (Wasted / Prepared) × 100
        </p>
      </div>
    </div>
  );
};
