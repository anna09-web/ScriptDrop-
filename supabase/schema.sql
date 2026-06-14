-- ScriptDrop database schema for Supabase / Postgres.
-- Run this in the Supabase SQL editor (or via the CLI) on a fresh project.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  -- `credits` is the remaining generations in the current billing period.
  -- New users start with 2 free generations.
  credits integer not null default 2,
  total_credits_purchased integer not null default 0,
  -- Subscription state.
  plan text,
  plan_interval text,
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- Idempotency log for Stripe webhook events.
create table if not exists billing_events (
  event_id text primary key,
  created_at timestamptz default now()
);

create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  product_input text not null,
  hook_style text not null,
  platform text not null,
  scripts jsonb not null,
  created_at timestamptz default now()
);

create index if not exists generations_user_id_created_at_idx
  on generations (user_id, created_at desc);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  stripe_session_id text unique not null,
  pack_name text not null,
  credits_added integer not null,
  amount_cents integer not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Note: the backend uses the service role key, which bypasses RLS. These
-- policies protect against any access made with the anon key (e.g. the
-- frontend reading its own data directly).

alter table profiles enable row level security;
alter table generations enable row level security;
alter table orders enable row level security;

drop policy if exists "Users read own profile" on profiles;
create policy "Users read own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Users update own profile" on profiles;
create policy "Users update own profile"
  on profiles for update
  using (auth.uid() = id);

drop policy if exists "Users read own generations" on generations;
create policy "Users read own generations"
  on generations for select
  using (auth.uid() = user_id);

drop policy if exists "Users read own orders" on orders;
create policy "Users read own orders"
  on orders for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- New-user trigger: create a profile row (with 2 free credits) on signup
-- ---------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- RPC: atomic credit deduction (1 credit). Returns false if insufficient.
-- ---------------------------------------------------------------------------

create or replace function deduct_credit(user_id uuid)
returns boolean as $$
declare
  current_credits integer;
begin
  select credits into current_credits from profiles where id = user_id for update;
  if current_credits is null or current_credits < 1 then
    return false;
  end if;
  update profiles set credits = credits - 1 where id = user_id;
  return true;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- RPC: add credits (used for refunds and as a primitive). When `purchased` is
-- true the lifetime purchased counter is incremented too.
-- ---------------------------------------------------------------------------

create or replace function add_credits(user_id uuid, amount integer, purchased boolean)
returns void as $$
begin
  update profiles
  set credits = credits + amount,
      total_credits_purchased = total_credits_purchased + (case when purchased then amount else 0 end)
  where id = user_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- RPC: apply a subscription's monthly generation grant, idempotently.
-- Recording the Stripe event id first relies on the billing_events primary key:
-- if the webhook is retried, the insert is a no-op and no second grant happens.
-- Sets the period's generation balance to the plan allowance (overwrite, not
-- increment) so renewals refill rather than stack.
-- ---------------------------------------------------------------------------

create or replace function apply_subscription(
  p_event_id text,
  p_user_id uuid,
  p_plan text,
  p_interval text,
  p_generations integer,
  p_status text
)
returns void as $$
declare
  inserted_count integer;
begin
  insert into billing_events (event_id) values (p_event_id)
  on conflict (event_id) do nothing;

  get diagnostics inserted_count = row_count;

  -- Only apply if this is the first time we've seen this event.
  if inserted_count = 1 then
    update profiles
    set credits = p_generations,
        plan = p_plan,
        plan_interval = p_interval,
        subscription_status = p_status,
        total_credits_purchased = total_credits_purchased + p_generations
    where id = p_user_id;
  end if;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- RPC: update subscription status (e.g. on cancellation).
-- ---------------------------------------------------------------------------

create or replace function set_subscription_status(
  p_user_id uuid,
  p_status text
)
returns void as $$
begin
  update profiles set subscription_status = p_status where id = p_user_id;
end;
$$ language plpgsql security definer set search_path = public;
