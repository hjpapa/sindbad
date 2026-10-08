import roc from './roc-actions.generated.json' with {type:'json'};

export function rocFlightFrame(sim:number,attackAge:number|null,reducedMotion:boolean){
    if(attackAge!==null&&attackAge<=280)return 2;
    return reducedMotion?4:4+Math.floor(sim/160)%2;
}

export function rocFlightLayout(frame:number,flipX:boolean){
    const seat=roc.frames[frame].seat;
    return {displaySize:240*roc.cellSize/roc.flightReferenceWidth,
        originX:flipX?1-seat[0]/roc.cellSize:seat[0]/roc.cellSize,originY:seat[1]/roc.cellSize};
}
