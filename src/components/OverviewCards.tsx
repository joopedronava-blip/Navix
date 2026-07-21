import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';

interface OverviewCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export default function OverviewCards({ totalBalance, totalIncome, totalExpenses }: OverviewCardsProps) {
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, ((totalIncome - Math.abs(totalExpenses)) / totalIncome) * 100)) : 0;

  const cards = [
    {
      id: 'card-balance',
      title: 'Saldo Consolidado',
      value: totalBalance,
      icon: Wallet,
      color: 'text-white',
      bgColor: 'bg-zinc-900 border-zinc-800/80',
      accentColor: 'text-emerald-400',
      description: 'Soma de todas as contas',
    },
    {
      id: 'card-income',
      title: 'Receitas (Mês)',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-zinc-900 border-zinc-800/80',
      accentColor: 'text-emerald-400',
      description: 'Salário, rendimentos e PIX',
    },
    {
      id: 'card-expenses',
      title: 'Despesas (Mês)',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-rose-400',
      bgColor: 'bg-zinc-900 border-zinc-800/80',
      accentColor: 'text-rose-400',
      description: 'Gastos fixos e variáveis',
    },
    {
      id: 'card-savings',
      title: 'Taxa de Poupança',
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      color: 'text-blue-400',
      bgColor: 'bg-zinc-900 border-zinc-800/80',
      accentColor: 'text-blue-400',
      description: 'Porcentagem de receita poupada',
      isPercentage: true,
    },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            id={card.id}
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`${card.bgColor} border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-700 hover:shadow-sm transition-all group`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/50 ${card.accentColor} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className={`font-display font-bold text-2xl tracking-tight ${card.color}`}>
                {card.isPercentage ? card.value : formatCurrency(card.value as number)}
              </h2>
              <p className="text-[11px] text-zinc-400">
                {card.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
