import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Storefront from './pages/Storefront';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import ConfigPanel from './pages/ConfigPanel';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import { ShoppingCart, LayoutDashboard, Settings, Sparkles, Heart } from 'lucide-react';
import AgentPopup from './components/AgentPopup';

const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-brand-500/10 text-brand-400 shadow-[inset_0_1px_0_0_rgba(217,70,239,0.2)]' 
          : 'text-gray-400 hover:text-gray-100 hover:bg-dark-700/50'
      }`}
    >
      {Icon && <Icon size={18} className={isActive ? 'text-brand-400' : 'text-gray-400'} />}
      {children}
    </Link>
  );
};

function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-4 h-4 bg-fuchsia-500 rounded-full pointer-events-none mix-blend-screen z-[9999] transition-transform duration-75 ease-out shadow-[0_0_15px_rgba(217,70,239,1)]"
        style={{ transform: `translate(${position.x - 8}px, ${position.y - 8}px)` }}
      />
      <div 
        className="fixed top-0 left-0 w-12 h-12 border-2 border-brand-400 rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-out opacity-50"
        style={{ transform: `translate(${position.x - 24}px, ${position.y - 24}px)` }}
      />
    </>
  );
}

function AppContent() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', 'sess_' + Math.random().toString(36).substr(2, 9));
    }
    setSessionId(localStorage.getItem('sessionId'));
  }, []);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-gray-100 cursor-none">
      <CustomCursor />
      <nav className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                <Sparkles className="text-brand-500 animate-pulse" size={28} />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-fuchsia-500 to-purple-600">
                  CheckoutMind
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NavLink to="/" icon={ShoppingCart}>Store</NavLink>
              <NavLink to="/wishlist" icon={Heart}>Wishlist</NavLink>
              <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/config" icon={Settings}>Config</NavLink>
              
              <div className="h-6 w-px bg-white/10 mx-2"></div>
              
              <Link to="/checkout" className="relative group p-2">
                <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-md scale-0 group-hover:scale-100 transition-transform"></div>
                <ShoppingCart size={24} className="text-gray-300 group-hover:text-white transition-colors relative z-10" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-[0_0_10px_rgba(217,70,239,0.5)] border border-brand-400 relative z-20">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-900/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <Routes>
          <Route path="/" element={<Storefront addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} sessionId={sessionId} />} />
          <Route path="/wishlist" element={<Wishlist wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} sessionId={sessionId} />} />
          <Route path="/checkout" element={<Checkout cart={cart} total={cartTotal} sessionId={sessionId} setCart={setCart} removeFromCart={removeFromCart} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/config" element={<ConfigPanel />} />
        </Routes>
      </main>
      
      {/* Global Agent Popup Layer */}
      <AgentPopup cart={cart} sessionId={sessionId} total={cartTotal} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
