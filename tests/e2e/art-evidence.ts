import {mkdirSync} from 'node:fs';

// A fresh root keeps previous art evidence intact and avoids overwriting files
// that a Windows image preview may still have open. Reports use this same path.
const root=process.env.SINBAD_EVIDENCE_ROOT??'docs/screenshots';
mkdirSync(root,{recursive:true});
export const evidencePath=(relative:string)=>`${root}/${relative}`;
