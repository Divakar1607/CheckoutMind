import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Send } from 'lucide-react';

export default function ProductDetail({ addToCart, wishlist, toggleWishlist, sessionId }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p.id === parseInt(id));
        setProduct(found);
        setLoading(false);
      });
  }, [id]);

  const handleAskAgent = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAgentTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/agent/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType: 'product_qa',
          context: {
            productId: product.id,
            productName: product.name,
            question: userMessage
          }
        })
      });
      const data = await response.json();
      
      setChatHistory(prev => [...prev, { 
        role: 'agent', 
        content: data.action_payload?.message || "I'm sorry, I couldn't process that." 
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'agent', content: "Error connecting to AI." }]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  if (loading) return <div className="text-center p-20 text-gray-400">Loading...</div>;
  if (!product) return <div className="text-center p-20 text-gray-400">Product not found</div>;

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center text-brand-400 hover:text-brand-300 mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Store
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative group rounded-2xl overflow-hidden glass p-4 flex items-center justify-center bg-dark-800">
          <div className="absolute inset-0 bg-brand-500/5 group-hover:bg-brand-500/10 transition-colors"></div>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-auto max-h-[500px] object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
          />
          <button 
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-4 right-4 z-20 p-3 rounded-full bg-dark-900/80 hover:bg-dark-900 border border-white/10 transition-all hover:scale-110"
          >
            <Heart size={24} className={isWishlisted ? "text-fuchsia-500 fill-fuchsia-500" : "text-gray-400"} />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30 w-max mb-4">
            {product.category}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
          <p className="text-3xl font-light text-fuchsia-400 mb-6">₹{product.price.toLocaleString()}</p>
          
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {product.description || "A premium product designed to exceed your expectations. Experience the perfect blend of style and functionality."}
          </p>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 border border-white/5">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm font-medium text-gray-300">In Stock (12 left)</span>
            </div>
          </div>

          <button 
            onClick={() => addToCart(product)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>

          {/* AI Buy Assistant Widget */}
          <div className="mt-12 glass rounded-2xl p-6 border border-brand-500/20 shadow-[0_0_15px_rgba(217,70,239,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-400 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="font-bold text-white text-sm">AI</span>
              </div>
              <div>
                <h3 className="font-bold text-white">AI Buy Assistant</h3>
                <p className="text-xs text-brand-300">Ask me anything about this product</p>
              </div>
            </div>
            
            <div className="h-48 overflow-y-auto mb-4 p-4 bg-dark-900/50 rounded-xl border border-white/5 flex flex-col gap-3">
              {chatHistory.length === 0 && (
                <div className="text-center text-sm text-gray-500 mt-10">
                  Try asking about sizing, compatibility, or how it compares to similar items!
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === 'user' ? 'bg-brand-500/20 text-brand-100 border border-brand-500/30 rounded-br-none' : 'bg-dark-800 text-gray-300 border border-white/10 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAgentTyping && (
                <div className="flex justify-start">
                  <div className="bg-dark-800 p-3 rounded-lg border border-white/10 rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAgent()}
                placeholder="Ask a question..."
                className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50"
              />
              <button 
                onClick={handleAskAgent}
                disabled={isAgentTyping || !chatInput.trim()}
                className="p-2 bg-brand-500/20 text-brand-400 rounded-xl hover:bg-brand-500/30 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
