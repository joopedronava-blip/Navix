import React from 'react';
import { Budget } from '../types';
import { CATEGORIES_CONFIG } from '../data';

interface BudgetCardsProps {
  budgets: Budget[];
}

export default function BudgetCards({ budgets }: BudgetCardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-white text-base">
          Metas & Limites de Gastos
        </h3>
        <p className="text-xs text-zinc-400">Orçamento mensal por categoria</p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {budgets.map((b) => {
          const percentage = Math.min(100, (b.spent / b.limit) * 100);
          
          // Determine progress bar color
          let progressColor = 'bg-emerald-500';
          let textColor = 'text-emerald-400';
          let bgColor = 'bg-emerald-950/40 border border-emerald-800/20';

          if (percentage >= 85) {
            progressColor = 'bg-rose-500';
            textColor = 'text-rose-400';
            bgColor = 'bg-rose-950/40 border border-rose-800/20';
          } else if (percentage >= 60) {
            progressColor = 'bg-amber-500';
            textColor = 'text-amber-400';
            bgColor = 'bg-amber-950/40 border border-amber-800/20';
          }

          const catConfig = CATEGORIES_CONFIG[b.category] || { color: 'text-zinc-400', bgColor: 'bg-zinc-800', icon: 'HelpCircle' };

          return (
            <div id={`budget-item-${b.category}`} key={b.category} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${catConfig.color.replace('text-', 'bg-')}`}></span>
                  <span className="font-semibold text-zinc-300">{b.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">{formatCurrency(b.spent)}</span>
                  <span className="text-zinc-500"> / {formatCurrency(b.limit)}</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className={`px-1.5 py-0.5 rounded-md font-medium ${bgColor} ${textColor}`}>
                  {percentage.toFixed(0)}% Utilizado
                </span>
                <span className="text-zinc-400">
                  Resta {formatCurrency(Math.max(0, b.limit - b.spent))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
