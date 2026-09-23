import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {Audio} from '../../src/game/audio';

const parameter=()=>({value:0,setValueAtTime:vi.fn(),setTargetAtTime:vi.fn(),linearRampToValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()});
class FakeContext {
    state='running';destination={};
    get currentTime(){return Date.now()/1000;}
    resume=vi.fn(async()=>{});
    createGain=vi.fn(()=>({gain:parameter(),connect:vi.fn(),disconnect:vi.fn()}));
    createOscillator=vi.fn(()=>({frequency:parameter(),type:'sine',connect:vi.fn(),disconnect:vi.fn(),start:vi.fn(),stop:vi.fn(),onended:null as (()=>void)|null}));
}
describe('voyage music lifecycle',()=>{
    let context:FakeContext;
    beforeEach(()=>{vi.useFakeTimers();context=new FakeContext();vi.stubGlobal('AudioContext',class{constructor(){return context;}});});
    afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();vi.unstubAllGlobals();});
    it('plays changing notes and schedules each voice to finish',async()=>{
        const audio=new Audio();audio.unlock();audio.setMusic(.2);audio.setPaused(false);
        await vi.advanceTimersByTimeAsync(3000);
        const voices=context.createOscillator.mock.results.map(result=>result.value);
        expect(voices.length).toBeGreaterThan(8);
        expect(new Set(voices.map(voice=>voice.frequency.value)).size).toBeGreaterThan(4);
        expect(voices.every(voice=>voice.stop.mock.calls.length===1)).toBe(true);
        voices[0].onended?.();expect(voices[0].disconnect).toHaveBeenCalled();
    });
    it('stops on pause and mute, and never duplicates scheduler on resume',async()=>{
        const audio=new Audio();audio.unlock();audio.setMusic(.2);audio.setPaused(false);
        await vi.advanceTimersByTimeAsync(500);
        audio.setPaused(true);const count=context.createOscillator.mock.calls.length;
        await vi.advanceTimersByTimeAsync(2000);expect(context.createOscillator).toHaveBeenCalledTimes(count);
        expect(vi.getTimerCount()).toBe(0);
        audio.setPaused(false);audio.setPaused(false);audio.setMusic(.3);
        expect(vi.getTimerCount()).toBe(1);
        audio.setMusic(0);expect(vi.getTimerCount()).toBe(0);
    });
    it('remains silent before user unlock and tolerates unavailable audio',()=>{
        const audio=new Audio();audio.setMusic(.2);audio.setPaused(false);
        expect(context.createOscillator).not.toHaveBeenCalled();
        vi.stubGlobal('AudioContext',class{constructor(){throw Error('unsupported');}});
        expect(()=>audio.unlock()).not.toThrow();expect(vi.getTimerCount()).toBe(0);
    });
});
