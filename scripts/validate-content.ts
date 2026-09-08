import { existsSync } from 'node:fs';
import { assets } from '../src/content/assets.manifest';
import { proceduralAssets } from '../src/content/procedural-assets';
import { validateContent } from '../src/content/validate';
const errors = validateContent();
for (const asset of proceduralAssets) if (!existsSync(asset.path)) errors.push(`Missing procedural source ${asset.path}`);
for (const a of assets)
    if (!existsSync(`public/${a.path}`))
        errors.push(`Missing asset ${a.path}`);
if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
}
else
    console.log('PASS: 36 stages, 24 child scenes, 7 weapons, 7 treasures, 8 golden hearts; acquisition graph, S16 protection, rewards, maps and assets. S01–S03 implemented; S04–S36 planned.');
