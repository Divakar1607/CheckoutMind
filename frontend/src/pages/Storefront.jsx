import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Star, TrendingUp, Filter, Search, Eye, X, CheckCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Storefront = ({ addToCart, wishlist = [], toggleWishlist }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState(null);

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

  const handleAddToCart = (product) => {
    addToCart(product);
    setToast(product.name);
    setTimeout(() => setToast(null), 3000);
    setQuickViewProduct(null);
  };

  const categories = ['All', ...new Set(products.map(p => p.category))].filter(Boolean);
  
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-24 right-6 z-50 transition-all duration-500 transform \${toast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-dark-800 border border-brand-500/30 shadow-[0_0_20px_rgba(217,70,239,0.3)] rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-green-400" size={20} />
          <div>
            <p className="text-sm font-bold text-white">Added to Cart</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{toast}</p>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-md animate-fade-in-up">
          <div className="bg-dark-800 border border-white/10 rounded-3xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden relative shadow-[0_0_50px_rgba(217,70,239,0.2)]">
            <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-dark-900/50 p-2 rounded-full">
              <X size={24} />
            </button>
            <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
              <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-auto object-contain max-h-[400px] mix-blend-multiply" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-dark-800 to-dark-900">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2 block">{quickViewProduct.category}</span>
              <h2 className="text-3xl font-extrabold text-white mb-4">{quickViewProduct.name}</h2>
              <div className="flex items-center gap-2 mb-6">
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                <span className="text-white font-bold">{quickViewProduct.rating}</span>
                <span className="text-gray-500 text-sm">({quickViewProduct.reviews} verified reviews)</span>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed">{quickViewProduct.description}</p>
              <div className="mt-auto flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Total Price</p>
                  <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">₹{quickViewProduct.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleAddToCart(quickViewProduct)}
                  className="bg-brand-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-400 shadow-[0_0_20px_rgba(217,70,239,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-6xl drop-shadow-lg">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-fuchsia-600">Premium</span> Goods
        </h1>
        <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
          Handpicked essentials for your everyday life, now in a sleek, immersive dark mode experience.
        </p>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        
        {/* Categories */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <div className="flex items-center gap-2 text-gray-400 mr-2">
            <Filter size={18} /> Filters:
          </div>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat || 'All')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 \${
                activeCategory === (cat || 'All')
                  ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.6)]'
                  : 'bg-dark-800 text-gray-400 border border-white/10 hover:border-brand-500/50 hover:text-white'
              }`}
            >
              {cat || 'All'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-800 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder-gray-500"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">No products found matching your search.</p>
          <button onClick={() => {setSearchQuery(''); setActiveCategory('All');}} className="mt-4 text-brand-400 hover:text-brand-300 font-bold underline">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {filteredProducts.map((product, idx) => (
            <div key={product.id} className="group relative glass rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 animate-fade-in-up hover:shadow-[0_0_30px_rgba(217,70,239,0.3)]" style={{ animationDelay: `\${(idx % 6) * 100}ms` }}>
              
              {/* Image Container with White Background for Real Products */}
              <div className="w-full h-64 bg-white relative flex items-center justify-center p-6">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                  />
                </Link>
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-dark-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] pointer-events-none">
                  <button onClick={() => setQuickViewProduct(product)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl pointer-events-auto mx-2">
                    <Eye size={24} />
                  </button>
                  <button onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl pointer-events-auto mx-2">
                    <Heart size={24} className={wishlist?.includes(product.id) ? "text-fuchsia-500 fill-fuchsia-500" : ""} />
                  </button>
                </div>

                {product.stock < 10 && (
                  <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] z-10">
                    Only {product.stock} left!
                  </div>
                )}
                {product.rating > 4.7 && (
                  <div className="absolute top-3 right-3 bg-brand-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(217,70,239,0.5)] z-10">
                    <TrendingUp size={12} /> Trending
                  </div>
                )}
              </div>
              
              <div className="p-6 relative z-10 bg-gradient-to-b from-dark-800 to-dark-900 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                    {product.category || 'Uncategorized'}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                    <Star size={14} className="fill-yellow-400" />
                    {product.rating || '4.5'}
                  </div>
                </div>
                
                <Link to={`/product/${product.id}`} className="hover:text-brand-400 transition-colors">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400 line-clamp-2 mb-6">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-end mt-auto">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Price</p>
                    <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">₹{product.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-brand-500 text-white p-3 rounded-xl hover:bg-brand-400 hover:shadow-[0_0_20px_rgba(217,70,239,0.6)] transition-all duration-300 transform active:scale-95 group/btn"
                  >
                    <ShoppingCart size={22} className="group-hover/btn:animate-bounce" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Storefront;
