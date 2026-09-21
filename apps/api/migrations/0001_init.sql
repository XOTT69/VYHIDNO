PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  variant TEXT,
  category TEXT,
  gtin TEXT UNIQUE,
  mpn TEXT,
  image_url TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_brand_model ON products(brand, model);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_mpn_brand ON products(brand, mpn) WHERE mpn IS NOT NULL;

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  logo_url TEXT,
  reliability_score INTEGER NOT NULL DEFAULT 80 CHECK(reliability_score BETWEEN 0 AND 100),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_locations (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT NOT NULL,
  city TEXT,
  lat REAL,
  lng REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON store_locations(lat, lng);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  store_location_id TEXT REFERENCES store_locations(id) ON DELETE SET NULL,
  external_sku TEXT NOT NULL,
  title_raw TEXT,
  external_url TEXT NOT NULL,
  price REAL NOT NULL CHECK(price > 0),
  old_price REAL,
  delivery_price REAL NOT NULL DEFAULT 0 CHECK(delivery_price >= 0),
  currency TEXT NOT NULL DEFAULT 'UAH',
  availability TEXT NOT NULL DEFAULT 'in_stock' CHECK(availability IN ('in_stock','out_of_stock','preorder','unknown')),
  sponsored INTEGER NOT NULL DEFAULT 0,
  checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, external_sku)
);
CREATE INDEX IF NOT EXISTS idx_offers_product ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_price ON offers(price);
CREATE INDEX IF NOT EXISTS idx_offers_checked ON offers(checked_at);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  price REAL NOT NULL,
  captured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_price_history_offer_time ON price_history(offer_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  telegram_chat_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlists (
  id TEXT PRIMARY KEY,
  device_id TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(device_id IS NOT NULL OR user_id IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_watch_device_product ON watchlists(device_id, product_id) WHERE device_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_watch_user_product ON watchlists(user_id, product_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS purchase_requests (
  id TEXT PRIMARY KEY,
  device_id TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  product_text TEXT NOT NULL,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  budget REAL NOT NULL CHECK(budget > 0),
  deadline TEXT,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','accepted','closed','expired')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_requests_status ON purchase_requests(status, created_at DESC);

CREATE TABLE IF NOT EXISTS seller_offers (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price REAL NOT NULL CHECK(price > 0),
  delivery_price REAL NOT NULL DEFAULT 0,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','accepted','withdrawn','expired')),
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deal_scores (
  offer_id TEXT PRIMARY KEY REFERENCES offers(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
  avg_30 REAL,
  min_180 REAL,
  real_discount_pct REAL,
  calculated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
