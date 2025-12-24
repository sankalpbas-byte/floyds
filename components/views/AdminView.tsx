import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../state/AppContext';
import { Transaction, OrderStatus, MenuItem } from '../../types';
import { CheckIcon } from '../icons/CheckIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { UserIcon } from '../icons/UserIcon';
import { CATEGORIES } from '../../constants';

const statusOptions: OrderStatus[] = ['Preparing', 'Out for Delivery', 'Delivered'];

export const AdminView: React.FC = () => {
  const { 
    state, 
    updateOrderStatus, 
    markOrderPaid, 
    addExpense, 
    confirmLoad, 
    adminAddFunds,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    resolveServiceRequest
  } = useContext(AppContext);
  
  const { transactions, menuItems } = state;
  const [activeTab, setActiveTab] = useState<'orders' | 'expenses' | 'profit' | 'ledgers' | 'menu'>('orders');

  // Expense Form State
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Ledger State
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  // Menu Form State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<Partial<MenuItem>>({
    name: '', description: '', price: 0, category: 'Main Courses', imageUrl: ''
  });

  const orders = useMemo(() => 
    transactions.filter((tx): tx is Transaction & { type: 'order' } => tx.type === 'order'), 
  [transactions]);

  const expenses = useMemo(() => 
    transactions.filter((tx): tx is Transaction & { type: 'expense' } => tx.type === 'expense'), 
  [transactions]);

  const serviceRequests = useMemo(() => 
    transactions.filter((tx): tx is Transaction & { type: 'service' } => tx.type === 'service' && tx.status === 'Pending'),
  [transactions]);

  // Daily Profit Stats
  const dailyStats = useMemo(() => {
    const stats: Record<string, { date: Date, revenue: number, expenses: number }> = {};
    transactions.forEach(tx => {
      if (tx.type === 'load') return;
      const dateObj = new Date(tx.created);
      const dateKey = dateObj.toLocaleDateString(); 
      if (!stats[dateKey]) stats[dateKey] = { date: dateObj, revenue: 0, expenses: 0 };
      if (tx.type === 'order') stats[dateKey].revenue += tx.totalPrice;
      else if (tx.type === 'expense') stats[dateKey].expenses += tx.amount;
    });
    return Object.values(stats)
      .map(stat => ({ ...stat, profit: stat.revenue - stat.expenses }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions]);

  const totals = useMemo(() => {
    return dailyStats.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      expenses: acc.expenses + curr.expenses,
      profit: acc.profit + curr.profit
    }), { revenue: 0, expenses: 0, profit: 0 });
  }, [dailyStats]);

  // Ledger / User Stats
  const userStats = useMemo(() => {
      const stats: Record<string, { phone: string, balance: number, totalOrders: number, lastActivity: string }> = {};
      
      transactions.forEach(tx => {
          if (tx.type === 'expense' || tx.type === 'service') return;
          const phone = tx.userPhone || 'Guest';
          if (!stats[phone]) stats[phone] = { phone, balance: 0, totalOrders: 0, lastActivity: tx.created };
          
          if (new Date(tx.created) > new Date(stats[phone].lastActivity)) {
              stats[phone].lastActivity = tx.created;
          }

          if (tx.type === 'load' && tx.status === 'Confirmed') {
              stats[phone].balance += tx.amount;
          } else if (tx.type === 'order') {
              stats[phone].balance -= tx.totalPrice;
              stats[phone].totalOrders += 1;
          }
      });
      return Object.values(stats);
  }, [transactions]);

  const selectedUserTransactions = useMemo(() => {
      if (!selectedUser) return [];
      return transactions.filter(tx => (tx.type === 'order' || tx.type === 'load') && tx.userPhone === selectedUser);
  }, [transactions, selectedUser]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supplier && description && amount) {
        addExpense(supplier, description, parseFloat(amount));
        setSupplier('');
        setDescription('');
        setAmount('');
    }
  };

  const handleAddFunds = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedUser && addFundsAmount) {
          adminAddFunds(selectedUser, parseFloat(addFundsAmount));
          setAddFundsAmount('');
          setIsAddFundsOpen(false);
      }
  };

  // Menu Handlers
  const openMenuModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setMenuForm({ ...item });
    } else {
      setEditingItem(null);
      setMenuForm({ name: '', description: '', price: 0, category: 'Main Courses', imageUrl: 'https://picsum.photos/seed/new/400/300' });
    }
    setIsMenuModalOpen(true);
  };

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (menuForm.name && menuForm.price) {
      if (editingItem) {
        editMenuItem({ ...editingItem, ...menuForm } as MenuItem);
      } else {
        const newItem: MenuItem = {
          id: Date.now().toString(),
          ...menuForm as any
        };
        addMenuItem(newItem);
      }
      setIsMenuModalOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h2>
      </div>

      {/* Live Alerts / Service Requests */}
      {serviceRequests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center uppercase tracking-wider animate-pulse">
             <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
             Live Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceRequests.map(req => (
              <div key={req.id} className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex justify-between items-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                 <div>
                   <p className="font-bold text-red-300">Need Water</p>
                   <p className="text-sm text-neutral-400">{req.userPhone}</p>
                   <p className="text-xs text-neutral-500">{new Date(req.created).toLocaleTimeString()}</p>
                 </div>
                 <button 
                  onClick={() => resolveServiceRequest(req.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors shadow-lg"
                 >
                   Done
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b border-white/10 overflow-x-auto pb-1 no-scrollbar">
        {['orders', 'expenses', 'profit', 'ledgers', 'menu'].map(tab => (
            <button
                key={tab}
                className={`pb-3 px-6 font-medium transition-all relative whitespace-nowrap capitalize text-sm ${
                    activeTab === tab ? 'text-green-400 font-bold' : 'text-neutral-500 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab as any)}
            >
                {tab === 'profit' ? 'Daily Profit' : tab}
                {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>}
            </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6 content-visibility-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="font-bold text-white">#{order.id.slice(-6)}</h3>
                      <p className="text-xs text-neutral-500">{new Date(order.created).toLocaleString()}</p>
                      <p className="text-xs text-green-500 font-mono mt-1">{order.userPhone}</p>
                   </div>
                   <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${order.isPaid ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {order.isPaid ? 'PAID' : 'UNPAID'}
                   </div>
                </div>
                {/* ... Order Items ... */}
                <div className="flex-grow mb-4 space-y-2 border-t border-white/5 pt-3 mt-1">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-neutral-300">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="text-neutral-500">{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                    ))}
                    {order.notes && (
                        <div className="mt-2 p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-xs text-yellow-200/80 italic">
                            "{order.notes}"
                        </div>
                    )}
                </div>
                <div className="pt-3 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-neutral-500 text-sm">Total</span>
                        <span className="text-xl font-bold text-white">Nrs. {order.totalPrice}</span>
                    </div>
                    <div className="space-y-3">
                        <div className="relative">
                            <select 
                                value={order.status} 
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className="w-full bg-neutral-900 text-white border border-white/10 rounded-xl py-2.5 px-3 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-green-500/50 cursor-pointer hover:bg-neutral-800 transition-colors"
                            >
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 text-neutral-500 pointer-events-none" />
                        </div>
                        {!order.isPaid && (
                            <button 
                                onClick={() => markOrderPaid(order.id)}
                                className="w-full bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black border border-green-500/20 py-2.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2"
                            >
                                <CheckIcon /> Settle Payment
                            </button>
                        )}
                    </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
                <div className="col-span-full py-16 text-center text-neutral-500 bg-[#121212] rounded-2xl border border-white/5 border-dashed">
                    No active orders
                </div>
            )}
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl sticky top-24">
                    <h3 className="text-lg font-bold text-white mb-6">New Purchase</h3>
                    <form onSubmit={handleExpenseSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Supplier</label>
                            <input 
                                type="text" 
                                required
                                value={supplier}
                                onChange={e => setSupplier(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-green-500/50 focus:outline-none placeholder-neutral-700"
                                placeholder="e.g. Fresh Veggies Pvt."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Description</label>
                            <textarea 
                                required
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-green-500/50 focus:outline-none placeholder-neutral-700"
                                placeholder="Tomatoes, Onions..."
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Amount</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-green-500/50 focus:outline-none placeholder-neutral-700"
                                placeholder="0.00"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-neutral-800 text-white font-bold py-3 rounded-xl hover:bg-white hover:text-black transition-colors"
                        >
                            Record Bill
                        </button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2 space-y-4 content-visibility-auto">
                <h3 className="text-lg font-bold text-white mb-4">History</h3>
                {expenses.length === 0 ? (
                    <div className="text-center py-12 bg-[#121212] rounded-2xl border border-white/5 text-neutral-500 border-dashed">
                        No expenses recorded.
                    </div>
                ) : (
                    expenses.map(exp => (
                        <div key={exp.id} className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex justify-between items-center hover:border-white/10 transition-colors">
                            <div>
                                <h4 className="font-bold text-white">{exp.supplier}</h4>
                                <p className="text-neutral-400 text-sm">{exp.description}</p>
                                <p className="text-xs text-neutral-600 mt-1">{new Date(exp.created).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold text-red-400">- {exp.amount.toFixed(0)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}

      {/* Profit Tab */}
      {activeTab === 'profit' && (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Sales</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">Nrs. {totals.revenue.toFixed(0)}</p>
                </div>
                <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-400 mt-2">Nrs. {totals.expenses.toFixed(0)}</p>
                </div>
                <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Net Profit</p>
                    <p className={`text-3xl font-bold mt-2 ${totals.profit >= 0 ? 'text-white' : 'text-red-500'}`}>
                        Nrs. {totals.profit.toFixed(0)}
                    </p>
                </div>
            </div>
            <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">Daily Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-900 text-neutral-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold text-right">Sales</th>
                                <th className="px-6 py-4 font-bold text-right">Expenses</th>
                                <th className="px-6 py-4 font-bold text-right">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {dailyStats.map((stat, index) => (
                                <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-white font-medium whitespace-nowrap">
                                        {stat.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right text-green-400 font-mono">
                                        {stat.revenue > 0 ? `+${stat.revenue.toFixed(0)}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-red-400 font-mono">
                                        {stat.expenses > 0 ? `-${stat.expenses.toFixed(0)}` : '-'}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold font-mono ${stat.profit >= 0 ? 'text-white' : 'text-red-500'}`}>
                                        {stat.profit.toFixed(0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* Ledgers Tab */}
      {activeTab === 'ledgers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Users List */}
              <div className="lg:col-span-1 space-y-4">
                  <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden flex flex-col max-h-[600px]">
                      <div className="p-4 border-b border-white/5 bg-neutral-900/30">
                          <h3 className="font-bold text-white">Users</h3>
                      </div>
                      <ul className="divide-y divide-white/5 overflow-y-auto content-visibility-auto">
                          {userStats.map(user => (
                              <li key={user.phone}>
                                  <button
                                      onClick={() => { setSelectedUser(user.phone); setIsAddFundsOpen(false); }}
                                      className={`w-full text-left p-4 hover:bg-white/[0.02] transition-colors flex justify-between items-center ${selectedUser === user.phone ? 'bg-green-500/5 border-l-2 border-green-500' : 'border-l-2 border-transparent'}`}
                                  >
                                      <div>
                                          <p className="text-white font-medium text-sm">{user.phone}</p>
                                          <p className="text-[10px] text-neutral-500 uppercase mt-0.5">{user.totalOrders} Orders</p>
                                      </div>
                                      <div className="text-right">
                                          <p className={`font-bold font-mono ${user.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                              {user.balance.toFixed(0)}
                                          </p>
                                      </div>
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>

              {/* User Details */}
              <div className="lg:col-span-2">
                  {selectedUser ? (
                      <div className="bg-[#121212] rounded-2xl border border-white/5 p-6 relative">
                          <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6">
                              <div>
                                  <h3 className="text-2xl font-bold text-white tracking-tight">{selectedUser}</h3>
                                  <p className="text-neutral-500 text-sm">Transaction History</p>
                              </div>
                              <button
                                  onClick={() => setIsAddFundsOpen(!isAddFundsOpen)}
                                  className="bg-neutral-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-white hover:text-black flex items-center transition-all text-sm"
                              >
                                  <PlusIcon />
                                  <span className="ml-2">Add Funds</span>
                              </button>
                          </div>

                          {isAddFundsOpen && (
                              <div className="mb-6 bg-neutral-900/50 p-5 rounded-2xl border border-white/5 animate-fade-in">
                                  <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Add Funds</h4>
                                  <form onSubmit={handleAddFunds} className="flex gap-4">
                                      <input 
                                          type="number" 
                                          placeholder="Amount"
                                          className="flex-grow bg-[#121212] border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-green-500/50 focus:outline-none"
                                          value={addFundsAmount}
                                          onChange={e => setAddFundsAmount(e.target.value)}
                                          min="1"
                                      />
                                      <button type="submit" className="bg-green-500 text-black font-bold px-6 rounded-xl hover:bg-green-400 transition-colors">
                                          Confirm
                                      </button>
                                  </form>
                              </div>
                          )}

                          <div className="space-y-3 content-visibility-auto">
                              {selectedUserTransactions.length === 0 ? (
                                  <p className="text-neutral-500 text-center py-10 border border-white/5 border-dashed rounded-xl">No transactions found.</p>
                              ) : (
                                  selectedUserTransactions.slice().reverse().map(tx => (
                                      <div key={tx.id} className="bg-neutral-900/30 p-4 rounded-xl flex justify-between items-center border border-white/5 hover:border-white/10 transition-colors">
                                          <div className="flex items-center gap-4">
                                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'load' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                  {tx.type === 'load' ? <PlusIcon /> : <span className="font-bold text-lg">-</span>}
                                              </div>
                                              <div>
                                                  <p className="text-white font-medium text-sm">
                                                      {tx.type === 'order' ? `Order #${tx.id.slice(-6)}` : `Wallet Load`}
                                                  </p>
                                                  <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-neutral-500">{new Date(tx.created).toLocaleString()}</p>
                                                    {tx.type === 'load' && 'status' in tx && (
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${tx.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                            {tx.status}
                                                        </span>
                                                    )}
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                              <span className={`font-bold font-mono ${tx.type === 'load' ? 'text-green-400' : 'text-neutral-300'}`}>
                                                  {tx.type === 'load' ? '+' : '-'} {tx.type === 'load' ? tx.amount.toFixed(0) : tx.totalPrice.toFixed(0)}
                                              </span>
                                              {tx.type === 'load' && 'status' in tx && tx.status === 'Pending' && (
                                                  <button
                                                      onClick={() => confirmLoad(tx.id)}
                                                      className="bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-black p-2 rounded-lg transition-colors"
                                                      title="Confirm Load"
                                                  >
                                                      <CheckIcon />
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-500 bg-[#121212] rounded-2xl border border-white/5 border-dashed p-10">
                          <div className="bg-neutral-800/50 p-4 rounded-full mb-4">
                             <UserIcon />
                          </div>
                          <p>Select a user to view their ledger.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === 'menu' && (
         <div className="space-y-6">
            <div className="flex justify-end">
               <button 
                onClick={() => openMenuModal()}
                className="bg-green-500 text-black px-5 py-2.5 rounded-xl font-bold hover:bg-green-400 flex items-center shadow-lg shadow-green-500/20 transition-all transform hover:scale-105"
               >
                 <PlusIcon />
                 <span className="ml-2">Add New Item</span>
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {menuItems.map(item => (
                 <div key={item.id} className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-lg group hover:border-green-500/30 transition-all">
                    <div className="relative h-48 overflow-hidden">
                        <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent"></div>
                        <div className="absolute bottom-3 left-4">
                            <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md border border-white/10">{item.category}</span>
                        </div>
                    </div>
                    <div className="p-5">
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-white text-lg leading-tight">{item.name}</h3>
                         <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded text-sm">Nrs. {item.price}</span>
                       </div>
                       <p className="text-neutral-500 text-sm mb-6 line-clamp-2">{item.description}</p>
                       <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => openMenuModal(item)}
                            className="bg-neutral-800 hover:bg-white hover:text-black text-neutral-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => { if(window.confirm('Delete this item?')) deleteMenuItem(item.id); }}
                            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <TrashIcon />
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Menu Modal */}
            {isMenuModalOpen && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                 <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
                    <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">{editingItem ? 'Edit Item' : 'New Menu Item'}</h3>
                    <form onSubmit={handleMenuSubmit} className="space-y-5">
                       <div>
                          <label className="block text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Item Name</label>
                          <input 
                            type="text"
                            required
                            value={menuForm.name}
                            onChange={e => setMenuForm({...menuForm, name: e.target.value})}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-green-500/50 focus:outline-none placeholder-neutral-700"
                            placeholder="e.g. Spicy Chicken Wings"
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Price</label>
                                <input 
                                    type="number"
                                    required
                                    value={menuForm.price}
                                    onChange={e => setMenuForm({...menuForm, price: parseFloat(e.target.value)})}
                                    className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-green-500/50 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Category</label>
                                <select
                                    value={menuForm.category}
                                    onChange={e => setMenuForm({...menuForm, category: e.target.value})}
                                    className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-green-500/50 focus:outline-none appearance-none"
                                >
                                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                       </div>
                       <div>
                          <label className="block text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Description</label>
                          <textarea
                            required
                            value={menuForm.description}
                            onChange={e => setMenuForm({...menuForm, description: e.target.value})}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-green-500/50 focus:outline-none placeholder-neutral-700 resize-none"
                            rows={3}
                            placeholder="Describe the dish..."
                          />
                       </div>
                       <div>
                          <label className="block text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Image URL</label>
                          <input 
                            type="text"
                            value={menuForm.imageUrl}
                            onChange={e => setMenuForm({...menuForm, imageUrl: e.target.value})}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-green-500/50 focus:outline-none placeholder-neutral-700"
                            placeholder="https://..."
                          />
                       </div>
                       <div className="flex gap-4 pt-4">
                          <button 
                            type="button" 
                            onClick={() => setIsMenuModalOpen(false)}
                            className="w-1/2 bg-neutral-800 text-neutral-300 py-3 rounded-xl font-bold hover:bg-neutral-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="w-1/2 bg-green-500 text-black py-3 rounded-xl font-bold hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
                          >
                            Save Item
                          </button>
                       </div>
                    </form>
                 </div>
              </div>
            )}
         </div>
      )}
    </div>
  );
};

export default AdminView;