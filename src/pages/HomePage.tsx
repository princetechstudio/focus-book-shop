import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight, Truck, ShieldCheck, Store } from 'lucide-react';
import { products, categories } from '../data/store';
import { ProductArtwork, ProductGrid } from '../components/Products';
import { useApp } from '../context/AppContext';
import featuredImage from '../../images/bags-transparent.webp';
import squareSaleFlyer from '../../images/Book Sale Ad Template - Made with PosterMyWall.jpg';
import storySaleFlyer from '../../images/Modern  Minimal Book Sale Instagram Story - Made with PosterMyWall.jpg';
import screenshotFlyer from '../../images/Screenshot 2026-09-27 011950.png';

export function HomePage({ darkMode = false }: { darkMode?: boolean }) {
  const { state } = useApp();
  const featuredProducts = products.filter(product => product.featured && product.status === 'active').slice(0, 5);
  const topSellingProducts = products.filter(product => product.bestSeller && product.status === 'active').slice(0, 5);
  const saleProducts = products.filter(product => product.salePrice && product.status === 'active').slice(0, 5);
  const newArrivals = products.filter(product => product.newArrival && product.status === 'active').slice(0, 5);
  const carouselRef = useRef<HTMLDivElement>(null);
  const promoCarouselRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activePromo, setActivePromo] = useState(0);
  const promoFlyers = [
    { id: 'book-sale-square', image: squareSaleFlyer, alt: 'Book sale flyer', label: 'Shop book sale' },
    { id: 'book-sale-story', image: storySaleFlyer, alt: 'Book sale story flyer', label: 'Browse books on sale' },
    { id: 'screenshot-flyer', image: screenshotFlyer, alt: 'Book sale flyer from screenshot', label: 'Shop featured books' },
  ];
  const slides = [
    { categoryId: 'cat-3', eyebrow: 'SCHOOL BAGS', title: 'Ready for every school day', description: 'Find a backpack with room for everything they need.', action: 'Shop school bags', path: '/shop?cat=school-bags' },
    { categoryId: 'cat-9', eyebrow: 'NEW SYLLABUS', title: 'Books for the next big step', description: 'Explore updated books for a fresh school year.', action: 'Shop new syllabus', path: '/shop?cat=new-syllabus' },
    { categoryId: 'cat-2', eyebrow: 'STATIONERY', title: 'Start the term prepared', description: 'Stock up on notebooks, pens and everyday essentials.', action: 'Shop stationery', path: '/shop?cat=stationery' },
  ];

  const moveSlide = (direction: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const nextIndex = (activeSlide + direction + slides.length) % slides.length;
    carousel.scrollTo({ left: nextIndex * carousel.clientWidth, behavior: 'smooth' });
    setActiveSlide(nextIndex);
  };

  const scrollToSlide = (index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollTo({ left: index * carousel.clientWidth, behavior: 'smooth' });
    setActiveSlide(index);
  };

  const scrollToPromo = (index: number) => {
    const carousel = promoCarouselRef.current;
    const card = carousel?.querySelectorAll<HTMLElement>('[data-promo-slide]').item(index);
    if (!carousel || !card) return;
    const left = card.getBoundingClientRect().left - carousel.getBoundingClientRect().left + carousel.scrollLeft;
    carousel.scrollTo({ left, behavior: 'smooth' });
    setActivePromo(index);
  };

  const movePromo = (direction: number) => {
    scrollToPromo((activePromo + direction + promoFlyers.length) % promoFlyers.length);
  };

  const updateActivePromo = (carousel: HTMLDivElement) => {
    const containerLeft = carousel.getBoundingClientRect().left;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    Array.from(carousel.querySelectorAll('[data-promo-slide]')).forEach((card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - containerLeft);
      if (distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });
    setActivePromo(nearestIndex);
  };

  return (
    <div className={darkMode ? 'bg-[#111820] text-slate-100' : 'bg-white text-slate-900'}>
      <div className="mx-auto max-w-7xl px-4 pt-5 md:pt-7">
        <section aria-label="Featured collections" className="relative">
          <div ref={carouselRef} onScroll={event => setActiveSlide(Math.min(slides.length - 1, Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth)))} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slides.map((slide, index) => {
              const slideProducts = products.filter(product => product.categoryId === slide.categoryId && product.status === 'active').slice(0, 3);
              return (
                <article key={slide.categoryId} className="grid min-h-[310px] min-w-full snap-start items-center gap-6 overflow-hidden bg-[#123d63] px-6 py-8 text-white sm:px-12 md:min-h-[390px] md:grid-cols-2 md:px-16 md:py-12">
                  <div className="max-w-xl">
                    <p className="mb-3 text-sm font-semibold uppercase">{slide.eyebrow}</p>
                    <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{slide.title}</h1>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/90">{slide.description}</p>
                    <Link to={slide.path} className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#123d63] hover:bg-blue-50">
                      {slide.action} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="flex h-44 items-center justify-center gap-3 sm:h-56 md:h-64">
                    {index === 0 ? (
                      <img src={featuredImage} alt="Featured school supplies" className="h-full w-full rounded-md border border-[#f5a623] bg-[#fff4cc] p-2 object-contain sm:p-4" />
                    ) : slideProducts.map(product => (
                      <Link key={product.id} to={`/product/${product.slug}`} aria-label={product.name} className="flex aspect-square w-1/3 max-w-40 items-center justify-center overflow-hidden rounded-md border border-[#f5a623] bg-[#fff4cc] p-2 transition-colors hover:bg-[#ffe58f] sm:p-4">
                        <ProductArtwork source={product.images[0]} alt={product.name} className="h-full w-full object-contain text-6xl sm:text-7xl" />
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          <button type="button" onClick={() => moveSlide(-1)} aria-label="Previous promotion" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#123d63] shadow-sm hover:bg-white sm:left-5">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => moveSlide(1)} aria-label="Next promotion" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#123d63] shadow-sm hover:bg-white sm:right-5">
            <ArrowRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2" role="group" aria-label="Choose promotion">
            {slides.map((slide, index) => (
              <button key={slide.categoryId} type="button" onClick={() => scrollToSlide(index)} aria-label={`Show promotion ${index + 1}`} aria-current={activeSlide === index ? 'true' : undefined} className={`h-2 rounded-full transition-all ${activeSlide === index ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white'}`} />
            ))}
          </div>
        </section>

        <section aria-label="More from FOCUS" className="my-6">
          <div className="mb-3 flex justify-end gap-2">
            <button type="button" onClick={() => movePromo(-1)} aria-label="Previous featured offer" className="grid h-9 w-9 place-items-center rounded-md border border-gray-200 text-[#123d63] hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => movePromo(1)} aria-label="Next featured offer" className="grid h-9 w-9 place-items-center rounded-md border border-gray-200 text-[#123d63] hover:bg-slate-50">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div ref={promoCarouselRef} onScroll={event => updateActivePromo(event.currentTarget)} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {promoFlyers.map(flyer => (
              <article key={flyer.id} data-promo-slide className="flex h-[300px] w-[88%] shrink-0 snap-start items-center justify-center overflow-hidden rounded-md bg-slate-50 p-3 sm:h-[360px] md:w-[64%] md:p-5">
                <Link to="/shop?deals=true" aria-label={flyer.label} className="flex h-full w-full items-center justify-center">
                  <img src={flyer.image} alt={flyer.alt} className="h-full w-full object-contain" />
                </Link>
              </article>
            ))}
            <div aria-hidden="true" className="w-[15%] shrink-0 md:w-[36%]" />
          </div>
          <div className="mt-4 flex justify-center gap-2" role="group" aria-label="Choose featured offer">
            {promoFlyers.map((flyer, index) => (
              <button key={flyer.id} type="button" onClick={() => scrollToPromo(index)} aria-label={`Show featured offer ${index + 1}`} aria-current={activePromo === index ? 'true' : undefined} className={`h-2 rounded-full transition-all ${activePromo === index ? 'w-6 bg-[#123d63]' : 'w-2 bg-slate-300 hover:bg-slate-400'}`} />
            ))}
          </div>
        </section>

        <nav aria-label="Shop by department" className="grid grid-cols-2 border-b border-gray-200 sm:grid-cols-3 md:grid-cols-6">
          {categories.slice(0, 6).map(category => (
            <Link key={category.id} to={`/shop?cat=${category.slug}`} className="flex min-h-14 items-center justify-between gap-2 border-b border-r border-gray-200 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#123d63] md:border-b-0">
              <span className="truncate">{category.name}</span><ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          ))}
        </nav>

        <section aria-label="Shopping benefits" className="my-6 grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 bg-slate-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Truck, title: 'Delivery across Ghana', detail: 'Choose delivery or free pickup' },
            { icon: ShieldCheck, title: 'Secure checkout', detail: 'Pay with confidence' },
            { icon: Store, title: 'Made for school', detail: 'Books and essentials in one place' },
          ].map(benefit => (
            <div key={benefit.title} className="flex items-center gap-3 px-4 py-4 sm:px-5">
              <benefit.icon className="h-5 w-5 shrink-0 text-[#123d63]" />
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{benefit.title}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{benefit.detail}</p>
              </div>
            </div>
          ))}
        </section>

        <ProductGrid
          products={featuredProducts}
          title="Featured products"
          subtitle="Handpicked essentials for the new term"
          viewAllLink="/shop?featured=true"
        />

        <ProductGrid
          products={topSellingProducts}
          title="Top sellers"
          subtitle="Customer favorites for school and home"
          viewAllLink="/shop?bestseller=true"
        />

        {saleProducts.length > 0 && (
          <section className="my-4 border-y border-amber-200 bg-[#fff8e5] px-4 sm:px-6">
            <ProductGrid
              products={saleProducts}
              title="On sale"
              subtitle="Save on selected school essentials"
              viewAllLink="/shop?deals=true"
            />
          </section>
        )}

        {newArrivals.length > 0 && (
          <ProductGrid
            products={newArrivals}
            title="New arrivals"
            subtitle="Fresh additions to the store"
            viewAllLink="/shop?new=true"
          />
        )}

        {state.storePackages.length > 0 && (
          <Link to="/packages" className="mb-8 flex items-center justify-between border-y border-gray-200 py-4 text-sm font-semibold text-slate-700 hover:text-[#123d63]">
            <span>Shop school packages</span><ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
