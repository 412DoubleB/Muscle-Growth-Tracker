import {GYM_AI_TRIAL_ID} from './gym-research-budget.mjs';

export const BETA_CAMPAIGN_ID='menei-beta-20-1';
export const BETA_CAPACITY=20;
export const BETA_PERSONAL_LIMIT=5;
export const BETA_GLOBAL_LIMIT=100;
export const BETA_LEASE_MS=90_000;
export const BETA_COOLDOWN_MS=10_000;

const unavailable=()=>new Error('Beta membership and budget are unavailable.');
const validId=value=>typeof value==='string'&&value.length>0&&value.length<=200&&!/[\u0000-\u001f\u007f]/.test(value);
const validTime=value=>Number.isSafeInteger(value)&&value>=0&&value<=Number.MAX_SAFE_INTEGER-BETA_LEASE_MS-BETA_COOLDOWN_MS;
const triggerNames=['campaign_no_delete','campaign_identity_immutable','member_no_update','member_no_delete','member_admit','attempt_no_update','attempt_no_delete','attempt_reserve','campaign_lease_sync','legacy_guard_update','legacy_guard_delete','legacy_guard_insert'].map(name=>'menei_beta_'+name);
const badIdentity=column=>`(typeof(${column})!='text' OR length(${column}) NOT BETWEEN 1 AND 200 OR ${column} GLOB '*[' || char(1) || '-' || char(31) || char(127) || ']*' OR instr(${column},char(0))>0)`;
const badLease=prefix=>`(typeof(${prefix}lease_until)!='integer' OR ${prefix}lease_until<0 OR typeof(${prefix}next_allowed_at)!='integer' OR ${prefix}next_allowed_at<${prefix}lease_until OR (${prefix}lease_id IS NULL AND ${prefix}lease_until!=0) OR (${prefix}lease_id IS NOT NULL AND ${badIdentity(prefix+'lease_id')}))`;

// Read-only health checks also detect a partially applied migration. Ordinary
// requests never create tables, repair records, reset counters or claim slots.
const READ_SQL=`SELECT
 (SELECT count(*) FROM sqlite_master WHERE type='trigger' AND name IN (${triggerNames.map(name=>`'${name}'`).join(',')})) AS triggers,
 (SELECT count(*) FROM menei_beta_campaigns) AS campaigns,
 (SELECT count(*) FROM menei_beta_campaigns WHERE id!='${BETA_CAMPAIGN_ID}' OR bootstrap_closed!=1 OR ${badIdentity('owner_user_id')} OR typeof(created_at)!='integer' OR created_at<0 OR ${badLease('')}) AS bad_campaigns,
 (SELECT owner_user_id FROM menei_beta_campaigns WHERE id='${BETA_CAMPAIGN_ID}') AS owner_id,
 (SELECT count(*) FROM menei_beta_members) AS members,
 (SELECT count(*) FROM menei_beta_members WHERE role='owner') AS owners,
 (SELECT count(*) FROM menei_beta_members m JOIN menei_beta_campaigns c ON c.id=m.campaign_id AND c.owner_user_id=m.site_user_id WHERE m.role='owner') AS matching_owners,
 (SELECT count(*) FROM menei_beta_members WHERE campaign_id!='${BETA_CAMPAIGN_ID}' OR ${badIdentity('site_user_id')} OR role NOT IN ('owner','member') OR typeof(enrolled_at)!='integer' OR enrolled_at<0) AS bad_members,
 (SELECT count(*) FROM menei_beta_attempts) AS attempts,
 (SELECT count(*) FROM menei_beta_attempts a WHERE campaign_id!='${BETA_CAMPAIGN_ID}' OR ${badIdentity('lease_id')} OR typeof(reserved_at)!='integer' OR reserved_at<0 OR NOT EXISTS(SELECT 1 FROM menei_beta_members m WHERE m.campaign_id=a.campaign_id AND m.site_user_id=a.site_user_id)) AS bad_attempts,
 (SELECT count(*) FROM menei_beta_members m WHERE (SELECT count(*) FROM menei_beta_attempts a WHERE a.campaign_id=m.campaign_id AND a.site_user_id=m.site_user_id)+CASE WHEN m.role='owner' THEN coalesce((SELECT used FROM menei_gym_ai_trials WHERE id='${GYM_AI_TRIAL_ID}'),0) ELSE 0 END>${BETA_PERSONAL_LIMIT}) AS over_limit,
 (SELECT count(*) FROM menei_gym_ai_trials WHERE id='${GYM_AI_TRIAL_ID}') AS legacy_rows,
 (SELECT count(*) FROM menei_gym_ai_trials WHERE id='${GYM_AI_TRIAL_ID}' AND (typeof(used)!='integer' OR used NOT BETWEEN 0 AND 5 OR ${badLease('')})) AS bad_legacy,
 coalesce((SELECT used FROM menei_gym_ai_trials WHERE id='${GYM_AI_TRIAL_ID}'),0) AS legacy_used,
 (SELECT role FROM menei_beta_members WHERE campaign_id='${BETA_CAMPAIGN_ID}' AND site_user_id=?) AS role,
 (SELECT count(*) FROM menei_beta_attempts WHERE campaign_id='${BETA_CAMPAIGN_ID}' AND site_user_id=?) AS personal_attempts`;

