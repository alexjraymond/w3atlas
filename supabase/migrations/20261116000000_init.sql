-- W3Atlas schema: profiles, routes, builds, ratings, comments.
-- Row level security: anyone can read public routes/builds and their ratings/comments;
-- only the owner can create, edit or delete their own; you can't rate your own route.

-- ---------------------------------------------------------------------------
-- profiles (one per auth user, created automatically on sign-up)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by everyone" on public.profiles
  for select using (true);

create policy "users update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'preferred_username', ''), -- twitch
      nullif(new.raw_user_meta_data -> 'custom_claims' ->> 'global_name', ''), -- discord display name
      nullif(new.raw_user_meta_data ->> 'full_name', ''), -- google / discord
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'player'
    ), 40),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- shared helpers
-- ---------------------------------------------------------------------------
create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- routes/builds:
--  * rating_avg / rating_count / comment_count belong to the aggregate triggers: values sent by
--    clients (roles anon / authenticated) are ignored. (A column REVOKE wouldn't work, because
--    Supabase grants table-wide privileges.)
--  * only real edits bump updated_at, not rating / comment count updates
create function public.protect_and_touch()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.rating_avg := 0;
      new.rating_count := 0;
      new.comment_count := 0;
      return new;
    end if;
    new.rating_avg := old.rating_avg;
    new.rating_count := old.rating_count;
    new.comment_count := old.comment_count;
  end if;
  if tg_op = 'INSERT' then
    return new;
  end if;
  if new.data is distinct from old.data
     or new.title is distinct from old.title
     or new.is_public is distinct from old.is_public
     or new.race is distinct from old.race
     or new.vs is distinct from old.vs then
    new.updated_at = now();
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- builds
-- ---------------------------------------------------------------------------
create table public.builds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 120),
  race text check (race in ('human', 'orc', 'nightelf', 'undead')),
  vs text not null default 'any' check (vs in ('any', 'human', 'orc', 'nightelf', 'undead')),
  data jsonb not null, -- the full Build object as the app stores it
  is_public boolean not null default false,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index builds_owner_idx on public.builds (owner_id);
create index builds_public_idx on public.builds (is_public, race, vs);

create trigger builds_touch before insert or update on public.builds
  for each row execute function public.protect_and_touch();

-- ---------------------------------------------------------------------------
-- routes
-- ---------------------------------------------------------------------------
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 120),
  map_id text not null check (char_length(map_id) <= 64),
  race text check (race in ('human', 'orc', 'nightelf', 'undead')),
  vs text not null default 'any' check (vs in ('any', 'human', 'orc', 'nightelf', 'undead')),
  hero text check (char_length(hero) <= 40),
  build_id uuid references public.builds (id) on delete set null,
  data jsonb not null, -- the full Route object as the app stores it
  is_public boolean not null default false,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index routes_owner_idx on public.routes (owner_id);
create index routes_public_idx on public.routes (is_public, map_id, race, vs);
create index routes_rating_idx on public.routes (rating_avg desc, rating_count desc) where is_public;

create trigger routes_touch before insert or update on public.routes
  for each row execute function public.protect_and_touch();

alter table public.routes enable row level security;

create policy "public routes and your own are readable" on public.routes
  for select using (is_public or owner_id = auth.uid());

create policy "users create their own routes" on public.routes
  for insert with check (owner_id = auth.uid());

create policy "owners update their routes" on public.routes
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owners delete their routes" on public.routes
  for delete using (owner_id = auth.uid());

alter table public.builds enable row level security;

-- a build is readable if it's public, yours, or the companion build of a public route
create policy "readable: public, own, or linked from a public route" on public.builds
  for select using (
    is_public
    or owner_id = auth.uid()
    or exists (select 1 from public.routes r where r.build_id = builds.id and r.is_public)
  );

create policy "users create their own builds" on public.builds
  for insert with check (owner_id = auth.uid());

create policy "owners update their builds" on public.builds
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owners delete their builds" on public.builds
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- route ratings (1-5 stars, one per user per route, not on your own route)
-- ---------------------------------------------------------------------------
create table public.route_ratings (
  route_id uuid not null references public.routes (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (route_id, user_id)
);

create index route_ratings_user_idx on public.route_ratings (user_id);

create trigger route_ratings_touch before update on public.route_ratings
  for each row execute function public.touch_updated_at();

alter table public.route_ratings enable row level security;

create policy "ratings of readable routes are readable" on public.route_ratings
  for select using (exists (select 1 from public.routes r where r.id = route_id and (r.is_public or r.owner_id = auth.uid())));

create policy "users rate other people's public routes" on public.route_ratings
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.routes r where r.id = route_id and r.is_public and r.owner_id <> auth.uid())
  );

create policy "users change their own rating" on public.route_ratings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users remove their own rating" on public.route_ratings
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- route comments
-- ---------------------------------------------------------------------------
create table public.route_comments (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index route_comments_route_idx on public.route_comments (route_id, created_at);

alter table public.route_comments enable row level security;

create policy "comments on readable routes are readable" on public.route_comments
  for select using (exists (select 1 from public.routes r where r.id = route_id and (r.is_public or r.owner_id = auth.uid())));

create policy "signed-in users comment on public routes" on public.route_comments
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.routes r where r.id = route_id and (r.is_public or r.owner_id = auth.uid()))
  );

-- authors delete their comments; route owners can delete comments on their route
create policy "authors and route owners delete comments" on public.route_comments
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.routes r where r.id = route_id and r.owner_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- keep rating / comment aggregates on routes up to date
-- ---------------------------------------------------------------------------
create function public.refresh_route_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rid uuid := coalesce(new.route_id, old.route_id);
begin
  update public.routes r
  set rating_avg = coalesce((select round(avg(stars)::numeric, 2) from public.route_ratings where route_id = rid), 0),
      rating_count = (select count(*) from public.route_ratings where route_id = rid)
  where r.id = rid;
  return null;
end;
$$;

create trigger route_ratings_refresh
  after insert or update or delete on public.route_ratings
  for each row execute function public.refresh_route_rating();

create function public.refresh_route_comment_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rid uuid := coalesce(new.route_id, old.route_id);
begin
  update public.routes r
  set comment_count = (select count(*) from public.route_comments where route_id = rid)
  where r.id = rid;
  return null;
end;
$$;

create trigger route_comments_refresh
  after insert or delete on public.route_comments
  for each row execute function public.refresh_route_comment_count();
