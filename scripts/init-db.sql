-- Run once against booking_db (e.g. psql or init job in K8s)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  event_id VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
