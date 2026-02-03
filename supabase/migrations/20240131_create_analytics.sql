-- Create a table to track page views
create table if not exists page_analytics (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  country text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table page_analytics enable row level security;

-- Allow anyone (anon) to insert data (for tracking public visits)
create policy "Enable insert for anon (public) users"
on page_analytics for insert
with check (true);

-- Allow admins to read data
create policy "Enable read for service role only"
on page_analytics for select
to service_role
using (true);
