import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Trash2,
  SlidersHorizontal,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  FileSpreadsheet,
  Calendar,
  Tag,
  CheckCircle,
  HelpCircle,
  Utensils,
  Car,
  Home,
  Sparkles,
  Heart,
  BookOpen,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Transaction, TransactionCategory, BankAccount } from '../types';
import { CATEGORIES_CONFIG } from '../data';

interface TransactionHistoryProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionHistory({
  transactions,
  accounts,
  onAddTransaction,
  onDeleteTransaction,
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Outros');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenAddModal = () => {
    // Reset form states
    setDescription('');
    setAmount('');
    setCategory('Outros');
    setType('expense');
    setAccountId(accounts[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return;

    onAddTransaction({
      description,
      amount: type === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
      type,
      category,
      date,
      accountId,
      isSynced: false,
    });

    setShowAddModal(false);
  };

  // Filters
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getCategoryIcon = (categoryName: TransactionCategory) => {
    switch (categoryName) {
      case 'Alimentação':
        return <Utensils className="w-4 h-4" />;
      case 'Transporte':
        return <Car className="w-4 h-4" />;
      case 'Moradia':
        return <Home className="w-4 h-4" />;
      case 'Lazer':
        return <Sparkles className="w-4 h-4" />;
      case 'Saúde':
        return <Heart className="w-4 h-4" />;
      case 'Educação':
        return <BookOpen className="w-4 h-4" />;
      case 'Salário':
        return <DollarSign className="w-4 h-4" />;
      case 'Investimentos':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const categories: TransactionCategory[] = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saúde',
    'Educação',
    'Salário',
    'Investimentos',
    'Outros',
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 shadow-xs">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="font-display font-semibold text-white text-base">
            Extrato de Lançamentos
          </h3>
          <p className="text-xs text-zinc-400">Suas movimentações consolidadas</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        {/* Search */}
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-500"
          />
        </div>

        {/* Category filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-zinc-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none bg-zinc-950 text-zinc-300 transition-all cursor-pointer"
          >
            <option value="all">Todas Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="w-full px-3 py-1.5 text-xs border border-zinc-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none bg-zinc-950 text-zinc-300 transition-all cursor-pointer"
          >
            <option value="all">Entradas e Saídas</option>
            <option value="income">Apenas Entradas (+)</option>
            <option value="expense">Apenas Saídas (-)</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-800/80 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <th className="pb-3 pt-1 pl-2">Descrição</th>
              <th className="pb-3 pt-1">Categoria</th>
              <th className="pb-3 pt-1">Conta / Banco</th>
              <th className="pb-3 pt-1">Data</th>
              <th className="pb-3 pt-1 text-right">Valor</th>
              <th className="pb-3 pt-1 text-center w-12">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-zinc-500 text-xs">
                  Nenhum lançamento encontrado correspondente aos filtros.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const catConfig = CATEGORIES_CONFIG[tx.category] || {
                  color: 'text-zinc-400',
                  bgColor: 'bg-zinc-800 border-zinc-700/30',
                };
                const matchingAccount = accounts.find((acc) => acc.id === tx.accountId);

                return (
                  <tr
                    id={`tx-row-${tx.id}`}
                    key={tx.id}
                    className="hover:bg-zinc-800/30 transition-colors text-xs"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${catConfig.bgColor}`}
                        >
                          <span className={catConfig.color}>{getCategoryIcon(tx.category)}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-200">{tx.description}</div>
                          {tx.isSynced && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="inline-block px-1 bg-emerald-950/50 border border-emerald-800/30 rounded text-[9px] font-semibold text-emerald-400 uppercase tracking-tight scale-90">
                                Open Finance
                              </span>
                              {tx.bankName && (
                                <span className="text-[9px] text-zinc-500 font-medium">
                                  ({tx.bankName})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catConfig.bgColor} ${catConfig.color}`}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400 font-medium">
                      {matchingAccount?.name || tx.bankName || 'Carteira'}
                    </td>
                    <td className="py-3 text-zinc-500 font-mono font-medium">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`font-mono font-bold ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Lançamento Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl border border-zinc-800 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zinc-800 rounded-lg text-zinc-300">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-base leading-tight">
                      Novo Lançamento Manual
                    </h3>
                    <p className="text-xs text-zinc-400">Registre receita ou despesa de sua carteira</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer text-lg leading-none"
                >
                  <span className="sr-only">Fechar</span>
                  &times;
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                {/* Income / Expense Toggle */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      type === 'expense' ? 'bg-zinc-800 text-rose-400 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Despesa (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      type === 'income' ? 'bg-zinc-800 text-emerald-400 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Receita (+)
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 block">Descrição</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Padaria, Salário, Uber"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 block">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all font-mono font-bold placeholder:text-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 block">Categoria</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                      className="w-full px-2.5 py-2 text-xs border border-zinc-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none bg-zinc-950 text-zinc-300 transition-all cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Account Selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 block">Conta de Saída/Entrada</label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border border-zinc-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none bg-zinc-950 text-zinc-300 transition-all cursor-pointer"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 block">Data do Lançamento</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-800 bg-zinc-950 text-zinc-300 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 py-2 text-xs font-semibold border border-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Confirmar Lançamento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
