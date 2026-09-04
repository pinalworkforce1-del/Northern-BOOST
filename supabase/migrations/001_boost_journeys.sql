-- Northern Arizona BOOST cloud persistence
-- Deployed to Supabase project Northern BOOST (us-west-1).

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.boost_journeys (
  id uuid primary key,
  access_token_hash text not null,
  participant_name text,
  participant_email text,
  region text not null default 'Northern Arizona',
  primary_career_title text,
  journey_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists boost_journeys_updated_at_idx on public.boost_journeys(updated_at desc);
create index if not exists boost_journeys_participant_email_idx on public.boost_journeys(lower(participant_email)) where participant_email is not null;

alter table public.boost_journeys enable row level security;
revoke all on public.boost_journeys from anon, authenticated;

create or replace function public.boost_save_journey(
  p_journey_id uuid,
  p_access_token text,
  p_journey jsonb
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
  v_existing text;
  v_name text;
  v_email text;
  v_region text;
  v_primary text;
begin
  if p_journey_id is null or p_access_token is null or length(p_access_token) < 32 or p_journey is null then
    raise exception 'Invalid BOOST journey payload';
  end if;
  v_hash := encode(extensions.digest(p_access_token, 'sha256'), 'hex');
  v_name := nullif(trim(p_journey #>> '{participant,name}'), '');
  v_email := nullif(lower(trim(p_journey #>> '{participant,email}')), '');
  v_region := coalesce(nullif(trim(p_journey ->> 'region'), ''), 'Northern Arizona');
  v_primary := nullif(trim(p_journey #>> '{module4,career,title}'), '');
  select access_token_hash into v_existing from public.boost_journeys where id=p_journey_id;
  if v_existing is null then
    insert into public.boost_journeys(id,access_token_hash,participant_name,participant_email,region,primary_career_title,journey_data)
    values(p_journey_id,v_hash,v_name,v_email,v_region,v_primary,p_journey);
  else
    if v_existing <> v_hash then raise exception 'Invalid BOOST journey token'; end if;
    update public.boost_journeys
      set participant_name=v_name, participant_email=v_email, region=v_region,
          primary_career_title=v_primary, journey_data=p_journey, updated_at=now()
      where id=p_journey_id;
  end if;
  return p_journey_id;
end;
$$;

create or replace function public.boost_load_journey(
  p_journey_id uuid,
  p_access_token text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
  v_row public.boost_journeys%rowtype;
begin
  if p_journey_id is null or p_access_token is null or length(p_access_token) < 32 then return null; end if;
  v_hash := encode(extensions.digest(p_access_token, 'sha256'), 'hex');
  select * into v_row from public.boost_journeys where id=p_journey_id;
  if not found then return null; end if;
  if v_row.access_token_hash <> v_hash then raise exception 'Invalid BOOST journey token'; end if;
  return v_row.journey_data;
end;
$$;

revoke all on function public.boost_save_journey(uuid,text,jsonb) from public, anon, authenticated;
revoke all on function public.boost_load_journey(uuid,text) from public, anon, authenticated;
grant execute on function public.boost_save_journey(uuid,text,jsonb) to anon, authenticated;
grant execute on function public.boost_load_journey(uuid,text) to anon, authenticated;

comment on table public.boost_journeys is 'Lean connected BOOST participant journey record. Detailed free-text reflections and non-retained financial/research inputs remain outside the cloud record unless explicitly included by module policy.';
