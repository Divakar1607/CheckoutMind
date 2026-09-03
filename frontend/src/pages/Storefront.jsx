import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Star, TrendingUp, Filter } from 'lucide-react';

const Storefront = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))].filter(Boolean);
  
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-6xl drop-shadow-lg">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-fuchsia-600">Premium</span> Goods
        </h1>
        <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
          Handpicked essentials for your everyday life, now in a sleek, immersive dark mode experience.
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex justify-center gap-3 mb-12 flex-wrap animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 text-gray-400 mr-2">
          <Filter size={18} /> Filters:
        </div>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(cat || 'All')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCategory === (cat || 'All')
                ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.6)]'
                : 'bg-dark-800 text-gray-400 border border-white/10 hover:border-brand-500/50 hover:text-white'
            }`}
          >
            {cat || 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {filteredProducts.map((product, idx) => (
          <div key={product.id} className="group relative glass rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 animate-fade-in-up hover:shadow-[0_0_30px_rgba(217,70,239,0.3)]" style={{ animationDelay: `${(idx % 6) * 100}ms` }}>
            <div className="w-full h-64 bg-dark-900 aspect-w-1 aspect-h-1 overflow-hidden relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-80"></div>
              
              {product.stock < 10 && (
                <div className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-md border border-red-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  Only {product.stock} left!
                </div>
              )}
              {product.rating > 4.7 && (
                <div className="absolute top-3 right-3 bg-brand-500/80 backdrop-blur-md border border-brand-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                  <TrendingUp size={12} /> Trending
                </div>
              )}
            </div>
            
            <div className="p-6 relative z-10 -mt-10 bg-gradient-to-b from-transparent to-dark-800">
              <div className="flex items-center justify-between mb-2 mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-900/50 px-2 py-0.5 rounded border border-brand-500/20">
                  {product.category || 'Uncategorized'}
                </span>
                <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                  <Star size={14} className="fill-yellow-400" />
                  {product.rating || '4.5'} <span className="text-gray-500">({product.reviews || '42'})</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                {product.name}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-6">
                {product.description}
              </p>
              
              <div className="flex justify-between items-end mt-auto">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Price</p>
                  <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">₹{product.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-brand-500 text-white p-3 rounded-xl hover:bg-brand-400 hover:shadow-[0_0_20px_rgba(217,70,239,0.6)] transition-all duration-300 transform active:scale-95 group/btn"
                >
                  <ShoppingCart size={22} className="group-hover/btn:animate-bounce" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storefront;
