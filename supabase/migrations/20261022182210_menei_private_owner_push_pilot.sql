-- Isolated test project only. No user workout or account records are rewritten.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create table if not exists mgt_beta_private.menei_push_pilots(user_id uuid primary key references auth.users(id) on delete cascade,enabled boolean not null default false);
alter table mgt_beta_private.menei_push_pilots enable row level security;
revoke all on mgt_beta_private.menei_push_pilots from public,anon,authenticated;
grant all on mgt_beta_private.menei_push_pilots to service_role;
create table if not exists public.menei_push_public_config(id boolean primary key default true check(id),public_key text check(public_key is null or public_key ~ '^B[A-Za-z0-9_-]{86}$'));
alter table public.menei_push_public_config enable row level security;
revoke all on public.menei_push_public_config from public,anon,authenticated;
grant select on public.menei_push_public_config to anon,authenticated;
grant all on public.menei_push_public_config to service_role;
create policy menei_push_public_key on public.menei_push_public_config for select to anon,authenticated using(true);
insert into public.menei_push_public_config(id) values(true) on conflict do nothing;
alter table public.mgt_beta_push add column if not exists delivered_slots jsonb not null default '{}'::jsonb;
create or replace function mgt_beta_private.menei_push_allowed() returns boolean language sql stable security definer set search_path='' as $$ select auth.uid() is not null and exists(select 1 from mgt_beta_private.menei_push_pilots where user_id=(select auth.uid()) and enabled) $$;
revoke all on function mgt_beta_private.menei_push_allowed() from public,anon,authenticated;
grant execute on function mgt_beta_private.menei_push_allowed() to authenticated,service_role;
create policy menei_push_pilot_only on public.mgt_beta_push as restrictive for all to authenticated using((select mgt_beta_private.menei_push_allowed())) with check((select mgt_beta_private.menei_push_allowed()));
create or replace function mgt_beta_private.menei_push_device_limit() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('menei-push:'||new.user_id::text,0));
 if not exists(select 1 from public.mgt_beta_push where user_id=new.user_id and endpoint=new.endpoint) and (select count(*) from public.mgt_beta_push where user_id=new.user_id)>=5 then raise exception 'Up to five notification devices are supported for this pilot.' using errcode='23514'; end if;
 return new;
end $$;
revoke all on function mgt_beta_private.menei_push_device_limit() from public,anon,authenticated;
create trigger menei_push_device_limit before insert on public.mgt_beta_push for each row execute function mgt_beta_private.menei_push_device_limit();
DO $init$ begin
 if not exists(select 1 from vault.secrets where name='menei_beta_push_v1_cron') then perform vault.create_secret(encode(extensions.gen_random_bytes(48),'hex'),'menei_beta_push_v1_cron'); end if;
end $init$;
create or replace function mgt_beta_private.menei_push_verify(provided_secret text) returns void language plpgsql security definer set search_path='' as $$
declare expected text;
begin
 select decrypted_secret into expected from vault.decrypted_secrets where name='menei_beta_push_v1_cron';
 if expected is null or provided_secret is null or length(provided_secret)<>96 or extensions.digest(provided_secret,'sha256')<>extensions.digest(expected,'sha256') then raise exception 'Unauthorized' using errcode='42501'; end if;
end $$;
revoke all on function mgt_beta_private.menei_push_verify(text) from public,anon,authenticated;
grant execute on function mgt_beta_private.menei_push_verify(text) to service_role;
create or replace function mgt_beta_private.menei_push_config(provided_secret text) returns jsonb language plpgsql security definer set search_path='' as $$
declare pub text; priv text;
begin
 perform mgt_beta_private.menei_push_verify(provided_secret);
 select public_key into pub from public.menei_push_public_config where id;
 if pub is null then return jsonb_build_object('ready',false); end if;
 select decrypted_secret into priv from vault.decrypted_secrets where name='menei_beta_push_v1_private';
 if priv is null then raise exception 'Push configuration unavailable'; end if;
 return jsonb_build_object('ready',true,'publicKey',pub,'privateKey',priv,'subject','https://menei-private-beta.crispcrown515.chatgpt.site');
end $$;
revoke all on function mgt_beta_private.menei_push_config(text) from public,anon,authenticated;
grant execute on function mgt_beta_private.menei_push_config(text) to service_role;
create or replace function public.menei_beta_push_config(provided_secret text) returns jsonb language sql security invoker set search_path='' as $$ select mgt_beta_private.menei_push_config(provided_secret) $$;
revoke all on function public.menei_beta_push_config(text) from public,anon,authenticated;
grant execute on function public.menei_beta_push_config(text) to service_role;
create or replace function mgt_beta_private.menei_push_store_keys(provided_secret text,public_key text,private_key text) returns boolean language plpgsql security definer set search_path='' as $$
begin
 perform mgt_beta_private.menei_push_verify(provided_secret);
 if public_key !~ '^B[A-Za-z0-9_-]{86}$' or private_key !~ '^[A-Za-z0-9_-]{43}$' or public_key is null or private_key is null then raise exception 'Invalid key format'; end if;
 perform pg_catalog.pg_advisory_xact_lock(896210414);
 if exists(select 1 from public.menei_push_public_config where id and menei_push_public_config.public_key is not null) then return false; end if;
 if exists(select 1 from vault.secrets where name='menei_beta_push_v1_private') then raise exception 'Existing private configuration requires review'; end if;
 perform vault.create_secret(private_key,'menei_beta_push_v1_private');
 update public.menei_push_public_config set public_key=menei_push_store_keys.public_key where id;
 return true;
