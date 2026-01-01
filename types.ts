
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface UserProfile {
  name: string;
  mobile: string;
  country: string;
  currency: CurrencyCode;
  weeklyLimit: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  isSubscription?: boolean;
}

export interface ImpulsePurchase {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Goal {
  name: string;
  targetAmount: number;
  currentAmount: number;
  viceName: string;
  vicePrice: number;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
  type: 'badge' | 'voucher';
}

export interface AppState {
  user: UserProfile | null;
  expenses: Expense[];
  impulsePurchases: ImpulsePurchase[];
  goal: Goal;
  healthPoints: number;
  inventory: string[]; // List of reward IDs owned
}

export enum Country {
  INDIA = 'India',
  USA = 'USA',
  UK = 'UK',
  GERMANY = 'Germany'
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const REWARDS_CATALOG: Reward[] = [
  { id: 'badge_newbie', name: 'Saver Apprentice', cost: 100, icon: '🌱', type: 'badge' },
  { id: 'badge_warrior', name: 'Budget Warrior', cost: 300, icon: '🛡️', type: 'badge' },
  { id: 'badge_master', name: 'Wealth Wizard', cost: 750, icon: '🧙‍♂️', type: 'badge' },
  { id: 'voucher_coffee', name: 'Skip-a-Coffee Credit', cost: 200, icon: '☕', type: 'voucher' },
  { id: 'voucher_pro', name: 'Gemini Pro Theme', cost: 500, icon: '🎨', type: 'voucher' },
  { id: 'badge_gemini', name: 'AI Optimizer', cost: 1000, icon: '🤖', type: 'badge' },
];
