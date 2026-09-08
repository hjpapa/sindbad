import { existsSync } from 'node:fs';
import { assets } from '../src/content/assets.manifest';
import { validateContent } from '../src/content/validate';
const errors = validateContent();
for (const a of assets)
    if (!existsSync(`public/${a.path}`))
        errors.push(`Missing asset ${a.path}`);
if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
}
else
    console.log('PASS: 36 stages, 24 child scenes, 7 weapons, 7 treasures, 8 golden hearts; acquisition graph, S16 protection, rewards, maps and assets. S01–S07 implemented; S08–S36 planned.');
