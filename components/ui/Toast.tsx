import React, { useEffect, useState } from 'react';
import { BellIcon } from '../icons/BellIcon';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 4000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Wait for animation to finish before calling onClose
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out 
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
    >
      <div className="bg-neutral-900 border border-green-500/50 rounded-lg shadow-lg shadow-green-500/10 flex items-center p-4 space-x-3">
        <BellIcon />
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
};
