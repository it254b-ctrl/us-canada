CREATE TABLE IF NOT EXISTS stops (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  state_province TEXT NOT NULL,
  state_name TEXT NOT NULL,
  city TEXT NOT NULL,
  highway TEXT,
  exit_number TEXT,
  address TEXT,
  latitude REAL,
  longitude REAL,
  total_spaces INTEGER,
  is_free INTEGER DEFAULT 1,
  has_showers INTEGER DEFAULT 0,
  has_security INTEGER DEFAULT 0,
  has_wifi INTEGER DEFAULT 0,
  has_diesel INTEGER DEFAULT 0,
  is_24_7 INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  featured_tagline TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stops_state ON stops(state_province);
CREATE INDEX IF NOT EXISTS idx_stops_city ON stops(state_province, city);
CREATE INDEX IF NOT EXISTS idx_stops_hwy ON stops(highway);
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  state_province TEXT NOT NULL,
  highway TEXT,
  total_spaces INTEGER,
  wants_featured INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
