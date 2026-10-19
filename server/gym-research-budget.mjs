export const GYM_AI_TRIAL_ID='menei-gym-ai-trial-1';
export const GYM_AI_TRIAL_LIMIT=5;

const LEASE_MS=90_000,COOLDOWN_MS=10_000;
const unavailable=()=>new Error('Gym research budget is unavailable.');
const validTime=now=>Number.isSafeInteger(now)&&now>=0&&now<=Number.MAX_SAFE_INTEGER-LEASE_MS-COOLDOWN_MS;
const validLease=leaseId=>typeof leaseId==='string'&&leaseId.length>0&&leaseId.length<=200&&!/[\u0000-\u001f\u007f]/.test(leaseId);

// The migration owns table creation. This single statement reserves the global
// attempt and lease together; failed or timed-out provider requests keep it spent.
const RESERVE_SQL=`INSERT INTO menei_gym_ai_trials
 (id,used,lease_id,lease_until,next_allowed_at) VALUES (?,1,?,?,?)
 ON CONFLICT(id) DO UPDATE SET
  used=menei_gym_ai_trials.used+1,
  lease_id=excluded.lease_id,
  lease_until=excluded.lease_until,
  next_allowed_at=excluded.next_allowed_at
 WHERE typeof(menei_gym_ai_trials.used)='integer'
  AND menei_gym_ai_trials.used>=0 AND menei_gym_ai_trials.used<?
  AND menei_gym_ai_trials.lease_until<=?
  AND menei_gym_ai_trials.next_allowed_at<=?
 RETURNING used`;

// Health checks only read the existing table; an unused trial has no row yet.
export async function readGymResearchQuota(db){
 try{
  const row=await db.prepare('SELECT used FROM menei_gym_ai_trials WHERE id=?').bind(GYM_AI_TRIAL_ID).first();
  if(row==null)return {used:0,remaining:GYM_AI_TRIAL_LIMIT};
  if(!Number.isInteger(row.used)||row.used<0||row.used>GYM_AI_TRIAL_LIMIT)throw unavailable();
  return {used:row.used,remaining:GYM_AI_TRIAL_LIMIT-row.used};
 }catch{throw unavailable()}
}

export async function reserveGymResearch(db,{now=Date.now(),leaseId=crypto.randomUUID()}={}){
 if(!validTime(now)||!validLease(leaseId))throw unavailable();
 try{
  const reserved=await db.prepare(RESERVE_SQL).bind(GYM_AI_TRIAL_ID,leaseId,now+LEASE_MS,now+LEASE_MS+COOLDOWN_MS,GYM_AI_TRIAL_LIMIT,now,now).first();
  if(reserved){
   if(!Number.isInteger(reserved.used)||reserved.used<1||reserved.used>GYM_AI_TRIAL_LIMIT)throw unavailable();
   return {allowed:true,leaseId,used:reserved.used};
  }
  const row=await db.prepare('SELECT used FROM menei_gym_ai_trials WHERE id=?').bind(GYM_AI_TRIAL_ID).first();
  if(!row||!Number.isInteger(row.used)||row.used<0||row.used>GYM_AI_TRIAL_LIMIT)throw unavailable();
  return {allowed:false,reason:row.used>=GYM_AI_TRIAL_LIMIT?'limit':'busy',used:row.used};
 }catch{throw unavailable()}
}

// Only the holder of this exact lease may release it. A delayed completion from
// an expired request cannot unlock a newer request or refund an attempt.
export async function releaseGymResearch(db,leaseId,{now=Date.now()}={}){
 if(!validTime(now)||!validLease(leaseId))throw unavailable();
 try{
  const result=await db.prepare(`UPDATE menei_gym_ai_trials
   SET lease_id=NULL,lease_until=0,next_allowed_at=?
   WHERE id=? AND lease_id=?`).bind(now+COOLDOWN_MS,GYM_AI_TRIAL_ID,leaseId).run();
  if(result?.success!==true||!Number.isInteger(result.meta?.changes)||result.meta.changes<0)throw unavailable();
  return {released:result.meta.changes>0};
 }catch{throw unavailable()}
}
