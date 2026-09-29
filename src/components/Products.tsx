import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star, Package } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, getDiscountPercentage, products } from '../data/store';
import { useApp } from '../context/AppContext';

const productGridReveal: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const productReveal: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.965 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
};

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductArtwork({ source, className = '', alt = '' }: { source: string; className?: string; alt?: string }) {
  if (/^(https?:\/\/|data:image\/|\/|\.\/)/i.test(source)) {
    return <img src={source} alt={alt} className={`object-contain ${className}`} />;
  }
  return <span className={className}>{source}</span>;
}

export function ProductCard({ product, compact }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  const inWishlist = isInWishlist(product.id);
  const discount = product.salePrice ? getDiscountPercentage(product.price, product.salePrice) : 0;
  const effectivePrice = product.salePrice || product.price;
  const outOfStock = product.stockQuantity === 0;
  const lowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

  return (
    <div className={`group bg-white rounded-md border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200 ${compact ? '' : 'flex flex-col'}`}>
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square bg-[#f6f8fa] flex items-center justify-center overflow-hidden">
        <ProductArtwork source={product.images[0]} alt={product.name} className="h-full w-full p-3 sm:p-5 text-7xl sm:text-8xl group-hover:scale-110 transition-transform duration-300" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{discount}% OFF</span>
          )}
          {product.newArrival && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">NEW</span>
          )}
          {product.bestSeller && (
            <span className="bg-[#123d63] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">BEST SELLER</span>
          )}
        </div>

        {/* Stock Status */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-md">OUT OF STOCK</span>
          </div>
        )}
        {lowStock && (
          <span className="absolute bottom-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            Only {product.stockQuantity} left
          </span>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.preventDefault(); inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'}`}
          >
            <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="flex-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
            {product.author || product.brand || product.publisher || ''}
          </p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-[#1e3a5f] transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`w-3 h-3 ${star <= Math.round(product.rating) ? 'text-[#f5a623] fill-[#f5a623]' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
          </div>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-[#123d63]">{formatPrice(effectivePrice)}</span>
          {product.salePrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Add to Cart */}
        {!outOfStock && (
          <button
            onClick={() => addToCart(product.id)}
            className="w-full bg-[#123d63] hover:bg-[#0b2d4a] text-white font-semibold text-sm py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        )}
        {outOfStock && (
          <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold text-sm py-2.5 rounded-xl cursor-not-allowed">
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  columns?: number;
}

export function ProductGrid({ products, title, subtitle, viewAllLink, columns }: ProductGridProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className="py-8"
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.55 } } }}
    >
      {(title || viewAllLink) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h2 className="text-2xl font-bold text-[#1e3a5f]">{title}</h2>}
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link to={viewAllLink} className="text-[#f5a623] font-semibold text-sm hover:underline flex items-center gap-1">
              View All →
            </Link>
          )}
        </div>
      )}
      <motion.div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" variants={productGridReveal}>
        {products.map(product => (
          <motion.div key={product.id} variants={productReveal} whileHover={prefersReducedMotion ? undefined : { y: -5, scale: 1.015 }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

export function PackageCard({ pkg, schoolName, className }: { pkg: any; schoolName?: string; className?: string }) {
  const { addToCart, addPackageToCart } = useApp();
  const totalItems = pkg.items.reduce((count: number, item: any) => count + item.quantity, 0);
  const packageTitle = schoolName || pkg.name || 'Store Curated Package';
  const packageSubtitle = className || pkg.description || 'Well-balanced essentials bundle';
  const savings = pkg.savings ?? pkg.retailPrice - pkg.packagePrice;

  return (
    <div className="bg-white rounded-md border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#1e3a5f] text-lg">{packageTitle}</h3>
          <p className="text-sm text-gray-500">{packageSubtitle}</p>
        </div>
        <Package className="w-8 h-8 text-[#f5a623]" />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">{totalItems} items</span>
        <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Save {formatPrice(savings)}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-[#1e3a5f]">{formatPrice(pkg.packagePrice)}</span>
        <span className="text-sm text-gray-400 line-through">{formatPrice(pkg.retailPrice)}</span>
      </div>

      <button
        onClick={() => {
          if (pkg.id && pkg.packagePrice !== undefined) addPackageToCart(pkg);
          else pkg.items.forEach((item: any) => addToCart(item.productId, item.quantity));
        }}
        className="w-full bg-[#f5a623] hover:bg-[#e09500] text-[#1e3a5f] font-semibold py-3 rounded-xl transition-colors"
      >
        Add Complete Package
      </button>
    </div>
  );
}

export function CategoryCard({ category }: { category: any }) {
  const productCount = products.filter(product => product.categoryId === category.id && product.status === 'active').length;
  return (
    <Link
      to={`/shop?cat=${category.slug}`}
      className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:border-[#f5a623]/30 transition-all group"
    >
      <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{category.icon}</span>
      <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#1e3a5f] transition-colors">{category.name}</h3>
      <p className="text-xs text-gray-400 mt-1">{productCount} products</p>
    </Link>
  );
}
