// Render the preserved project SVGs only as imagegen composition references.
import {chromium} from '@playwright/test';
import {readFileSync, mkdirSync} from 'node:fs';
const dir='art-source/weapons/references';
mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
    const page=await browser.newPage({deviceScaleFactor:4});
    for(let n=1;n<=7;n++){
        const id=`W0${n}`;
        await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${readFileSync(`public/assets/weapons/${id}.svg`,'utf8')}`);
        await page.locator('svg').screenshot({path:`${dir}/${id}.png`,omitBackground:true});
    }
}finally{await browser.close();}
