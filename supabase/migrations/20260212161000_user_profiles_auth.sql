create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  email text not null,
  goal text,
  diet_type text,
  macro_priority text,
  activity_level text,
  age integer,
  gender text,
  height_cm real,
  current_weight_kg real,
  goal_weight_kg real,
  weekly_dining_budget real,
  intolerances text[],
  dislikes text[],
  favorite_cuisines text[],
  eating_frequency text,
  dining_challenge text,
  daily_calorie_target integer,
  goal_date text,
  profile_michi text default 'avatar',
  health_goal_v2 text,
  spending_goals text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.user_profiles;
create policy "Users can delete own profile"
  on public.user_profiles for delete
  using (auth.uid() = id);

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_user() to authenticated;
