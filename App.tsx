
import React, { Suspense, lazy, useContext, useEffect } from 'react';
import { AppContext } from './state/AppContext';
import { Header } from './components/ui/Header';
import { BottomNav } from './components/ui/BottomNav';
import { Toast } from './components/ui/Toast';
import { CartFAB } from './components/ui/CartFAB';
import { OrdersIcon } from './components/icons/OrdersIcon';

// Lazy load view components for code-splitting
const HomeView = lazy(() => import('./components/views/HomeView'));
const MenuView = lazy(() => import('./components/views/MenuView'));
const CartView = lazy(() => import('./components/views/CartView'));
const ProfileView = lazy(() => import('./components/views/ProfileView'));
const AboutView = lazy(() => import('./components/views/AboutView'));
const OrderConfirmation = lazy(() => import('./components/ui/OrderConfirmation'));
const AdminView = lazy(() => import('./components/views/AdminView'));

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

const App: React.FC = () => {
  const { state, setView, setToast, requestWater } = useContext(AppContext);
  const { view, isLoggedIn, cartItems, toastMessage, isLoading } = state;

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const pageTitles: Record<string, string> = {
    home: "Welcome to Floyd's",
    menu: "Floyd's Menu",
    cart: 'Your Cart',
    confirmation: 'Order Confirmed',
    about: "About Floyd's",
    profile: 'Your Profile',
    admin: 'Restaurant Management',
  };

  const renderContent = () => {
    switch (view) {
      case 'cart':
        return <CartView />;
      case 'confirmation':
        return <OrderConfirmation />;
      case 'about':
        return <AboutView />;
      case 'profile':
        return <ProfileView />;
      case 'menu':
        return <MenuView />;
      case 'admin':
        return <AdminView />;
      case 'home':
      default:
        return <HomeView />;
    }
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen text-neutral-200">
      <Toast message={toastMessage} onClose={() => setToast('')} />
      <Header title={pageTitles[view] || "Welcome to Floyd's"} />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <Suspense fallback={<LoadingSpinner />}>
          {renderContent()}
        </Suspense>
      </main>

      {/* Logged-in only UI elements */}
      {isLoggedIn && (
        <>
          {view === 'menu' && (
            <>
              <button
                onClick={requestWater}
                className="fixed bottom-20 left-4 z-10 bg-cyan-500 text-white py-2 px-4 rounded-full shadow-lg hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-cyan-400 transition-colors duration-300"
              >
                Need Water?
              </button>
              <button
                onClick={() => setView('profile')}
                className="fixed bottom-20 right-4 z-10 bg-green-500 text-black p-3 rounded-full shadow-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-400 transition-colors duration-300"
                aria-label="View Order History"
              >
                <OrdersIcon />
              </button>
            </>
          )}

          {cartItemCount > 0 && view !== 'cart' && (
            <CartFAB
              itemCount={cartItemCount}
              onClick={() => setView('cart')}
            />
          )}
          
          <BottomNav />
        </>
      )}
    </div>
  );
};

export default App;
