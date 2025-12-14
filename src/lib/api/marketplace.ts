// Marketplace API Service
import { buildUrl } from './config';
import { storage } from '../hooks/useAuth';
import type {
  Product,
  ProductsResponse,
  ProductDetailResponse,
  Cart,
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  ShippingAddress,
  ShippingAddressesResponse,
  CreateShippingAddressRequest,
  Order,
  OrdersResponse,
  OrderDetailResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  ReviewProductRequest,
} from '../types/marketplace';

// Helper function for authenticated API calls
async function authRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = storage.getToken();
  const url = buildUrl(endpoint);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      success: false,
      message: data.message || 'Terjadi kesalahan',
      statusCode: response.status,
    };
  }

  return data;
}

// Helper function for public API calls (no auth required)
async function publicRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildUrl(endpoint);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      success: false,
      message: data.message || 'Terjadi kesalahan',
      statusCode: response.status,
    };
  }

  return data;
}

// ============= PRODUCT API =============

export async function getProducts(params?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.category) searchParams.append('category', params.category);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
  if (params?.inStock) searchParams.append('inStock', 'true');
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const query = searchParams.toString();
  return publicRequest<ProductsResponse>(`/marketplace/products${query ? `?${query}` : ''}`);
}

export async function getProductById(id: string): Promise<ProductDetailResponse> {
  return publicRequest<ProductDetailResponse>(`/marketplace/products/${id}`);
}

// ============= CART API =============

export async function getCart(): Promise<CartResponse> {
  return authRequest<CartResponse>('/marketplace/cart');
}

export async function addToCart(data: AddToCartRequest): Promise<CartResponse> {
  return authRequest<CartResponse>('/marketplace/cart', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCartItem(itemId: string, data: UpdateCartItemRequest): Promise<CartResponse> {
  return authRequest<CartResponse>(`/marketplace/cart/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function removeFromCart(itemId: string): Promise<CartResponse> {
  return authRequest<CartResponse>(`/marketplace/cart/${itemId}`, {
    method: 'DELETE',
  });
}

export async function clearCart(): Promise<{ message: string }> {
  return authRequest<{ message: string }>('/marketplace/cart', {
    method: 'DELETE',
  });
}

// ============= SHIPPING ADDRESS API =============

export async function getShippingAddresses(): Promise<ShippingAddressesResponse> {
  return authRequest<ShippingAddressesResponse>('/marketplace/addresses');
}

export async function createShippingAddress(data: CreateShippingAddressRequest): Promise<{ message: string; data: ShippingAddress }> {
  return authRequest<{ message: string; data: ShippingAddress }>('/marketplace/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateShippingAddress(id: string, data: Partial<CreateShippingAddressRequest>): Promise<{ message: string; data: ShippingAddress }> {
  return authRequest<{ message: string; data: ShippingAddress }>(`/marketplace/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteShippingAddress(id: string): Promise<{ message: string }> {
  return authRequest<{ message: string }>(`/marketplace/addresses/${id}`, {
    method: 'DELETE',
  });
}

// ============= ORDER API =============

export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  return authRequest<CreateOrderResponse>('/marketplace/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<OrdersResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const query = searchParams.toString();
  return authRequest<OrdersResponse>(`/marketplace/orders${query ? `?${query}` : ''}`);
}

export async function getOrderById(id: string): Promise<OrderDetailResponse> {
  return authRequest<OrderDetailResponse>(`/marketplace/orders/${id}`);
}

export async function cancelOrder(id: string): Promise<{ message: string }> {
  return authRequest<{ message: string }>(`/marketplace/orders/${id}/cancel`, {
    method: 'PATCH',
  });
}

export async function confirmDelivery(id: string): Promise<{ message: string }> {
  return authRequest<{ message: string }>(`/marketplace/orders/${id}/confirm-delivery`, {
    method: 'PATCH',
  });
}

// ============= REVIEW API =============

export async function reviewProduct(productId: string, data: ReviewProductRequest): Promise<{ message: string }> {
  return authRequest<{ message: string }>(`/marketplace/products/${productId}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
