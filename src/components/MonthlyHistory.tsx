import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, TrendingUp, TrendingDown, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownLeft, ShieldAlert, FileText } from 'lucide-react';
import { Transaction, TransactionCategory } from '../types';
import { CATEGORIES_CONFIG } from '../data';

interface MonthlyHistoryProps {
  transactions: Transaction[];
}

export default function MonthlyHistory({ transactions }: MonthlyHistoryProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  // Dynamic monthly consolidation
  const monthlySummaries = useMemo(() => {
    const summaries: Record<
      string,
      {
        monthKey: string;
        monthLabel: string;
        income: number;
        expenses: number;
        balance: number;
        isPositive: boolean;
        savingRate: number;
      }
    > = {};

    const monthNames: Record<string, string> = {
      '01': 'Janeiro',
      '02': 'Fevereiro',
      '03': 'Março',
      '04': 'Abril',
      '05': 'Maio',
      '06': 'Junho',
      '07': 'Julho',
      '08': 'Agosto',
      '09': 'Setembro',
      '10': 'Outubro',
      '11': 'Novembro',
      '12': 'Dezembro',
    };

    transactions.forEach((tx) => {
      const monthKey = tx.date.substring(0, 7); // "2026-07"
      const [year, month] = monthKey.split('-');
      const monthLabel = `${monthNames[month] || month} ${year}`;

      if (!summaries[monthKey]) {
        summaries[monthKey] = {
          monthKey,
          monthLabel,
          income: 0,
          expenses: 0,
          balance: 0,
          isPositive: true,
          savingRate: 0,
        };
      }

      if (tx.type === 'income') {
        summaries[monthKey].income += tx.amount;
      } else {
        summaries[monthKey].expenses += Math.abs(tx.amount);
      }
    });

    return Object.values(summaries)
      .map((m) => {
        const balance = m.income - m.expenses;
        const savingRate = m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0;
        return {
          ...m,
          balance,
          isPositive: balance >= 0,
          savingRate,
        };
      })
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [transactions]);

  // Extract past months (excluding current month July 2026, or displaying all with completed ones clearly tagged)
  const currentMonthKey = '2026-07';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const getCategoryBreakdown = (monthKey: string) => {
    const categorySum: Record<string, number> = {};
    const monthTransactions = transactions.filter((tx) => tx.date.startsWith(monthKey));
    const totalExpenses = monthTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    monthTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        categorySum[tx.category] = (categorySum[tx.category] || 0) + Math.abs(tx.amount);
      }
    });

    const categoriesList = Object.entries(categorySum)
      .map(([category, amount]) => ({
        category: category as TransactionCategory,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalExpenses,
      categories: categoriesList,
      txCount: monthTransactions.length,
    };
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 shadow-xs">
      <div className="mb-6">
        <h3 className="font-display font-semibold text-white text-lg">
          Histórico de Meses Passados
        </h3>
        <p className="text-xs text-zinc-400">
          Acompanhe o balanço consolidado, fluxo de caixa e rentabilidade de meses anteriores
        </p>
      </div>

      <div className="space-y-4">
        {monthlySummaries.map((summary) => {
          const isCurrent = summary.monthKey === currentMonthKey;
          const isExpanded = expandedMonth === summary.monthKey;
          const breakdown = getCategoryBreakdown(summary.monthKey);

          return (
            <div
              id={`month-card-${summary.monthKey}`}
              key={summary.monthKey}
              className={`border rounded-xl transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-zinc-950/40 border-emerald-500/40 shadow-md'
                  : 'bg-zinc-950/20 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Row Header */}
              <div
                onClick={() => toggleMonth(summary.monthKey)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
              >
                {/* Month identity */}
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl flex items-center justify-center ${
                    summary.isPositive ? 'bg-emerald-950/40 text-emerald-400' : 'bg-rose-950/40 text-rose-400'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-white">
                        {summary.monthLabel}
                      </h4>
                      {isCurrent ? (
                        <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 text-[9px] font-bold rounded-md border border-emerald-900/30">
                          MÊS ATUAL
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[9px] font-bold rounded-md border border-zinc-700/50">
                          FECHADO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                      {breakdown.txCount} transações registradas
                    </p>
                  </div>
                </div>

                {/* Financial values */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-right">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Entradas</p>
                    <div className="flex items-center sm:justify-end gap-1 text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      {formatCurrency(summary.income)}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Saídas</p>
                    <div className="flex items-center sm:justify-end gap-1 text-xs font-bold text-zinc-400 font-mono mt-0.5">
                      <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                      {formatCurrency(summary.expenses)}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-sans">Saldo Líquido</p>
                    <div className={`text-xs font-mono font-bold mt-0.5 ${
                      summary.isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {summary.isPositive ? '+' : ''} {formatCurrency(summary.balance)}
                    </div>
                  </div>

                  {/* Negative/Positive status badge */}
                  <div className="flex items-center justify-start sm:justify-end">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      summary.isPositive
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30'
                        : 'bg-rose-950/50 text-rose-400 border border-rose-900/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${summary.isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {summary.isPositive ? 'Positivo' : 'Negativo'}
                    </span>
                  </div>

                  {/* Expand icon */}
                  <div className="hidden sm:block text-zinc-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-zinc-850 bg-zinc-950/60"
                  >
                    <div className="p-4 sm:p-5 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Category breakdown */}
                        <div className="space-y-3.5">
                          <div>
                            <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                              Distribuição de Despesas por Categoria
                            </h5>
                            <p className="text-[11px] text-zinc-500">
                              Onde você mais investiu seu capital neste mês
                            </p>
                          </div>

                          {breakdown.categories.length === 0 ? (
                            <p className="text-xs text-zinc-500 py-4">Nenhuma despesa registrada.</p>
                          ) : (
                            <div className="space-y-3">
                              {breakdown.categories.map((cat) => {
                                const catConfig = CATEGORIES_CONFIG[cat.category] || {
                                  color: 'text-zinc-400',
                                  bgColor: 'bg-zinc-800 border-zinc-700/30',
                                };
                                return (
                                  <div key={cat.category} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${catConfig.color.replace('text-', 'bg-')}`} />
                                        {cat.category}
                                      </span>
                                      <span className="font-mono text-zinc-400 font-medium">
                                        {formatCurrency(cat.amount)}{' '}
                                        <span className="text-[10px] text-zinc-500 font-normal">
                                          ({cat.percentage.toFixed(0)}%)
                                        </span>
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${catConfig.color.replace('text-', 'bg-')}`}
                                        style={{ width: `${cat.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* 2. Monthly analysis metrics card */}
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                              Análise do Mês
                            </h5>
                            <p className="text-[11px] text-zinc-500">
                              Indicadores de saúde financeira consolidados
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-zinc-900/50 p-3 border border-zinc-850 rounded-xl space-y-1">
                              <p className="text-[10px] text-zinc-500 font-medium">Taxa de Poupança</p>
                              <p className={`text-base font-bold font-mono ${
                                summary.savingRate >= 15 ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {summary.savingRate.toFixed(1)}%
                              </p>
                              <p className="text-[9px] text-zinc-500">Meta sugerida: 20%</p>
                            </div>

                            <div className="bg-zinc-900/50 p-3 border border-zinc-850 rounded-xl space-y-1">
                              <p className="text-[10px] text-zinc-500 font-medium">Situação Geral</p>
                              <p className={`text-base font-bold ${
                                summary.isPositive ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {summary.isPositive ? 'SUPERAVITÁRIO' : 'DEFICITÁRIO'}
                              </p>
                              <p className="text-[9px] text-zinc-500">
                                {summary.isPositive
                                  ? 'Economias adicionadas'
                                  : 'Reserva foi acionada'}
                              </p>
                            </div>
                          </div>

                          {/* Advice or summary message */}
                          <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-start gap-2.5">
                            {summary.isPositive ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-zinc-400 leading-normal">
                                  Excelente controle financeiro! Em{' '}
                                  <strong>{summary.monthLabel}</strong> você gastou menos do que
                                  ganhou, permitindo direcionar <strong>{formatCurrency(summary.balance)}</strong>{' '}
                                  para novos investimentos ou reserva de emergência.
                                </p>
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-zinc-400 leading-normal">
                                  Atenção: o mês de <strong>{summary.monthLabel}</strong> fechou no
                                  vermelho em{' '}
                                  <strong className="text-rose-400 font-mono">{formatCurrency(Math.abs(summary.balance))}</strong>.{' '}
                                  Isso ocorreu principalmente devido a compras atípicas/emergências. Revise as categorias acima.
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Month's transactions drawer inline */}
                      <div className="pt-4 border-t border-zinc-850">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <FileText className="w-4 h-4 text-zinc-400" />
                          <h6 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                            Lista de Lançamentos deste Mês
                          </h6>
                        </div>
                        <div className="max-h-52 overflow-y-auto border border-zinc-850 rounded-xl divide-y divide-zinc-900">
                          {transactions
                            .filter((tx) => tx.date.startsWith(summary.monthKey))
                            .map((tx) => {
                              const catConfig = CATEGORIES_CONFIG[tx.category] || { color: 'text-zinc-400' };
                              return (
                                <div key={tx.id} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-900/30 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                      {tx.date.split('-')[2]}/{tx.date.split('-')[1]}
                                    </span>
                                    <span className="font-semibold text-zinc-300">{tx.description}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold font-sans bg-zinc-900 ${catConfig.color}`}>
                                      {tx.category}
                                    </span>
                                  </div>
                                  <span className={`font-bold font-mono ${
                                    tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-400'
                                  }`}>
                                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
