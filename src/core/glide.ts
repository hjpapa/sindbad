export const glideFallSpeed=180;
export function canGlide(hasFeather:boolean,jumpHeld:boolean,freeMovement:boolean,grounded:boolean,velocityY:number){
    return hasFeather&&jumpHeld&&!freeMovement&&!grounded&&velocityY>0;
}
