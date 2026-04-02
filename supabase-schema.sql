-- 在 Supabase SQL Editor 執行這段 SQL

create table if not exists items (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  title       text,
  description text,
  thumbnail   text,
  platform    text,
  category    text,
  tags        text[] default '{}',
  summary     text,
  note        text,
  created_at  timestamptz default now()
);

-- 開啟 RLS（Row Level Security）
alter table items enable row level security;

-- 暫時允許所有讀寫（之後加入登入功能再限制）
create policy "allow all" on items for all using (true) with check (true);
