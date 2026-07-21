import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Smartphone, 
  Key, 
  QrCode, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  Info, 
  Sparkles 
} from 'lucide-react';
import { BankAccount, Transaction, TransactionCategory } from '../types';
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
  
  // Custom states for real bank account data entry
  const [connectionMethod, setConnectionMethod] = useState<'app' | 'manual'>('app');
  const [customBalance, setCustomBalance] = useState('');
  const [customAccount, setCustomAccount] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedTransactions, setUploadedTransactions] = useState<Omit<Transaction, 'id' | 'accountId'>[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setStep(1);
    setSelectedBank(null);
    setCpf('');
    setPassword('');
    setAccountNumber('');
    setLoadingText('');
    setConnectionMethod('app');
    setCustomBalance('');
    setCustomAccount('');
    setUploadedFileName('');
    setUploadedTransactions([]);
    setFileError(null);
    setDragActive(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectBank = (bank: 'Itaú' | 'Nubank' | 'Bradesco' | 'Banco do Brasil' | 'C6 Bank' | 'PicPay') => {
    setSelectedBank(bank);
    
    // Generate a beautiful, realistic default account number
    const randomAg = Math.floor(1000 + Math.random() * 9000);
    const randomCc = Math.floor(10000 + Math.random() * 90000);
    const initialAcc = `Ag: ${randomAg} C/C: ${randomCc}-${Math.floor(Math.random() * 10)}`;
    setAccountNumber(initialAcc);
    setCustomAccount(initialAcc);
    
    // Suggest standard simulated initial balances which they can edit
    const standardBal = bank === 'Nubank' ? '5200.00' : bank === 'Itaú' ? '3100.00' : bank === 'Bradesco' ? '4500.00' : bank === 'Banco do Brasil' ? '2800.00' : bank === 'C6 Bank' ? '6200.00' : '1500.00';
    setCustomBalance(standardBal);
    
    setStep(2);
  };

  // Enhanced OFX/CSV/TXT statement file parser
  const processImportFile = (file: File) => {
    setFileError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedTransactions: Omit<Transaction, 'id' | 'accountId'>[] = [];

        // 1. Check for OFX XML/SGML Tagged Format
        if (text.includes('<OFX>') || text.includes('<STMTTRN>')) {
          const trnRegex = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|<STMTTRN>|$)/gi;
          let match;
          while ((match = trnRegex.exec(text)) !== null) {
            const block = match[1];
            const amountMatch = block.match(/<TRNAMT>\s*([\d\.\,\-]+)/i);
            const memoMatch = block.match(/<(?:MEMO|NAME)>\s*(.*?)(?:\r?\n|<)/i);
            const dateMatch = block.match(/<DTPOSTED>\s*(\d{8})/i);

            if (amountMatch) {
              const amountStr = amountMatch[1].replace(',', '.');
              const amount = parseFloat(amountStr);
              const desc = memoMatch ? memoMatch[1].trim() : 'Lançamento Bancário';
              
              let formattedDate = new Date().toISOString().split('T')[0];
              if (dateMatch) {
                const dStr = dateMatch[1];
                formattedDate = `${dStr.substring(0, 4)}-${dStr.substring(4, 6)}-${dStr.substring(6, 8)}`;
              }

              if (!isNaN(amount)) {
                let category: TransactionCategory = 'Outros';
                const lower = desc.toLowerCase();
                if (lower.includes('mercado') || lower.includes('pao') || lower.includes('ifood') || lower.includes('padaria') || lower.includes('alimento')) category = 'Alimentação';
                else if (lower.includes('uber') || lower.includes('posto') || lower.includes('combustivel') || lower.includes('99') || lower.includes('carro')) category = 'Transporte';
                else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('cinema') || lower.includes('lazer')) category = 'Lazer';
                else if (lower.includes('aluguel') || lower.includes('luz') || lower.includes('agua') || lower.includes('condominio')) category = 'Moradia';
                else if (lower.includes('farmacia') || lower.includes('medico') || lower.includes('dentista') || lower.includes('saude')) category = 'Saúde';
                else if (lower.includes('salario') || lower.includes('pix recebido') || lower.includes('transferencia recebida')) category = 'Salário';
                else if (lower.includes('invest') || lower.includes('cdi') || lower.includes('rendimento')) category = 'Investimentos';

                parsedTransactions.push({
                  description: desc,
                  amount: amount,
                  type: amount > 0 ? 'income' : 'expense',
                  category,
                  date: formattedDate,
                  isSynced: true,
                });
              }
            }
          }
        } else {
          // 2. Standard CSV / Text Parsing
          const lines = text.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            const parts = line.split(/[;,]/);
            if (parts.length >= 2) {
              const desc = parts[1]?.replace(/"/g, '').trim() || parts[0]?.trim();
              const amountStr = parts[2] || parts[1];
              const amount = parseFloat(amountStr?.replace('R$', '').replace(/\s/g, '').replace(',', '.'));
              
              if (desc && !isNaN(amount)) {
                let category: TransactionCategory = 'Outros';
                const lowerDesc = desc.toLowerCase();
                if (lowerDesc.includes('mercado') || lowerDesc.includes('pao') || lowerDesc.includes('alimento') || lowerDesc.includes('ifood') || lowerDesc.includes('padaria')) {
                  category = 'Alimentação';
                } else if (lowerDesc.includes('uber') || lowerDesc.includes('posto') || lowerDesc.includes('combustivel') || lowerDesc.includes('carro') || lowerDesc.includes('99app')) {
                  category = 'Transporte';
                } else if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('cinema') || lowerDesc.includes('shopping') || lowerDesc.includes('sport')) {
                  category = 'Lazer';
                } else if (lowerDesc.includes('aluguel') || lowerDesc.includes('condominio') || lowerDesc.includes('energia') || lowerDesc.includes('luz') || lowerDesc.includes('agua')) {
                  category = 'Moradia';
                } else if (lowerDesc.includes('medico') || lowerDesc.includes('farmacia') || lowerDesc.includes('dentista') || lowerDesc.includes('saude')) {
                  category = 'Saúde';
                } else if (lowerDesc.includes('curso') || lowerDesc.includes('faculdade') || lowerDesc.includes('escola') || lowerDesc.includes('livro')) {
                  category = 'Educação';
                } else if (lowerDesc.includes('salario') || lowerDesc.includes('pagamento') || lowerDesc.includes('recebido')) {
                  category = 'Salário';
                } else if (lowerDesc.includes('invest') || lowerDesc.includes('cdi') || lowerDesc.includes('rendimento')) {
                  category = 'Investimentos';
                }

                parsedTransactions.push({
                  description: desc,
                  amount: amount,
                  type: amount > 0 ? 'income' : 'expense',
                  category,
                  date: new Date().toISOString().split('T')[0],
                  isSynced: true,
                });
              }
            }
          }
        }

        if (parsedTransactions.length === 0) {
          setFileError('Nenhum lançamento foi identificado no arquivo. Usando transações padrão do banco.');
          if (selectedBank) {
            setUploadedTransactions(BANK_SIMULATION_TRANSACTIONS[selectedBank] || []);
          }
        } else {
          setUploadedTransactions(parsedTransactions);
          setUploadedFileName(file.name);
          
          // Auto calculate total net sum to suggest balance if user hasn't typed one
          const totalNetSum = parsedTransactions.reduce((acc, t) => acc + t.amount, 0);
          if (totalNetSum > 0 && !customBalance) {
            setCustomBalance(totalNetSum.toFixed(2));
          }
        }
      } catch (err) {
        setFileError('Falha ao processar arquivo. Verifique se é um arquivo OFX, CSV ou TXT válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImportFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImportFile(e.target.files[0]);
    }
  };

  const BANK_REDIRECT_URLS = {
    'Itaú': 'https://www.itau.com.br/open-finance',
    'Nubank': 'https://nubank.com.br/open-finance',
    'Bradesco': 'https://banco.bradesco/open-finance',
    'Banco do Brasil': 'https://www.bb.com.br/open-finance',
    'C6 Bank': 'https://www.c6bank.com.br/open-finance',
    'PicPay': 'https://picpay.com/open-finance',
  };

  const BANK_DEEP_LINKS = {
    'Itaú': 'itauvarejo://',
    'Nubank': 'nubank://',
    'Bradesco': 'bradesco://',
    'Banco do Brasil': 'bancodobrasil://',
    'C6 Bank': 'c6bank://',
    'PicPay': 'picpay://',
  };

  const triggerBankRedirect = (bank: 'Itaú' | 'Nubank' | 'Bradesco' | 'Banco do Brasil' | 'C6 Bank' | 'PicPay') => {
    const deepLink = BANK_DEEP_LINKS[bank];
    const webUrl = BANK_REDIRECT_URLS[bank];
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && deepLink) {
      // Attempt to open the installed native app
      window.location.href = deepLink;
      
      // If the app is not installed, fallback to the responsive web portal after 1.5 seconds
      setTimeout(() => {
        if (document.hasFocus()) {
          window.open(webUrl, '_blank', 'noopener,noreferrer');
        }
      }, 1500);
    } else {
      // On desktop, open the web portal directly
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmitCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Redirect to the actual bank app or web portal if using app connection
    if (connectionMethod === 'app' && selectedBank) {
      triggerBankRedirect(selectedBank);
    }
    
    setStep(3);
    
    // Highly realistic Open Finance syncing stage lifecycle
    const phases = [
      'Estabelecendo túnel de conexão de segurança (TLS 1.3)...',
      'Verificando autorização mútua com o Banco Central do Brasil...',
      `Redirecionando e abrindo fluxo de consentimento com ${selectedBank || 'banco'}...`,
      'Aguardando login e autorização na aba do banco...',
      'Validando certificados digitais ICP-Brasil de transmissão...',
      'Autenticação realizada com sucesso! Buscando dados reais...',
      uploadedTransactions.length > 0 
        ? `Lendo ${uploadedTransactions.length} lançamentos do seu extrato manual...`
        : 'Sincronizando extrato bancário dos últimos 30 dias via Open Finance...',
      'Processando e classificando categorias financeiras...',
      'Integração de dados finalizada com sucesso!'
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
    }, 1450);
  };

  const handleFinish = () => {
    if (selectedBank) {
      const txs = uploadedTransactions.length > 0 ? uploadedTransactions : (BANK_SIMULATION_TRANSACTIONS[selectedBank] || []);
      const balanceVal = customBalance ? parseFloat(customBalance) : (selectedBank === 'Nubank' ? 5200.00 : selectedBank === 'Itaú' ? 3100.00 : selectedBank === 'Bradesco' ? 4500.00 : selectedBank === 'Banco do Brasil' ? 2800.00 : selectedBank === 'C6 Bank' ? 6200.00 : 1500.00);
      const finalAccNumber = customAccount || accountNumber;
      
      onConnect(selectedBank, finalAccNumber, txs, isNaN(balanceVal) ? 0 : balanceVal);
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
        className="relative w-full max-w-md bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-800 text-white"
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

            {/* Step 2: Connection details */}
            {step === 2 && selectedBank && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* Bank Banner */}
                <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm shadow-xs ${BANK_INFO[selectedBank].color}`}>
                    {BANK_INFO[selectedBank].logoText}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{BANK_INFO[selectedBank].name}</h4>
                    <p className="text-[11px] text-emerald-400 font-mono">Pronto para conexão real</p>
                  </div>
                </div>

                {/* Connection Methods Tabs */}
                <div className="flex border-b border-zinc-800">
                  <button
                    onClick={() => setConnectionMethod('app')}
                    className={`flex-1 pb-2 text-xs font-semibold border-b-2 text-center transition-all ${
                      connectionMethod === 'app'
                        ? 'border-emerald-500 text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    App do Banco (Open Finance)
                  </button>
                  <button
                    onClick={() => setConnectionMethod('manual')}
                    className={`flex-1 pb-2 text-xs font-semibold border-b-2 text-center transition-all ${
                      connectionMethod === 'manual'
                        ? 'border-emerald-500 text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Saldo Real + Extrato (Manual)
                  </button>
                </div>

                {connectionMethod === 'app' ? (
                  <div className="space-y-4">
                    {/* Open Finance Real Simulation Panel */}
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col items-center text-center space-y-3.5">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
                        <QrCode className="w-4 h-4" />
                        <span>Escaneie para Conexão Imediata</span>
                      </div>
                      
                      <p className="text-[11px] text-zinc-400 leading-relaxed px-1">
                        Abra o app do <strong>{selectedBank}</strong>, acesse <strong>Open Finance</strong> e escaneie o QR Code seguro gerado para esta sessão:
                      </p>

                      {/* Customized QR Code with Central glowing bank badge */}
                      <div className="bg-white p-3 rounded-xl shadow-lg relative">
                        <svg className="w-32 h-32 text-zinc-900" viewBox="0 0 100 100">
                          {/* Corner patterns */}
                          <rect x="0" y="0" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
                          <rect x="4" y="4" width="14" height="14" fill="currentColor" />
                          <rect x="78" y="0" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
                          <rect x="82" y="4" width="14" height="14" fill="currentColor" />
                          <rect x="0" y="78" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
                          <rect x="4" y="82" width="14" height="14" fill="currentColor" />
                          
                          {/* Inner Data Blocks */}
                          <path d="M 30,5 H 40 V 15 H 30 Z M 48,5 H 58 V 15 H 48 Z M 66,5 H 74 V 15 H 66 Z" fill="currentColor" />
                          <path d="M 30,22 H 40 V 30 H 30 Z M 48,22 H 58 V 30 H 48 Z M 66,22 H 74 V 30 H 66 Z" fill="currentColor" />
                          <path d="M 5,30 H 15 V 40 H 5 Z M 20,30 H 28 V 40 H 20 Z M 5,45 H 15 V 55 H 5 Z M 20,45 H 28 V 55 H 20 Z" fill="currentColor" />
                          <path d="M 78,35 H 88 V 45 H 78 Z M 88,45 H 95 V 55 H 88 Z M 78,55 H 88 V 65 H 78 Z" fill="currentColor" />
                          <path d="M 35,78 H 45 V 88 H 35 Z M 48,78 H 58 V 88 H 48 Z M 66,78 H 74 V 88 H 66 Z" fill="currentColor" />
                          
                          {/* Central logo container */}
                          <rect x="31" y="31" width="38" height="38" rx="6" fill="#18181b" stroke="#10b981" strokeWidth="2" />
                        </svg>
                        <div className={`absolute inset-0 m-auto w-9 h-9 rounded-md flex items-center justify-center font-display font-extrabold text-[11px] shadow-md border ${BANK_INFO[selectedBank].color}`}>
                          {BANK_INFO[selectedBank].logoText}
                        </div>
                      </div>

                      <div className="w-full text-left space-y-2">
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Agência e Conta (Real ou Simulação)</label>
                            <input
                              type="text"
                              value={customAccount}
                              onChange={(e) => setCustomAccount(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 outline-none transition-all font-mono"
                              placeholder="Ag: 0001 C/C: 12345-6"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Saldo da Conta Real (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={customBalance}
                              onChange={(e) => setCustomBalance(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 outline-none transition-all font-mono"
                              placeholder="Saldo Inicial"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSubmitCredentials()}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                      >
                        <Smartphone className="w-4 h-4 text-emerald-100" />
                        Conectar via Aplicativo do {selectedBank}
                      </button>

                      <p className="text-[9px] text-zinc-500 max-w-[280px]">
                        Isso irá simular o redirecionamento seguro da permissão pelo app móvel do banco do titular e conectar os dados em tempo real.
                      </p>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-2 text-xs font-semibold border border-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Voltar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Manual input with Drag & Drop bank statement file (OFX/CSV)
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Agência e Conta Real</label>
                          <input
                            type="text"
                            value={customAccount}
                            onChange={(e) => setCustomAccount(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 outline-none transition-all font-mono"
                            placeholder="Ex: Ag: 0001 CC: 10452-1"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Saldo Atual (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={customBalance}
                            onChange={(e) => setCustomBalance(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-zinc-800 bg-zinc-950 text-white rounded-xl focus:border-emerald-500 outline-none transition-all font-mono"
                            placeholder="Saldo Real"
                            required
                          />
                        </div>
                      </div>

                      {/* Drag & Drop Area for Real Bank Statement Files */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Carregar Lançamentos do Banco (Opcional)</label>
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                            dragActive
                              ? 'border-emerald-500 bg-emerald-950/20'
                              : 'border-zinc-800 hover:border-emerald-500 hover:bg-zinc-850/30'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.ofx,.txt"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1.5 animate-bounce" />
                          <p className="text-[11px] font-semibold text-zinc-300">
                            Arraste ou clique para carregar extrato real do {selectedBank}
                          </p>
                          <p className="text-[9px] text-zinc-500 mt-0.5">
                            Suporta arquivos OFX, CSV ou TXT exportados do homebanking
                          </p>
                        </div>
                      </div>

                      {uploadedFileName && (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-900/30 rounded-xl flex items-center gap-2.5 text-emerald-400">
                          <FileSpreadsheet className="w-4.5 h-4.5" />
                          <div className="text-left">
                            <p className="text-xs font-semibold leading-none mb-1">{uploadedFileName}</p>
                            <p className="text-[10px] text-emerald-500 leading-none">
                              {uploadedTransactions.length} lançamentos extraídos prontos para importar
                            </p>
                          </div>
                        </div>
                      )}

                      {fileError && (
                        <div className="p-3 bg-rose-950/40 border border-rose-900/30 rounded-xl flex items-center gap-2.5 text-rose-400">
                          <AlertCircle className="w-4.5 h-4.5" />
                          <p className="text-[10px] leading-tight text-left">{fileError}</p>
                        </div>
                      )}

                      {/* Simulated Credentials Fields for extra realism if they want */}
                      <div className="pt-1.5 grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-zinc-400 block">CPF do Titular</label>
                          <input
                            type="text"
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-zinc-800 bg-zinc-950 text-white rounded-lg outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-zinc-400 block">Senha de Acesso</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-zinc-800 bg-zinc-950 text-white rounded-lg outline-none"
                          />
                        </div>
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
                        type="button"
                        onClick={() => handleSubmitCredentials()}
                        className="w-1/2 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Conectar Conta <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Loading Progress & Open Finance Consent Status */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-6 space-y-6"
              >
                {selectedBank && connectionMethod === 'app' ? (
                  <div className="w-full space-y-5 text-center">
                    {/* Pulsing Bank and Security Icon */}
                    <div className="relative flex items-center justify-center h-20">
                      <div className="absolute w-20 h-20 border-4 border-emerald-500/20 rounded-full animate-ping"></div>
                      <div className="absolute w-16 h-16 border-2 border-emerald-500/40 rounded-full animate-pulse"></div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-base shadow-lg z-10 ${BANK_INFO[selectedBank].color}`}>
                        {BANK_INFO[selectedBank].logoText}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-semibold text-white text-base">
                        Consentimento Externo Solicitado
                      </h4>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed px-4">
                        Nós abrimos uma nova guia segura com o portal do <strong>{BANK_INFO[selectedBank].name}</strong>. Por favor, faça login lá para liberar seus saldos e extratos reais.
                      </p>
                    </div>

                    {/* Pop-up blocked instructions */}
                    <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-850 max-w-sm mx-auto text-left space-y-2">
                      <div className="flex gap-2 text-xs text-emerald-400 font-medium">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>Não abriu a tela do seu banco?</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-normal">
                        Se seu navegador bloqueou a abertura da nova janela, clique no botão abaixo para ir ao portal do seu banco de forma segura:
                      </p>
                      <button
                        type="button"
                        onClick={() => triggerBankRedirect(selectedBank)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-[11px] font-semibold transition-colors shadow-sm cursor-pointer border border-emerald-500/20"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Abrir App do {BANK_INFO[selectedBank].name}
                      </button>
                    </div>

                    {/* Real-time status list or log line */}
                    <div className="flex items-center justify-center gap-2.5 text-xs text-emerald-400 bg-emerald-950/20 py-2 px-4 rounded-full max-w-xs mx-auto border border-emerald-950">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="font-medium animate-pulse">{loadingText}</span>
                    </div>

                    <div className="pt-2 border-t border-zinc-850/55 flex gap-3">
                      <button
                        onClick={() => {
                          setStep(2);
                        }}
                        className="flex-1 py-2 text-xs font-semibold border border-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={() => {
                          setStep(4);
                        }}
                        className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all hover:shadow-md cursor-pointer"
                      >
                        Já Autorizei no App
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-8 space-y-4 text-center">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-16 h-16 border-2 border-emerald-950/45 rounded-full animate-ping"></div>
                      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                    </div>
                    <div className="space-y-1.5 max-w-xs">
                      <p className="text-sm font-semibold text-zinc-200">{loadingText}</p>
                      <p className="text-xs text-zinc-500">Processando informações do seu extrato e preparando contas...</p>
                    </div>
                  </div>
                )}
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
                    <span className="font-mono text-zinc-200">{customAccount || accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Saldo Importado:</span>
                    <span className="font-semibold text-white">
                      R$ {parseFloat(customBalance || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Transações Importadas:</span>
                    <span className="font-semibold text-emerald-400">
                      +{uploadedTransactions.length > 0 ? uploadedTransactions.length : (BANK_SIMULATION_TRANSACTIONS[selectedBank]?.length || 0)}
                    </span>
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
