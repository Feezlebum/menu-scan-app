create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key,
  created_at timestamptz default now(),
  goal text,
  age int,
  gender text,
  height_cm float,
  current_weight_kg float,
  goal_weight_kg float,
  activity_level text,
  diet_type text,
  macro_priority text,
  intolerances text[],
  dislikes text[],
  favorite_cuisines text[],
  eating_out_frequency text,
  daily_calorie_target int,
  streak_count int default 0,
  streak_last_date date,
  scans_this_week int default 0,
  scans_reset_at timestamptz,
  subscription_tier text default 'free'
);

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  restaurant_name text,
  restaurant_type text,
  photo_url text,
  menu_items jsonb,
  top_picks jsonb,
  location point,
  cached boolean default false
);

create table if not exists meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  date date default current_date,
  meal_type text,
  description text,
  calories int,
  protein float,
  carbs float,
  fat float,
  scan_id uuid references scans(id),
  traffic_light text
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  restaurant_name text,
  item_name text,
  item_data jsonb,
  created_at timestamptz default now()
);
