import React, { useContext, useState, useEffect } from 'react';
import { UserIcon } from '../icons/UserIcon';
import { AppContext } from '../../state/AppContext';
import { LoginIcon } from '../icons/LoginIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = React.memo(({ title }) => {
  const { state, login, setView } = useContext(AppContext);
  const { isLoggedIn } = state;
  const [phone, setPhone] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
       setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        setDeferredPrompt(null);
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      login(phone.trim());
      setPhone('');
    }
  };

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'bg-[#050505]/80 border-b border-white/5 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-transparent border-b border-transparent'}`}>
      <div className="container mx-auto px-4">
        {/* Top Row */}
        <div className="h-16 flex justify-center items-center relative">
          
          {/* Install Button */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="absolute left-0 text-neutral-400 hover:text-green-400 text-xs flex flex-col items-center group transition-colors"
              title="Install App"
            >
              <div className="border border-current rounded-lg p-1.5 group-hover:bg-green-500/10">
                 <PlusIcon />
              </div>
            </button>
          )}

          <h1 className={`text-xl md:text-2xl font-bold text-center absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${scrolled ? 'text-white scale-100' : 'text-white/90 scale-105'}`}>
            {title}
          </h1>
          
          {isLoggedIn && (
            <button 
              onClick={() => setView('profile')} 
              className="text-neutral-300 hover:text-green-400 hover:bg-white/5 transition-all duration-200 p-2 rounded-full absolute right-0"
              aria-label="Open Profile"
            >
              <UserIcon />
            </button>
          )}
        </div>

        {/* Login Form */}
        {!isLoggedIn && (
          <form onSubmit={handleLogin} className={`pb-4 transition-all duration-300 ${scrolled ? 'opacity-0 h-0 overflow-hidden pb-0' : 'opacity-100 h-auto'}`}>
            <div className="relative max-w-md mx-auto">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <PhoneIcon />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full bg-[#121212] border border-white/10 rounded-xl py-3 pl-10 pr-24 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all shadow-inner"
                autoComplete="tel"
              />
              <button
                type="submit"
                className="absolute inset-y-1 right-1 flex items-center px-4 rounded-lg bg-green-500/10 text-green-400 font-bold hover:bg-green-500 hover:text-black transition-all duration-200 text-sm"
              >
                <LoginIcon />
                <span className="ml-1">Log In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </header>
  );
});