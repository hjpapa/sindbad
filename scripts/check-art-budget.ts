import {statSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {assets} from '../src/content/assets.manifest';

const initialKeys=new Set(['chapter-1','hero-webtoon','hero-run','enemy-atlas']);
const initial=assets.filter(asset=>asset.kind==='svg'||initialKeys.has(asset.key));
const files=initial.map(asset=>({path:`public/${asset.path}`,bytes:statSync(`public/${asset.path}`).size}));
const bundleFiles=readdirSync('dist/assets').filter(file=>/\.(js|css)$/.test(file)).map(file=>({path:`dist/assets/${file}`,bytes:statSync(`dist/assets/${file}`).size}));
const total=files.concat(bundleFiles).reduce((sum,file)=>sum+file.bytes,0);
const report={date:new Date().toISOString(),method:'raw production JS/CSS plus currently requested S01 artwork; excludes HTTP overhead, not a device/network benchmark',budgetBytes:8_000_000,totalBytes:total,pass:total<=8_000_000,files,bundleFiles};
mkdirSync('docs/validation',{recursive:true});writeFileSync('docs/validation/art-budget.json',JSON.stringify(report,null,2));
console.log(`Initial production files: ${(total/1_000_000).toFixed(2)} MB / 8.00 MB (raw bytes).`);
if(!report.pass)process.exitCode=1;
