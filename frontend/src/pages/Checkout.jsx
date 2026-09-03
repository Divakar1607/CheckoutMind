import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, ShieldCheck, ArrowRight, ShoppingCart, Sparkles, Smartphone, Building2, Trash2 } from 'lucide-react';

const Checkout = ({ cart, total, sessionId, setCart, removeFromCart }) => {
  const [hesitationTriggered, setHesitationTriggered] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    if (cart.length === 0) return;
    
    const timer = setTimeout(() => {
      if (!hesitationTriggered) {
        setHesitationTriggered(true);
        axios.post('http://localhost:5000/api/agent/event', {
          sessionId,
          eventType: 'checkout_hesitation_60s',
          context: { cartValue: total, items: cart.map(i => i.name) }
        }).then(res => {
          window.dispatchEvent(new CustomEvent('agent-action', { detail: res.data }));
          
          if (res.data.action_type === 'discount') {
             const pct = res.data.action_payload.discount_percentage || 0;
             setDiscountAmount((total * pct) / 100);
          }
        });
      }
    }, 10000); // 10s for demo

    return () => clearTimeout(timer);
  }, [cart, total, sessionId, hesitationTriggered]);

  const handlePayment = async () => {
    try {
      const finalTotal = total - discountAmount;
      const res = await axios.post('http://localhost:5000/api/checkout', { amount: finalTotal });
      
      if (res.data.mock) {
        alert("Payment Successful (Mock Mode)");
        setCart([]);
      } else {
        const options = {
          key: "rzp_test_dummy",
          amount: res.data.amount,
          currency: res.data.currency,
          name: "CheckoutMind Premium",
          description: "Test Transaction",
          order_id: res.data.id,
          handler: function (response) {
            alert("Payment Successful! ID: " + response.razorpay_payment_id);
            setCart([]);
          },
          theme: { color: "#d946ef" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 animate-fade-in-up">
        <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
          <ShoppingCart size={40} className="text-gray-600" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Discover our premium collection and find something you love.</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-white text-dark-900 rounded-lg font-bold hover:bg-gray-200 transition-colors">
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4">Complete Your Order</h1>
        <p className="text-gray-400">You're just one step away from premium quality.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingCart size={20} className="text-brand-400" /> Order Summary
            </h2>
            <div className="space-y-6 divide-y divide-white/10">
              {cart.map(item => (
                <div key={item.id} className="pt-6 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-dark-900 border border-white/10 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity mix-blend-screen" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{item.name}</p>
                      <p className="text-sm text-gray-500 font-medium">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-extrabold text-white text-xl">₹{(item.price * item.quantity).toLocaleString()}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="md:col-span-1">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Payment</h2>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-white">Free</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-brand-400 animate-pulse bg-brand-500/10 p-2 rounded-lg border border-brand-500/20">
                  <span className="flex items-center gap-1"><Sparkles size={14} /> Agent Discount</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-gray-400">Total</span>
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  ₹{(total - discountAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="text-sm font-bold text-white mb-3">Select Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${paymentMethod === 'upi' ? 'bg-brand-500/20 border-brand-500' : 'bg-dark-900 border-white/10 hover:border-brand-500/50'}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <Smartphone className={paymentMethod === 'upi' ? 'text-brand-400' : 'text-gray-500'} size={20} />
                  <span className={`font-medium ${paymentMethod === 'upi' ? 'text-brand-400' : 'text-gray-400'}`}>UPI (GPay, PhonePe, Paytm)</span>
                </label>
                
                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${paymentMethod === 'card' ? 'bg-brand-500/20 border-brand-500' : 'bg-dark-900 border-white/10 hover:border-brand-500/50'}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <CreditCard className={paymentMethod === 'card' ? 'text-brand-400' : 'text-gray-500'} size={20} />
                  <span className={`font-medium ${paymentMethod === 'card' ? 'text-brand-400' : 'text-gray-400'}`}>Credit / Debit Card</span>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${paymentMethod === 'netbanking' ? 'bg-brand-500/20 border-brand-500' : 'bg-dark-900 border-white/10 hover:border-brand-500/50'}`}>
                  <input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <Building2 className={paymentMethod === 'netbanking' ? 'text-brand-400' : 'text-gray-500'} size={20} />
                  <span className={`font-medium ${paymentMethod === 'netbanking' ? 'text-brand-400' : 'text-gray-400'}`}>Net Banking</span>
                </label>
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="mt-6 w-full bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:from-brand-500 hover:to-fuchsia-500 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <span>Pay Now</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> Secured by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
