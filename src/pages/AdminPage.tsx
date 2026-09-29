import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Package, Users, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, Eye, Edit, Trash2, Plus, Search, Filter, Download, CheckCircle, Clock, XCircle, Truck, ChevronRight, Settings, UploadCloud, LogOut, SunMedium, MoonStar } from 'lucide-react';
import { products, formatPrice, categories, addProduct, updateProduct } from '../data/store';
import { useApp } from '../context/AppContext';
import { createStorePackage, fetchSupabaseOrders, fetchSupabaseProducts, isCurrentUserAdmin, saveSupabaseProduct, supabase, updateSupabaseOrder, updateSupabaseProduct, uploadProductImage } from '../lib/supabase';
import type { Order, Product, StorePackage, StorePackageItem } from '../types';
import { ProductArtwork } from '../components/Products';
import { useTheme } from '../context/ThemeContext';
import type { Session } from '@supabase/supabase-js';
import logoImage from '../../images/logo.jpeg';

export function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { state, dispatch } = useApp();
  const { darkMode, toggleTheme } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInBusy, setSignInBusy] = useState(false);
  const [databaseOrders, setDatabaseOrders] = useState<Order[]>([]);
  const [ordersWarning, setOrdersWarning] = useState('');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setAuthError(error.message);
      setSession(data.session);
      setSessionReady(true);
    }).catch(error => {
      if (mounted) {
        setAuthError(getSupabaseErrorMessage(error));
        setSessionReady(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionReady(true);
      setAuthError('');
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      if (sessionReady) setAuthLoading(false);
      return;
    }

    let mounted = true;
    setAuthLoading(true);
    isCurrentUserAdmin()
      .then(authorized => {
        if (mounted) setIsAdmin(authorized);
      })
      .catch(error => {
        if (mounted) {
          setIsAdmin(false);
          setAuthError(getSupabaseErrorMessage(error));
        }
      })
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });

    return () => { mounted = false; };
  }, [session?.user.id, sessionReady]);

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    fetchSupabaseOrders()
      .then(orders => {
        if (!mounted) return;
        setDatabaseOrders(orders);
        setOrdersWarning('');
      })
      .catch(error => {
        if (mounted) setOrdersWarning(getSupabaseErrorMessage(error));
      });
    return () => { mounted = false; };
  }, [isAdmin]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setSignInBusy(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim(),
        password: signInPassword,
      });
      if (error) {
        setAuthError(error.message);
        return;
      }
      setSignInPassword('');
      setSession(data.session);
      setSessionReady(true);
    } catch (error) {
      setAuthError(getSupabaseErrorMessage(error));
    } finally {
      setSignInBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
    else {
      setSession(null);
      setSessionReady(true);
      setIsAdmin(false);
    }
  };

  const orderMap = new Map<string, Order>();
  for (const order of state.orders) orderMap.set(order.id, order);
  for (const order of databaseOrders) orderMap.set(order.id, order);
  const allOrders = [...orderMap.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const totalRevenue = allOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = allOrders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0);
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: AlertTriangle },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center bg-gray-50 px-4 text-sm text-gray-600">Checking administrator access...</div>;
  }

  if (!session || !isAdmin) {
    const signedInButNotAdmin = Boolean(session && !isAdmin);
    return (
      <main className="page-enter min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
        <section className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-slate-700 bg-[#0b1220] p-1.5">
              <img src={logoImage} alt="FOCUS logo" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1e3a5f]">FOCUS Admin</h1>
              <p className="text-sm text-gray-600">Sign in to continue</p>
            </div>
          </div>

          {authError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{authError}</p>}

          {!supabase ? (
            <p className="text-sm text-gray-700">Supabase isn&apos;t configured. Add the Supabase URL and anon key to `.env.local`, then restart the app.</p>
          ) : signedInButNotAdmin ? (
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>{session?.user.email}</strong> is signed in, but this account is not in the admin allowlist.</p>
              <p>Add this Auth user ID in the Supabase SQL Editor:</p>
              <code className="block break-all rounded-lg bg-gray-100 p-3 text-xs text-gray-900">insert into public.admin_users (user_id) values (&apos;{session?.user.id}&apos;) on conflict do nothing;</code>
              <p className="text-xs text-gray-600">If this query or access check is denied, rerun the updated `supabase/product-upload-setup.sql` script.</p>
              <button type="button" onClick={handleSignOut} className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">Sign out</button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Admin email
                <input type="email" autoComplete="username" required value={signInEmail} onChange={event => setSignInEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900" />
              </label>
              <label className="block text-sm font-medium text-gray-700">Password
                <input type="password" autoComplete="current-password" required value={signInPassword} onChange={event => setSignInPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900" />
              </label>
              <button type="submit" disabled={signInBusy} className="w-full rounded-lg bg-[#1e3a5f] px-4 py-2.5 font-semibold text-white hover:bg-[#294c77] disabled:opacity-60">
                {signInBusy ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          <Link to="/" className="mt-6 inline-block text-sm font-medium text-[#1e3a5f] hover:underline">Back to store</Link>
        </section>
      </main>
    );
  }

  return (
    <div className="page-enter min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-[#1e3a5f] min-h-screen p-4 fixed left-0 top-0">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 bg-[#f5a623] rounded-lg flex items-center justify-center">
              <span className="text-[#1e3a5f] font-bold text-sm">F</span>
            </div>
            <span className="text-white font-bold">FOCUS Admin</span>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.id ? 'bg-[#f5a623] text-[#1e3a5f]' : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 pt-8 border-t border-white/10">
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white">
              ← Back to Store
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Mobile Header */}
          <div className="lg:hidden bg-[#1e3a5f] p-4 flex items-center justify-between">
            <span className="text-white font-bold">FOCUS Admin</span>
            <select value={activeSection} onChange={e => setActiveSection(e.target.value)} className="bg-slate-800 text-white text-sm rounded-lg px-3 py-1.5 border border-white/20">
              {sidebarItems.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>

          <div className="p-4 md:p-8">
            <div className="flex justify-end mb-4">
              <button type="button" onClick={handleSignOut} className="mr-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
              <button type="button" onClick={toggleTheme} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                {darkMode ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                {darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              </button>
            </div>
            {ordersWarning && (activeSection === 'orders' || activeSection === 'dashboard') && (
              <p role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Order database: {ordersWarning}</p>
            )}
            <div key={activeSection} className="page-enter">
              {activeSection === 'dashboard' && <DashboardSection totalRevenue={totalRevenue} pendingOrders={pendingOrders} lowStockProducts={lowStockProducts} orders={allOrders} storePackageCount={state.storePackages.length} />}
              {activeSection === 'orders' && <OrdersSection orders={allOrders} dispatch={dispatch} onOrderUpdated={order => setDatabaseOrders(current => current.map(saved => saved.id === order.id ? order : saved))} />}
              {activeSection === 'products' && <ProductsSection />}
              {activeSection === 'inventory' && <InventorySection lowStockProducts={lowStockProducts} outOfStockProducts={outOfStockProducts} />}
              {activeSection === 'packages' && <PackagesSection />}
              {activeSection === 'customers' && <CustomersSection />}
              {activeSection === 'reports' && <ReportsSection />}
              {activeSection === 'settings' && <SettingsSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSection({ totalRevenue, pendingOrders, lowStockProducts, orders, storePackageCount }: any) {
  const todayOrders = orders.filter((o: any) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  
  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Orders', value: pendingOrders.toString(), icon: Clock, color: 'bg-orange-50 text-orange-600' },
    { label: 'Low Stock Items', value: lowStockProducts.length.toString(), icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
    { label: 'Total Products', value: products.length.toString(), icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Store Packages', value: storePackageCount.toString(), icon: Package, color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-lg font-bold text-[#1e3a5f]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <h3 className="font-bold text-[#1e3a5f] mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order: any) => (
                <tr key={order.id} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-[#1e3a5f]">#{order.orderNumber}</td>
                  <td className="py-3 text-gray-600">{order.customerId}</td>
                  <td className="py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      order.orderStatus === 'completed' ? 'bg-green-50 text-green-700' :
                      order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" /> Low Stock Alerts
          </h3>
          <div className="space-y-2">
            {lowStockProducts.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.images[0]}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-orange-600">{p.stockQuantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersSection({ orders, dispatch, onOrderUpdated }: { orders: Order[]; dispatch: React.Dispatch<any>; onOrderUpdated: (order: Order) => void }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const updateOrderStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    const order = orders.find(item => item.id === orderId);
    if (!order) return;
    setSavingStatus(true);
    setStatusError('');
    try {
      const updatedOrder = await updateSupabaseOrder({ ...order, orderStatus: newStatus, updatedAt: new Date().toISOString() });
      dispatch({ type: 'UPDATE_ORDER', order: updatedOrder });
      onOrderUpdated(updatedOrder);
      setSelectedOrder(updatedOrder);
    } catch (error) {
      setStatusError(getSupabaseErrorMessage(error));
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Orders Management</h1>
      {statusError && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{statusError}</p>}
      
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-[#1e3a5f]">
                    <span className="block">#{order.orderNumber}</span>
                    <span className="mt-1 block text-xs font-normal text-gray-600">{order.customerName || order.customerId}{order.customerPhone ? ` · ${order.customerPhone}` : ''}</span>
                  </td>
                  <td className="p-4 text-gray-600">{order.items.length} items</td>
                  <td className="p-4 font-medium">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>{order.paymentStatus}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      order.orderStatus === 'completed' ? 'bg-green-50 text-green-700' :
                      order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>{order.orderStatus.replace('_', ' ')}</span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button onClick={() => setSelectedOrder(order)} className="text-[#f5a623] hover:underline text-xs font-medium">View</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-600">No saved orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-[#1e3a5f] text-lg mb-4">Order #{selectedOrder.orderNumber}</h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm"><span className="text-gray-500">Delivery:</span> {selectedOrder.deliveryMethod}</p>
              {selectedOrder.customerName && <p className="text-sm"><span className="text-gray-500">Customer:</span> {selectedOrder.customerName}</p>}
              {selectedOrder.customerPhone && <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedOrder.customerPhone}</p>}
              {selectedOrder.customerEmail && <p className="text-sm"><span className="text-gray-500">Email:</span> {selectedOrder.customerEmail}</p>}
              {selectedOrder.address && <p className="text-sm"><span className="text-gray-500">Address:</span> {selectedOrder.address}</p>}
              {selectedOrder.notes && <p className="text-sm"><span className="text-gray-500">Notes:</span> {selectedOrder.notes}</p>}
            </div>

            <h4 className="font-semibold text-sm mb-2">Items</h4>
            <div className="space-y-2 mb-6">
              {selectedOrder.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50">
                  <span>{item.productName} × {item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Order Preparation Checklist */}
            <h4 className="font-semibold text-sm mb-2">Order Preparation</h4>
            <div className="space-y-2 mb-6">
              {selectedOrder.items.map((item: any, i: number) => (
                <label key={i} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-[#f5a623]" />
                  <span>{item.productName} × {item.quantity}</span>
                </label>
              ))}
            </div>

            {/* Update Status */}
            <div className="flex flex-wrap gap-2">
              {(['pending', 'processing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'] as Order['orderStatus'][]).map(status => (
                <button
                  key={status}
                  disabled={savingStatus || selectedOrder.orderStatus === status}
                  onClick={() => { void updateOrderStatus(selectedOrder.id, status); }}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize disabled:opacity-60 ${
                    selectedOrder.orderStatus === status ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button onClick={() => setSelectedOrder(null)} className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function getSupabaseErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST205') {
    return 'Supabase setup is incomplete. Run the complete supabase/product-upload-setup.sql script to create the required tables and policies.';
  }
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return String(error);
}

function createEmptyProductForm() {
  return {
    name: '',
    categoryId: categories[0]?.id || 'cat-1',
    price: '0',
    salePrice: '',
    stockQuantity: '0',
    availability: 'in_stock',
    status: 'active',
    featured: false,
    bestSeller: false,
    newArrival: true,
    image: '📚',
    description: '',
    shortDescription: '',
  };
}

function ProductsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [productList, setProductList] = useState(products);
  const { state } = useApp();
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [backendWarning, setBackendWarning] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(createEmptyProductForm);

  useEffect(() => {
    setProductList([...products]);
  }, [state]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    fetchSupabaseProducts()
      .then(() => {
        if (mounted) setBackendWarning('');
      })
      .catch(error => {
        if (!mounted) return;
        const message = getSupabaseErrorMessage(error);
        setBackendWarning(/PGRST205|schema cache|does not exist/i.test(message)
          ? 'Supabase setup is incomplete. Run supabase/product-upload-setup.sql in the Supabase SQL Editor.'
          : `Supabase product access failed: ${message}`);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    const checkAdmin = async (session: { user: { email?: string } } | null) => {
      if (!mounted) return;
      setEmail(session?.user.email || '');
      if (!session) {
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }
      try {
        setIsAdmin(await isCurrentUserAdmin());
      } catch {
        setIsAdmin(false);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => checkAdmin(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void checkAdmin(session);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const filtered = productList.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = stockFilter === 'all'
      || (stockFilter === 'out' && product.stockQuantity === 0)
      || (stockFilter === 'low' && product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold)
      || (stockFilter === 'available' && product.stockQuantity > product.lowStockThreshold);
    return matchesSearch && matchesStock;
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      price: String(product.price),
      salePrice: product.salePrice === undefined ? '' : String(product.salePrice),
      stockQuantity: String(product.stockQuantity),
      availability: product.stockQuantity === 0 ? 'out_of_stock' : 'in_stock',
      status: product.status,
      featured: product.featured,
      bestSeller: product.bestSeller,
      newArrival: product.newArrival,
      image: /^(https?:\/\/|data:image\/)/i.test(product.images[0] || '') ? '📚' : product.images[0] || '📚',
      description: product.description,
      shortDescription: product.shortDescription,
    });
    setImageFile(null);
    setFeedback('');
    setShowForm(true);
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setFeedback('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSaving(false);
    if (error) setFeedback(error.message);
    else setPassword('');
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setFeedback('Signed out.');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const name = formData.name.trim();
    if (!name || !supabase) return;

    const price = Number(formData.price) || 0;
    const salePrice = formData.salePrice ? Number(formData.salePrice) : undefined;
    const stockQuantity = formData.availability === 'out_of_stock' ? 0 : Number(formData.stockQuantity) || 0;
    if (salePrice !== undefined && salePrice > price) {
      setFeedback('Sale price must not be higher than regular price.');
      return;
    }

    setSaving(true);
    setFeedback('');
    try {
      const now = new Date().toISOString().slice(0, 10);
      const id = editingProduct?.id || crypto.randomUUID();
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${id.slice(0, 6)}`;
      const image = imageFile ? await uploadProductImage(imageFile) : editingProduct?.images[0] || formData.image || '📚';
      const product: Product = {
        ...(editingProduct || {} as Product),
        id,
        sku: editingProduct?.sku || `FOC-${id.slice(0, 8).toUpperCase()}`,
        name,
        slug,
        description: formData.description || `${name} is now available in the FOCUS store.`,
        shortDescription: formData.shortDescription || formData.description || name,
        categoryId: formData.categoryId,
        price,
        salePrice,
        stockQuantity,
        lowStockThreshold: Math.max(1, Math.min(20, Math.round(stockQuantity * 0.15))),
        images: [image],
        status: formData.status as Product['status'],
        featured: formData.featured,
        bestSeller: formData.bestSeller,
        newArrival: formData.newArrival,
        rating: 5,
        reviewCount: 0,
        createdAt: editingProduct?.createdAt || now,
        updatedAt: now,
      };

      const wasEditing = Boolean(editingProduct);
      const savedProduct = wasEditing ? await updateSupabaseProduct(product) : await saveSupabaseProduct(product);
      if (wasEditing) updateProduct(savedProduct);
      else addProduct(savedProduct);
      setProductList([...products]);
      setImageFile(null);
      setEditingProduct(null);
      setFormData(createEmptyProductForm());
      setShowForm(false);
      setFeedback(wasEditing ? 'Product changes saved.' : 'Product saved and published to the store.');
    } catch (error) {
      setFeedback(getSupabaseErrorMessage(error) || 'Could not save this product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Products</h1>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button onClick={handleSignOut} className="p-2 text-gray-500 hover:text-red-600" title="Sign out" aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData(createEmptyProductForm());
                setImageFile(null);
                setShowForm(true);
              }}
              className="bg-[#f5a623] text-[#1e3a5f] font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        )}
      </div>

      {backendWarning && <p role="alert" className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">{backendWarning}</p>}
      {feedback && <p role="status" className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{feedback}</p>}

      {authLoading && <p className="mb-6 text-sm text-gray-500">Checking admin access...</p>}

      {!authLoading && !isAdmin && (
        <section className="bg-white border border-gray-100 rounded-xl p-6 mb-6 max-w-xl">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">Admin access required</h2>
          {!supabase ? (
            <p className="text-sm text-gray-600">Set the Supabase URL and anon key in the local environment file, then restart the dev server.</p>
          ) : email ? (
            <div>
              <p className="text-sm text-gray-700">{email} is authenticated but is not registered as a product admin. Authentication accounts must also have a row in <code>public.admin_users</code>.</p>
              <p className="mt-2 text-xs text-gray-600">In Supabase SQL Editor, add this account&apos;s Auth user UUID:</p>
              <code className="mt-1 block rounded bg-gray-50 p-2 text-xs text-gray-800">insert into public.admin_users (user_id) values (&apos;AUTH_USER_UUID&apos;) on conflict do nothing;</code>
              <button onClick={handleSignOut} className="mt-3 text-sm font-medium text-[#1e3a5f] underline">Sign out</button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Admin email
                <input type="email" value={email} onChange={event => setEmail(event.target.value)} required className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Password
                <input type="password" value={password} onChange={event => setPassword(event.target.value)} required className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
              </label>
              <button disabled={saving} className="bg-[#1e3a5f] text-white font-semibold px-4 py-2.5 rounded-lg text-sm disabled:opacity-60">
                {saving ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}
        </section>
      )}

      {showForm && isAdmin && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#1e3a5f]">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }} className="text-sm text-gray-600 hover:text-gray-900">Close</button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name</label>
              <input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Example: Mathematics Workbook" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <select value={formData.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Regular Price</label>
              <input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sale Price</label>
              <input type="number" min="0" step="0.01" value={formData.salePrice} onChange={(e) => handleChange('salePrice', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Optional" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Stock availability</label>
              <select value={formData.availability} onChange={(e) => handleChange('availability', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
                <option value="in_stock">In stock</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Stock quantity</label>
              <input type="number" min="0" value={formData.stockQuantity} disabled={formData.availability === 'out_of_stock'} onChange={(e) => handleChange('stockQuantity', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm disabled:bg-gray-100 disabled:text-gray-500" required />
              <p className="mt-1 text-xs text-gray-500">Out of stock saves with quantity 0.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Fallback emoji</label>
              <input value={formData.image} onChange={(e) => handleChange('image', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" maxLength={2} placeholder="📚" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Product photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={event => {
                  const file = event.target.files?.[0] || null;
                  if (file && (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024)) {
                    setFeedback('Choose an image smaller than 5 MB.');
                    event.currentTarget.value = '';
                    return;
                  }
                  setFeedback('');
                  setImageFile(file);
                }}
                className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2"
              />
              <p className="mt-1 text-xs text-gray-500">{imageFile ? imageFile.name : 'Optional; JPG, PNG, or WebP, up to 5 MB'}</p>
              {imagePreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={imagePreview} alt="Selected product preview" className="h-16 w-16 rounded-lg border border-gray-200 object-contain p-1" />
                  <button type="button" onClick={() => setImageFile(null)} className="text-sm font-medium text-red-600 hover:underline">Remove photo</button>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Short Description</label>
              <input value={formData.shortDescription} onChange={(e) => handleChange('shortDescription', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Short summary" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Description</label>
              <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Describe the product" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
            <div className="flex items-center gap-4 pt-7">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={formData.featured} onChange={(e) => handleChange('featured', e.target.checked)} className="rounded border-gray-300 text-[#f5a623]" />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={formData.bestSeller} onChange={(e) => handleChange('bestSeller', e.target.checked)} className="rounded border-gray-300 text-[#f5a623]" />
                Best Seller
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={formData.newArrival} onChange={(e) => handleChange('newArrival', e.target.checked)} className="rounded border-gray-300 text-[#f5a623]" />
                New Arrival
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="bg-[#f5a623] text-[#1e3a5f] font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
                <UploadCloud className="w-4 h-4" /> {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
        </div>
        <select aria-label="Filter products by stock" value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700">
          <option value="all">All stock statuses</option>
          <option value="available">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <button className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Quantity</th>
                <th className="p-4 font-semibold">Stock status</th>
                <th className="p-4 font-semibold">Listing status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <ProductArtwork source={product.images[0]} alt={product.name} className="w-10 h-10 text-xl" />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{categories.find(c => c.id === product.categoryId)?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700 text-sm">{product.sku}</td>
                  <td className="p-4 font-semibold text-sm">{formatPrice(product.salePrice || product.price)}</td>
                  <td className="p-4">
                    <span className={`text-sm font-semibold ${product.stockQuantity <= product.lowStockThreshold ? 'text-orange-700' : 'text-gray-700'}`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.stockQuantity === 0 ? 'bg-red-50 text-red-700' : product.stockQuantity <= product.lowStockThreshold ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-700'}`}>
                      {product.stockQuantity === 0 ? 'Out of stock' : product.stockQuantity <= product.lowStockThreshold ? 'Low stock' : 'In stock'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {product.status === 'active' ? 'Active' : product.status === 'inactive' ? 'Hidden' : 'Discontinued'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-[#1e3a5f]"><Eye className="w-3.5 h-3.5" /></button>
                    {isAdmin && <button type="button" onClick={() => startEditing(product)} title={`Edit ${product.name}`} aria-label={`Edit ${product.name}`} className="p-1.5 text-gray-500 hover:text-[#f5a623]"><Edit className="w-4 h-4" /></button>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-500">No products match this search and stock filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PackagesSection() {
  const { state: appState } = useApp();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [packages, setPackages] = useState<StorePackage[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadPackages = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('store_packages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setPackages((data || []).map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      items: row.items,
      retailPrice: Number(row.retail_price),
      packagePrice: Number(row.package_price),
      available: row.available,
      createdAt: row.created_at,
    })));
  };

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      setFeedback('Supabase is not configured.');
      return;
    }
    let mounted = true;
    const verify = async (session: { user: { id: string } } | null) => {
      if (!mounted) return;
      if (!session) {
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }
      try {
        const authorized = await isCurrentUserAdmin();
        if (!mounted) return;
        setIsAdmin(authorized);
        if (authorized) await loadPackages();
      } catch (error) {
        if (mounted) setFeedback(getSupabaseErrorMessage(error));
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };
    supabase.auth.getSession().then(({ data }) => verify(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void verify(session); });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const retailPrice = Object.entries(selectedItems).reduce((total, [productId, quantity]) => {
    const product = products.find(item => item.id === productId);
    return total + (product ? (product.salePrice || product.price) * quantity : 0);
  }, 0);

  const toggleProduct = (productId: string) => {
    setSelectedItems(current => {
      if (current[productId]) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return { ...current, [productId]: 1 };
    });
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const items: StorePackageItem[] = Object.entries(selectedItems).map(([productId, quantity]) => ({ productId, quantity }));
    const price = Number(packagePrice);
    const unavailableItem = items.some(item => {
      const product = products.find(candidate => candidate.id === item.productId);
      return !product || product.status !== 'active' || product.stockQuantity < item.quantity;
    });
    if (!items.length || unavailableItem || !Number.isFinite(price) || price < 0 || price > retailPrice) {
      setFeedback('Select at least one product and set a package price no higher than the retail total.');
      return;
    }
    setSaving(true);
    setFeedback('');
    const id = crypto.randomUUID();
    const cleanName = name.trim();
    const slug = `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${id.slice(0, 6)}`;
    try {
      const created = await createStorePackage({
        id,
        name: cleanName,
        slug,
        description: description.trim(),
        items,
        retailPrice,
        packagePrice: price,
        available: true,
        createdAt: new Date().toISOString(),
      });
      setPackages(current => [created, ...current]);
      setName('');
      setDescription('');
      setPackagePrice('');
      setSelectedItems({});
      setFeedback('Package created and published for customers.');
    } catch (error) {
      setFeedback(getSupabaseErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Customer Packages</h1>
        <p className="mt-1 text-sm text-gray-600">Build store-curated bundles from products. These packages are not tied to a school. {appState.storePackages.length} published.</p>
      </div>
      {feedback && <p role="status" className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">{feedback}</p>}
      {authLoading ? <p className="text-sm text-gray-600">Checking admin access...</p> : !isAdmin ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Sign in with an account authorized in the product admin allowlist to manage packages.</p>
      ) : (
        <>
          <form onSubmit={handleCreate} className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#1e3a5f]">Create a package</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">Package name
                <input value={name} onChange={event => setName(event.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" placeholder="e.g. Everyday Study Essentials" />
              </label>
              <label className="text-sm font-medium text-gray-700">Package price (GH₵)
                <input type="number" min="0" max={retailPrice || undefined} step="0.01" value={packagePrice} onChange={event => setPackagePrice(event.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" placeholder="0.00" />
              </label>
              <label className="text-sm font-medium text-gray-700 md:col-span-2">Description
                <textarea value={description} onChange={event => setDescription(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" placeholder="What makes this bundle useful?" />
              </label>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-800">Choose package items</h3>
                <p className="text-sm text-gray-600">Retail total: <strong>{formatPrice(retailPrice)}</strong></p>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200">
                {products.filter(product => product.status === 'active' && product.stockQuantity > 0).map(product => (
                  <div key={product.id} className="flex items-center gap-3 border-b border-gray-100 p-3 last:border-0 hover:bg-gray-50">
                    <input type="checkbox" aria-label={`Include ${product.name}`} checked={Boolean(selectedItems[product.id])} onChange={() => toggleProduct(product.id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-gray-800">{product.name}</span>
                      <span className="block text-xs text-gray-500">{formatPrice(product.salePrice || product.price)} · {product.stockQuantity} in stock</span>
                    </span>
                    {selectedItems[product.id] && <input aria-label={`Quantity of ${product.name}`} type="number" min="1" max={Math.max(1, product.stockQuantity)} value={selectedItems[product.id]} onChange={event => setSelectedItems(current => ({ ...current, [product.id]: Math.max(1, Number(event.target.value) || 1) }))} className="w-20 rounded border border-gray-300 px-2 py-1 text-sm" />}
                  </div>
                ))}
              </div>
            </div>
            <button disabled={saving || !isAdmin} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#f5a623] px-5 py-2.5 text-sm font-bold text-[#1e3a5f] disabled:opacity-60">
              <Plus className="h-4 w-4" /> {saving ? 'Creating...' : 'Create customer package'}
            </button>
          </form>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4"><h2 className="font-bold text-[#1e3a5f]">Published packages ({packages.length})</h2></div>
            {packages.length ? packages.map(bundle => (
              <div key={bundle.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 last:border-0">
                <div><p className="font-semibold text-gray-800">{bundle.name}</p><p className="text-sm text-gray-600">{bundle.items.length} products · retail {formatPrice(bundle.retailPrice)}</p></div>
                <p className="font-bold text-[#1e3a5f]">{formatPrice(bundle.packagePrice)}</p>
              </div>
            )) : <p className="p-5 text-sm text-gray-600">No customer packages created yet.</p>}
          </div>
        </>
      )}
    </section>
  );
}

function InventorySection({ lowStockProducts, outOfStockProducts }: any) {
  const { state } = useApp();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Inventory Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-[#1e3a5f]">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4">
          <p className="text-sm text-orange-600">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-4">
          <p className="text-sm text-red-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
        </div>
      </div>

      {state.storePackages.filter(pkg => {
        return pkg.items.some(item => {
          const product = products.find(p => p.id === item.productId);
          return product && product.stockQuantity < item.quantity;
        });
      }).map(pkg => (
        <div key={pkg.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-orange-800">Package availability warning</p>
          <p className="text-xs text-orange-700 mt-1">{pkg.name} contains an item with insufficient stock.</p>
        </div>
      ))}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Current Stock</th>
                <th className="p-4 font-medium">Low Stock Alert</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="p-4 flex items-center gap-2">
                    <span>{p.images[0]}</span>
                    <span className="text-xs font-medium">{p.name}</span>
                  </td>
                  <td className="p-4 text-xs text-gray-600">{p.sku}</td>
                  <td className="p-4 font-medium text-xs">{p.stockQuantity}</td>
                  <td className="p-4 text-xs text-gray-500">{p.lowStockThreshold}</td>
                  <td className="p-4">
                    {p.stockQuantity === 0 ? (
                      <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Out of Stock</span>
                    ) : p.stockQuantity <= p.lowStockThreshold ? (
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">Low Stock</span>
                    ) : (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomersSection() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Customers</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-gray-500 text-sm">Customer management will show registered customers here. Demo data shows sample customers.</p>
        <div className="mt-4 space-y-3">
          {['Akua Mensah - 0241234567', 'Kofi Asante - 0201234567', 'Ama Darko - 0271234567'].map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-xs font-bold">{c[0]}</div>
                <span className="text-sm font-medium">{c}</span>
              </div>
              <button className="text-xs text-[#f5a623] font-medium">View Orders</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsSection() {
  const { state } = useApp();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Reports & Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4">Sales Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Today</span><span className="font-medium">GH₵0.00</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">This Week</span><span className="font-medium">GH₵304.00</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">This Month</span><span className="font-medium">GH₵304.00</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4">Top Products</h3>
          <div className="space-y-3">
            {products.filter(p => p.bestSeller).slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{p.images[0]}</span>
                  <span className="text-xs">{p.name}</span>
                </div>
                <span className="text-xs font-medium text-[#f5a623]">{p.reviewCount} sold</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4">Store Package Analytics</h3>
          <div className="space-y-3">
            {state.storePackages.map(pkg => (
              <div key={pkg.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{pkg.name}</span>
                <span className="font-medium">{formatPrice(pkg.packagePrice)}</span>
              </div>
            ))}
            {state.storePackages.length === 0 && <p className="text-sm text-gray-500">No store packages created yet.</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4">Export Reports</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">📊 Sales Report (CSV)</button>
            <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">📦 Inventory Report (CSV)</button>
            <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">👥 Customer Report (CSV)</button>
            <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">🎁 Store Package Report (CSV)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  const hasPaystackPublicKey = Boolean(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4">Store Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Store Name</label>
              <input type="text" defaultValue="FOCUS" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp Number</label>
              <input type="text" defaultValue="+233 00 000 0000" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input type="email" defaultValue="info@focusstore.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
              <input type="text" defaultValue="Accra, Ghana" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4">BMS Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">BMS API URL</label>
              <input type="text" placeholder="https://api.focus-bms.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">BMS API Key</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span>BMS not connected — Configure API credentials to enable sync</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-[#1e3a5f] mb-3">Paystack Payment Setup</h3>
          <p className="text-sm text-gray-700">Browser public key: {hasPaystackPublicKey ? 'configured' : 'not configured'}.</p>
          <p className="mt-2 text-sm text-gray-600">The server verifier must be deployed as a Supabase Edge Function. Keep <code>PAYSTACK_SECRET_KEY</code> in Supabase Function Secrets only; never enter it in this dashboard.</p>
          <p className="mt-2 text-xs text-gray-500">See README.md for the test setup steps. Use a production key only after server-side order pricing and order persistence are in place.</p>
        </div>
        <button className="bg-[#f5a623] text-[#1e3a5f] font-bold px-6 py-2.5 rounded-xl text-sm">Save Settings</button>
      </div>
    </div>
  );
}
