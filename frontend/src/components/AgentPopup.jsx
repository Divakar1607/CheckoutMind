import React, { useEffect, useState } from 'react';
import { Sparkles, X, Gift, MessageCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const AgentPopup = ({ cart, sessionId, total }) => {
  const [activePopup, setActivePopup] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let idleTimer;
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (cart.length > 0 && window.location.pathname === '/') {
        idleTimer = setTimeout(() => {
          triggerAgentEvent('idle_30s');
        }, 15000); 
      }
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, [cart, sessionId]);

  useEffect(() => {
    const handleAgentAction = (e) => {
      if (e.detail.action_type !== 'none') {
        setActivePopup(e.detail);
        setIsOpen(true);
      }
    };
    window.addEventListener('agent-action', handleAgentAction);
    return () => window.removeEventListener('agent-action', handleAgentAction);
  }, []);

  const triggerAgentEvent = async (eventType) => {
    try {
      const res = await axios.post('http://localhost:5000/api/agent/event', {
        sessionId,
        eventType,
        context: { cartValue: total, items: cart.map(i => i.name) }
      });
      if (res.data.action_type !== 'none') {
        setActivePopup(res.data);
        setIsOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!activePopup) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out \${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-brand-400 via-fuchsia-500 to-purple-600 shadow-[0_0_40px_rgba(217,70,239,0.4)] overflow-hidden animate-glow">
        <div className="relative bg-dark-900 rounded-[23px] w-80 sm:w-96 overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="bg-brand-900/30 border-b border-brand-500/20 px-5 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center border-2 border-dark-900 z-10 relative">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-dark-900 rounded-full"></span>
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm leading-none">AI Concierge</h4>
                <p className="text-[10px] text-brand-300 uppercase tracking-widest font-semibold mt-1">Active</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 relative">
            {/* Ambient background glow inside the chat */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand-500/20 blur-[40px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-dark-800 border border-white/5 flex items-center justify-center flex-shrink-0 shadow-inner">
                {activePopup.action_type === 'discount' ? <Gift size={14} className="text-brand-400" /> : <MessageCircle size={14} className="text-brand-400" />}
              </div>
              
              <div className="bg-dark-800 border border-white/10 rounded-2xl rounded-tl-sm p-4 shadow-lg text-sm text-gray-200">
                <p className="font-medium leading-relaxed">
                  {activePopup.action_payload?.message || "I noticed you're looking around. Can I assist you with anything?"}
                </p>
                
                {activePopup.action_type === 'discount' && activePopup.action_payload?.discount_percentage && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-fuchsia-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-md">
                    <Gift size={12} />
                    {activePopup.action_payload.discount_percentage}% OFF APPLIED
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-3 border-t border-white/5 bg-dark-800/50 flex justify-end">
            <button 
              onClick={() => {
                setIsOpen(false);
                if (activePopup.action_type === 'discount') {
                   // Redirect to checkout or just close
                   if(window.location.pathname !== '/checkout') {
                      window.location.href = '/checkout';
                   }
                }
              }}
              className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300 uppercase tracking-widest transition-colors group"
            >
              {activePopup.action_type === 'discount' ? 'Go to Checkout' : 'Understood'}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AgentPopup;