async function readState(db,siteUserId=''){
 try{
  const row=await db.prepare(READ_SQL).bind(siteUserId,siteUserId).first();
  if(!row||row.triggers!==triggerNames.length)throw unavailable();
  for(const key of ['campaigns','bad_campaigns','members','owners','matching_owners','bad_members','attempts','bad_attempts','over_limit','legacy_rows','bad_legacy','legacy_used','personal_attempts'])if(!Number.isSafeInteger(row[key])||row[key]<0)throw unavailable();
  if(row.bad_campaigns||row.bad_members||row.bad_attempts||row.bad_legacy||row.over_limit||row.legacy_used>5||row.members>BETA_CAPACITY||row.attempts+row.legacy_used>BETA_GLOBAL_LIMIT||row.legacy_rows>1)throw unavailable();
  if(row.campaigns===0){if(row.members||row.attempts||row.owners||row.matching_owners||row.role!=null)throw unavailable()}
  else if(row.campaigns!==1||row.members<1||row.owners!==1||row.matching_owners!==1||row.legacy_rows!==1||!validId(row.owner_id))throw unavailable();
  if(row.role!=null&&!['owner','member'].includes(row.role))throw unavailable();
  return row;
 }catch{throw unavailable()}
}
const status=row=>({enrolled:row.members,capacity:BETA_CAPACITY,remainingSlots:BETA_CAPACITY-row.members,bootstrapClosed:row.campaigns===1});
const membership=row=>({member:row.role!=null,role:row.role??null,...status(row)});
const quota=row=>{
 const used=row.personal_attempts+(row.role==='owner'?row.legacy_used:0),globalUsed=row.attempts+row.legacy_used;
 return {used,remaining:BETA_PERSONAL_LIMIT-used,globalUsed,globalRemaining:BETA_GLOBAL_LIMIT-globalUsed,limit:BETA_PERSONAL_LIMIT,globalLimit:BETA_GLOBAL_LIMIT};
};

export async function readBetaStatus(db){return status(await readState(db))}
export async function readBetaMembership(db,siteUserId){
 if(!validId(siteUserId))throw unavailable();
 return membership(await readState(db,siteUserId));
}

