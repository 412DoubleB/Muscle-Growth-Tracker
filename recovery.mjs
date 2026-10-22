import LZString from './vendor/lz-string.mjs?v=8.1.1';
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
