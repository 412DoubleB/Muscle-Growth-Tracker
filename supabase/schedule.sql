-- Run after deploying send-reminders and storing these two values in Supabase Vault:
-- mgt_beta_function_url = https://YOUR-PROJECT.supabase.co/functions/v1/send-reminders
-- mgt_beta_cron_secret = same 32+ character secret as REMINDER_CRON_SECRET
-- Use the Dashboard Vault UI. Never paste secrets into Git or client settings.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.unschedule(jobid) from cron.job where jobname='mgt-beta-reminders';
select cron.schedule('mgt-beta-reminders','* * * * *', $$
 select net.http_post(
  url:=(select decrypted_secret from vault.decrypted_secrets where name='mgt_beta_function_url'),
  headers:=jsonb_build_object('Content-Type','application/json','x-cron-key',(select decrypted_secret from vault.decrypted_secrets where name='mgt_beta_cron_secret')),
  body:='{}'::jsonb,
  timeout_milliseconds:=50000
 );
$$);
