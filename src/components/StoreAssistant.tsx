import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { categories, formatPrice, products } from '../data/store';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import type { Product, StorePackage } from '../types';

type ChatLink = { label: string; href: string };
type ChatMessage = {
  id: string;
  role: 'assistant' | 'customer';
  text: string;
  products?: Product[];
  packages?: StorePackage[];
  links?: ChatLink[];
};

const quickQuestions = ['Find SHS books', 'Delivery and pickup', 'Track an order'];
const stopWords = new Set(['about', 'any', 'are', 'can', 'do', 'find', 'for', 'have', 'help', 'i', 'in', 'is', 'looking', 'me', 'of', 'please', 'show', 'some', 'the', 'to', 'what', 'where', 'which', 'with', 'you']);

function findProducts(query: string): Product[] {
  const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word.length > 1 && !stopWords.has(word));
  if (!words.length) return [];

  return products
    .filter(product => product.status === 'active')
    .map(product => {
      const categoryName = categories.find(category => category.id === product.categoryId)?.name || '';
      const searchable = `${product.name} ${product.description} ${product.shortDescription} ${product.author || ''} ${product.publisher || ''} ${product.brand || ''} ${categoryName}`.toLowerCase();
      const score = words.reduce((total, word) => total + (searchable.includes(word) ? (product.name.toLowerCase().includes(word) ? 3 : 1) : 0), 0);
      return { product, score };
    })
    .filter(result => result.score > 0)
    .sort((left, right) => right.score - left.score || right.product.stockQuantity - left.product.stockQuantity)
    .slice(0, 3)
    .map(result => result.product);
}

function answerQuestion(query: string, packages: StorePackage[]): Omit<ChatMessage, 'id' | 'role'> {
  const normalized = query.toLowerCase();

  if (/\b(hello|hi|hey|good morning|good afternoon)\b/.test(normalized)) {
    return { text: 'Hi! I can help you find books and school supplies, browse packages, or answer questions about delivery and orders.' };
  }
  if (/track|order status|where is my order/.test(normalized)) {
    return { text: 'You can check an order with your order number and phone number on the Track Order page.', links: [{ label: 'Track an order', href: '/track-order' }] };
  }
  if (/payment|paystack|mobile money|momo|pay on pickup|pay on collection/.test(normalized)) {
    return { text: 'Checkout currently offers Paystack and pay on pickup. Available payment options are shown during checkout.', links: [{ label: 'Go to checkout', href: '/checkout' }] };
  }
  if (/deliver|delivery|shipping|pickup|pick up|collect/.test(normalized)) {
    return { text: 'Choose delivery or store pickup at checkout. The available delivery areas, fees, and estimated times are shown there. The FAQ lists 1–2 days within Accra and 2–5 days for other regions.', links: [{ label: 'Delivery FAQ', href: '/faq' }, { label: 'Shop products', href: '/shop' }] };
  }
  if (/return|refund|exchange/.test(normalized)) {
    return { text: 'The store FAQ says unused items in their original packaging can be returned within 7 days of delivery. Contact the team to start a return.', links: [{ label: 'Read the FAQ', href: '/faq' }, { label: 'Contact FOCUS', href: '/contact' }] };
  }
  if (/bulk|school order|institution|wholesale|custom quote/.test(normalized)) {
    return { text: 'For bulk, school, or institution pricing, contact the FOCUS team for a custom quote.', links: [{ label: 'Contact FOCUS', href: '/contact' }, { label: 'WhatsApp support', href: 'https://wa.me/233244602008?text=Hello%20FOCUS%2C%20I%20would%20like%20a%20bulk%20order%20quote.' }] };
  }
  if (/package|bundle|curated/.test(normalized)) {
    return packages.length
      ? { text: 'Here are the customer packages currently available:', packages, links: [{ label: 'Browse all packages', href: '/packages' }] }
      : { text: 'There are no customer-curated packages available right now. You can still browse individual products in the shop.', links: [{ label: 'Browse the shop', href: '/shop' }] };
  }
  if (/human|person|agent|support|contact|whatsapp/.test(normalized)) {
    return { text: 'You can reach the FOCUS team by phone, email, or WhatsApp from the Contact page.', links: [{ label: 'Contact FOCUS', href: '/contact' }, { label: 'WhatsApp support', href: 'https://wa.me/233244602008?text=Hello%20FOCUS%2C%20I%20need%20help.' }] };
  }

  const matches = findProducts(query);
  if (matches.length) {
    return { text: `I found ${matches.length === 1 ? 'this product' : 'these products'} that may help:`, products: matches, links: [{ label: 'Search the shop', href: `/search?q=${encodeURIComponent(query)}` }] };
  }

  return { text: 'I can help with products, customer packages, delivery, payment, returns, or order tracking. Try a product name or contact the FOCUS team for personal help.', links: [{ label: 'Browse the shop', href: '/shop' }, { label: 'Contact FOCUS', href: '/contact' }] };
}

export function StoreAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: 'Welcome to FOCUS. Ask me about products, packages, delivery, or an order.' },
  ]);
  const { state } = useApp();
  const { darkMode } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isOpen]);

  const sendMessage = (text: string) => {
    const question = text.trim();
    if (!question) return;
    setMessages(current => [
      ...current,
      { id: crypto.randomUUID(), role: 'customer', text: question },
      { id: crypto.randomUUID(), role: 'assistant', ...answerQuestion(question, state.storePackages) },
    ]);
    setDraft('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const surface = darkMode ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900';
  const assistantBubble = darkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-800';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
        <motion.section
          id="store-assistant-panel"
          role="dialog"
          aria-label="FOCUS Store Assistant"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed bottom-40 right-4 z-50 flex h-[min(72dvh,36rem)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border shadow-2xl sm:right-6 ${surface}`}
        >
          <header className="flex items-center justify-between bg-[#123d63] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><Sparkles className="h-4 w-4" /></span>
              <span>
                <span className="block text-sm font-semibold">FOCUS Store Assistant</span>
                <span className="block text-xs text-blue-100">Product and order help</span>
              </span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" className="grid h-9 w-9 place-items-center rounded-md text-white/80 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4" role="log" aria-live="polite" aria-relevant="additions text">
            <AnimatePresence initial={false}>
              {messages.map(message => (
              <motion.div
                key={message.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
                className={`flex ${message.role === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] space-y-3 rounded-lg px-3 py-2.5 text-sm leading-relaxed ${message.role === 'customer' ? 'bg-[#123d63] text-white' : assistantBubble}`}>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.products?.map(product => (
                    <Link key={product.id} to={`/product/${product.slug}`} onClick={() => setIsOpen(false)} className={`flex items-center justify-between gap-3 border-t pt-2 ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                      <span className="min-w-0 truncate font-medium">{product.name}</span>
                      <span className="shrink-0 font-semibold text-[#f5a623]">{formatPrice(product.salePrice || product.price)}</span>
                    </Link>
                  ))}
                  {message.packages?.map(storePackage => (
                    <Link key={storePackage.id} to="/packages" onClick={() => setIsOpen(false)} className={`flex items-center justify-between gap-3 border-t pt-2 ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                      <span className="min-w-0 truncate font-medium">{storePackage.name}</span>
                      <span className="shrink-0 font-semibold text-[#f5a623]">{formatPrice(storePackage.packagePrice)}</span>
                    </Link>
                  ))}
                  {message.links?.length ? (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-current/10 pt-2">
                      {message.links.map(link => link.href.startsWith('http') ? (
                        <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#d58a00] underline underline-offset-2">{link.label}</a>
                      ) : (
                        <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} className="text-xs font-semibold text-[#d58a00] underline underline-offset-2">{link.label}</Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </motion.div>
              ))}
            </AnimatePresence>
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pl-1">
                {quickQuestions.map(question => (
                  <button key={question} type="button" onClick={() => sendMessage(question)} className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${darkMode ? 'border-slate-600 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    {question}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSubmit} className={`flex items-center gap-2 border-t p-3 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <input
              ref={inputRef}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              onKeyDown={event => { if (event.key === 'Escape') setIsOpen(false); }}
              aria-label="Ask FOCUS a question"
              placeholder="Ask about the store..."
              className={`min-w-0 flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f5a623] ${darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-400' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-500'}`}
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#123d63] text-white transition-colors hover:bg-[#0b2d4a] disabled:cursor-not-allowed disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label={isOpen ? 'Close store assistant' : 'Chat with FOCUS'}
        aria-expanded={isOpen}
        aria-controls="store-assistant-panel"
        onClick={() => setIsOpen(open => !open)}
        className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#123d63] text-white shadow-lg transition-colors hover:bg-[#0b2d4a] sm:right-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? 'close' : 'chat'}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.65, rotate: -35 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.65, rotate: 35 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: 'easeOut' }}
            className="grid place-items-center"
          >
            {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </>
  );
}