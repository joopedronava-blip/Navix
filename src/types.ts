export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  institution: 'Itaú' | 'Nubank' | 'Bradesco' | 'Banco do Brasil' | 'Carteira' | 'C6 Bank' | 'PicPay';
  syncStatus: 'synced' | 'pending' | 'error' | 'disconnected';
  lastSynced?: string;
  accountNumber?: string;
  color: string;
}

export type TransactionCategory =
  | 'Alimentação'
  | 'Transporte'
  | 'Moradia'
  | 'Lazer'
  | 'Saúde'
  | 'Educação'
  | 'Salário'
  | 'Investimentos'
  | 'Outros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: string;
  accountId: string;
  isSynced: boolean;
  bankName?: string;
}

export interface Budget {
  category: TransactionCategory;
  limit: number;
  spent: number;
}

export interface BankConnection {
  id: string;
  institution: 'Itaú' | 'Nubank' | 'Bradesco' | 'Banco do Brasil' | 'C6 Bank' | 'PicPay';
  isConnected: boolean;
  lastSynced?: string;
  accountNumber?: string;
}
