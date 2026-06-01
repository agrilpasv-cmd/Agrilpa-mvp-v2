-- Add is_read column to purchases table
alter table purchases 
add column if not exists is_read boolean default false;

-- Update existing records to be read (optional, but good for UX so users don't start with 0 unread if they have old orders? 
-- Actually user complained about "2" being shown, so probably wants them to be unread initially until acted upon. 
-- Let's leave them as false (unread) or let the default handle it.
-- But to match current behavior where counter shows all, maybe we explicitly set old ones to false? Default does that.
