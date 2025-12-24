import React, { useContext } from 'react';
import { AppContext } from '../../state/AppContext';

export const HomeView: React.FC = () => {
  const { setView } = useContext(AppContext);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative text-center bg-[#121212] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 saturate-50 mix-blend-overlay" 
          style={{ backgroundImage: `url('https://picsum.photos/seed/nepal/1200/600')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/80 to-[#121212]"></div>
        
        <div className="relative z-10 p-8 py-20 md:p-20">
          <div className="inline-block px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
            Kathmandu's Finest
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tighter drop-shadow-sm">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Floyd's</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 leading-relaxed max-w-2xl mx-auto mb-10 font-light">
            Your sanctuary in the heart of Nepal. Experience soulful food and curated essentials in an atmosphere that feels like home.
          </p>
          <button
            onClick={() => setView('menu')}
            className="bg-green-500 text-black py-4 px-10 rounded-full font-bold text-lg hover:bg-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            Explore Our Menu
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#121212] p-8 md:p-10 rounded-3xl border border-white/5 shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">A Taste of Comfort</h2>
        <p className="text-neutral-400 leading-relaxed text-lg">
          At Floyd's, we believe in the power of good food to bring people together. Our kitchen is passionate about crafting dishes that warm you from the inside out, from timeless comfort classics to unique local favorites. Every meal is an experience, prepared with care and the freshest ingredients available in the valley.
        </p>
      </section>
      
      {/* Offerings Section */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="group bg-[#121212] p-8 rounded-3xl border border-white/5 hover:border-green-500/20 transition-colors duration-300">
          <div className="h-12 w-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform duration-300">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Soulful Food</h3>
          <p className="text-neutral-400 leading-relaxed">
            Dive into our menu featuring everything from classic Margherita pizzas to rich Carbonara pasta, all with a unique Nepali touch. Perfect for a hearty meal any time of day.
          </p>
        </div>
        <div className="group bg-[#121212] p-8 rounded-3xl border border-white/5 hover:border-green-500/20 transition-colors duration-300">
          <div className="h-12 w-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Curated Essentials</h3>
          <p className="text-neutral-400 leading-relaxed">
            Beyond our kitchen, we offer a selection of premium cigarettes for your convenience. Whether you're dining in or just stopping by, we've got you covered.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomeView;