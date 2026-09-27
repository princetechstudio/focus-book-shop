import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Send, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { searchProducts, formatPrice } from '../data/store';
import { ProductCard } from '../components/Products';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-6">About FOCUS</h1>
      <div className="prose prose-lg text-gray-600 space-y-6">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a70] rounded-3xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-3">Books • Supplies • More</h2>
          <p className="text-gray-300">Your trusted partner for quality educational products in Ghana.</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">Who We Are</h3>
          <p className="text-gray-600 leading-relaxed">
            FOCUS is a Ghanaian educational supply store dedicated to providing quality books, stationery, learning supplies, and curated bundles to customers across Ghana.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            We make it easy to find useful books and supplies, shop by category, and choose a ready-made bundle assembled by the FOCUS team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <span className="text-3xl mb-3 block">📚</span>
            <h4 className="font-bold text-[#1e3a5f] mb-2">Quality Products</h4>
            <p className="text-sm text-gray-500">Genuine textbooks and supplies from trusted publishers</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <span className="text-3xl mb-3 block">🎁</span>
            <h4 className="font-bold text-[#1e3a5f] mb-2">Curated Bundles</h4>
            <p className="text-sm text-gray-500">Useful combinations selected by the FOCUS team</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <span className="text-3xl mb-3 block">🚚</span>
            <h4 className="font-bold text-[#1e3a5f] mb-2">Convenient Delivery</h4>
            <p className="text-sm text-gray-500">Fast delivery and easy store pickup options</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mt-8">
          <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">Our Mission</h3>
          <p className="text-gray-600 leading-relaxed">
            To make quality educational resources accessible and affordable for every student in Ghana. We believe every child deserves the right tools for learning, and we're committed to making that a reality.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = [
      'Hello FOCUS, I have an inquiry.',
      `Name: ${formData.name.trim()}`,
      `Phone: ${formData.phone.trim()}`,
      formData.email.trim() ? `Email: ${formData.email.trim()}` : '',
      `Message: ${formData.message.trim()}`,
    ].filter(Boolean).join('\n');
    const url = `https://wa.me/233244602008?text=${encodeURIComponent(message)}`;
    setWhatsappUrl(url);
    setSubmitted(true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-sm font-semibold uppercase text-[#123d63]">FOCUS customer care</p>
        <h1 className="text-3xl font-bold text-[#123d63] md:text-4xl">Contact us</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">Questions about a product, an order, or a school package? Talk to our team.</p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <aside>
          <h2 className="mb-5 text-xl font-bold text-[#123d63]">Get in touch</h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            <a href="tel:+233244602008" className="flex items-center gap-4 py-4 hover:text-[#123d63]">
              <Phone className="h-5 w-5 shrink-0 text-[#123d63]" />
              <span><span className="block text-xs text-slate-500">Call us</span><span className="font-semibold">+233 244 602 008</span></span>
            </a>
            <a href="https://wa.me/233244602008" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-4 hover:text-[#123d63]">
              <MessageCircle className="h-5 w-5 shrink-0 text-green-600" />
              <span><span className="block text-xs text-slate-500">WhatsApp</span><span className="font-semibold">Chat with our team</span></span>
            </a>
            <a href="mailto:info@focusstore.com" className="flex items-center gap-4 py-4 hover:text-[#123d63]">
              <Mail className="h-5 w-5 shrink-0 text-[#123d63]" />
              <span><span className="block text-xs text-slate-500">Email</span><span className="font-semibold">info@focusstore.com</span></span>
            </a>
            <div className="flex items-center gap-4 py-4">
              <MapPin className="h-5 w-5 shrink-0 text-[#123d63]" />
              <span><span className="block text-xs text-slate-500">Visit</span><span className="font-semibold">Kasoa, Ghana</span></span>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="mb-3 text-lg font-bold text-[#123d63]">Business hours</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Monday–Friday</dt><dd className="font-medium text-slate-800">8:00 AM–6:00 PM</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Saturday</dt><dd className="font-medium text-slate-800">9:00 AM–4:00 PM</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Sunday</dt><dd className="font-medium text-slate-800">Closed</dd></div>
            </dl>
          </div>
        </aside>

        <section className="border-t border-slate-200 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <h2 className="mb-2 text-xl font-bold text-[#123d63]">Send us a message</h2>
          <p className="mb-5 text-sm text-slate-600">We’ll prepare your message in WhatsApp so you can review it and send it to our team.</p>
          
          {submitted ? (
            <div role="status" className="border-y border-green-200 bg-green-50 px-4 py-5">
              <p className="font-semibold text-green-900">Your message is ready in WhatsApp.</p>
              <p className="mt-1 text-sm text-green-800">Review it there and tap Send to contact FOCUS.</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-green-900 underline underline-offset-4">Open WhatsApp</a>
                <button type="button" onClick={() => setSubmitted(false)} className="text-slate-700 underline underline-offset-4">Write another message</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-slate-700">Full name *</label>
                <input id="contact-name" name="name" autoComplete="name" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#123d63]" />
              </div>
              <div>
                <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium text-slate-700">Phone number *</label>
                <input id="contact-phone" name="phone" autoComplete="tel" type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#123d63]" />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-slate-700">Email (optional)</label>
                <input id="contact-email" name="email" autoComplete="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#123d63]" />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-slate-700">Message *</label>
                <textarea id="contact-message" name="message" required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#123d63]" />
              </div>
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#123d63] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#0b2d4a]">
                <Send className="h-4 w-4" /> Continue to WhatsApp
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <p className="mb-2 text-sm font-semibold uppercase text-[#123d63]">FOCUS policies</p>
      <h1 className="text-3xl font-bold text-[#123d63] md:text-4xl">Privacy policy</h1>
      <p className="mt-4 text-sm leading-6 text-slate-500">This page explains how information is used when you browse or shop with FOCUS.</p>
      <div className="mt-8 space-y-7 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Information you provide</h2>
          <p className="mt-2 leading-7">When you contact us, create an account, or place an order, you may provide your name, phone number, email address, and delivery details.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">How we use it</h2>
          <p className="mt-2 leading-7">FOCUS uses this information to respond to inquiries, process orders, arrange delivery or pickup, and support your account. Shopping preferences such as your cart and wishlist may be stored in your browser.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Payments and external services</h2>
          <p className="mt-2 leading-7">If you choose Paystack at checkout, payment details are handled through Paystack’s payment flow and are subject to its privacy terms. Links to WhatsApp and email open those external services.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Questions about your information</h2>
          <p className="mt-2 leading-7">For privacy questions, contact <a href="mailto:info@focusstore.com" className="font-medium text-[#123d63] underline underline-offset-4">info@focusstore.com</a>.</p>
        </section>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <p className="mb-2 text-sm font-semibold uppercase text-[#123d63]">FOCUS policies</p>
      <h1 className="text-3xl font-bold text-[#123d63] md:text-4xl">Terms &amp; conditions</h1>
      <p className="mt-4 text-sm leading-6 text-slate-500">These terms cover browsing, ordering, and shopping with FOCUS.</p>
      <div className="mt-8 space-y-7 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Products and prices</h2>
          <p className="mt-2 leading-7">Product availability and prices can change. Review your cart and the total shown at checkout before placing an order.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Orders and payment</h2>
          <p className="mt-2 leading-7">Provide accurate contact and delivery information. Use the payment methods offered at checkout; Paystack payments are subject to confirmation by the payment provider.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Delivery, pickup, and returns</h2>
          <p className="mt-2 leading-7">Available delivery and pickup options and fees are shown during checkout. For an order issue or return request, contact FOCUS with your order number so the team can assist.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
          <p className="mt-2 leading-7">Questions about these terms? Email <a href="mailto:info@focusstore.com" className="font-medium text-[#123d63] underline underline-offset-4">info@focusstore.com</a> or call <a href="tel:+233244602008" className="font-medium text-[#123d63] underline underline-offset-4">+233 244 602 008</a>.</p>
        </section>
      </div>
    </div>
  );
}

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: 'How do I find a product?', a: 'Browse the shop by category or search by product name, author, or ISBN. Add items to your cart and checkout as a guest.' },
    { q: 'What payment methods do you accept?', a: 'We accept Mobile Money (MTN, Vodafone, AirtelTigo), debit/credit cards, bank transfers, and pay on pickup for store collection.' },
    { q: 'How long does delivery take?', a: 'Delivery within Accra takes 1-2 days. Other regions take 2-5 days depending on location. Store pickup is available within 2 hours of order confirmation.' },
    { q: 'Can I return a product?', a: 'Yes, we accept returns within 7 days of delivery for unused items in original packaging. Contact us via WhatsApp or email to initiate a return.' },
    { q: 'Do you offer bulk discounts?', a: 'Yes! We offer special pricing for bulk orders, schools, and institutions. Contact us via WhatsApp or the contact form for a custom quote.' },
    { q: 'What are curated packages?', a: 'Curated packages are useful combinations of products assembled by the FOCUS team and offered together at a bundle price.' },
    { q: 'How do I track my order?', a: 'Go to the Track Order page and enter your order number (e.g., FOC1001) and phone number. You\'ll see real-time status updates.' },
    { q: 'Are the books genuine/original?', a: 'Yes, all our books are 100% genuine and sourced directly from authorized publishers and distributors.' },
    { q: 'Can I order via WhatsApp?', a: 'Absolutely! You can send us your order list via WhatsApp and we\'ll process it for you. Click the WhatsApp button on any product page.' },
    { q: 'Do you deliver outside Accra?', a: 'Yes, we deliver to all regions in Ghana. Delivery fees vary by location. See our delivery zones at checkout for specific pricing.' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-3">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-8">Find answers to common questions about shopping at FOCUS.</p>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-800 text-sm pr-4">{faq.q}</span>
              {openIndex === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#1e3a5f] rounded-2xl p-6 text-center text-white">
        <h3 className="font-bold text-lg mb-2">Still have questions?</h3>
        <p className="text-gray-300 text-sm mb-4">Contact us and we'll be happy to help.</p>
        <Link to="/contact" className="bg-[#f5a623] text-[#1e3a5f] font-bold px-6 py-2.5 rounded-full inline-block">Contact Us</Link>
      </div>
    </div>
  );
}

export function SearchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const query = urlParams.get('q') || hashParams.get('q') || '';
  const results = searchProducts(query);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Search Results</h1>
        <p className="text-gray-500 text-sm mt-1">
          {results.length} result{results.length !== 1 ? 's' : ''} for "<span className="font-medium text-[#1e3a5f]">{query}</span>"
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">Try searching with different keywords.</p>
          <div className="text-sm text-gray-500">
            <p className="font-medium mb-2">Suggestions:</p>
            <ul className="space-y-1">
              <li>• Check your spelling</li>
              <li>• Use more general terms</li>
              <li>• Try searching by ISBN or author</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
