-- Migration: move from one-time credit packs to subscription plans.
-- Safe to run on a database created from the original schema.sql.

-- Subscription columns on profiles.
alter table profiles add column if not exists plan text;
alter table profiles add column if not exists plan_interval text;
alter table profiles add column if not exists subscription_status text;
alter table profiles add column if not exists current_period_end timestamptz;

-- Idempotency log for Stripe webhook events.
create table if not exists billing_events (
  event_id text primary key,
  created_at timestamptz default now()
);

-- Replace the credit-pack fulfillment RPC with subscription RPCs.
drop function if exists fulfill_order(uuid, text, text, integer, integer);

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

create or replace function set_subscription_status(
  p_user_id uuid,
  p_status text
)
returns void as $$
begin
  update profiles set subscription_status = p_status where id = p_user_id;
end;
$$ language plpgsql security definer set search_path = public;
