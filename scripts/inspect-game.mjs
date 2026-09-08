import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
mkdirSync('docs/screenshots',{recursive:true});
const suffix=(process.argv[2]??'').replace(/[^a-z0-9-]/gi,'');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
 await page.goto('http://127.0.0.1:5173');
 await page.screenshot({path:`docs/screenshots/title${suffix}.png`});
 await page.getByRole('button',{name:'새 모험 시작'}).click();
 await page.waitForTimeout(1500);
 console.log('STATE',await page.evaluate(()=>window.__SINBAD_TEST__));
 await page.screenshot({path:`docs/screenshots/harbor${suffix}.png`});
} finally { await browser.close(); }
