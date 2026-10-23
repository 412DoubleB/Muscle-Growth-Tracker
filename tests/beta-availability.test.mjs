import test from 'node:test';
import assert from 'node:assert/strict';
import {temporaryBetaFailure,betaEntryHtml} from '../beta-entry.mjs';
test('only transport and temporary service failures qualify for device continuation',()=>{
 for(const status of [408,429,500,502,503,504,599])assert.equal(temporaryBetaFailure({status}),true,String(status));
 for(const status of [200,400,401,403,404,409,422,600])assert.equal(temporaryBetaFailure({status}),false,String(status));
 for(const code of ['BETA_FULL','INVALID_ADMISSION','AUTH_REQUIRED'])assert.equal(temporaryBetaFailure({code,status:503}),false,code);
 assert.equal(temporaryBetaFailure(new TypeError('fetch failed')),true);assert.equal(temporaryBetaFailure({name:'TimeoutError'}),true);
 assert.equal(temporaryBetaFailure({name:'AbortError'}),false);assert.equal(temporaryBetaFailure(new SyntaxError('bad response')),false);assert.equal(temporaryBetaFailure(Error('unknown')),false);
});
test('a retry does not require a password and unavailable cloud configuration does not disable an eligible local action',()=>{
 const html=betaEntryHtml({available:false,temporary:true,localAvailable:true});
 assert.match(html,/data-action="beta-retry"[^>]*>Retry connection/);assert.match(html,/data-action="beta-offline">Open saved data on this device/);assert.match(html,/Cloud sync, AI search and push setup stay paused/);
 assert.doesNotMatch(betaEntryHtml(),/beta-offline/);assert.match(betaEntryHtml({temporary:true,localAvailable:true,busy:true}),/data-action="beta-offline" disabled/);
});
