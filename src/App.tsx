import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, Shield, RefreshCw, LogOut, CheckCircle, Award, LayoutDashboard, CalendarRange, CloudLightning } from 'lucide-react';
import { BankAccount, Transaction, Budget, TransactionCategory } from './types';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from './data';

import OverviewCards from './components/OverviewCards';
import AccountsList from './components/AccountsList';
import BudgetCards from './components/BudgetCards';
import VisualCharts from './components/VisualCharts';
import TransactionHistory from './components/TransactionHistory';
import MonthlyHistory from './components/MonthlyHistory';
import BankConnectionModal from './components/BankConnectionModal';
import FileUploadModal from './components/FileUploadModal';
import ExportDeployModal from './components/ExportDeployModal';

export default function App() {
  // --- States ---
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('gfp_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('gfp_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  // --- Effects (Persistence) ---
  useEffect(() => {
    localStorage.setItem('gfp_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('gfp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Show auto-dismiss toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- Dynamic Financial Calculations ---
  // Budgets dynamically compiled from active transactions
  const budgets: Budget[] = INITIAL_BUDGETS.map((initBudget) => {
    // Sum matching category expenses for the current month (2026-07)
    const spent = transactions
      .filter((tx) => tx.type === 'expense' && tx.category === initBudget.category && tx.date.startsWith('2026-07'))
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return {
      category: initBudget.category,
      limit: initBudget.limit,
      spent,
    };
  });

  // KPI Calculations
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income' && tx.date.startsWith('2026-07'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense' && tx.date.startsWith('2026-07'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  // --- Action Handlers ---
  
  // Connect new bank (Open Finance)
  const handleConnectBank = (
    bank: 'Itaú' | 'Nubank' | 'Bradesco' | 'Banco do Brasil' | 'C6 Bank' | 'PicPay',
    accountNumber: string,
    importedTransactions: Omit<Transaction, 'id' | 'accountId'>[],
    initialBalance: number
  ) => {
    // 1. Create new BankAccount
    const newAccountId = `acc-bank-${Date.now()}`;
    const bankColors = {
      Itaú: 'from-orange-500 to-amber-600',
      Nubank: 'from-purple-600 to-indigo-700',
      Bradesco: 'from-rose-600 to-rose-700',
      'Banco do Brasil': 'from-amber-400 to-yellow-600',
      'C6 Bank': 'from-zinc-700 to-zinc-900',
      PicPay: 'from-emerald-500 to-teal-600',
    };

    const newAccount: BankAccount = {
      id: newAccountId,
      name: bank === 'C6 Bank' ? 'C6 Conta Global' : bank === 'PicPay' ? 'Carteira PicPay' : `Conta ${bank}`,
      type: (bank === 'Nubank' || bank === 'PicPay') ? 'savings' : 'checking',
      balance: initialBalance,
      institution: bank,
      syncStatus: 'synced',
      lastSynced: 'Agora mesmo',
      accountNumber,
      color: bankColors[bank] || 'from-slate-600 to-slate-800',
    };

    // 2. Add imported transactions
    const newTransactions: Transaction[] = importedTransactions.map((tx, idx) => ({
      ...tx,
      id: `tx-synced-${Date.now()}-${idx}`,
      accountId: newAccountId,
    }));

    // Update States
    setAccounts((prev) => [...prev, newAccount]);
    setTransactions((prev) => [...newTransactions, ...prev]);
    
    triggerToast(`Conta ${bank} integrada! +${newTransactions.length} lançamentos importados.`);
  };

  // Import from OFX/CSV statement file
  const handleImportFile = (importedTransactions: Omit<Transaction, 'id' | 'accountId'>[]) => {
    // We import this into the "Conta Corrente Itaú" or default account
    const targetAccountId = accounts[0]?.id || 'acc-1';
    
    // Create completed transaction entries
    const newTransactions: Transaction[] = importedTransactions.map((tx, idx) => ({
      ...tx,
      id: `tx-file-${Date.now()}-${idx}`,
      accountId: targetAccountId,
    }));

    // Calculate sum of these transactions to adjust balance of that account
    const totalChange = newTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === targetAccountId ? { ...acc, balance: acc.balance + totalChange } : acc
      )
    );

    setTransactions((prev) => [...newTransactions, ...prev]);
    triggerToast(`Arquivo importado! +${newTransactions.length} lançamentos processados.`);
  };

  // Add individual manual transaction
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-manual-${Date.now()}`,
    };

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === newTx.accountId ? { ...acc, balance: acc.balance + newTx.amount } : acc
      )
    );

    setTransactions((prev) => [newTx, ...prev]);
    triggerToast('Lançamento registrado com sucesso!');
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    const targetTx = transactions.find((tx) => tx.id === id);
    if (!targetTx) return;

    // Revert account balance
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === targetTx.accountId ? { ...acc, balance: acc.balance - targetTx.amount } : acc
      )
    );

    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    triggerToast('Lançamento removido.');
  };

  // Individual account refresh / sync animation
  const handleSyncAccount = (id: string) => {
    const targetAccount = accounts.find((acc) => acc.id === id);
    if (!targetAccount) return;

    // Simulate small balance adjustment
    const drift = (Math.random() - 0.4) * 80; // random shift
    
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          return {
            ...acc,
            balance: acc.balance + drift,
            syncStatus: 'synced',
            lastSynced: 'Agora mesmo',
          };
        }
        return acc;
      })
    );

    // If there is drift, add a simulated Open Finance transaction
    if (Math.abs(drift) > 5) {
      const isIncome = drift > 0;
      const newTx: Transaction = {
        id: `tx-sync-drift-${Date.now()}`,
        description: isIncome ? 'Rendimento de Aplicação' : 'Ajuste de Tarifa de Conta',
        amount: drift,
        type: isIncome ? 'income' : 'expense',
        category: isIncome ? 'Investimentos' : 'Outros',
        date: new Date().toISOString().split('T')[0],
        accountId: id,
        isSynced: true,
        bankName: targetAccount.institution,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    triggerToast(`Sincronização concluída com ${targetAccount.name}!`);
  };

  // Delete bank account
  const handleDeleteAccount = (id: string) => {
    const targetAccount = accounts.find((acc) => acc.id === id);
    if (!targetAccount) return;

    if (accounts.length <= 1) {
      triggerToast('Você precisa manter pelo menos uma conta ativa no aplicativo.');
      return;
    }

    if (window.confirm(`Deseja realmente desconectar e remover a conta ${targetAccount.name}? Todos os lançamentos sincronizados desta conta serão removidos.`)) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      setTransactions((prev) => prev.filter((tx) => tx.accountId !== id));
      triggerToast(`Conta ${targetAccount.name} removida com sucesso!`);
    }
  };

  // Reset Mock Data
  const handleResetData = () => {
    if (window.confirm('Deseja realmente redefinir o dashboard para os valores padrão de simulação?')) {
      localStorage.removeItem('gfp_accounts');
      localStorage.removeItem('gfp_transactions');
      setAccounts(INITIAL_ACCOUNTS);
      setTransactions(INITIAL_TRANSACTIONS);
      triggerToast('Dados redefinidos para o padrão!');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-sm flex items-center justify-center">
              <Landmark className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl text-white leading-none tracking-tight">
                  Navix
                </h1>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 text-[9px] font-bold rounded-md border border-emerald-800/30">
                  <Shield className="w-2.5 h-2.5" /> OPEN FINANCE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Sincronização bancária automática e orçamentos inteligentes</p>
            </div>
          </div>

          {/* User & Admin controls */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-zinc-300">Olá, João Silva</p>
              <p className="text-[10px] text-zinc-500">joooedronava@gmail.com</p>
            </div>
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Restaurar dados iniciais de exemplo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar</span>
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
              title="Exportar para o GitHub e Deploy no Netlify"
            >
              <CloudLightning className="w-3.5 h-3.5" />
              <span>Exportar & Deploy</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Toast Notification Container */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-2 max-w-sm"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top metrics summary cards */}
        <OverviewCards
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
        />

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800/80 gap-1 pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 font-bold bg-zinc-900/30'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/10'
            } rounded-t-xl`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400 font-bold bg-zinc-900/30'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/10'
            } rounded-t-xl`}
          >
            <CalendarRange className="w-4 h-4" />
            Histórico Mensal
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Block - Bank Accounts & Budget Limits (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <AccountsList
                  accounts={accounts}
                  onSyncAccount={handleSyncAccount}
                  onDeleteAccount={handleDeleteAccount}
                  onOpenConnectModal={() => setIsConnectOpen(true)}
                  onOpenUploadModal={() => setIsUploadOpen(true)}
                />
                <BudgetCards budgets={budgets} />
              </div>

              {/* Right Block - Visual Analytics & Dynamic Transactions (lg:col-span-8) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <VisualCharts transactions={transactions} />
                <TransactionHistory
                  transactions={transactions}
                  accounts={accounts}
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <MonthlyHistory transactions={transactions} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footnote */}
      <footer className="py-6 border-t border-zinc-900 text-center text-[11px] text-zinc-500 bg-black/50">
        <p>© 2026 Navix. Dados criptografados de acordo com as normas LGPD e BACEN.</p>
      </footer>

      {/* Interactive Modals */}
      <BankConnectionModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onConnect={handleConnectBank}
      />

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImport={handleImportFile}
      />

      <ExportDeployModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
