import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../state/AppContext';
import { UserIcon } from '../icons/UserIcon';
import { Transaction, OrderStatus } from '../../types';
import { CreditCardIcon } from '../icons/CreditCardIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { PlusIcon } from '../icons/PlusIcon';

const statusColorMap: Record<OrderStatus, string> = {
  'Preparing': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Out for Delivery': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Delivered': 'bg-green-500/10 text-green-400 border-green-500/20',
};

export const ProfileView: React.FC = () => {
  const { state, setView, updateOrderStatus, loadBalance, logout } = useContext(AppContext);
  const { balance, transactions, phone, favoriteItemIds } = state;

  const [expandedOrders, setExpandedOrders] = useState<string[]>(() => 
    transactions.filter(tx => tx.type === 'order' && tx.status !== 'Delivered').map(tx => tx.id)
  );
  const [isLoadBalanceModalOpen, setIsLoadBalanceModalOpen] = useState(false);
  const [loadAmount, setLoadAmount] = useState('');
  
  // Calculate stats
  const username = phone ? `User ${phone.slice(-4)}` : 'Guest';
  const orderCount = transactions.filter(tx => tx.type === 'order' && tx.userPhone === phone).length;
  const favoriteCount = favoriteItemIds.length;
  
  useEffect(() => {
    const timers: number[] = [];
    transactions.forEach(tx => {
      if (tx.type === 'order') {
        if (tx.status === 'Preparing') {
          const timer = window.setTimeout(() => {
            updateOrderStatus(tx.id, 'Out for Delivery');
          }, 5000);
          timers.push(timer);
        } else if (tx.status === 'Out for Delivery') {
          const timer = window.setTimeout(() => {
            updateOrderStatus(tx.id, 'Delivered');
          }, 10000);
          timers.push(timer);
        }
      }
    });
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [transactions, updateOrderStatus]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const handleLoadBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loadAmount);
    if (!isNaN(amount) && amount > 0) {
      loadBalance(amount);
      setLoadAmount('');
      setIsLoadBalanceModalOpen(false);
    }
  };

  // Filter transactions for current user
  const userTransactions = transactions.filter(tx => 
      (tx.type === 'order' && tx.userPhone === phone) || 
      (tx.type === 'load' && tx.userPhone === phone)
  );

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Load Balance Modal */}
      {isLoadBalanceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 w-full max-w-sm relative shadow-2xl">
            <button onClick={() => setIsLoadBalanceModalOpen(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">&times;</button>
            <h3 className="text-2xl font-bold text-white mb-6">Add Funds</h3>
            <form onSubmit={handleLoadBalanceSubmit}>
              <label htmlFor="load-amount" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Amount (Nrs.)</label>
              <input
                type="number"
                id="load-amount"
                value={loadAmount}
                onChange={(e) => setLoadAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-4 text-white text-lg placeholder-neutral-700 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                autoFocus
              />
              <p className="text-xs text-neutral-500 mt-3">Request will be sent to admin for approval.</p>
              <button
                type="submit"
                className="mt-8 w-full bg-green-500 text-black py-4 rounded-xl font-bold hover:bg-green-400 flex items-center justify-center transition-colors shadow-lg shadow-green-500/20"
              >
                <CreditCardIcon />
                <span className="ml-2">Send Request</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-[#121212] p-6 md:p-8 rounded-3xl shadow-xl border border-white/5 mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 relative z-10">
            <div className="p-5 bg-neutral-800/50 rounded-2xl border border-white/5 text-neutral-300">
                <UserIcon />
            </div>
            <div className="flex-grow">
                <h2 className="text-3xl font-bold text-white tracking-tight">{username}</h2>
                <p className="text-green-500 font-mono mt-1 font-medium">{phone}</p>
            </div>
            <button
                onClick={logout}
                className="w-full sm:w-auto bg-red-500/10 text-red-400 border border-red-500/20 py-2.5 px-6 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition-all duration-300"
            >
                Log Out
            </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5 relative z-10">
            <div className="bg-neutral-900/50 p-4 rounded-2xl text-center border border-white/5">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Orders</p>
                <p className="text-2xl font-bold text-white mt-1">{orderCount}</p>
            </div>
            <div className="bg-neutral-900/50 p-4 rounded-2xl text-center border border-white/5">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Favorites</p>
                <p className="text-2xl font-bold text-white mt-1">{favoriteCount}</p>
            </div>
        </div>
        
        {/* Balance Section */}
        <div className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
            <div>
                <p className="text-sm font-medium text-green-400/80 uppercase tracking-wide">Wallet Balance</p>
                <p className={`text-4xl font-bold mt-1 tracking-tight ${balance < 0 ? 'text-red-500' : 'text-white'}`}>
                    Nrs. {balance.toFixed(0)}
                </p>
            </div>
            <button 
                onClick={() => setIsLoadBalanceModalOpen(true)} 
                className="w-full sm:w-auto flex items-center justify-center bg-green-500 text-black py-3 px-6 rounded-xl font-bold hover:bg-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 shadow-lg shadow-green-500/20"
            >
                <PlusIcon />
                <span className="ml-2">Add Funds</span>
            </button>
        </div>
      </div>

      <div className="mb-12 flex justify-center">
         <button
            onClick={() => setView('admin')}
            className="text-neutral-500 hover:text-white hover:underline text-sm transition-colors"
         >
            Dashboard Access
         </button>
      </div>

      {/* History Section */}
      {userTransactions.length === 0 ? (
        <div className="text-center py-16 bg-[#121212] rounded-3xl p-8 border border-white/5 border-dashed">
          <h2 className="text-2xl font-bold mb-4 text-white">No Orders Yet</h2>
          <p className="text-neutral-400 mb-8 max-w-xs mx-auto">Your history is empty. Time to discover your next favorite meal!</p>
          <button
            onClick={() => setView('menu')}
            className="bg-neutral-800 text-white border border-white/10 py-3 px-8 rounded-full font-bold hover:bg-white hover:text-black transition-all"
          >
            Go to Menu
          </button>
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Recent Activity</h2>
          </div>
          <div className="space-y-4 content-visibility-auto">
            {userTransactions.map(tx => {
              if (tx.type === 'order') {
                const isExpanded = expandedOrders.includes(tx.id);
                return (
                  <div key={tx.id} className="bg-[#121212] rounded-2xl overflow-hidden border border-white/5 transition-all hover:border-white/10">
                    <button
                      onClick={() => toggleOrderDetails(tx.id)}
                      className="w-full p-5 flex flex-col sm:flex-row justify-between sm:items-center text-left hover:bg-white/[0.02] transition-colors focus:outline-none group"
                      aria-expanded={isExpanded}
                    >
                      <div className="mb-3 sm:mb-0">
                        <div className="flex items-center gap-3 mb-1">
                             <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">Order #{tx.id.substring(24, 32)}</h3>
                             <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${statusColorMap[tx.status]}`}>{tx.status}</span>
                        </div>
                        <p className="text-xs text-neutral-500">{new Date(tx.created).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                         <span className="font-bold text-white">Nrs. {tx.totalPrice.toFixed(0)}</span>
                         <ChevronDownIcon className={`h-5 w-5 text-neutral-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="bg-black/20 border-t border-white/5 animate-fade-in">
                        <ul className="divide-y divide-white/5">
                          {tx.items.map((item, index) => (
                            <li key={`${item.id}-${index}`} className="p-4 flex justify-between items-center">
                              <div className="flex items-center">
                                <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-10 h-10 object-cover rounded-lg mr-3 bg-neutral-800" />
                                <div>
                                  <p className="font-medium text-white text-sm">{item.name}</p>
                                  <p className="text-xs text-neutral-500">{item.quantity} x Nrs. {item.price.toFixed(0)}</p>
                                </div>
                              </div>
                              <p className="font-medium text-neutral-300 text-sm">Nrs. {(item.price * item.quantity).toFixed(0)}</p>
                            </li>
                          ))}
                        </ul>
                         {tx.notes && (
                          <div className="p-4 border-t border-white/5 bg-yellow-500/5">
                            <p className="text-xs font-bold text-yellow-500/80 uppercase mb-1">Notes</p>
                            <p className="text-sm text-neutral-300 italic">"{tx.notes}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              } else if (tx.type === 'load') {
                return (
                  <div key={tx.id} className="bg-[#121212] rounded-2xl p-5 border border-white/5 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">Wallet Load</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${tx.status === 'Confirmed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {tx.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">{new Date(tx.created).toLocaleString()}</p>
                      </div>
                      <span className={`font-bold text-lg ${tx.status === 'Confirmed' ? 'text-green-500' : 'text-neutral-500'}`}>+ {tx.amount.toFixed(0)}</span>
                  </div>
                )
              }
               return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;