-- ============================================================
-- LA PRAMA - Supabase Database Schema
-- Run this entire script in Supabase SQL Editor to initialize DB
-- ============================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  label_en TEXT NOT NULL,
  icon TEXT NOT NULL,
  has_spicy_option BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ج.م',
  image_url TEXT NOT NULL,
  category TEXT REFERENCES categories(id) ON DELETE SET NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  has_sizes BOOLEAN NOT NULL DEFAULT FALSE,
  sizes JSONB DEFAULT '[]'::jsonb,
  addons JSONB DEFAULT '[]'::jsonb,
  nutrition_facts JSONB DEFAULT '[]'::jsonb
);

-- 3. DELIVERY ZONES TABLE
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fee NUMERIC(10, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'online')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'delivering', 'completed', 'cancelled'))
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_hidden ON products(is_hidden) WHERE is_hidden = FALSE;
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_delivery_zones_name ON delivery_zones(name);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable all for all users" ON categories;
CREATE POLICY "Enable all for all users" ON categories
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read visible products" ON products;
CREATE POLICY "Public can read visible products" ON products
  FOR SELECT USING (is_hidden = FALSE);
DROP POLICY IF EXISTS "Enable all for all users" ON products;
CREATE POLICY "Enable all for all users" ON products
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Delivery Zones
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active zones" ON delivery_zones;
CREATE POLICY "Public can read active zones" ON delivery_zones
  FOR SELECT USING (active = TRUE);
DROP POLICY IF EXISTS "Enable all for all users" ON delivery_zones;
CREATE POLICY "Enable all for all users" ON delivery_zones
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
CREATE POLICY "Public can insert orders" ON orders
  FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Public can read own orders" ON orders;
CREATE POLICY "Public can read own orders" ON orders
  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable all for all users" ON orders;
CREATE POLICY "Enable all for all users" ON orders
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- SEED DATA - Categories
-- ============================================================
INSERT INTO categories (id, label, label_en, icon, has_spicy_option, sort_order) VALUES
  ('healthy_meals', 'وجبات صحية', 'Healthy Meals', 'nutrition', FALSE, 1),
  ('salads', 'سلطات', 'Salads', 'emoji_food_beverage', FALSE, 2),
  ('sandwiches', 'سندوتشات', 'Sandwiches', 'skateboarding', FALSE, 3),
  ('grills', 'مشويات', 'Grills', 'oven_gen', FALSE, 4),
  ('appetizers', 'مقبلات', 'Appetizers', 'tapas', FALSE, 5),
  ('sides', 'إضافات', 'Sides', 'extension', FALSE, 6),
  ('drinks', 'مشروبات', 'Drinks', 'local_cafe', FALSE, 7),
  ('desserts', 'حلويات دايت', 'Diet Desserts', 'cake', FALSE, 8)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA - Delivery Zones
