import React, { useContext } from 'react';
import { AppContext } from '../../state/AppContext';

const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)

export const OrderConfirmation: React.FC = () => {
  const { setView } = useContext(AppContext);

  return (
    <div className="text-center py-20 max-w-lg mx-auto bg-neutral-900 p-10 rounded-xl shadow-lg border border-neutral-800">
      <CheckCircleIcon />
      <h2 className="text-3xl font-bold mb-4 text-white">Thank You For Your Order!</h2>
      <p className="text-gray-300 mb-8">Your order has been placed and our kitchen is preparing it now. We'll notify you when it's ready.</p>
      <button
        onClick={() => setView('menu')}
        className="bg-green-500 text-black py-3 px-8 rounded-lg font-bold hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-400 transition-colors duration-300"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default OrderConfirmation;
