create policy menei_push_service_only on mgt_beta_private.menei_push_pilots for all to service_role using(true) with check(true);
