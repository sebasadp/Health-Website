-- Run this in Supabase SQL Editor
alter table meals add column if not exists calories integer;
alter table members add column if not exists maintenance_calories integer default 2000;

create table if not exists workout_comments (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references workouts(id) on delete cascade,
  member_name text not null,
  text text not null,
  created_at timestamptz default now()
);

alter table workout_comments enable row level security;
create policy "Public access" on workout_comments for all using (true) with check (true);
