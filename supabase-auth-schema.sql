-- 在 Supabase SQL Editor 執行這段 SQL

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  created_at    timestamptz default now()
);

create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  last_active timestamptz default now(),
  created_at  timestamptz default now()
);

-- items 加上 user_id 欄位
alter table items add column if not exists user_id uuid references users(id) on delete cascade;

-- 開啟 RLS 並允許所有操作（auth 在 app 層處理）
alter table users    enable row level security;
alter table sessions enable row level security;

create policy "allow all" on users    for all using (true) with check (true);
create policy "allow all" on sessions for all using (true) with check (true);
