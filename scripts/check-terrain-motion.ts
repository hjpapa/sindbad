// Additional read-only art observation, separate from fresh campaign verification.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave} from '../src/core/state';
import {SAVE_KEY} from '../src/core/save';
import {maps} from '../src/content/maps';

type PlatformObservation={x:number;y:number;width:number;height:number;skinX:number;skinY:number;skinWidth:number;skinHeight:number;texture:string};
type TerrainObservation={style:string;platforms:PlatformObservation[];tops:{x:number;y:number;width:number;height:number;texture:string}[]};
const base=process.argv[2]??'http://127.0.0.1:5175';
const browser=await chromium.launch({channel:'msedge',headless:true});
const checks:unknown[]=[];
mkdirSync('docs/screenshots/art-a5',{recursive:true});
try{
    for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
        const context=await browser.newContext({viewport});const page=await context.newPage();const errors:string[]=[];
        page.on('pageerror',error=>errors.push(error.message));
        page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
        page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
        const fixture=freshSave();fixture.checkpoint={stageId:'S07',checkpointId:'start'};
        fixture.clearedStageIds=['S01','S02','S03','S04','S05','S06'];fixture.weapons=['W01','W02','W03'];
        fixture.treasures=['T01'];fixture.flags=['bubbleBlessing'];fixture.totalXp=300;
        fixture.claimedRewardIds=maps.S07.spawns.map(spawn=>spawn.id);
        await page.goto(base);await page.evaluate(({key,fixture})=>localStorage.setItem(key,JSON.stringify(fixture)),{key:SAVE_KEY,fixture});
        await page.reload();await page.getByRole('button',{name:'이어하기 · S07'}).click();
        await page.waitForFunction(()=>{const state=Reflect.get(window,'__SINBAD_TEST__');return state?.stage==='S07'&&state.player?.grounded;});
        await page.keyboard.down('d');await page.waitForTimeout(600);await page.keyboard.press('ArrowUp');await page.waitForTimeout(250);await page.keyboard.up('d');
        const samples:TerrainObservation[]=[];let maxAlignmentDifference=0;
        for(let sample=0;sample<6;sample++){
            await page.waitForTimeout(400);
            const terrain=await page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__').terrain) as TerrainObservation;
            assert.equal(terrain.style,'deck');assert.equal(terrain.platforms.length,maps.S07.platforms.length);
            for(const [index,def] of maps.S07.platforms.entries()){
                const fill=terrain.platforms[index],top=terrain.tops[index];
                assert.equal(fill.texture,'terrain-deck-fill');assert.equal(top.texture,'terrain-deck-top');
                assert.equal(fill.width,def.w);assert.equal(fill.height,def.h);assert.equal(fill.skinWidth,def.w);assert.equal(fill.skinHeight,def.h);
                assert.equal(top.width,def.w);assert.equal(top.height,34);
                const difference=Math.max(Math.abs(fill.x-fill.skinX),Math.abs(fill.y-fill.skinY),Math.abs(top.x-fill.x),Math.abs(top.y-(fill.y-def.h/2+13)));
                maxAlignmentDifference=Math.max(maxAlignmentDifference,difference);
                // Arcade synchronizes bodies after scene update; allow one subpixel frame.
                assert.ok(difference<3,`${device} platform ${index}: ${difference}px`);
            }
            samples.push(terrain);
        }
        const movement=maps.S07.platforms.flatMap((def,index)=>def.motion?[{
            index,xRange:Math.max(...samples.map(sample=>sample.platforms[index].x))-Math.min(...samples.map(sample=>sample.platforms[index].x)),
            yRange:Math.max(...samples.map(sample=>sample.platforms[index].y))-Math.min(...samples.map(sample=>sample.platforms[index].y))
        }]:[]);
        assert.equal(movement.length,6);for(const range of movement)assert.ok(range.xRange>2&&range.yRange>2);
        assert.deepEqual(errors,[]);const path=`docs/screenshots/art-a5/${device}-S07-moving-deck.png`;await page.screenshot({path});
        checks.push({device,stage:'S07',samples,movement,maxAlignmentDifference,path,errors});
        console.log(`PASS ${device}: six moving decks / six samples / max alignment difference ${maxAlignmentDifference.toFixed(3)}px`);
        await context.close();
    }
    writeFileSync('docs/validation/a5-moving-platforms.json',JSON.stringify({date:new Date().toISOString(),pass:true,method:'explicit S07 prior-stage/items/enemy-reward save fixture; real continue button and keyboard; read-only six 400ms-spaced observations per phone/tablet viewport; 3px tolerance for Arcade update order, not a campaign playthrough',checks},null,2));
}finally{await browser.close();}
