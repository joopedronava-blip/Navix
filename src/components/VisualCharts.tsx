import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Transaction, TransactionCategory } from '../types';
import { CATEGORIES_CONFIG } from '../data';

interface VisualChartsProps {
  transactions: Transaction[];
}

export default function VisualCharts({ transactions }: VisualChartsProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const [timeRange, setTimeRange] = useState<'7days' | 'june'>('june');

  // --- 1. Line/Area Chart Data Preparation (Cash Flow trend) ---
  const dailyBalances = React.useMemo(() => {
    if (timeRange === '7days') {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      }).reverse(); // Latest to oldest

      const chronologicalDays = [...last7Days].reverse();

      return chronologicalDays.map((date) => {
        const totalBeforeAndOnDate = transactions
          .filter((tx) => tx.date <= date)
          .reduce((acc, tx) => acc + tx.amount, 10000); // Base of 10k
        
        const [_, month, day] = date.split('-');
        return {
          dateLabel: `${day}/${month}`,
          showLabel: true,
          balance: totalBeforeAndOnDate,
        };
      });
    } else {
      // June 2026 (30 days) - Last complete month
      const juneDays = Array.from({ length: 30 }, (_, i) => {
        const dayStr = String(i + 1).padStart(2, '0');
        return `2026-06-${dayStr}`;
      });

      return juneDays.map((date, idx) => {
        const totalBeforeAndOnDate = transactions
          .filter((tx) => tx.date <= date)
          .reduce((acc, tx) => acc + tx.amount, 8000); // Base of 8k for June

        const [_, month, day] = date.split('-');
        const dayNum = idx + 1;
        return {
          dateLabel: `${day}/${month}`,
          showLabel: dayNum === 1 || dayNum === 5 || dayNum === 10 || dayNum === 15 || dayNum === 20 || dayNum === 25 || dayNum === 30,
          balance: totalBeforeAndOnDate,
        };
      });
    }
  }, [timeRange, transactions]);

  // Calculate coordinates for SVG
  const chartWidth = 500;
  const chartHeight = 160;
  const padding = 25;

  const minBalance = Math.min(...dailyBalances.map(d => d.balance));
  const maxBalance = Math.max(...dailyBalances.map(d => d.balance));
  const balanceRange = maxBalance - minBalance || 1;

  const points = dailyBalances.map((d, idx) => {
    const x = padding + (idx / (dailyBalances.length - 1)) * (chartWidth - padding * 2);
    // Y is inverted in SVG, padding at top and bottom
    const y = chartHeight - padding - ((d.balance - minBalance) / balanceRange) * (chartHeight - padding * 2);
    return { x, y, label: d.dateLabel, value: d.balance, showLabel: d.showLabel };
  });

  // Build SVG path (curved line)
  let linePath = '';
  let areaPath = '';

  if (points.length > 1) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Create smooth bezier curve
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    // Area path closes the shape to the bottom of chart
    areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;
  }

  // --- 2. Donut Chart Data Preparation (Expense Categories) ---
  const expenses = transactions.filter(tx => tx.type === 'expense');
  const totalExpensesAmount = Math.abs(expenses.reduce((sum, tx) => sum + tx.amount, 0));

  const categoryShares: { category: TransactionCategory; amount: number; percentage: number; color: string }[] = [];
  
  // Group by category
  const categories: TransactionCategory[] = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saúde',
    'Educação',
    'Outros',
  ];

  categories.forEach(cat => {
    const catAmount = Math.abs(
      expenses.filter(tx => tx.category === cat).reduce((sum, tx) => sum + tx.amount, 0)
    );
    if (catAmount > 0) {
      categoryShares.push({
        category: cat,
        amount: catAmount,
        percentage: totalExpensesAmount > 0 ? (catAmount / totalExpensesAmount) * 100 : 0,
        color: CATEGORIES_CONFIG[cat]?.color || 'text-slate-500',
      });
    }
  });

  // Sort descending by share
  categoryShares.sort((a, b) => b.amount - a.amount);

  // Donut SVG parameters
  const donutSize = 130;
  const radius = 45;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Track dash offsets
  let accumulatedPercentage = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Cash Flow Area Chart */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 shadow-xs lg:col-span-7 flex flex-col justify-between">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-semibold text-white text-base">
              Evolução do Saldo
            </h3>
            <p className="text-xs text-zinc-400">
              {timeRange === 'june' ? 'Evolução patrimonial do último mês completo (Junho)' : 'Patrimônio líquido acumulado nos últimos 7 dias'}
            </p>
          </div>
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850/80 self-start sm:self-auto">
            <button
              onClick={() => setTimeRange('june')}
              className={`px-3 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                timeRange === 'june' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mês Completo (Jun)
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                timeRange === '7days' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Últimos 7 dias
            </button>
          </div>
        </div>

        {/* Chart SVG */}
        <div className="relative w-full overflow-hidden flex-1 flex items-center justify-center">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Grids */}
            <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#18181b" strokeWidth="1" />
            <line x1={padding} y1={(chartHeight) / 2} x2={chartWidth - padding} y2={(chartHeight) / 2} stroke="#18181b" strokeWidth="1" />
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#27272a" strokeWidth="1" />

            {/* Gradient under line */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {areaPath && (
              <path d={areaPath.replace(/#4f46e5/g, '#10b981')} fill="url(#chartGradient)" />
            )}

            {/* Main Trend Line */}
            {linePath && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                d={linePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Interactive Points / Hover Triggers */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#09090b"
                  stroke="#10b981"
                  strokeWidth="2"
                  className="transition-all duration-200 cursor-pointer hover:r-5"
                  onMouseEnter={() => setHoveredPoint(pt)}
                />
                
                {/* Invisible larger hover catcher */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="15"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                />

                {/* X labels */}
                {pt.showLabel && (
                  <text
                    x={pt.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    className="fill-zinc-500 font-sans font-medium text-[10px]"
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            ))}

            {/* Vertical Line on Hover */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={padding}
                x2={hoveredPoint.x}
                y2={chartHeight - padding}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
            )}
          </svg>

          {/* Interactive Tooltip Overlay */}
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bg-zinc-950 text-white rounded-lg px-2.5 py-1.5 shadow-md border border-zinc-850 text-[11px] font-semibold pointer-events-none"
              style={{
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: `${(hoveredPoint.y / chartHeight) * 100 - 30}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="text-zinc-500 text-[9px] font-normal leading-none mb-0.5">{hoveredPoint.label}</div>
              <div className="font-mono text-emerald-400">{formatCurrency(hoveredPoint.value)}</div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 2. Donut Expense Distribution Chart */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 shadow-xs lg:col-span-5 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-semibold text-white text-base">
            Distribuição de Gastos
          </h3>
          <p className="text-xs text-zinc-400">Classificação percentual das despesas</p>
        </div>

        {categoryShares.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-zinc-500">Nenhuma despesa registrada para exibir.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            {/* Donut SVG */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`} className="transform -rotate-90">
                <circle
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={radius}
                  fill="transparent"
                  stroke="#18181b"
                  strokeWidth={strokeWidth}
                />
                {categoryShares.map((share, idx) => {
                  const dashArray = `${(share.percentage / 100) * circumference} ${circumference}`;
                  const dashOffset = circumference - (accumulatedPercentage / 100) * circumference;
                  accumulatedPercentage += share.percentage;

                  let colorHex = '#71717a'; // Fallback
                  if (share.category === 'Alimentação') colorHex = '#f97316';
                  if (share.category === 'Transporte') colorHex = '#3b82f6';
                  if (share.category === 'Moradia') colorHex = '#a855f7';
                  if (share.category === 'Lazer') colorHex = '#ec4899';
                  if (share.category === 'Saúde') colorHex = '#f43f5e';
                  if (share.category === 'Educação') colorHex = '#f59e0b';

                  const isActive = activeCategoryIndex === idx;

                  return (
                    <circle
                      key={share.category}
                      cx={donutSize / 2}
                      cy={donutSize / 2}
                      r={radius}
                      fill="transparent"
                      stroke={colorHex}
                      strokeWidth={isActive ? strokeWidth + 3 : strokeWidth}
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Total Expenses Metric inside donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] uppercase font-semibold text-zinc-500">Total</span>
                <span className="text-xs font-bold text-white leading-none">
                  {formatCurrency(totalExpensesAmount)}
                </span>
              </div>
            </div>

            {/* Legend breakdown */}
            <div className="flex-1 space-y-1.5 w-full">
              {categoryShares.map((share, idx) => {
                const config = CATEGORIES_CONFIG[share.category] || { color: 'text-zinc-400', bgColor: 'bg-zinc-800' };
                const isActive = activeCategoryIndex === idx;
                return (
                  <div
                    key={share.category}
                    className={`flex items-center justify-between p-1.5 rounded-lg border transition-all text-xs ${
                      isActive ? 'bg-zinc-800/60 border-zinc-700' : 'bg-transparent border-transparent'
                    }`}
                    onMouseEnter={() => setActiveCategoryIndex(idx)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}></span>
                      <span className="font-medium text-zinc-300">{share.category}</span>
                    </div>
                    <div className="text-right font-semibold text-zinc-100">
                      <span>{share.percentage.toFixed(0)}%</span>
                      <span className="text-[10px] text-zinc-500 font-normal ml-1">({formatCurrency(share.amount)})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
