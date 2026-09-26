import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Store, Clock, Headphones, Gift, Zap } from 'lucide-react';
import { products, categories } from '../data/store';
import { ProductGrid, ProductCard, CategoryCard, PackageCard } from '../components/Products';
import { useApp } from '../context/AppContext';

export function HomePage({ darkMode = true }: { darkMode?: boolean }) {
  const { state } = useApp();
  const featuredProducts = products.filter(p => p.featured && p.status === 'active').slice(0, 10);
  const newArrivals = products.filter(p => p.newArrival && p.status === 'active').slice(0, 5);
  const bestSellers = products.filter(p => p.bestSeller && p.status === 'active').slice(0, 5);
  const deals = products.filter(p => p.salePrice && p.status === 'active').slice(0, 5);
  const sectionShell = darkMode ? 'bg-slate-950/40 border-white/10' : 'bg-white border-slate-200';
  const mutedText = darkMode ? 'text-slate-500' : 'text-slate-600';
  const headingText = darkMode ? 'text-white' : 'text-slate-900';
  const softPanel = darkMode ? 'bg-slate-900/80 border-white/10' : 'bg-slate-50 border-slate-200';
  const heroPanel = darkMode ? 'bg-slate-950/60 border-white/10' : 'bg-white/90 border-slate-200';

  return (
    <div>
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${darkMode ? 'bg-[radial-gradient(circle_at_top_left,_rgba(245,166,35,0.22),transparent_26%),linear-gradient(135deg,#081120_0%,#0f172a_45%,#111827_100%)]' : 'bg-[radial-gradient(circle_at_top_left,_rgba(245,166,35,0.15),transparent_24%),linear-gradient(135deg,#f8fafc_0%,#f1f5f9_45%,#e2e8f0_100%)]'}`}>
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#f5a623]/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#2563eb]/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/30 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" /> Trusted School Essentials Store
              </div>
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-[-0.04em] ${headingText}`}>
                Smart School Supplies,
                <span className="text-[#f5a623] block">Curated for Every Term</span>
              </h1>
              <p className={`text-lg mb-8 max-w-xl leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Discover quality textbooks, stationery, and curated learning bundles from FOCUS — professionally selected to help students stay prepared and confident.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop" className="bg-[#f5a623] hover:bg-[#e09500] text-[#0f172a] font-bold px-8 py-3.5 rounded-full transition-all duration-200 shadow-[0_10px_25px_rgba(245,166,35,0.35)] inline-flex items-center gap-2">
                  Browse Products <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/packages" className="border border-white/15 bg-white/5 backdrop-blur-sm text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 hover:bg-white/10 inline-flex items-center gap-2">
                  View Store Packages
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className={`rounded-[28px] border backdrop-blur-xl p-6 shadow-[0_30px_60px_rgba(2,8,23,0.18)] ${heroPanel}`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>This week</p>
                    <h2 className={`text-2xl font-bold mt-2 ${headingText}`}>School Ready</h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#f5a623]/15 flex items-center justify-center border border-[#f5a623]/20">
                    <span className="text-2xl">📚</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Textbooks', value: '120+', accent: 'bg-[#f5a623]/10 text-[#f5a623]' },
                    { label: 'Stationery', value: '300+', accent: 'bg-[#22c55e]/10 text-[#4ade80]' },
                    { label: 'Bundles', value: '48', accent: 'bg-[#60a5fa]/10 text-[#93c5fd]' },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${softPanel}`}>
                      <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.accent}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className={`mt-6 rounded-2xl border p-4 ${darkMode ? 'border-[#f5a623]/20 bg-[#f5a623]/8' : 'border-[#f5a623]/20 bg-[#fff7ed]'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Best value bundle</span>
                    <span className="text-xs font-medium text-[#f5a623]">Save 25%</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className={`text-3xl font-bold ${headingText}`}>GHS 320</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} line-through`}>GHS 430</p>
                    </div>
                    <button className="bg-[#f5a623] text-slate-900 font-semibold px-4 py-2 rounded-xl">Shop now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-1">Find exactly what you need</p>
          </div>
          <Link to="/shop" className="text-[#f5a623] font-semibold text-sm hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.slice(0, 8).map(cat => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4">
        <ProductGrid
          products={featuredProducts}
          title="Featured Products"
          subtitle="Handpicked quality educational products"
          viewAllLink="/shop?featured=true"
        />
      </div>

      {/* New Arrivals */}
      <div className="max-w-7xl mx-auto px-4">
        <ProductGrid
          products={newArrivals}
          title="New Arrivals"
          subtitle="Just arrived at FOCUS"
          viewAllLink="/shop?new=true"
        />
      </div>

      {/* Best Sellers */}
      <div className="max-w-7xl mx-auto px-4">
        <ProductGrid
          products={bestSellers}
          title="Best Sellers"
          subtitle="Most popular products this month"
          viewAllLink="/shop?bestseller=true"
        />
      </div>

      {/* Deals Section */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1e3a5f]">FOCUS Deals</h2>
                <p className="text-gray-500 text-sm">Save more on quality products</p>
              </div>
            </div>
            <Link to="/shop?deals=true" className="text-red-600 font-semibold text-sm hover:underline">See All Deals →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {deals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Store Packages */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Store Curated Packages</h2>
            <p className="text-gray-500 text-sm mt-1">Ready-made learning bundles designed by our team for everyday school needs.</p>
          </div>
          <Link to="/packages" className="text-[#f5a623] font-semibold text-sm hover:underline">View All Packages →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.storePackages.slice(0, 3).map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      {/* Why Choose FOCUS */}
      <section className={darkMode ? 'bg-[#1e3a5f] py-16' : 'bg-slate-200 py-16'}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-2xl md:text-3xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Why Choose FOCUS?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: Truck, title: 'Fast Ordering', desc: 'Quick and easy checkout' },
              { icon: Shield, title: 'Genuine Products', desc: '100% authentic books' },
              { icon: Store, title: 'Easy Pickup', desc: 'Collect from our store' },
              { icon: Clock, title: 'Delivery Options', desc: 'Delivered to your door' },
              { icon: Headphones, title: 'Customer Support', desc: 'We are here to help' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-[#f5a623]/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-7 h-7 text-[#f5a623]" />
                </div>
                <h3 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#f5a623] to-[#e09500] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">Get ready to learn</h2>
          <p className="text-[#1e3a5f]/70 text-lg mb-8">Explore useful books and supplies, or choose a curated bundle from the FOCUS team.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-bold px-8 py-3.5 rounded-full transition-colors inline-flex items-center gap-2">
              Browse the shop <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/packages" className="bg-white hover:bg-gray-50 text-[#1e3a5f] font-bold px-8 py-3.5 rounded-full transition-colors inline-flex items-center gap-2">
              View curated packages
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
