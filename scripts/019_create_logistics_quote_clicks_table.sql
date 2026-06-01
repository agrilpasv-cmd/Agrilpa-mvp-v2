CREATE TABLE IF NOT EXISTS logistics_quote_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
  email text,
  clicked_at timestamp DEFAULT now() NOT NULL,
  user_agent text,
  ip_address text
);

ALTER TABLE logistics_quote_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_insert_logistics_clicks"
  ON logistics_quote_clicks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "anyone_can_view_logistics_clicks"
  ON logistics_quote_clicks
  FOR SELECT
  USING (true);

CREATE INDEX idx_logistics_clicks_user_id ON logistics_quote_clicks(user_id);
CREATE INDEX idx_logistics_clicks_email ON logistics_quote_clicks(email);
CREATE INDEX idx_logistics_clicks_timestamp ON logistics_quote_clicks(clicked_at);
