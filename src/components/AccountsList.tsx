import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Landmark, RefreshCw, Plus, Upload, Check, AlertCircle, Trash2 } from 'lucide-react';
import { BankAccount } from '../types';

interface AccountsListProps {
  accounts: BankAccount[];
  onSyncAccount: (id: string) => void;
  onDeleteAccount: (id: string) => void;
  onOpenConnectModal: () => void;
  onOpenUploadModal: () => void;
}

export default function AccountsList({
  accounts,
  onSyncAccount,
  onDeleteAccount,
  onOpenConnectModal,
  onOpenUploadModal,
}: AccountsListProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncClick = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      onSyncAccount(id);
      setSyncingId(null);
    }, 1500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const getInstitutionLogo = (inst: string) => {
    switch (inst) {
      case 'Itaú':
        return <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-display font-bold flex items-center justify-center text-xs shadow-xs">Itaú</div>;
      case 'Nubank':
        return <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-display font-bold flex items-center justify-center text-xs shadow-xs">Nu</div>;
      case 'Bradesco':
        return <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-display font-bold flex items-center justify-center text-[10px] shadow-xs">Brad</div>;
      case 'Banco do Brasil':
        return <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-800 font-display font-bold flex items-center justify-center text-xs shadow-xs">BB</div>;
      case 'C6 Bank':
        return <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white font-display font-bold flex items-center justify-center text-xs shadow-xs border border-zinc-700">C6</div>;
      case 'PicPay':
        return <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-display font-bold flex items-center justify-center text-[10px] shadow-xs">PicP</div>;
      default:
        return <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-display font-bold flex items-center justify-center text-xs shadow-xs">Card</div>;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-white text-base">
            Contas & Integrações
          </h3>
          <p className="text-xs text-zinc-400">Suas conexões automáticas ativas</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={onOpenUploadModal}
            title="Importar extrato em arquivo"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
          >
            <Upload className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={onOpenConnectModal}
            className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 border border-emerald-800/40 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <Plus className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Conectar</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {accounts.map((acc) => {
          const isSyncing = syncingId === acc.id;
          return (
            <motion.div
              id={`acc-item-${acc.id}`}
              key={acc.id}
              layout
              className="flex items-center justify-between p-3.5 border border-zinc-800 hover:border-zinc-700 rounded-xl hover:bg-zinc-800/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                {getInstitutionLogo(acc.institution)}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 leading-tight">
                    {acc.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {acc.accountNumber || 'Controle Manual'}
                  </p>
                  
                  {acc.syncStatus !== 'disconnected' && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${acc.syncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                      <span className="text-[9px] font-medium text-zinc-400">
                        {acc.syncStatus === 'synced' ? `Sincronizado: ${acc.lastSynced}` : 'Pendente de sincronização'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right flex items-center gap-2.5">
                <div>
                  <p className="text-xs font-bold text-white">
                    {formatCurrency(acc.balance)}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-medium leading-none">
                    {acc.type === 'checking' ? 'Corrente' : acc.type === 'savings' ? 'Poupança' : acc.type === 'credit' ? 'Crédito' : 'Dinheiro'}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {acc.syncStatus !== 'disconnected' && (
                    <button
                      disabled={isSyncing}
                      onClick={() => handleSyncClick(acc.id)}
                      className={`p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all ${isSyncing ? 'cursor-not-allowed opacity-50' : ''}`}
                      title="Sincronizar conta agora"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all"
                    title="Desconectar conta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex items-center gap-2 text-[11px] text-zinc-500">
        <Landmark className="w-4 h-4 text-zinc-600" />
        <span>Dados integrados via Open Finance autorizado.</span>
      </div>
    </div>
  );
}
