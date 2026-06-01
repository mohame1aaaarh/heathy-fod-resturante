
export interface ProductSize {
  name: string;
  price: number;
}

export interface ProductAddon {
  name: string;
  price: number;
}

export interface NutritionFact {
  label: string;
  value: string;
}

export interface Category {
  id: string;
  label: string;
  label_en: string;
  icon: string;
  has_spicy_option: boolean;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  imageUrl: string;
  category?: string;
  is_featured?: boolean;
  is_available?: boolean;
  is_hidden?: boolean;
  has_sizes?: boolean;
  sizes?: ProductSize[];
  addons?: ProductAddon[]; // New field for suggestions/combos
  nutritionFacts?: NutritionFact[]; // New field for nutrition info
}

export interface CartItem extends MenuItem {
  quantity: number;
  variant?: 'spicy' | 'regular';
  selectedSize?: ProductSize;
  selectedAddons?: ProductAddon[]; // New field for selected addons
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  active: boolean;
}

export type OrderType = 'delivery' | 'pickup';
export type PaymentMethod = 'cash' | 'online';

export interface Order {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  zone_name: string;
  order_type: OrderType;
  payment_method: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'new' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  created_at: string;
}

export interface NavLink {
  label: string;
  href: string;
}
