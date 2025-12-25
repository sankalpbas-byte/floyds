import React, { useState, useEffect } from 'react';
import { WhatsappIcon } from '../icons/WhatsappIcon';
import { InstagramIcon } from '../icons/InstagramIcon';
import { FacebookIcon } from '../icons/FacebookIcon';
import { PhoneIcon } from '../icons/PhoneIcon';

export const AboutView: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();
      // Restaurant is open from 10 AM (10) to 10 PM (22)
      setIsOpen(currentHour >= 10 && currentHour < 22);
    };

    checkStatus(); // Initial check
    const interval = setInterval(checkStatus, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-neutral-900 p-8 rounded-xl shadow-lg text-center border border-neutral-800">
      <h2 className="text-4xl font-bold mb-4 text-green-400">Floyd's</h2>
      <p className="text-gray-300 leading-relaxed mb-6">
        Welcome to Floyd's, your little haven nestled in the heart of Nepal. We're passionate about serving up soulful food that warms you from the inside out. 
        From classic comfort dishes to local favorites, every meal is an experience.
      </p>
      <p className="text-gray-300 leading-relaxed mb-8">
        Beyond our kitchen, we offer a curated selection of cigarettes for your convenience. Whether you're stopping by for a hearty meal or just to pick up a pack, we've got you covered. Settle in, relax, and enjoy the vibe.
      </p>
      
      <div className="border-t border-neutral-800 pt-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-white">Opening Hours</h3>
        <p className="text-gray-400 mb-3">Open daily from 10:00 AM to 10:00 PM</p>
        <div className={`px-4 py-1.5 text-sm font-bold rounded-full inline-block ${isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
          {isOpen ? 'Currently Open' : 'Currently Closed'}
        </div>
      </div>

       <div className="border-t border-neutral-800 pt-6 mb-8">
        <a href="tel:+97712345678" className="w-full max-w-xs mx-auto bg-green-500 text-black py-3 px-6 rounded-lg font-bold hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-400 transition-colors duration-300 flex items-center justify-center">
            <PhoneIcon />
            <span className="ml-2">Call Us Now</span>
        </a>
       </div>

      <div className="border-t border-neutral-800 pt-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Follow Us</h3>
        <div className="flex justify-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" aria-label="WhatsApp">
            <WhatsappIcon />
          </a>
          <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" aria-label="Instagram">
            <InstagramIcon />
          </a>
          <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" aria-label="Facebook">
            <FacebookIcon />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