-- ============================================================
INSERT INTO delivery_zones (name, fee, active) VALUES
  ('مدينة المنصورة - وسط', 15, TRUE),
  ('مدينة المنصورة - شمال', 20, TRUE),
  ('مدينة المنصورة - جنوب', 20, TRUE),
  ('مدينة المنصورة - شرق', 25, TRUE),
  ('مدينة المنصورة - غرب', 25, TRUE),
  ('طلخا', 25, TRUE),
  ('نبروه', 30, TRUE),
  ('ميت غمر', 30, TRUE),
  ('أجا', 25, TRUE),
  ('السنبلاوين', 30, TRUE),
  ('بني عبيد', 30, TRUE),
  ('تمي الأمديد', 35, TRUE),
  ('دكرنس', 35, TRUE),
  ('منية النصر', 30, TRUE),
  ('شربين', 30, TRUE),
  ('المطرية', 30, TRUE),
  ('بلقاس', 30, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA - Sample Products
-- ============================================================
INSERT INTO products (title, subtitle, price, currency, image_url, category, is_featured, is_available, has_sizes, sizes, addons, nutrition_facts) VALUES
  ('وجبة لابراما الصحية', 'صدر دجاج مشوي + أرز بني + سلطة جانبية', 120, 'ج.م', 'https://i.postimg.cc/8PfBKjPF/chick-banner.jpg', 'healthy_meals', TRUE, TRUE, FALSE, NULL,
    '[{"name": "إضافة بروتين", "price": 30}, {"name": "حمص إضافي", "price": 15}]'::jsonb,
    '[{"label": "سعرات", "value": "420 kcal"}, {"label": "بروتين", "value": "38g"}, {"label": "كارب", "value": "35g"}, {"label": "دهون", "value": "12g"}]'::jsonb),
  ('سلطة السيزر بالدجاج', 'خس طازج + صدر دجاج مشوي + جبنة بارميزان', 85, 'ج.م', 'https://i.postimg.cc/8PfBKjPF/chick-banner.jpg', 'salads', TRUE, TRUE, FALSE, NULL,
    '[{"name": "إضافة دجاج", "price": 25}, {"name": "إضافة أفوكادو", "price": 20}]'::jsonb,
    '[{"label": "سعرات", "value": "280 kcal"}, {"label": "بروتين", "value": "32g"}, {"label": "كارب", "value": "8g"}, {"label": "دهون", "value": "14g"}]'::jsonb),
  ('سندوتش راب صحي', 'خبز راب القمح الكامل + دجاج + خضار طازجة', 75, 'ج.م', 'https://i.postimg.cc/8PfBKjPF/chick-banner.jpg', 'sandwiches', TRUE, TRUE, FALSE, NULL, NULL,
    '[{"label": "سعرات", "value": "350 kcal"}, {"label": "بروتين", "value": "28g"}, {"label": "ألياف", "value": "8g"}]'::jsonb),
  ('شيش طاووق', 'أسياخ دجاج مشوي متبلة بالبهارات', 110, 'ج.م', 'https://i.postimg.cc/8PfBKjPF/chick-banner.jpg', 'grills', TRUE, TRUE, FALSE, NULL,
    '[{"name": "وجبة (أرز + سلطة)", "price": 35}]'::jsonb,
    '[{"label": "سعرات", "value": "380 kcal"}, {"label": "بروتين", "value": "42g"}, {"label": "دهون", "value": "10g"}]'::jsonb),
  ('حمص بالطحينة', 'حمص مهروس مع الطحينة وزيت الزيتون', 45, 'ج.م', 'https://i.postimg.cc/8PfBKjPF/chick-banner.jpg', 'appetizers', FALSE, TRUE, FALSE, NULL, NULL,
    '[{"label": "سعرات", "value": "180 kcal"}, {"label": "بروتين", "value": "8g"}, {"label": "ألياف", "value": "6g"}]'::jsonb),
  ('بطاطا حلوة مشوية', 'شرائح بطاطا حلوة بالزيتون وزعتر', 35, 'ج.م', 'https://i.postimg.cc/8PfBKjPF/chick-banner.jpg', 'sides', FALSE, TRUE, FALSE, NULL, NULL,
    '[{"label": "سعرات", "value": "150 kcal"}, {"label": "ألياف", "value": "4g"}, {"label": "فيتامين A", "value": "120%"}]'::jsonb),
  ('عصير طازج', 'عصير برتقال طبيعي 100%', 25, 'ج.م', 'https://i.postimg.cc/8PfBKjPF/chick-banner.jpg', 'drinks', FALSE, TRUE, TRUE,
    '[{"name": "صغير", "price": 25}, {"name": "كبير", "price": 35}]'::jsonb, NULL,
    '[{"label": "سعرات", "value": "110 kcal"}, {"label": "سكر", "value": "22g"}, {"label": "فيتامين C", "value": "90%"}]'::jsonb),
  ('تشيز كيك دايت', 'تشيز كيك منزوع السكر مع طبقة فراولة', 55, 'ج.م', 'https://i.postimg.cc/8PfBKjPF/chick-banner.jpg', 'desserts', FALSE, TRUE, FALSE, NULL, NULL,
    '[{"label": "سعرات", "value": "160 kcal"}, {"label": "بروتين", "value": "12g"}, {"label": "سكر", "value": "5g"}]'::jsonb)
ON CONFLICT DO NOTHING;
