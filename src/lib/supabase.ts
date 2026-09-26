import { createClient } from '@supabase/supabase-js';
import type { Order, Product, StorePackage } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

type ProductRow = {
  id: string;
  sku: string;
  isbn: string | null;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  author: string | null;
  publisher: string | null;
  brand: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  images: string[];
  status: Product['status'];
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: Order['items'];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_status: Order['paymentStatus'];
  payment_method: NonNullable<Order['paymentMethod']>;
  payment_reference: string | null;
  order_status: Order['orderStatus'];
  delivery_method: Order['deliveryMethod'];
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || undefined,
    items: row.items,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    orderStatus: row.order_status,
    deliveryMethod: row.delivery_method,
    address: row.address || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toOrderRow(order: Order) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    customer_id: order.customerId,
    customer_name: order.customerName || 'Customer',
    customer_phone: order.customerPhone || '',
    customer_email: order.customerEmail || null,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    delivery_fee: order.deliveryFee,
    total: order.total,
    payment_status: order.paymentStatus,
    payment_method: order.paymentMethod || 'pay_on_pickup',
    payment_reference: order.paymentMethod === 'paystack' ? order.orderNumber : null,
    order_status: order.orderStatus,
    delivery_method: order.deliveryMethod,
    address: order.address || null,
    notes: order.notes || null,
    updated_at: order.updatedAt,
  };
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    isbn: row.isbn || undefined,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    categoryId: row.category_id,
    author: row.author || undefined,
    publisher: row.publisher || undefined,
    brand: row.brand || undefined,
    price: Number(row.price),
    salePrice: row.sale_price === null ? undefined : Number(row.sale_price),
    stockQuantity: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
    images: row.images || [],
    status: row.status,
    featured: row.featured,
    bestSeller: row.best_seller,
    newArrival: row.new_arrival,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(product: Product): Omit<ProductRow, 'created_at' | 'updated_at'> {
  return {
    id: product.id,
    sku: product.sku,
    isbn: product.isbn || null,
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.shortDescription,
    category_id: product.categoryId,
    author: product.author || null,
    publisher: product.publisher || null,
    brand: product.brand || null,
    price: product.price,
    sale_price: product.salePrice ?? null,
    stock_quantity: product.stockQuantity,
    low_stock_threshold: product.lowStockThreshold,
    images: product.images,
    status: product.status,
    featured: product.featured,
    best_seller: product.bestSeller,
    new_arrival: product.newArrival,
    rating: product.rating,
    review_count: product.reviewCount,
  };
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
  }
  return supabase;
}

export async function fetchSupabaseProducts(): Promise<Product[]> {
  const { data, error } = await requireSupabase()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ProductRow[]).map(toProduct);
}

export async function saveSupabaseProduct(product: Product): Promise<Product> {
  const { data, error } = await requireSupabase()
    .from('products')
    .insert(toRow(product))
    .select('*')
    .single();

  if (error) throw error;
  return toProduct(data as ProductRow);
}

export async function updateSupabaseProduct(product: Product): Promise<Product> {
  const { data, error } = await requireSupabase()
    .from('products')
    .update(toRow(product))
    .eq('id', product.id)
    .select('*')
    .single();

  if (error) throw error;
  return toProduct(data as ProductRow);
}

export async function fetchStorePackages(): Promise<StorePackage[]> {
  const { data, error } = await requireSupabase()
    .from('store_packages')
    .select('*')
    .eq('available', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    items: row.items,
    retailPrice: Number(row.retail_price),
    packagePrice: Number(row.package_price),
    available: row.available,
    createdAt: row.created_at,
  }));
}

export async function createStorePackage(storePackage: StorePackage): Promise<StorePackage> {
  const { data, error } = await requireSupabase()
    .from('store_packages')
    .insert({
      id: storePackage.id,
      name: storePackage.name,
      slug: storePackage.slug,
      description: storePackage.description,
      items: storePackage.items,
      retail_price: storePackage.retailPrice,
      package_price: storePackage.packagePrice,
      available: storePackage.available,
    })
    .select('*')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    items: data.items,
    retailPrice: Number(data.retail_price),
    packagePrice: Number(data.package_price),
    available: data.available,
    createdAt: data.created_at,
  };
}

export async function uploadProductImage(file: File): Promise<string> {
  const client = requireSupabase();
  const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw error;
  return client.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getSession();
  if (authError) throw authError;
  if (!authData.session) return false;

  const { data, error } = await client
    .from('admin_users')
    .select('user_id')
    .eq('user_id', authData.session.user.id)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function saveSupabaseOrder(order: Order): Promise<Order> {
  const { error } = await requireSupabase().from('orders').insert(toOrderRow(order));
  if (error) throw error;
  return order;
}

export async function fetchSupabaseOrders(): Promise<Order[]> {
  const { data, error } = await requireSupabase()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(toOrder);
}

export async function updateSupabaseOrder(order: Order): Promise<Order> {
  const { data, error } = await requireSupabase()
    .from('orders')
    .update(toOrderRow(order))
    .eq('id', order.id)
    .select('*')
    .single();
  if (error) throw error;
  return toOrder(data as OrderRow);
}