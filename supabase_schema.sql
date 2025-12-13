-- Create table for My List
create table public.my_list (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tmdb_id bigint not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  added_at timestamptz default now(),
  unique(user_id, tmdb_id, media_type)
);

-- RLS Policies for My List
alter table public.my_list enable row level security;

create policy "Users can view their own list"
  on public.my_list for select
  using (auth.uid() = user_id);

create policy "Users can insert into their own list"
  on public.my_list for insert
  with check (auth.uid() = user_id);

create policy "Users can delete from their own list"
  on public.my_list for delete
  using (auth.uid() = user_id);

-- Create table for Continue Watching
create table public.continue_watching (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tmdb_id bigint not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  season int,
  episode int,
  progress_seconds int default 0,
  duration_seconds int default 0,
  last_watched_at timestamptz default now(),
  -- Unique constraint for upsert functionality
  -- We use coalesce on season/episode to handle nulls if necessary, 
  -- but standard Postgres unique constraint allows multiple nulls. 
  -- However, Supabase-js upsert requires a matching Unique constraint.
  -- Strategy: We'll assume the client sends numbers or nulls, and we use a unique index.
  unique(user_id, tmdb_id, media_type, season, episode)
);

-- RLS Policies for Continue Watching
alter table public.continue_watching enable row level security;

create policy "Users can view their own watch history"
  on public.continue_watching for select
  using (auth.uid() = user_id);

create policy "Users can insert/update their own watch history"
  on public.continue_watching for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own watch history"
  on public.continue_watching for update
  using (auth.uid() = user_id);

create policy "Users can delete from their own watch history"
  on public.continue_watching for delete
  using (auth.uid() = user_id);
