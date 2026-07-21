import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CreditCard, Loader2, CheckCircle2, ArrowRight, Smartphone, Key } from 'lucide-react';
import { BankAccount, Transaction } from '../types';
import { BANK_SIMULATION_TRANSACTIONS } from '../data';

interface BankConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (
    bank: 'Itaú' | 'Nubank' | 'Bradesco' | 'Banco do Brasil' | 'C6 Bank' | 'PicPay',
    accountNumber: string,
    importedTransactions: Omit<Transaction, 'id' | 'accountId'>[],
    initialBalance: number
  ) => void;
}

const BANK_INFO = {
  'Itaú': {
    name: 'Itaú Unibanco',
    color: 'bg-orange-500 text-white',
    hoverColor: 'hover:bg-orange-600',
    logoText: 'Itaú',
    accentColor: 'text-orange-500',
  },
  'Nubank': {
    name: 'Nubank',
    color: 'bg-purple-600 text-white',
    hoverColor: 'hover:bg-purple-700',
    logoText: 'Nu',
    accentColor: 'text-purple-600',
  },
  'Bradesco': {
    name: 'Bradesco',
    color: 'bg-rose-600 text-white',
    hoverColor: 'hover:bg-rose-700',
    logoText: 'Bradesco',
    accentColor: 'text-rose-600',
  },
  'Banco do Brasil': {
    name: 'Banco do Brasil',
    color: 'bg-amber-400 text-slate-900',
    hoverColor: 'hover:bg-amber-500',
    logoText: 'BB',
    accentColor: 'text-amber-500',
  },
  'C6 Bank': {
    name: 'C6 Bank',
    color: 'bg-zinc-800 text-white border border-zinc-700',
    hoverColor: 'hover:bg-zinc-900',
    logoText: 'C6',
    accentColor: 'text-zinc-400',
  },
  'PicPay': {
    name: 'PicPay',
    color: 'bg-emerald-500 text-white',
    hoverColor: 'hover:bg-emerald-600',
    logoText: 'PicP',
    accentColor: 'text-emerald-500',
  },
};

export default function BankConnectionModal({ isOpen, onClose, onConnect }: BankConnectionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedBank, setSelectedBank] = useState<'Itaú' | 'Nubank' | 'Bradesco' | 'Banco do Brasil' | 'C6 Bank' | 'PicPay' | null>(null);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const resetForm = () => {
    setStep(1);
    setSelectedBank(null);
    setCpf('');
    setPassword('');
    setAccountNumber('');
    setLoadingText('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectBank = (bank: 'Itaú' | 'Nubank' | 'Bradesco' | 'Banco do Brasil' | 'C6 Bank' | 'PicPay') => {
    setSelectedBank(bank);
    // Generate a random account number for realism
    const randomAg = Math.floor(1000 + Math.random() * 9000);
    const randomCc = Math.floor(10000 + Math.random() * 90000);
    setAccountNumber(`Ag: ${randomAg} C/C: ${randomCc}-${Math.floor(Math.random() * 10)}`);
    setStep(2);
  };

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf || !password) return;
    
    setStep(3);
    
    // Simulate Open Finance connection lifecycle
    const phases = [
      'Estabelecendo conexão segura com o banco...',
      'Autenticando credenciais criptografadas...',
      'Consentimento Open Finance autorizado pelo Banco Central...',
      'Baixando extrato dos últimos 30 dias...',
      'Analisando e categorizando transações...',
      'Sincronização concluída com sucesso!'
    ];

    let currentPhase = 0;
    setLoadingText(phases[0]);

    const interval = setInterval(() => {
      currentPhase++;
      if (currentPhase < phases.length) {
        setLoadingText(phases[currentPhase]);
      } else {
        clearInterval(interval);
        setStep(4);
      }
    }, 1200);
  };

  const handleFinish = () => {
    if (selectedBank) {
      const txs = BANK_SIMULATION_TRANSACTIONS[selectedBank] || [];
      // Calculate random initial balance matching simulated values
      const balance = selectedBank === 'Nubank' ? 5200.00 : selectedBank === 'Itaú' ? 3100.00 : selectedBank === 'Bradesco' ? 4500.00 : selectedBank === 'Banco do Brasil' ? 2800.00 : selectedBank === 'C6 Bank' ? 6200.00 : 1500.00;
      onConnect(selectedBank, accountNumber, txs, balance);
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-950/50 rounded-lg text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-base leading-tight">
                Integração Automática
              </h3>
              <p className="text-xs text-zinc-400">Open Finance Seguro Banco Central</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Bank Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1 mb-2">
                  <p className="text-sm text-zinc-300 font-medium">
                    Escolha sua instituição bancária para conectar
                  </p>
                  <p className="text-xs text-zinc-500">
                    Sua conexão é protegida pela LGPD e normas do Open Finance.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(BANK_INFO) as Array<keyof typeof BANK_INFO>).map((bankKey) => {
                    const info = BANK_INFO[bankKey];
                    return (
                      <button
                        key={bankKey}
                        onClick={() => handleSelectBank(bankKey)}
                        className="flex flex-col items-center justify-center p-4 border border-zinc-800 bg-zinc-950/40 rounded-xl hover:border-emerald-500 hover:bg-zinc-850/50 hover:shadow-xs group transition-all text-center cursor-pointer"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg mb-2 shadow-xs ${info.color}`}>
                          {info.logoText}
                        </div>
                        <span className="text-xs font-semibold text-zinc-300 group-hover:text-emerald-400">
                          {info.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-start gap-2 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/50 text-[11px] text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Nós <strong>nunca</strong> guardamos suas senhas. A autenticação é feita diretamente com o seu banco sob criptografia de ponta a ponta.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Step 2: Credentials Form */}
            {step === 2 && selectedBank && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm shadow-xs ${BANK_INFO[selectedBank].color}`}>
                    {BANK_INFO[selectedBank].logoText}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{BANK_INFO[selectedBank].name}</h4>
                    <p className="text-[11px] text-zinc-500 font-mono">{accountNumber}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitCredentials} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 block">CPF do Titular</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-650"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 block">Senha da Conta (Simulada)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-650"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/2 py-2 text-xs font-semibold border border-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Conectar <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Loading Progress */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 border-2 border-emerald-950/45 rounded-full animate-ping"></div>
                  <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                </div>
                <div className="text-center space-y-1.5 max-w-xs">
                  <p className="text-sm font-semibold text-zinc-200">{loadingText}</p>
                  <p className="text-xs text-zinc-500">Por favor, mantenha esta janela aberta para autorizar o fluxo.</p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && selectedBank && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4 space-y-5"
              >
                <div className="inline-flex p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 rounded-full animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-white text-lg">
                    Conexão Estabelecida!
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    A integração com o <strong>{BANK_INFO[selectedBank].name}</strong> foi autorizada. Seus dados serão atualizados em tempo real de forma automática.
                  </p>
                </div>

                <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 text-left space-y-1.5 max-w-sm mx-auto">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Banco:</span>
                    <span className="font-medium text-zinc-200">{BANK_INFO[selectedBank].name}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Conta:</span>
                    <span className="font-mono text-zinc-200">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Transações Importadas:</span>
                    <span className="font-semibold text-emerald-400">+{BANK_SIMULATION_TRANSACTIONS[selectedBank]?.length || 0}</span>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Ir para o Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
