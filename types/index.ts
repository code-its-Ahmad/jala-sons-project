export interface User {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role: 'customer' | 'rider' | 'admin';
  avatar_url?: string;
  default_address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Store {
  id: string;
  name: string;
  type: 'grocery' | 'restaurant' | 'hybrid';
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  open_time?: string;
  close_time?: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  parent_id?: string;
  type: string;
  icon_url?: string;
  sort_order: number;
  children?: Category[];
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  image_url?: string;
  is_active: boolean;
  tags?: string[];
  nutritional_info?: Record<string, any>;
  source_url?: string;
  created_at: string;
  updated_at?: string;
  available_quantity?: number;
  stock_status?: 'in_stock' | 'low' | 'critical' | 'out_of_stock' | 'unknown';
  similarity_score?: number;
  similarity_percent?: number;
  match_reason?: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity_available: number;
  quantity_reserved: number;
  unit?: string;
  reorder_point: number;
  last_restocked_at?: string;
  products?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  rider_id?: string;
  status: string;
  total_amount: number;
  subtotal?: number;
  delivery_fee?: number;
  discount_amount?: number;
  tax_amount?: number;
  delivery_address: any;
  delivery_lat?: number;
  delivery_lng?: number;
  delivery_notes?: string;
  estimated_eta?: number;
  payment_method: string;
  payment_status: string;
  source?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  rider_name?: string;
  rider_phone?: string;
  store_name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  is_substituted: boolean;
  substituted_for_id?: string;
  substitution_discount: number;
  products?: { name: string; image_url: string };
}

export interface Rider {
  id: string;
  user_id: string;
  vehicle_type: 'motorcycle' | 'bicycle' | 'car';
  is_available: boolean;
  is_online: boolean;
  current_latitude?: number;
  current_longitude?: number;
  active_order_count: number;
  avg_delivery_rating: number;
  total_deliveries: number;
  full_name?: string;
  phone?: string;
}

export interface RiderLocation {
  id: string;
  rider_id: string;
  latitude: number;
  longitude: number;
  speed_kmh?: number;
  heading_degrees?: number;
  recorded_at: string;
}

export interface SubstitutionOffer {
  id: string;
  order_id: string;
  original_product_id: string;
  suggested_product_id: string;
  similarity_score: number;
  rank: number;
  discount_percentage: number;
  ai_reasoning: string;
  user_response: 'pending' | 'accepted' | 'rejected';
  original_product?: Product;
  suggested_product?: Product;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'order_update' | 'substitution_offer' | 'low_stock' | 'rider_assigned' | 'delivered' | 'system';
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: any;
  label: string;
  description?: string;
  data_type: string;
  updated_at: string;
}

export interface AgentLog {
  id: string;
  agent_name: string;
  trigger_event: string;
  input_data?: any;
  output_data?: any;
  status: 'success' | 'failed' | 'partial';
  duration_ms?: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  order_id: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  reserved: boolean;
}

export interface Prediction {
  id: string;
  product_id: string;
  product_name?: string;
  predicted_demand_24h: number;
  predicted_demand_48h: number;
  predicted_demand_7d: number;
  confidence_score: number;
  predicted_stockout_at?: string;
  model_version?: string;
}

export interface TrackingInfo {
  order_id: string;
  status: string;
  rider_id?: string;
  rider_name?: string;
  rider_phone?: string;
  rider_lat?: number;
  rider_lng?: number;
  delivery_lat: number;
  delivery_lng: number;
  estimated_eta?: number;
  distance_km?: number;
  route_geojson?: any;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'RIDER_ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface Address {
  id: string;
  user_id: string;
  label: string;
  address_line1: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}
