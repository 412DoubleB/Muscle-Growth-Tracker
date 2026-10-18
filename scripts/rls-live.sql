-- Transactional acceptance: creates two synthetic identities then rolls back every write.
begin;
do $tests$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); payload jsonb; result jsonb; blocked boolean; count_rows integer;
begin
 insert into auth.users(id,aud,role,email,created_at,updated_at) values
 (a,'authenticated','authenticated',a::text||'@mgt-beta.example.invalid',now(),now()),
 (b,'authenticated','authenticated',b::text||'@mgt-beta.example.invalid',now(),now());
 perform set_config('request.jwt.claim.sub',a::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 payload:=jsonb_build_object('schemaVersion',8,'ownerId',a,'logs','{}'::jsonb,'gyms','[]'::jsonb);
 result:=public.mgt_beta_commit(0,payload);
 if (result->>'version')::int<>1 then raise exception 'Initial commit failed'; end if;
 result:=public.mgt_beta_commit(1,payload);
 if (result->>'version')::int<>2 then raise exception 'Update failed'; end if;
 blocked:=false; begin perform public.mgt_beta_commit(1,payload); exception when serialization_failure then blocked:=true; end;
 if not blocked then raise exception 'Stale version was accepted'; end if;
 select count(*) into count_rows from public.mgt_beta_revisions;
 if count_rows<>1 then raise exception 'Prior cloud revision not retained'; end if;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',b::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 payload:=jsonb_build_object('schemaVersion',8,'ownerId',b,'logs','{}'::jsonb,'gyms','[]'::jsonb);
 perform public.mgt_beta_commit(0,payload);
 select count(*) into count_rows from public.mgt_beta_states;
 if count_rows<>1 then raise exception 'RLS leaked another user snapshot'; end if;
 select count(*) into count_rows from public.mgt_beta_revisions;
 if count_rows<>0 then raise exception 'RLS leaked another user revision'; end if;
 blocked:=false; begin perform public.mgt_beta_commit(0,jsonb_set(payload,'{ownerId}',to_jsonb(a::text))); exception when invalid_parameter_value then blocked:=true; end;
 if not blocked then raise exception 'Cross-account RPC owner accepted'; end if;
 blocked:=false; begin update public.mgt_beta_states set app_data='{}'::jsonb where user_id=b; exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Direct state table write allowed'; end if;
 insert into public.mgt_beta_push(user_id,endpoint,subscription,preferences) values(b,'https://fcm.googleapis.com/mgt-beta-rollback-test',jsonb_build_object('endpoint','https://fcm.googleapis.com/mgt-beta-rollback-test'),'{}'::jsonb);
 blocked:=false; begin update public.mgt_beta_push set user_id=a where user_id=b; exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Push subscription could change owner'; end if;
 blocked:=false; begin perform public.mgt_beta_reminder_config(repeat('x',64)); exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'A signed-in user could read server config'; end if;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub','',true);
 perform set_config('request.jwt.claims','{}',true);
 execute 'set local role anon';
 blocked:=false; begin perform count(*) from public.mgt_beta_states; exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Anonymous table access allowed'; end if;
 blocked:=false; begin perform public.mgt_beta_commit(0,payload); exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Anonymous commit allowed'; end if;
 execute 'reset role';
end $tests$;
rollback;
select jsonb_build_object('passed',true,'checks',11,'synthetic_users_rolled_back',true,'remaining_beta_snapshots',(select count(*) from public.mgt_beta_states),'remaining_auth_users',(select count(*) from auth.users),'original_rows',(select count(*) from public.user_app_data),'original_digest',(select md5(coalesce(string_agg(user_id::text||app_data::text||updated_at::text,'' order by user_id),'')) from public.user_app_data)) as beta_live_rls_result;
