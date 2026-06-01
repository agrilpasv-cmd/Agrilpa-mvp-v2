-- Add referrer column to page_analytics if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'page_analytics' and column_name = 'referrer') then
        alter table page_analytics add column referrer text;
    end if;
end $$;