end $$;
revoke all on function mgt_beta_private.menei_push_store_keys(text,text,text) from public,anon,authenticated;
grant execute on function mgt_beta_private.menei_push_store_keys(text,text,text) to service_role;
create or replace function public.menei_beta_push_store_keys(provided_secret text,public_key text,private_key text) returns boolean language sql security invoker set search_path='' as $$ select mgt_beta_private.menei_push_store_keys(provided_secret,public_key,private_key) $$;
revoke all on function public.menei_beta_push_store_keys(text,text,text) from public,anon,authenticated;
grant execute on function public.menei_beta_push_store_keys(text,text,text) to service_role;
create or replace function public.menei_beta_push_pilots() returns table(user_id uuid) language sql security invoker set search_path='' as $$ select user_id from mgt_beta_private.menei_push_pilots where enabled $$;
revoke all on function public.menei_beta_push_pilots() from public,anon,authenticated;
grant execute on function public.menei_beta_push_pilots() to service_role;
create or replace function mgt_beta_private.menei_push_claim(subscription_id uuid,slot_kind text,slot_key text) returns text language plpgsql security definer set search_path='' as $$
declare token text;
begin
 if slot_kind not in ('legacy','workout','meals','test') or slot_key is null or length(slot_key)>256 then raise exception 'Invalid reminder slot'; end if;
 token=gen_random_uuid()::text;
 update public.mgt_beta_push set lease_slot=token,lease_until=now()+interval '2 minutes'
 where id=subscription_id and exists(select 1 from mgt_beta_private.menei_push_pilots where user_id=mgt_beta_push.user_id and enabled)
 and coalesce(delivered_slots->>slot_kind,'')<>slot_key and (lease_until is null or lease_until<now());
 if found then return token; end if;return null;
end $$;
revoke all on function mgt_beta_private.menei_push_claim(uuid,text,text) from public,anon,authenticated;
grant execute on function mgt_beta_private.menei_push_claim(uuid,text,text) to service_role;
create or replace function public.menei_beta_push_claim(subscription_id uuid,slot_kind text,slot_key text) returns text language sql security invoker set search_path='' as $$ select mgt_beta_private.menei_push_claim(subscription_id,slot_kind,slot_key) $$;
revoke all on function public.menei_beta_push_claim(uuid,text,text) from public,anon,authenticated;
grant execute on function public.menei_beta_push_claim(uuid,text,text) to service_role;
create or replace function mgt_beta_private.menei_push_finish(subscription_id uuid,slot_kind text,slot_key text,lease_token text,delivered boolean) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if slot_kind not in ('legacy','workout','meals','test') or slot_key is null or length(slot_key)>256 then raise exception 'Invalid reminder slot'; end if;
 update public.mgt_beta_push set delivered_slots=case when delivered then jsonb_set(delivered_slots,array[slot_kind],to_jsonb(slot_key),true) else delivered_slots end,
 last_slot=case when delivered then slot_key else last_slot end,lease_slot=null,lease_until=null,failures=case when delivered then 0 else failures+1 end
 where id=subscription_id and lease_slot=lease_token;
 return found;
end $$;
revoke all on function mgt_beta_private.menei_push_finish(uuid,text,text,text,boolean) from public,anon,authenticated;
grant execute on function mgt_beta_private.menei_push_finish(uuid,text,text,text,boolean) to service_role;
create or replace function public.menei_beta_push_finish(subscription_id uuid,slot_kind text,slot_key text,lease_token text,delivered boolean) returns boolean language sql security invoker set search_path='' as $$ select mgt_beta_private.menei_push_finish(subscription_id,slot_kind,slot_key,lease_token,delivered) $$;
revoke all on function public.menei_beta_push_finish(uuid,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.menei_beta_push_finish(uuid,text,text,text,boolean) to service_role;
-- Register inactive; bootstrap and verification must succeed before activation.
DO $cron$ declare jid bigint; begin jid:=cron.schedule('menei-private-beta-push-v1','* * * * *',$job$
select net.http_post(url:='https://bhyrrxrpqaxiwpfxnwpa.supabase.co/functions/v1/menei-push-reminders',headers:=jsonb_build_object('Content-Type','application/json','x-cron-key',(select decrypted_secret from vault.decrypted_secrets where name='menei_beta_push_v1_cron')),body:='{}'::jsonb,timeout_milliseconds:=10000);
$job$);
perform cron.alter_job(job_id:=jid,active:=false);end $cron$;
