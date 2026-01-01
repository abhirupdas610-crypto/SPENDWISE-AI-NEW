
import React, { useState, useEffect, useCallback } from 'react';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import { AppState, UserProfile, Expense, ImpulsePurchase, Goal, REWARDS_CATALOG } from './types';
import { analyzeReceipt, transcribeVoice, parseExpenseFromText, speak } from './services/geminiService';
import { encode } from './utils/audio';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('gemini_finance_state');
    if (saved) return JSON.parse(saved);
    return {
      user: null,
      expenses: [],
      impulsePurchases: [],
      goal: {
        name: "Flight to Tokyo",
        targetAmount: 100000,
        currentAmount: 0,
        viceName: "Daily Coffee",
        vicePrice: 250
      },
      healthPoints: 100,
      inventory: []
    };
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('gemini_finance_state', JSON.stringify(state));
    
    // Check weekly limit for notifications
    if (state.user) {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const weeklyTotal = state.expenses
        .filter(e => new Date(e.date) >= startOfWeek)
        .reduce((sum, e) => sum + e.amount, 0);

      if (weeklyTotal > state.user.weeklyLimit) {
        showSMSNotification(`Alert: Weekly limit exceeded! Spent ${weeklyTotal} / ${state.user.weeklyLimit}`);
      }
    }

    // Clean up old data (only keep last 2 months)
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const recentExpenses = state.expenses.filter(e => new Date(e.date) > twoMonthsAgo);
    if (recentExpenses.length !== state.expenses.length) {
      setState(prev => ({ ...prev, expenses: recentExpenses }));
    }
  }, [state.expenses, state.user]);

  const showSMSNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRegister = (user: UserProfile) => {
    setState(prev => ({ ...prev, user }));
  };

  const addExpense = (amount: number, description: string, category: string) => {
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      description,
      category,
      date: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      healthPoints: prev.healthPoints + 15 // Reward for active logging
    }));
  };

  const handleViceClick = () => {
    setState(prev => {
      const newAmount = prev.goal.currentAmount + prev.goal.vicePrice;
      if (newAmount >= prev.goal.targetAmount) {
        alert("CONGRATULATIONS! You reached your dream goal: " + prev.goal.name);
      }
      return {
        ...prev,
        goal: { ...prev.goal, currentAmount: newAmount },
        healthPoints: prev.healthPoints + 50 // Bonus for discipline
      };
    });
  };

  const handleImpulsePurchase = (amount: number, description: string) => {
    const newImpulse: ImpulsePurchase = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      description,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setState(prev => ({
      ...prev,
      impulsePurchases: [newImpulse, ...prev.impulsePurchases]
    }));
    alert("Speedbump Triggered! This purchase will be held for 24 hours. Think about it.");
  };

  const handleRedeem = (rewardId: string) => {
    const reward = REWARDS_CATALOG.find(r => r.id === rewardId);
    if (!reward) return;
    
    if (state.healthPoints >= reward.cost) {
      setState(prev => ({
        ...prev,
        healthPoints: prev.healthPoints - reward.cost,
        inventory: [...prev.inventory, rewardId]
      }));
      alert(`Redeemed! You've earned the ${reward.name}.`);
    } else {
      alert("Not enough Financial Health Points!");
    }
  };

  const processImpulsePurchases = useCallback(() => {
    const now = new Date();
    setState(prev => {
      let changed = false;
      const updated = prev.impulsePurchases.map(p => {
        const created = new Date(p.createdAt);
        const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        if (p.status === 'pending' && diffHours >= 24) {
          changed = true;
        }
        return p;
      });
      return changed ? { ...prev, impulsePurchases: updated } : prev;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(processImpulsePurchases, 60000);
    return () => clearInterval(interval);
  }, [processImpulsePurchases]);

  if (!state.user) {
    return <Registration onComplete={handleRegister} />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce">
          📱 SMS to {state.user.mobile}: {notification}
        </div>
      )}
      
      <Dashboard 
        state={state} 
        onAddExpense={addExpense}
        onViceClick={handleViceClick}
        onImpulse={handleImpulsePurchase}
        onRedeem={handleRedeem}
        onReset={() => setState(p => ({...p, user: null}))}
      />

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 md:hidden">
         <button className="flex flex-col items-center text-indigo-600">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
           <span className="text-[10px]">Home</span>
         </button>
         <button className="bg-indigo-600 p-3 rounded-full -mt-8 shadow-lg shadow-indigo-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
         </button>
         <button className="flex flex-col items-center text-gray-400">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
           <span className="text-[10px]">Profile</span>
         </button>
      </nav>
    </div>
  );
};

export default App;
