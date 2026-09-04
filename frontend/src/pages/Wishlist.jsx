import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Bell } from 'lucide-react';

export default function Wishlist({ wishlist, toggleWishlist, addToCart, sessionId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Trigger agent wishlist check when visiting the wishlist page with items
    if (wishlist.length > 0) {
      const checkWishlist = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/agent/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              eventType: 'wishlist_check',
              context: { wishlist_count: wishlist.length }
            })
          });
          const data = await response.json();
          if (data.action_type === 'wishlist_alert') {
            setNotification(data.action_payload?.message);
          }
        } catch (err) {
          console.error("Failed to check wishlist with agent", err);
        }
      };
      checkWishlist();
    }
  }, [wishlist.length, sessionId]);

  if (loading) return <div className="text-center p-20 text-gray-400">Loading...</div>;

  const wishlistedItems = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="text-fuchsia-500 fill-fuchsia-500" size={32} />
        <h1 className="text-3xl font-bold text-white">Your Wishlist</h1>
      </div>

      {notification && (
        <div className="mb-8 p-4 bg-brand-500/20 border border-brand-500/50 rounded-xl flex items-start gap-3">
          <Bell className="text-brand-400 mt-1 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-brand-300">Agent Alert</h4>
            <p className="text-sm text-brand-100">{notification}</p>
          </div>
        </div>
      )}

      {wishlistedItems.length === 0 ? (
        <div className="text-center p-20 glass rounded-2xl border border-white/5">
          <Heart className="mx-auto text-gray-600 mb-4" size={48} />
          <h2 className="text-xl font-medium text-gray-300 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love and keep an eye on price drops.</p>
          <Link to="/" className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors">
            Explore Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistedItems.map(product => (
            <div key={product.id} className="glass rounded-2xl p-4 flex flex-col group relative overflow-hidden border border-white/5 hover:border-brand-500/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all"></div>
              
              <Link to={`/product/${product.id}`} className="block relative aspect-video mb-4 bg-dark-800 rounded-xl overflow-hidden flex items-center justify-center p-4">
                <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </Link>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/product/${product.id}`} className="hover:text-brand-400 transition-colors">
                    <h3 className="font-bold text-lg text-white">{product.name}</h3>
                  </Link>
                  <p className="font-bold text-fuchsia-400">₹{product.price}</p>
                </div>
                
                <div className="mt-auto pt-4 flex gap-2">
                  <button 
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-white/10 hover:bg-brand-500/80 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
