import {statSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {assets} from '../src/content/assets.manifest';
import {sceneEffectKeys} from '../src/content/effects';
import {sceneWorldPropKeys} from '../src/content/worldProps';
import {maps} from '../src/content/maps';

const initialKeys=new Set(['chapter-1','hero-webtoon','hero-run','hero-action','captain-webtoon','captain-faces','enemy-actions','terrain-dock-fill','terrain-dock-top']);
// Conservatively include all nine small DOM icons, including later abilities.
for(const asset of assets)if(asset.key.startsWith('ui-'))initialKeys.add(asset.key);
for(const key of sceneEffectKeys(maps.S01.spawns.map(spawn=>spawn.kind),'S01'))initialKeys.add(key);
for(const key of sceneWorldPropKeys(maps.S01))initialKeys.add(key);
const initial=assets.filter(asset=>asset.kind==='svg'||asset.key.startsWith('weapon-')||initialKeys.has(asset.key));
const files=initial.map(asset=>({path:`public/${asset.path}`,bytes:statSync(`public/${asset.path}`).size}));
const bundleFiles=readdirSync('dist/assets').filter(file=>/\.(js|css)$/.test(file)).map(file=>({path:`dist/assets/${file}`,bytes:statSync(`dist/assets/${file}`).size}));
const total=files.concat(bundleFiles).reduce((sum,file)=>sum+file.bytes,0);
const report={date:new Date().toISOString(),method:'raw production JS/CSS plus S01 artwork and conservatively all nine DOM UI icons; excludes HTTP overhead, not a device/network benchmark',budgetBytes:8_000_000,totalBytes:total,pass:total<=8_000_000,files,bundleFiles};
mkdirSync('docs/validation',{recursive:true});writeFileSync('docs/validation/art-budget.json',JSON.stringify(report,null,2));
console.log(`Initial production files: ${(total/1_000_000).toFixed(2)} MB / 8.00 MB (raw bytes).`);
if(!report.pass)process.exitCode=1;
