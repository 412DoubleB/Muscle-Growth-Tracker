import LZString from './vendor/lz-string.mjs?v=8.2.0';
const FORMAT='menei-device-recovery',VERSION=1,MAX_TEXT=32*1024*1024;
const checksum=text=>{let n=2166136261;for(let i=0;i<text.length;i++){n^=text.charCodeAt(i);n=Math.imul(n,16777619)}return (n>>>0).toString(16)};
export const isStorageQuotaError=error=>['QuotaExceededError','NS_ERROR_DOM_QUOTA_REACHED'].includes(error?.name)||[22,1014].includes(error?.code)||/quota.*exceed|exceed.*quota|storage.*full/i.test(error?.message||'');
export function encodeRecoverySnapshots(list){
 const text=JSON.stringify(list);
 if(text.length>MAX_TEXT)throw Error('This recovery copy is too large to save safely. Download a backup before changing it.');
 return JSON.stringify({format:FORMAT,version:VERSION,encoding:'lz-string-utf16',length:text.length,checksum:checksum(text),data:LZString.compressToUTF16(text)});
}
export function readRecoverySnapshots(raw){
 if(raw==null)return [];
 try{
  const saved=JSON.parse(raw);
  // Existing full JSON arrays remain readable and are only compacted on a new snapshot.
  if(Array.isArray(saved))return saved;
  if(saved?.format!==FORMAT||saved.version!==VERSION||saved.encoding!=='lz-string-utf16'||typeof saved.data!=='string'||!Number.isInteger(saved.length)||saved.length<0||saved.length>MAX_TEXT)throw Error('Unsupported recovery copy.');
  const text=LZString.decompressFromUTF16(saved.data);
  if(typeof text!=='string'||text.length!==saved.length||checksum(text)!==saved.checksum)throw Error('Recovery integrity check failed.');
  const list=JSON.parse(text);if(!Array.isArray(list))throw Error('Invalid recovery list.');return list;
 }catch{throw Error('The saved recovery copies could not be read. They have not been overwritten. Export your current backup before continuing.');}
}

// The sync baseline is a comparison cache, not the primary workspace or auth.
const SYNC_FORMAT='menei-sync-base';
export function readSyncBase(raw){
 if(raw==null)return null;
 try{
  let base=JSON.parse(raw);
  if(base?.format===SYNC_FORMAT){
   if(base.version!==VERSION||base.encoding!=='lz-string-utf16'||typeof base.data!=='string'||!Number.isInteger(base.length)||base.length<0||base.length>MAX_TEXT)throw Error('Unsupported sync cache.');
   const text=LZString.decompressFromUTF16(base.data);
   if(typeof text!=='string'||text.length!==base.length||checksum(text)!==base.checksum)throw Error('Sync cache integrity check failed.');
   base=JSON.parse(text);
  }
  if(base!==null&&(!base||typeof base!=='object'||Array.isArray(base)||!base.state||typeof base.state!=='object'||Array.isArray(base.state)))throw Error('Invalid sync cache.');
  return base;
 }catch{throw Error('The saved sync comparison copy could not be read. Your workspace and saved copies were not cleared.');}
}
export function encodeSyncBase(base){
 const text=JSON.stringify(base);if(text.length>MAX_TEXT)throw Error('The sync comparison copy is too large to save safely.');
 const compressed=JSON.stringify({format:SYNC_FORMAT,version:VERSION,encoding:'lz-string-utf16',length:text.length,checksum:checksum(text),data:LZString.compressToUTF16(text)});
 return compressed.length<text.length?compressed:text;
}
export function compactSyncBase(storage,key){
 const raw=storage.getItem(key);if(raw==null)return false;
 let encoded;try{encoded=encodeSyncBase(readSyncBase(raw))}catch{return false}
 if(encoded.length>=raw.length)return false;
 storage.setItem(key,encoded);return true;
}
