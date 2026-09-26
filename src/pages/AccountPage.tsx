import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, MapPin, Settings, LogOut, ChevronRight, Search, Truck, CheckCircle, Clock, XCircle, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getProductById, formatPrice } from '../data/store';
import { PackageCard, ProductArtwork } from '../components/Products';
import { supabase } from '../lib/supabase';

type AuthMode = 'signin' | 'signup';

export function AccountPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [guestView, setGuestView] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    const syncUser = (session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null) => {
      if (!mounted) return;
      if (session) {
        const metadataName = session.user.user_metadata?.full_name;
        dispatch({
          type: 'SET_USER',
          user: {
            id: session.user.id,
            fullName: typeof metadataName === 'string' ? metadataName : session.user.email?.split('@')[0] || 'Customer',
            phone: '',
            email: session.user.email || '',
            children: [],
            role: 'customer',
          },
        });
      } else {
        dispatch({ type: 'SET_USER', user: null });
      }
      setAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setAuthError(error.message);
      syncUser(data.session);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => syncUser(session));

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [dispatch]);

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          setAuthMode('signin');
          setAuthMessage('To sign in immediately after creating an account, turn off Confirm email in Supabase Authentication settings.');
        } else {
          setAuthMessage('Your account is ready.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setPassword('');
        setGuestView(false);
        setAuthMessage('You are signed in.');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to authenticate. Please try again.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
    else {
      setAuthMessage('You have been signed out. You can continue as a guest.');
      setGuestView(false);
    }
  };

  const user = state.user || { id: 'guest', fullName: 'Guest User', phone: '', email: '', children: [], role: 'customer' as const };
  const isSignedIn = user.id !== 'guest';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.fullName[0]}
              </div>
              <div>
                <p className="font-semibold text-[#1e3a5f]">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.email || 'No email set'}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[#f5a623]/10 text-[#1e3a5f]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{state.orders.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <p className="text-sm text-gray-500">Wishlist Items</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{state.wishlist.length}</p>
                </div>
              </div>

              {!authLoading && !isSignedIn && (
                <section className="bg-white rounded-2xl border border-gray-100 p-6">
                  {guestView ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-bold text-[#1e3a5f]">Browsing as a guest</h2>
                        <p className="mt-1 text-sm text-gray-600">You can shop and check out without creating an account.</p>
                      </div>
                      <button type="button" onClick={() => setGuestView(false)} className="text-sm font-semibold text-[#1e3a5f] underline">Sign in or create an account</button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-lg font-bold text-[#1e3a5f]">Welcome to FOCUS</h2>
                      <p className="mt-1 text-sm text-gray-600">Sign in or create an account, or continue shopping as a guest.</p>

                      <div className="mt-5 inline-flex rounded-lg border border-gray-200 p-1" role="group" aria-label="Account access">
                        <button type="button" onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthMessage(''); }} aria-pressed={authMode === 'signin'} className={`rounded-md px-4 py-2 text-sm font-medium ${authMode === 'signin' ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Sign in</button>
                        <button type="button" onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthMessage(''); }} aria-pressed={authMode === 'signup'} className={`rounded-md px-4 py-2 text-sm font-medium ${authMode === 'signup' ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Create account</button>
                      </div>

                      {authError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{authError}</p>}
                      {authMessage && <p role="status" className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{authMessage}</p>}
                      {!supabase ? (
                        <p className="mt-4 text-sm text-amber-800">Account sign-in is unavailable until Supabase is configured. You can still continue as a guest.</p>
                      ) : (
                        <form onSubmit={handleAuthSubmit} className="mt-4 max-w-lg space-y-4">
                          {authMode === 'signup' && (
                            <label className="block text-sm font-medium text-gray-700">
                              Full name
                              <input type="text" autoComplete="name" required value={fullName} onChange={event => setFullName(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]" />
                            </label>
                          )}
                          <label className="block text-sm font-medium text-gray-700">
                            Email
                            <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]" />
                          </label>
                          <label className="block text-sm font-medium text-gray-700">
                            Password
                            <input type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623]" />
                          </label>
                          <button type="submit" disabled={authBusy} className="rounded-lg bg-[#1e3a5f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#294c77] disabled:cursor-not-allowed disabled:opacity-60">
                            {authBusy ? 'Please wait...' : authMode === 'signup' ? 'Create account' : 'Sign in'}
                          </button>
                        </form>
                      )}
                      <button type="button" onClick={() => { setGuestView(true); setAuthError(''); }} className="mt-4 block text-sm font-medium text-gray-600 underline underline-offset-2">Continue as guest</button>
                    </>
                  )}
                </section>
              )}

              {isSignedIn && (
                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5">
                  <div>
                    <p className="font-semibold text-[#1e3a5f]">Signed in</p>
                    <p className="text-sm text-gray-600">Your account is connected to {user.email}.</p>
                  </div>
                  <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#1e3a5f]"><LogOut className="h-4 w-4" />Sign out</button>
                </div>
              )}

              {state.orders.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-[#1e3a5f] mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {state.orders.slice(0, 3).map(order => (
                      <Link key={order.id} to={`/track-order?id=${order.orderNumber}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium text-sm text-[#1e3a5f]">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.items.length} items • {formatPrice(order.total)}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                          order.orderStatus === 'completed' ? 'bg-green-50 text-green-700' :
                          order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">My Orders</h3>
              {state.orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/shop" className="text-[#f5a623] font-medium text-sm mt-2 inline-block">Start Shopping →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.orders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-[#1e3a5f]">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1e3a5f]">{formatPrice(order.total)}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                            order.orderStatus === 'completed' ? 'bg-green-50 text-green-700' :
                            order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {order.orderStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                        <div className="flex gap-2">
                          <Link to={`/track-order?id=${order.orderNumber}`} className="text-xs text-[#f5a623] font-medium hover:underline">Track</Link>
                          <button className="text-xs text-[#1e3a5f] font-medium hover:underline" onClick={() => {
                            order.items.forEach(item => {
                              const product = getProductById(item.productId);
                              if (product && product.stockQuantity > 0) {
                                dispatch({ type: 'ADD_TO_CART', productId: item.productId, quantity: item.quantity });
                              }
                            });
                          }}>
                            Buy Again
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">My Wishlist</h3>
              {state.wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <Link to="/shop" className="text-[#f5a623] font-medium text-sm mt-2 inline-block">Browse Products →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.wishlist.map(item => {
                    const product = getProductById(item.productId);
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                        <ProductArtwork source={product.images[0]} alt={product.name} className="w-12 h-12 text-2xl" />
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${product.slug}`} className="text-sm font-medium text-gray-800 hover:text-[#1e3a5f] line-clamp-1">{product.name}</Link>
                          <p className="text-sm font-bold text-[#1e3a5f]">{formatPrice(product.salePrice || product.price)}</p>
                        </div>
                        <button onClick={() => dispatch({ type: 'ADD_TO_CART', productId: product.id })} className="text-xs bg-[#f5a623] text-[#1e3a5f] font-medium px-3 py-1.5 rounded-lg">Add to Cart</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Saved Addresses</h3>
              {user.address ? (
                <div className="p-4 border border-gray-100 rounded-xl">
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-gray-600">{user.address}, {user.city}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No saved addresses</p>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                  <input type="text" defaultValue={user.fullName} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                  <input type="tel" defaultValue={user.phone} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <input type="email" defaultValue={user.email} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
                </div>
                <button className="bg-[#f5a623] text-[#1e3a5f] font-bold px-6 py-2.5 rounded-xl text-sm">Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TrackOrderPage() {
  const { state } = useApp();
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const initialId = urlParams.get('id') || hashParams.get('id') || '';
  const [orderId, setOrderId] = useState(initialId);
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(!!initialId);

  const order = orderId ? state.orders.find(o => o.orderNumber === orderId) : null;

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'paid', label: 'Payment Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const getStatusIndex = (status: string) => statusSteps.findIndex(s => s.key === status);
  const currentIndex = order ? getStatusIndex(order.orderStatus) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-8">Track Your Order</h1>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Order Number</label>
            <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. FOC1001" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Phone or Email</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="024XXXXXXX" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
          </div>
        </div>
        <button onClick={() => setSearched(true)} className="mt-4 bg-[#f5a623] text-[#1e3a5f] font-bold px-6 py-2.5 rounded-xl text-sm">Track Order</button>
      </div>

      {/* Result */}
      {searched && order && (
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-[#1e3a5f] text-lg">Order #{order.orderNumber}</h3>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                order.orderStatus === 'completed' ? 'bg-green-50 text-green-700' :
                order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {order.orderStatus.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-4">
              {statusSteps.map((step, i) => {
                const isCompleted = i <= currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#1e3a5f] mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                  </div>
                  <p className="font-medium text-sm">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-[#1e3a5f]">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#1e3a5f] mb-2">Delivery Information</h3>
            <p className="text-sm text-gray-600">Method: {order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
            {order.address && <p className="text-sm text-gray-600">Address: {order.address}</p>}
            <p className="text-sm text-gray-600 mt-2">Estimated: {order.deliveryMethod === 'pickup' ? 'Ready in 2 hours' : '1-3 business days'}</p>
          </div>
        </div>
      )}

      {searched && !order && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-3">📦</p>
          <h3 className="font-semibold text-gray-800">Order not found</h3>
          <p className="text-sm text-gray-500 mt-1">Please check your order number and try again.</p>
        </div>
      )}
    </div>
  );
}

export function WishlistPage() {
  const { state, dispatch, addToCart } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-8">My Wishlist ({state.wishlist.length})</h1>

      {state.wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save products you love and come back to them later.</p>
          <Link to="/shop" className="bg-[#f5a623] text-[#1e3a5f] font-bold px-8 py-3 rounded-full inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.wishlist.map(item => {
            const product = getProductById(item.productId);
            if (!product) return null;
            return (
              <div key={item.productId} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                <Link to={`/product/${product.slug}`} className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ProductArtwork source={product.images[0]} alt={product.name} className="w-20 h-20 text-3xl" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.slug}`} className="font-semibold text-sm text-gray-800 hover:text-[#1e3a5f] line-clamp-2">{product.name}</Link>
                  <p className="font-bold text-[#1e3a5f] mt-1">{formatPrice(product.salePrice || product.price)}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => addToCart(product.id)} className="text-xs bg-[#f5a623] text-[#1e3a5f] font-medium px-3 py-1.5 rounded-lg">Add to Cart</button>
                    <button onClick={() => dispatch({ type: 'REMOVE_FROM_WISHLIST', productId: product.id })} className="text-xs text-red-500 font-medium px-3 py-1.5 rounded-lg border border-red-200">Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PackagesPage() {
  const { state } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a70] rounded-3xl p-8 md:p-12 mb-8 text-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Store Curated Packages</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">Carefully assembled learning bundles selected by our team to make term preparation easier and more affordable.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.storePackages.map(pkg => (
          <div key={pkg.id}>
            <PackageCard pkg={pkg} />
          </div>
        ))}
        {state.storePackages.length === 0 && (
          <p className="col-span-full py-12 text-center text-gray-600">No packages are available yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
