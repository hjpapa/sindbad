import type { WeaponId } from '../content/items';

// How each weapon is held and moved during an attack. Angles are degrees for a
// hero facing right; the stage mirrors them when the hero faces left.
export type SwingStyle = 'slash' | 'thrust' | 'smash' | 'draw' | 'throw';
export interface WeaponLook {
    width: number;
    height: number;
    originX: number;
    style: SwingStyle;
    from: number;
    to: number;
    trail: number;
}
export const weaponLooks: Record<WeaponId, WeaponLook> = {
    W01: { width: 112, height: 45, originX: 0.13, style: 'slash', from: -115, to: 55, trail: 0xffe4a0 },
    W02: { width: 64, height: 26, originX: 0.5, style: 'throw', from: -70, to: 20, trail: 0xb6f4e6 },
    W03: { width: 116, height: 46, originX: 0.13, style: 'slash', from: -120, to: 60, trail: 0xffa761 },
    W04: { width: 168, height: 67, originX: 0.25, style: 'thrust', from: -6, to: 0, trail: 0xa9e6ff },
    W05: { width: 42, height: 84, originX: 0.45, style: 'draw', from: 0, to: 0, trail: 0x9af2df },
    W06: { width: 124, height: 50, originX: 0.08, style: 'smash', from: -150, to: 35, trail: 0xc7b3fc },
    W07: { width: 120, height: 45, originX: 0.15, style: 'slash', from: -120, to: 60, trail: 0xfff3ce },
};
export const weaponTexture = (id: WeaponId) => `weapon-${id}`;
export const weaponFallbackTexture = (id: WeaponId) => `weapon-fallback-${id}`;
export const availableWeaponTexture = (id: WeaponId, exists: (key:string)=>boolean) => {
    const primary=weaponTexture(id), fallback=weaponFallbackTexture(id);
    return exists(primary)?primary:exists(fallback)?fallback:null;
};
const failedIcons = new Set<WeaponId>();
export const weaponIcon = (id: WeaponId) => `/assets/weapons/${id}.${failedIcons.has(id)?'svg':'webp'}`;
// One capture listener also covers images subsequently replaced by HUD/menu
// rendering. Remember a failed URL so recreated touch buttons don't retry it.
export function installWeaponIconFallback(root:HTMLElement) {
    root.addEventListener('error',event=>{
        const image=event.target;
        if(!(image instanceof HTMLImageElement))return;
        const match=new URL(image.src,document.baseURI).pathname.match(/^\/assets\/weapons\/(W0[1-7])\.webp$/);
        if(!match)return;
        const id=match[1] as WeaponId;
        failedIcons.add(id);
        image.src=weaponIcon(id);
    },true);
}

// Pose at a given moment of the swing. t runs 0..1 over the visible part of the
// attack; the hit window in stage.ts stays the authority for damage.
export function swingPose(look: WeaponLook, t: number) {
    const k = Math.min(1, Math.max(0, t));
    const ease = 1 - Math.pow(1 - k, 3);
    if (look.style === 'thrust') return { angle: look.from, reach: Math.sin(k * Math.PI) * 46, lift: 0 };
    if (look.style === 'draw') return { angle: 0, reach: 10 - Math.sin(k * Math.PI) * 8, lift: 0 };
    if (look.style === 'throw') return { angle: look.from + (look.to - look.from) * ease, reach: 6, lift: -10 };
    return { angle: look.from + (look.to - look.from) * ease, reach: 6, lift: look.style === 'smash' ? -6 : 0 };
}
