// Marketplace Types

export type ProductCategory = 
  | 'MEDICATION'
  | 'SUPPLEMENT'
  | 'MEDICAL_DEVICE'
  | 'HEALTH_FOOD'
  | 'OTHER';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount_percent: number;
  final_price: number;
  rating: number;
  rating_count: number;
  quantity: number;
  in_stock: boolean;
  image_url?: string;
  category: ProductCategory;
  is_active: boolean;
  reviews?: ProductReview[];
  created_at: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  user_id: string;
  created_at: string;
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ProductDetailResponse {
  data: Product;
}

// Cart Types
export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  total_quantity: number;
  total: number;
}

export interface CartResponse {
  data: Cart;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Shipping Address Types
export interface ShippingAddress {
  id: string;
  user_id: string;
  recipient_name: string;
  phone_number: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddressesResponse {
  data: ShippingAddress[];
}

export interface CreateShippingAddressRequest {
  recipient_name: string;
  phone_number: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default?: boolean;
}

// Order Types
export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

export type ShippingStatus = 
  | 'PREPARING'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'DELIVERED';

export interface OrderItemProductSnapshot {
  image_url?: string;
  description?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  product_snapshot?: OrderItemProductSnapshot;
}

export interface OrderPayment {
  order_id: string;
  status: PaymentStatus;
  method?: string;
  snap_token?: string;
  snap_redirect_url?: string;
  expiry_time?: string;
}

export interface Order {
  id: string;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  admin_fee?: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_status?: ShippingStatus;
  tracking_number?: string;
  courier?: string;
  notes?: string;
  items: OrderItem[];
  shipping_address?: ShippingAddress;
  payment?: OrderPayment;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface OrderDetailResponse {
  data: Order;
}

export interface CreateOrderRequest {
  shipping_address_id: string;
  shipping_cost: number;
  courier: string;
  notes?: string;
}

export interface CreateOrderResponse {
  message: string;
  order: Order;
  payment: {
    order_id: string;
    amount: number;
    expiry_time: string;
    snap_token: string;
    snap_redirect_url: string;
  };
}

export interface ReviewProductRequest {
  rating: number;
  comment?: string;
}
