import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Phone, Mail, MapPin, MessageCircle, SunMedium, MoonStar, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { categories, searchProducts, formatPrice } from '../data/store';
import logoImage from '../../images/image.png';

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProducts>>([]);
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const { cartCount, state } = useApp();

  const shellClasses = darkMode ? 'bg-[#020817] text-slate-100' : 'bg-slate-100 text-slate-900';
  const panelClasses = darkMode ? 'bg-[#0b1220]/90 border-white/10' : 'bg-white/90 border-slate-200';
  const bannerClasses = darkMode ? 'bg-[#0b1220] text-slate-200 border-white/10' : 'bg-slate-200 text-slate-800 border-slate-300';
  const navInactive = darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200';
  const navActive = darkMode ? 'bg-[#f5a623] text-slate-900' : 'bg-slate-900 text-white';
  const formClasses = darkMode ? 'border-white/10 bg-slate-900/80 text-slate-100 placeholder:text-slate-400' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-500';
  const footerClasses = darkMode ? 'bg-[#1e3a5f] text-white' : 'bg-slate-200 text-slate-800 border-slate-300';
  const footerMuted = darkMode ? 'text-gray-300' : 'text-slate-600';
  const footerLink = darkMode ? 'hover:text-white' : 'hover:text-slate-900';
  const mainClasses = darkMode ? 'bg-[#020817]' : 'bg-slate-100';
  const logoWrapClasses = darkMode ? 'bg-[#0b1220] border border-white/10' : 'bg-slate-900 border border-slate-800 shadow-sm';

  const themedChildren = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, { darkMode })
    : children;

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length >= 2) {
      setSearchResults(searchProducts(q).slice(0, 6));
    } else {
      setSearchResults([]);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Packages', path: '/packages' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${shellClasses}`}>
      {/* Announcement Bar */}
      <div className={`border-b text-center py-2 text-sm px-4 ${bannerClasses}`}>
        <p>📚 Quality Books & School Supplies — Delivered to You | Free pickup available</p>
      </div>

      {/* Header */}
      <header className={`backdrop-blur-md shadow-[0_10px_30px_rgba(2,8,23,0.35)] sticky top-0 z-50 border-b ${panelClasses}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${logoWrapClasses}`}>
                <img src={logoImage} alt="FOCUS logo" className="h-9 w-auto object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[#1e3a5f] font-bold text-xl leading-tight">FOCUS</h1>
                <p className="text-[10px] text-gray-500 leading-tight">Books • School Supplies • More</p>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books and supplies..."
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623] focus:border-transparent ${formClasses}`}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setSearchOpen(false)}
                />
                {searchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-slate-900 rounded-xl shadow-2xl border border-white/10 py-2 z-50">
                    {searchResults.map(p => (
                      <Link key={p.id} to={`/product/${p.slug}`} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800/80" onClick={() => { setSearchQuery(''); setSearchOpen(false); }}>
                        <span className="text-2xl">{p.images[0]}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-100">{p.name}</p>
                          <p className="text-xs text-[#f5a623] font-semibold">{formatPrice(p.salePrice || p.price)}</p>
                        </div>
                      </Link>
                    ))}
                    <Link to={`/search?q=${searchQuery}`} className="block px-4 py-2 text-sm text-[#f5a623] font-medium hover:bg-slate-800/80" onClick={() => { setSearchQuery(''); setSearchOpen(false); }}>
                      View all results →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={toggleTheme}
                className={`hidden sm:flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  darkMode ? 'border-white/10 bg-slate-900 text-slate-100 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunMedium className="w-4 h-4" /> : <MoonStar className="w-4 h-4" />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 text-gray-600 hover:text-[#1e3a5f]">
                <Search className="w-5 h-5" />
              </button>
              <Link to="/wishlist" className="hidden sm:flex p-2 text-gray-600 hover:text-[#1e3a5f] relative">
                <Heart className="w-5 h-5" />
                {state.wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{state.wishlist.length}</span>
                )}
              </Link>
              <Link to="/account" className="hidden sm:flex p-2 text-gray-600 hover:text-[#1e3a5f]">
                <User className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="p-2 text-gray-600 hover:text-[#1e3a5f] relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f5a623] text-[#1e3a5f] text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="sm:hidden p-2 text-gray-600"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunMedium className="w-5 h-5" /> : <MoonStar className="w-5 h-5" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 pb-3 overflow-x-auto">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  location.pathname === link.path ? navActive : navInactive
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="relative">
              <button type="button" aria-expanded={categoriesOpen} onClick={() => setCategoriesOpen(open => !open)} className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${navInactive}`}>
                Categories <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoriesOpen && (
                <div className={`absolute left-0 top-full z-50 mt-2 grid w-80 grid-cols-2 gap-1 rounded-xl border p-2 shadow-xl ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                  {categories.map(category => (
                    <Link key={category.id} to={`/shop?cat=${category.slug}`} onClick={() => setCategoriesOpen(false)} className={`rounded-lg px-3 py-2 text-sm transition-colors ${navInactive}`}>
                      <span className="mr-2">{category.icon}</span>{category.name}
                    </Link>
                  ))}
                  <Link to="/shop?deals=true" onClick={() => setCategoriesOpen(false)} className="col-span-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#f5a623] hover:bg-slate-800/70">Shop current deals</Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border py-2 z-50">
                  {searchResults.map(p => (
                    <Link key={p.id} to={`/product/${p.slug}`} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50" onClick={() => { setSearchQuery(''); setSearchOpen(false); }}>
                      <span className="text-xl">{p.images[0]}</span>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-[#f5a623] font-semibold">{formatPrice(p.salePrice || p.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-t border-white/10 px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
            <button type="button" aria-expanded={categoriesOpen} onClick={() => setCategoriesOpen(open => !open)} className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-200 hover:bg-slate-800">
              Browse Categories <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoriesOpen && (
              <div className="grid grid-cols-2 gap-1 pl-3">
                {categories.map(category => (
                  <Link key={category.id} to={`/shop?cat=${category.slug}`} onClick={() => { setCategoriesOpen(false); setMobileMenuOpen(false); }} className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                    {category.icon} {category.name}
                  </Link>
                ))}
              </div>
            )}
            <hr className="my-2 border-white/10" />
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg">
              ❤️ Wishlist ({state.wishlist.length})
            </Link>
            <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg">
              👤 My Account
            </Link>
            <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg">
              📦 Track Order
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${mainClasses}`}>
        <div key={`${location.pathname}${location.search}`} className="page-enter">
          {themedChildren}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${footerClasses}`}>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${logoWrapClasses}`}>
                  <img src={logoImage} alt="FOCUS logo" className="h-12 w-auto object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl">FOCUS</h3>
                  <p className="text-sm text-gray-300">Books • Supplies • More</p>
                </div>
              </div>
              <p className={`${footerMuted} max-w-sm text-base leading-7`}>
                Your trusted source for quality books, stationery, supplies, and curated learning bundles in Ghana.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-5 text-lg text-[#f5a623]">Quick Links</h4>
              <ul className={`space-y-3 text-base ${footerMuted}`}>
                <li><Link to="/shop" className={`${footerLink} transition-colors`}>Shop All</Link></li>
                <li><Link to="/packages" className={`${footerLink} transition-colors`}>Curated Packages</Link></li>
                <li><Link to="/track-order" className={`${footerLink} transition-colors`}>Track Order</Link></li>
                <li><Link to="/about" className={`${footerLink} transition-colors`}>About Us</Link></li>
                <li><Link to="/faq" className={`${footerLink} transition-colors`}>FAQ</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-5 text-lg text-[#f5a623]">Categories</h4>
              <ul className={`space-y-3 text-base ${footerMuted}`}>
                {categories.slice(0, 6).map(cat => (
                  <li key={cat.id}><Link to={`/shop?cat=${cat.slug}`} className={`${footerLink} transition-colors`}>{cat.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-5 text-lg text-[#f5a623]">Contact Us</h4>
              <ul className={`space-y-4 text-base ${footerMuted}`}>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +233 244602008</li>
                <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp Available</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@focusstore.com</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Kasoa, Ghana</li>
              </ul>
            </div>
          </div>

          <div className={`border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${darkMode ? 'border-gray-700' : 'border-slate-300'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>© 2026 FOCUS Books • School Supplies • More. All rights reserved.</p>
            <div className={`flex gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              <Link to="/privacy" className={footerLink}>Privacy Policy</Link>
              <Link to="/terms" className={footerLink}>Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/233244602008?text=Hello%20FOCUS%2C%20I%20would%20like%20to%20inquire%20about%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors z-40"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>

      {/* Toast */}
      {state.toast && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 text-sm font-medium animate-bounce ${
          state.toast.type === 'success' ? 'bg-green-500 text-white' :
          state.toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-[#1e3a5f] text-white'
        }`}>
          {state.toast.message}
        </div>
      )}
    </div>
  );
}
