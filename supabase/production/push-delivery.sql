-- Reviewed release input, NOT applied. Creation-only additions to the LIVE project.
-- Existing snapshots, push subscriptions, Vault keys and scheduler remain intact.
begin;
do $$ begin
 if to_regclass('public.mgt_beta_push') is null then raise exception 'Existing push table is required'; end if;
 if to_regprocedure('public.mgt_beta_reminder_config(text)') is null then raise exception 'Existing Vault config reader is required'; end if;
end $$;
create table public.menei_live_push_delivery (
 subscription_id uuid not null references public.mgt_beta_push(id) on delete cascade,
 slot_kind text not null check(slot_kind in ('test','workout','meals','legacy')),
 delivered_slot text,
 lease_slot text,
 lease_token uuid,
 lease_until timestamptz,
 primary key(subscription_id,slot_kind)
);
alter table public.menei_live_push_delivery enable row level security;
revoke all on public.menei_live_push_delivery from public,anon,authenticated;
grant select,insert,update,delete on public.menei_live_push_delivery to service_role;
create policy live_push_service_only on public.menei_live_push_delivery
 for all to service_role using (true) with check (true);
create function public.menei_live_push_claim(subscription_id uuid,slot_kind text,slot_key text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare token uuid:=gen_random_uuid(); claimed uuid;
begin
 if slot_kind not in ('test','workout','meals','legacy') or slot_key is null or length(slot_key) not between 1 and 300 then
  raise exception 'Invalid delivery slot';
 end if;
 -- Honor an original sender's completed legacy slot and any in-flight lease.
 if not exists(select 1 from public.mgt_beta_push p where p.id=menei_live_push_claim.subscription_id
  and (p.lease_until is null or p.lease_until<=now())
  and (slot_kind!='legacy' or p.last_slot is distinct from slot_key)) then return null; end if;
 insert into public.menei_live_push_delivery(subscription_id,slot_kind)
 values(menei_live_push_claim.subscription_id,menei_live_push_claim.slot_kind) on conflict on constraint menei_live_push_delivery_pkey do nothing;
 update public.menei_live_push_delivery d set lease_slot=slot_key,lease_token=token,lease_until=now()+interval '2 minutes'
 where d.subscription_id=menei_live_push_claim.subscription_id and d.slot_kind=menei_live_push_claim.slot_kind
 and d.delivered_slot is distinct from slot_key and (d.lease_until is null or d.lease_until<=now())
 returning d.lease_token into claimed;
 return claimed;
end $$;
create function public.menei_live_push_finish(subscription_id uuid,slot_kind text,slot_key text,lease_token uuid,delivered boolean)
returns boolean language plpgsql security invoker set search_path='' as $$
declare affected integer;
begin
 update public.menei_live_push_delivery d set
 delivered_slot=case when delivered then slot_key else d.delivered_slot end,
 lease_slot=null,lease_token=null,lease_until=null
 where d.subscription_id=menei_live_push_finish.subscription_id and d.slot_kind=menei_live_push_finish.slot_kind
 and d.lease_slot=slot_key and d.lease_token=menei_live_push_finish.lease_token;
 get diagnostics affected=row_count;return affected=1;
end $$;
revoke all on function public.menei_live_push_claim(uuid,text,text) from public,anon,authenticated;
revoke all on function public.menei_live_push_finish(uuid,text,text,uuid,boolean) from public,anon,authenticated;
grant execute on function public.menei_live_push_claim(uuid,text,text) to service_role;
grant execute on function public.menei_live_push_finish(uuid,text,text,uuid,boolean) to service_role;
commit;
