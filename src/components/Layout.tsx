import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search, ShoppingCart, Heart, User, Menu, X, Phone, Mail, MapPin, MessageCircle, SunMedium, MoonStar, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { categories, searchProducts, formatPrice } from '../data/store';
import { StoreAssistant } from './StoreAssistant';
import logoImage from '../../images/logo.jpeg';

type DepartmentSubcategory = {
  name: string;
  search?: string;
  category?: string;
  heading?: boolean;
};

type DepartmentItem = {
  name: string;
  category: string;
  featured?: boolean;
  subcategories?: DepartmentSubcategory[];
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [activeDepartmentName, setActiveDepartmentName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProducts>>([]);
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { cartCount, cartTotal, state } = useApp();

  const shellClasses = darkMode ? 'bg-[#111820] text-slate-100' : 'bg-white text-slate-900';
  const panelClasses = darkMode ? 'bg-[#111820] border-white/10' : 'bg-white border-gray-200';
  const navInactive = darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800/80' : 'text-slate-600 hover:text-[#123d63] hover:bg-slate-50';
  const navActive = darkMode ? 'text-white' : 'text-[#123d63]';
  const formClasses = darkMode ? 'border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-400' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-500';
  const footerClasses = darkMode ? 'bg-[#0b1928] text-white' : 'bg-[#123d63] text-white';
  const footerMuted = darkMode ? 'text-slate-300' : 'text-blue-100';
  const footerLink = 'hover:text-[#f5a623]';
  const mainClasses = darkMode ? 'bg-[#111820]' : 'bg-white';
  const logoWrapClasses = darkMode ? 'bg-slate-900' : 'bg-transparent';

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
    { name: 'Shop Stationery', path: '/shop?cat=stationery' },
    { name: 'School Packages', path: '/packages' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Track Order', path: '/track-order' },
  ];

  const departments: DepartmentItem[] = [
    { name: 'New GES Syllabus Books', category: 'new-syllabus', featured: true },
    {
      name: 'School Textbooks',
      category: 'textbooks',
      subcategories: [
        { name: 'Primary', heading: true },
        { name: 'English', search: 'English Primary' },
        { name: 'Mathematics', search: 'Mathematics Primary' },
        { name: 'Science', search: 'Science' },
        { name: 'Computer Literacy', search: 'ICT' },
        { name: 'Citizenship Education', search: 'Social Studies' },
        { name: 'French', search: 'French' },
        { name: 'Other Primary Books', search: 'Primary' },
        { name: 'JHS', heading: true },
        { name: 'All Textbooks JHS', search: 'JHS' },
        { name: 'SHS', heading: true },
        { name: 'All Textbooks SHS', search: 'SHS' },
      ],
    },
    { name: 'Stationery', category: 'stationery' },
    { name: 'Kindergarten and Nursery Textbooks', category: 'textbooks' },
    {
      name: 'Lifestyle Books',
      category: 'general-books',
      subcategories: [
        { name: 'Inspirational Books', category: 'general-books' },
        { name: 'Religious Books', category: 'general-books' },
        { name: 'African Books', category: 'general-books' },
        { name: 'Bibles', category: 'general-books' },
        { name: 'Dictionary', category: 'general-books' },
        { name: 'Startups', category: 'general-books' },
        { name: 'Magazines', category: 'general-books' },
      ],
    },
    { name: 'Kids Story Books', category: 'story-books' },
    { name: 'Educational Toys', category: 'educational-toys' },
    { name: 'School Bags', category: 'school-bags' },
  ];
  const activeDepartment = departments.find(department => department.name === activeDepartmentName);

  return (
    <div className={`min-h-screen flex flex-col ${shellClasses}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${panelClasses}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-3 md:h-[76px] md:py-0">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className={`flex h-11 w-11 items-center justify-center rounded-md ${logoWrapClasses}`}>
                <img src={logoImage} alt="FOCUS logo" className="h-10 w-auto object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[#1e3a5f] font-bold text-xl leading-tight">FOCUS</h1>
                <p className="text-[10px] text-gray-500 leading-tight">Books • School Supplies • More</p>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-3xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books and supplies..."
                  className={`w-full pl-10 pr-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#123d63] focus:border-transparent ${formClasses}`}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setSearchOpen(false)}
                />
                {searchOpen && searchResults.length > 0 && (
                  <div className={`absolute top-full mt-2 w-full rounded-md border py-2 shadow-lg z-50 ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                    {searchResults.map(p => (
                      <Link key={p.id} to={`/product/${p.slug}`} className={`flex items-center gap-3 px-4 py-2 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`} onClick={() => { setSearchQuery(''); setSearchOpen(false); }}>
                        <span className="text-2xl">{p.images[0]}</span>
                        <div>
                          <p className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{p.name}</p>
                          <p className="text-xs text-[#123d63] font-semibold">{formatPrice(p.salePrice || p.price)}</p>
                        </div>
                      </Link>
                    ))}
                    <Link to={`/search?q=${searchQuery}`} className={`block px-4 py-2 text-sm text-[#123d63] font-medium ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`} onClick={() => { setSearchQuery(''); setSearchOpen(false); }}>
                      View all results →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button type="button" onClick={toggleTheme} className={`hidden sm:flex items-center justify-center rounded-md p-2 ${navInactive}`} aria-label="Toggle dark mode">
                {darkMode ? <SunMedium className="w-5 h-5" /> : <MoonStar className="w-5 h-5" />}
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
              <Link to="/cart" aria-label={`Cart, ${cartCount} items, ${formatPrice(cartTotal)}`} className="flex items-center gap-1.5 p-2 text-gray-600 hover:text-[#123d63] relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden lg:inline text-sm font-medium">{formatPrice(cartTotal)}</span>
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
          <nav className="hidden md:flex min-h-12 flex-wrap items-center gap-x-7 border-t border-gray-100">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  `${location.pathname}${location.search}` === link.path ? navActive : navInactive
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="relative order-first" onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => { setCategoriesOpen(false); setActiveDepartmentName(null); }}>
              <button type="button" aria-expanded={categoriesOpen} onClick={() => setCategoriesOpen(open => !open)} className="inline-flex h-12 items-center gap-2 bg-[#123d63] px-5 text-sm font-semibold text-white hover:bg-[#0b2d4a]">
                <Menu className="h-4 w-4" /> All Departments <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoriesOpen && (
                <div onMouseLeave={() => setActiveDepartmentName(null)} className="absolute left-0 top-full z-50 mt-2 flex items-start">
                  <div className={`max-h-[70vh] w-80 overflow-y-auto rounded-md border p-2 shadow-xl ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                    {departments.map(department => department.subcategories ? (
                      <button key={department.name} type="button" aria-expanded={activeDepartmentName === department.name} onMouseEnter={() => setActiveDepartmentName(department.name)} onFocus={() => setActiveDepartmentName(department.name)} onClick={() => setActiveDepartmentName(current => current === department.name ? null : department.name)} className={`flex min-h-12 w-full items-center justify-between border-b px-3 py-2 text-left text-sm transition-colors last:border-b-0 ${darkMode ? 'border-slate-700' : 'border-slate-200'} ${activeDepartmentName === department.name ? (darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900') : navInactive} ${department.featured ? 'font-semibold' : ''}`}>
                        {department.name}
                        <ChevronRight className={`h-4 w-4 shrink-0 ${activeDepartmentName === department.name ? 'text-[#123d63]' : 'text-slate-400'}`} />
                      </button>
                    ) : (
                      <Link key={department.name} to={`/shop?cat=${department.category}`} onMouseEnter={() => setActiveDepartmentName(null)} onFocus={() => setActiveDepartmentName(null)} onClick={() => setCategoriesOpen(false)} className={`flex min-h-12 items-center border-b px-3 py-2 text-sm transition-colors last:border-b-0 ${darkMode ? 'border-slate-700' : 'border-slate-200'} ${navInactive} ${department.featured ? 'font-semibold' : ''}`}>
                        {department.name}
                      </Link>
                    ))}
                  </div>
                  {activeDepartment?.subcategories && (
                    <div className={`ml-1 max-h-[70vh] w-80 overflow-y-auto rounded-md border p-2 shadow-xl ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                      <Link to={`/shop?cat=${activeDepartment.category}`} onClick={() => { setCategoriesOpen(false); setActiveDepartmentName(null); }} className={`flex min-h-12 items-center border-b px-3 py-2 text-sm font-semibold ${darkMode ? 'border-slate-700' : 'border-slate-200'} ${navInactive}`}>
                        All {activeDepartment.name}
                      </Link>
                      {activeDepartment.subcategories.map((subcategory, index) => subcategory.heading ? (
                        <p key={`${subcategory.name}-${index}`} className={`border-b px-3 pb-2 pt-4 text-sm font-semibold ${darkMode ? 'border-slate-700 text-slate-100' : 'border-slate-200 text-slate-800'}`}>
                          {subcategory.name}
                        </p>
                      ) : (
                        <Link key={`${subcategory.name}-${index}`} to={subcategory.search ? `/search?q=${encodeURIComponent(subcategory.search)}` : `/shop?cat=${subcategory.category || activeDepartment.category}`} onClick={() => { setCategoriesOpen(false); setActiveDepartmentName(null); }} className={`flex min-h-11 items-center px-3 py-2 text-sm ${navInactive}`}>
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#123d63]"
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
          <div className={`md:hidden border-t px-4 py-4 space-y-1 ${darkMode ? 'bg-slate-950 border-white/10' : 'bg-white border-gray-200'}`}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium rounded-md ${navInactive}`}
              >
                {link.name}
              </Link>
            ))}
            <button type="button" aria-expanded={categoriesOpen} onClick={() => setCategoriesOpen(open => !open)} className={`flex w-full items-center justify-between rounded-md px-4 py-2.5 text-left text-sm font-medium ${navInactive}`}>
              All Departments <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoriesOpen && (
              <div className={`max-h-[60vh] overflow-y-auto border-l pl-3 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                {departments.map(department => department.subcategories ? (
                  <div key={department.name} className={`border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <button type="button" aria-expanded={activeDepartmentName === department.name} onClick={() => setActiveDepartmentName(current => current === department.name ? null : department.name)} className={`flex min-h-11 w-full items-center justify-between px-3 py-2 text-left text-sm ${navInactive} ${department.featured ? 'font-semibold' : ''}`}>
                      {department.name}
                      <ChevronDown className={`h-4 w-4 transition-transform ${activeDepartmentName === department.name ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDepartmentName === department.name && (
                      <div className={`mb-2 ml-3 border-l pl-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                        <Link to={`/shop?cat=${department.category}`} onClick={() => { setCategoriesOpen(false); setMobileMenuOpen(false); setActiveDepartmentName(null); }} className={`flex min-h-10 items-center px-3 py-2 text-sm font-medium ${navInactive}`}>
                          All {department.name}
                        </Link>
                        {department.subcategories.map((subcategory, index) => subcategory.heading ? (
                          <p key={`${subcategory.name}-${index}`} className={`px-3 pb-1 pt-3 text-xs font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {subcategory.name}
                          </p>
                        ) : (
                          <Link key={`${subcategory.name}-${index}`} to={subcategory.search ? `/search?q=${encodeURIComponent(subcategory.search)}` : `/shop?cat=${subcategory.category || department.category}`} onClick={() => { setCategoriesOpen(false); setMobileMenuOpen(false); setActiveDepartmentName(null); }} className={`flex min-h-10 items-center px-3 py-2 text-sm ${navInactive}`}>
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={department.name} to={`/shop?cat=${department.category}`} onClick={() => { setCategoriesOpen(false); setMobileMenuOpen(false); setActiveDepartmentName(null); }} className={`flex min-h-11 items-center border-b px-3 py-2 text-sm ${darkMode ? 'border-slate-700' : 'border-slate-200'} ${navInactive} ${department.featured ? 'font-semibold' : ''}`}>
                    {department.name}
                  </Link>
                ))}
              </div>
            )}
            <hr className="my-2 border-white/10" />
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2.5 text-sm font-medium rounded-md ${navInactive}`}>
              ❤️ Wishlist ({state.wishlist.length})
            </Link>
            <Link to="/account" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2.5 text-sm font-medium rounded-md ${navInactive}`}>
              👤 My Account
            </Link>
            <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2.5 text-sm font-medium rounded-md ${navInactive}`}>
              📦 Track Order
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${mainClasses}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${location.pathname}${location.search}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.992 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            {themedChildren}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <div aria-hidden="true" className="h-20 overflow-hidden bg-white md:h-36">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="h-full w-full">
          <path fill="#ffd447" d="M0 0C110 105 220 124 356 104c134-20 188-62 280-46 90 16 118 80 248 77 160-3 202-39 317-23 93 13 149 28 239 35v13H0Z" />
          <path fill="#f5a623" d="M0 40C108 136 214 148 342 124c126-24 184-61 272-48 86 13 114 75 242 74 160-1 204-38 318-23 106 14 176 31 266 36v-3H0Z" />
          <path fill="#123d63" d="M0 79C90 150 195 160 306 139c118-22 170-50 250-38 78 12 103 59 232 57 154-2 194-30 308-16 115 14 224 18 344 18v0H0Z" />
        </svg>
      </div>
      <footer className={footerClasses}>
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-14">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-white p-2">
                  <img src={logoImage} alt="FOCUS logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold leading-tight md:text-4xl">FOCUS</h3>
                  <p className="mt-1 text-sm text-blue-100">Books • School Supplies • More</p>
                </div>
              </div>
              <p className="mt-6 max-w-sm text-xl font-semibold leading-snug text-white md:text-2xl">
                Big plans start with the right supplies.
              </p>
              <p className={`${footerMuted} mt-3 max-w-sm text-base leading-7`}>
                Your trusted source for quality books, stationery, supplies, and curated learning bundles in Ghana.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-5 text-lg font-semibold text-[#f5a623]">Quick Links</h4>
              <ul className={`space-y-4 text-base ${footerMuted}`}>
                <li><Link to="/shop" className={`${footerLink} transition-colors`}>Shop All</Link></li>
                <li><Link to="/packages" className={`${footerLink} transition-colors`}>Curated Packages</Link></li>
                <li><Link to="/track-order" className={`${footerLink} transition-colors`}>Track Order</Link></li>
                <li><Link to="/about" className={`${footerLink} transition-colors`}>About Us</Link></li>
                <li><Link to="/faq" className={`${footerLink} transition-colors`}>FAQ</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="mb-5 text-lg font-semibold text-[#f5a623]">Categories</h4>
              <ul className={`space-y-4 text-base ${footerMuted}`}>
                {categories.slice(0, 6).map(cat => (
                  <li key={cat.id}><Link to={`/shop?cat=${cat.slug}`} className={`${footerLink} transition-colors`}>{cat.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-5 text-lg font-semibold text-[#f5a623]">Contact Us</h4>
              <ul className={`space-y-4 text-base ${footerMuted}`}>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +233 244602008</li>
                <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp Available</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@focusstore.com</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Kasoa, Ghana</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-8 md:flex-row">
            <p className={`text-sm ${footerMuted}`}>© 2026 FOCUS Books • School Supplies • More. All rights reserved.</p>
            <div className={`flex gap-4 text-sm ${footerMuted}`}>
              <Link to="/privacy" className={footerLink}>Privacy Policy</Link>
              <Link to="/terms" className={footerLink}>Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>

      <StoreAssistant />

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
