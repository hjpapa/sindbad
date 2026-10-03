import {writeFileSync,mkdirSync} from 'node:fs';
// Original weapon props for the in-hand swing and the HUD/touch weapon icons.
// Every blade points to the right; the grip sits on the left so the game can
// rotate the image around the hand (origin values live in src/game/weapons.ts).
mkdirSync('public/assets/weapons',{recursive:true});
const defs=`<defs>
<linearGradient id="steel" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset=".45" stop-color="#dbe9f0"/><stop offset="1" stop-color="#7f9cb0"/></linearGradient>
<linearGradient id="gold" x2="0" y2="1"><stop stop-color="#fff0b8"/><stop offset="1" stop-color="#c0813e"/></linearGradient>
<linearGradient id="flame" x2="1" y2="0"><stop stop-color="#ffcf6a"/><stop offset=".55" stop-color="#ff8a3c"/><stop offset="1" stop-color="#e24a2d"/></linearGradient>
<linearGradient id="storm" x2="0" y2="1"><stop stop-color="#e9fbff"/><stop offset="1" stop-color="#5d93c9"/></linearGradient>
<linearGradient id="sea" x2="0" y2="1"><stop stop-color="#9af2df"/><stop offset="1" stop-color="#2f7a92"/></linearGradient>
<linearGradient id="moon" x2="0" y2="1"><stop stop-color="#e6dcff"/><stop offset="1" stop-color="#7a68b4"/></linearGradient>
<linearGradient id="dawn" x2="1" y2="0"><stop stop-color="#fff6d6"/><stop offset=".7" stop-color="#ffe7a2"/><stop offset="1" stop-color="#ffd27a"/></linearGradient>
<linearGradient id="wood" x2="0" y2="1"><stop stop-color="#a7704a"/><stop offset="1" stop-color="#5d3524"/></linearGradient>
</defs>`;
const wrap=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<g stroke="#2a1d22" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
const grip=(x1,x2,color='url(#wood)')=>`<path d="M${x1} 28h${x2-x1}v9H${x1}Z" fill="${color}"/><path d="M${x1+6} 28v9m6-9v9m6-9v9" stroke="#3a2418" stroke-width="1.6"/><circle cx="${x1}" cy="32.5" r="5" fill="url(#gold)"/>`;
const weapons={
 W01:wrap(160,64,`${grip(8,32)}<path d="M36 27Q92 25 128 13Q145 7 155 3Q150 19 133 30Q99 44 36 39Z" fill="url(#steel)"/><path d="M44 30Q96 29 140 11" fill="none" stroke="#ffffff" stroke-width="2"/><ellipse cx="35" cy="33" rx="5" ry="13" fill="url(#gold)"/>`),
 W02:wrap(160,64,`<path d="M20 50Q60 8 80 6Q100 8 140 50Q118 54 80 26Q42 54 20 50Z" fill="url(#sea)"/><path d="M36 44Q62 22 80 18Q98 22 124 44" fill="none" stroke="#e9fff6" stroke-width="2"/><circle cx="80" cy="13" r="5" fill="url(#gold)"/><path d="M8 24q8-6 16 0M136 24q8-6 16 0" fill="none" stroke="#bff6ea"/>`),
 W03:wrap(160,64,`${grip(8,32,'#6a2e24')}<path d="M36 27Q92 25 128 13Q145 7 155 3Q150 19 133 30Q99 44 36 39Z" fill="url(#flame)"/><path d="M58 26q5-12 2-20 10 8 8 19M88 23q6-13 3-21 11 9 8 18M116 17q6-11 4-17 9 8 6 14" fill="#ffb24a"/><path d="M44 30Q96 29 140 11" fill="none" stroke="#fff1b0" stroke-width="2"/><ellipse cx="35" cy="33" rx="5" ry="13" fill="url(#gold)"/>`),
 W04:wrap(160,64,`<path d="M4 29h112v7H4Z" fill="url(#wood)"/><path d="M30 29v7m30-7v7m30-7v7" stroke="#3a2418" stroke-width="1.6"/><path d="M112 24q-10 10-24 22l8-12-12 4q10-8 20-18" fill="#6fb5e8"/><path d="M114 32L136 18Q158 26 158 32.5Q158 39 136 47Z" fill="url(#storm)"/><path d="M128 25l8 6-6 2 9 8" fill="none" stroke="#ffe27a" stroke-width="2.2"/><rect x="110" y="25" width="7" height="15" rx="2" fill="url(#gold)"/>`),
 W05:wrap(80,160,`<path d="M22 6Q66 40 62 80Q66 120 22 154" fill="none" stroke="#2a1d22" stroke-width="10"/><path d="M22 6Q66 40 62 80Q66 120 22 154" fill="none" stroke="url(#sea)" stroke-width="6"/><path d="M22 6L22 154" stroke="#f4f0dc" stroke-width="1.6"/><path d="M56 70h12v20H56Z" fill="url(#wood)"/><path d="M66 46q8 6 2 14M66 114q8-6 2-14" fill="none" stroke="#bff6ea"/><circle cx="22" cy="6" r="4" fill="url(#gold)"/><circle cx="22" cy="154" r="4" fill="url(#gold)"/>`),
 W06:wrap(160,64,`${grip(6,64)}<path d="M64 25Q90 12 130 10Q158 12 158 32Q158 53 130 55Q90 53 64 40Z" fill="url(#moon)"/><path d="M86 18v29M110 13v38" stroke="#4d3f7c" stroke-width="2"/><path d="M134 22a11 11 0 1 0 6 20 9 9 0 1 1-6-20Z" fill="#fff4c8"/><rect x="60" y="22" width="8" height="21" rx="2" fill="url(#gold)"/>`),
 W07:wrap(160,64,`${grip(8,30,'#3d4f73')}<path d="M40 27H140L158 32.5 140 38H40Z" fill="url(#dawn)"/><path d="M44 32.5H146" stroke="#ffffff" stroke-width="1.8"/><circle cx="35" cy="32.5" r="10" fill="url(#gold)"/><path d="M35 16v-6M35 49v6M22 20l-4-4M48 20l4-4M22 45l-4 4M48 45l4 4" stroke="#ffd36e" stroke-width="2.4"/><circle cx="35" cy="32.5" r="4" fill="#fff6d6"/>`),
};
for(const [id,svg] of Object.entries(weapons))writeFileSync(`public/assets/weapons/${id}.svg`,svg);
console.log(`Created ${Object.keys(weapons).length} original weapon props.`);
