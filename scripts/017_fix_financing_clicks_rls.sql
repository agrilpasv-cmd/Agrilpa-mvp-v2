-- Drop existing RLS policies that are causing conflicts
DROP POLICY IF EXISTS "Allow anyone to insert financing clicks" ON public.financing_clicks;
DROP POLICY IF EXISTS "Allow users to view their own financing clicks" ON public.financing_clicks;

-- Create new RLS policy to allow INSERT from anyone without authentication check
CREATE POLICY "Allow anyone to insert financing clicks"
  ON public.financing_clicks
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create new RLS policy to allow SELECT from anyone
CREATE POLICY "Allow anyone to select financing clicks"
  ON public.financing_clicks
  FOR SELECT
  TO public
  USING (true);
