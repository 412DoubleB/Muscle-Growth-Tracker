import webpush from 'npm:web-push@3.6.7';
import {createLiveReminderHandler} from './reminder-handler.mjs';
Deno.serve(createLiveReminderHandler({env:Deno.env,webpush}));
