-- Isolated beta schema. Does not alter public.user_app_data or existing auth policies.
begin;
create schema if not exists mgt_beta_private;
revoke all on schema mgt_beta_private from public,anon;
grant usage on schema mgt_beta_private to authenticated,service_role;
create table if not exists public.mgt_beta_states (
 user_id uuid primary key references auth.users(id) on delete cascade,
 app_data jsonb not null,
 version bigint not null default 1 check(version > 0),
 updated_at timestamptz not null default now()
);
create table if not exists public.mgt_beta_revisions (
 user_id uuid not null references auth.users(id) on delete cascade,
 version bigint not null,
 app_data jsonb not null,
 created_at timestamptz not null default now(),
 primary key(user_id,version)
);
create table if not exists public.mgt_beta_push (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 endpoint text not null check(length(endpoint)<4096),
 subscription jsonb not null,
 preferences jsonb not null,
 last_slot text,
 lease_slot text,
 lease_until timestamptz,
 failures integer not null default 0,
 updated_at timestamptz not null default now(),
 unique(user_id,endpoint),
 check(subscription->>'endpoint'=endpoint)
);
alter table public.mgt_beta_states enable row level security;
alter table public.mgt_beta_revisions enable row level security;
alter table public.mgt_beta_push enable row level security;
drop policy if exists beta_state_own_read on public.mgt_beta_states;
create policy beta_state_own_read on public.mgt_beta_states for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists beta_revision_own_read on public.mgt_beta_revisions;
create policy beta_revision_own_read on public.mgt_beta_revisions for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists beta_push_own on public.mgt_beta_push;
create policy beta_push_own on public.mgt_beta_push for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.mgt_beta_states, public.mgt_beta_revisions, public.mgt_beta_push from anon, authenticated;
grant select on public.mgt_beta_states,public.mgt_beta_revisions to authenticated;
grant select,insert,update,delete on public.mgt_beta_push to authenticated;
grant all on public.mgt_beta_states,public.mgt_beta_revisions,public.mgt_beta_push to service_role;

create or replace function mgt_beta_private.commit_snapshot(expected_version bigint,payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare caller uuid := auth.uid(); current_row public.mgt_beta_states%rowtype; next_version bigint;
begin
 if caller is null then raise exception 'Sign-in required' using errcode='42501'; end if;
 if payload->>'schemaVersion' is distinct from '8' or payload->>'ownerId' is distinct from caller::text
   or jsonb_typeof(payload->'logs') is distinct from 'object'
   or jsonb_typeof(payload->'gyms') is distinct from 'array' then
   raise exception 'Invalid beta snapshot or account identity' using errcode='22023';
 end if;
 if octet_length(payload::text)>10485760 then raise exception 'Snapshot exceeds 10 MB'; end if;
 select * into current_row from public.mgt_beta_states where user_id=caller for update;
 if not found then
   if expected_version<>0 then raise exception 'Revision changed' using errcode='40001'; end if;
   begin
    insert into public.mgt_beta_states(user_id,app_data,version) values(caller,payload,1);
   exception when unique_violation then raise exception 'Revision changed' using errcode='40001';
   end;
   next_version:=1;
 else
   if current_row.version<>expected_version then raise exception 'Revision changed' using errcode='40001'; end if;
   insert into public.mgt_beta_revisions(user_id,version,app_data) values(caller,current_row.version,current_row.app_data) on conflict do nothing;
   next_version:=current_row.version+1;
   update public.mgt_beta_states set app_data=payload,version=next_version,updated_at=now() where user_id=caller;
   delete from public.mgt_beta_revisions where user_id=caller and version<next_version-5;
 end if;
 return jsonb_build_object('version',next_version);
end $$;
revoke all on function mgt_beta_private.commit_snapshot(bigint,jsonb) from public,anon;
grant execute on function mgt_beta_private.commit_snapshot(bigint,jsonb) to authenticated;
create or replace function public.mgt_beta_commit(expected_version bigint,payload jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select mgt_beta_private.commit_snapshot(expected_version,payload) $$;
revoke all on function public.mgt_beta_commit(bigint,jsonb) from public,anon;
grant execute on function public.mgt_beta_commit(bigint,jsonb) to authenticated;

create or replace function mgt_beta_private.claim_reminder(subscription_id uuid,slot_key text)
returns boolean language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
 update public.mgt_beta_push set lease_slot=slot_key,lease_until=now()+interval '2 minutes'
 where id=subscription_id and last_slot is distinct from slot_key and (lease_until is null or lease_until<now());
 get diagnostics affected=row_count;
 return affected=1;
end $$;
revoke all on function mgt_beta_private.claim_reminder(uuid,text) from public,anon,authenticated;
grant execute on function mgt_beta_private.claim_reminder(uuid,text) to service_role;
create or replace function public.mgt_beta_claim_reminder(subscription_id uuid,slot_key text)
returns boolean language sql security invoker set search_path='' as $$ select mgt_beta_private.claim_reminder(subscription_id,slot_key) $$;
revoke all on function public.mgt_beta_claim_reminder(uuid,text) from public,anon,authenticated;
grant execute on function public.mgt_beta_claim_reminder(uuid,text) to service_role;

create or replace function mgt_beta_private.reminder_config(provided_secret text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare expected text; config jsonb;
begin
 select decrypted_secret into expected from vault.decrypted_secrets where name='mgt_beta_cron_secret';
 if expected is null or provided_secret is null or length(provided_secret)<32 or extensions.digest(provided_secret,'sha256')<>extensions.digest(expected,'sha256') then
  raise exception 'Unauthorized' using errcode='42501';
 end if;
 select jsonb_object_agg(name,decrypted_secret) into config from vault.decrypted_secrets where name in ('mgt_beta_vapid_public','mgt_beta_vapid_private','mgt_beta_vapid_subject');
 if config is null or not(config ?& array['mgt_beta_vapid_public','mgt_beta_vapid_private','mgt_beta_vapid_subject']) then raise exception 'Push configuration missing'; end if;
 return config;
end $$;
revoke all on function mgt_beta_private.reminder_config(text) from public,anon,authenticated;
grant execute on function mgt_beta_private.reminder_config(text) to service_role;
create or replace function public.mgt_beta_reminder_config(provided_secret text)
returns jsonb language sql security invoker set search_path='' as $$ select mgt_beta_private.reminder_config(provided_secret) $$;
revoke all on function public.mgt_beta_reminder_config(text) from public,anon,authenticated;
grant execute on function public.mgt_beta_reminder_config(text) to service_role;
commit;