// A single INSERT and database triggers create the owner+latch or claim one
// remaining slot. A GET never enters this path. The Worker must authorize owner
// bootstrap using its explicit bootstrap phase and native owner-only access.
export async function enrollBetaMember(db,siteUserId,{bootstrap=false,now=Date.now()}={}){
 if(!validId(siteUserId)||typeof bootstrap!=='boolean'||!validTime(now))throw unavailable();
 try{
  let row=await readState(db,siteUserId);
  if(row.role)return {admitted:true,existing:true,...membership(row)};
  if(bootstrap&&row.campaigns)return {admitted:false,reason:'bootstrap_closed',...membership(row)};
  if(!bootstrap&&!row.campaigns)return {admitted:false,reason:'bootstrap_required',...membership(row)};
  const role=bootstrap?'owner':'member';
  const inserted=await db.prepare(`INSERT INTO menei_beta_members(campaign_id,site_user_id,role,enrolled_at)
   SELECT ?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM menei_beta_members WHERE campaign_id=? AND site_user_id=?)
    AND ${bootstrap?'NOT EXISTS(SELECT 1 FROM menei_beta_campaigns) AND NOT EXISTS(SELECT 1 FROM menei_beta_members)':'EXISTS(SELECT 1 FROM menei_beta_campaigns c JOIN menei_beta_members m ON m.campaign_id=c.id AND m.site_user_id=c.owner_user_id WHERE c.id=\''+BETA_CAMPAIGN_ID+'\' AND c.bootstrap_closed=1 AND m.role=\'owner\') AND (SELECT count(*) FROM menei_beta_members)<'+BETA_CAPACITY}
   RETURNING site_user_id`).bind(BETA_CAMPAIGN_ID,siteUserId,role,now,BETA_CAMPAIGN_ID,siteUserId).first();
  row=await readState(db,siteUserId);
  if(row.role)return {admitted:true,existing:!inserted,...membership(row)};
  return {admitted:false,reason:bootstrap?'bootstrap_closed':row.campaigns?'full':'bootstrap_required',...membership(row)};
 }catch{throw unavailable()}
}

export async function readBetaQuota(db,siteUserId){
 if(!validId(siteUserId))throw unavailable();
 const row=await readState(db,siteUserId);
 if(!row.role)throw unavailable();
 return quota(row);
}

export async function reserveBetaGymResearch(db,siteUserId,{now=Date.now(),leaseId=crypto.randomUUID()}={}){
 if(!validId(siteUserId)||!validId(leaseId)||!validTime(now))throw unavailable();
 try{
  let row=await readState(db,siteUserId);
  if(!row.role)return {allowed:false,reason:'not_member'};
  const inserted=await db.prepare(`INSERT INTO menei_beta_attempts(lease_id,campaign_id,site_user_id,reserved_at)
   SELECT ?,?,?,? FROM menei_beta_campaigns c JOIN menei_beta_members m ON m.campaign_id=c.id
    JOIN menei_gym_ai_trials l ON l.id=?
   WHERE c.id=? AND m.site_user_id=? AND c.bootstrap_closed=1
    AND (SELECT count(*) FROM menei_beta_attempts WHERE campaign_id=c.id)+l.used<?
    AND (SELECT count(*) FROM menei_beta_attempts WHERE campaign_id=c.id AND site_user_id=m.site_user_id)+CASE WHEN m.role='owner' THEN l.used ELSE 0 END<?
    AND c.lease_until<=? AND c.next_allowed_at<=? AND l.lease_until<=? AND l.next_allowed_at<=?
   RETURNING lease_id`).bind(leaseId,BETA_CAMPAIGN_ID,siteUserId,now,GYM_AI_TRIAL_ID,BETA_CAMPAIGN_ID,siteUserId,BETA_GLOBAL_LIMIT,BETA_PERSONAL_LIMIT,now,now,now,now).first();
  row=await readState(db,siteUserId);const current=quota(row);
  if(inserted)return {allowed:true,leaseId,used:current.used,globalUsed:current.globalUsed};
  return {allowed:false,reason:current.used>=BETA_PERSONAL_LIMIT?'limit':current.globalUsed>=BETA_GLOBAL_LIMIT?'global_limit':'busy',used:current.used,globalUsed:current.globalUsed};
 }catch{throw unavailable()}
}

// Ledger rows are append-only. Release changes only operational locks, and a
// delayed completion cannot release the lease belonging to a newer request.
export async function releaseBetaGymResearch(db,leaseId,{now=Date.now()}={}){
 if(!validId(leaseId)||!validTime(now))throw unavailable();
 try{
  await readState(db);
  const result=await db.prepare(`UPDATE menei_beta_campaigns SET lease_id=NULL,lease_until=0,next_allowed_at=? WHERE id=? AND lease_id=?`).bind(now+BETA_COOLDOWN_MS,BETA_CAMPAIGN_ID,leaseId).run();
  if(result?.success!==true||!Number.isInteger(result.meta?.changes)||result.meta.changes<0)throw unavailable();
  return {released:result.meta.changes>0};
 }catch{throw unavailable()}
}
