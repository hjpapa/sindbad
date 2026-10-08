import atlas from './enemy-actions.generated.json' with {type:'json'};
import kite from './kite-actions.generated.json' with {type:'json'};
import siren from './siren-actions.generated.json' with {type:'json'};
import bat from './bat-actions.generated.json' with {type:'json'};
import spirit from './spirit-actions.generated.json' with {type:'json'};
import roc from './roc-actions.generated.json' with {type:'json'};

export type EnemyActionKey = 'skeleton' | 'bandit' | 'guard' | 'pirate' | 'snake' | 'tiger' | 'dragon' | 'crab' | 'stone' | 'kuura' | 'kite' | 'siren' | 'bat' | 'spirit' | 'roc';
export const enemyActionTexture = (key:EnemyActionKey) => key==='kite'?'kite-actions':key==='siren'?'siren-actions':key==='bat'?'bat-actions':key==='spirit'?'spirit-actions':key==='roc'?'roc-actions':'enemy-actions';
export type EnemyState = 'idle' | 'telegraph' | 'attack' | 'recover' | 'defeated';
export const enemyActionRows = atlas.rows;

export function enemyActionPose(state: EnemyState) {
    return state === 'telegraph' ? 1 : state === 'attack' ? 2 : state === 'defeated' ? 3 : 0;
}

// Keep the old combat centre and chosen resting foot position, despite transparent
// margins or a crouching pose. Pose changes never move the collision target.
export function enemyActionLayout(key: EnemyActionKey, state: EnemyState, bodyHeight: number, footOffset: number) {
    if(key==='roc'){
        const frame=enemyActionPose(state),pose=roc.frames[frame],displaySize=bodyHeight*roc.cellSize/roc.idleHeight;
        // The swooping attack tucks its feet above the wing tips. Anchor its
        // torso so the wings stay above the floor, rather than planting its toes.
        const baseline=frame===2?pose.centre[1]+roc.frames[0].baseline-roc.frames[0].centre[1]:pose.baseline;
        return {frame,displaySize,originX:pose.centre[0]/roc.cellSize,
            originY:baseline/roc.cellSize-footOffset/displaySize,bodyWidth:roc.bossBodyWidth};
    }
    if(key==='spirit'){
        const frame=enemyActionPose(state),pose=spirit.frames[frame];
        return {frame,displaySize:bodyHeight/spirit.legacyCanvasHeight*spirit.restingVisibleHeight*spirit.cellSize/spirit.idleHeight,
            originX:pose.centre[0]/spirit.cellSize,originY:pose.centre[1]/spirit.cellSize,bodyWidth:spirit.legacyCanvasWidth};
    }
    if(key==='bat'){
        const frame=enemyActionPose(state),pose=bat.frames[frame];
        return {frame,displaySize:bodyHeight/bat.legacyCanvasHeight*bat.restingVisibleHeight*bat.cellSize/bat.idleHeight,
            originX:pose.centre[0]/bat.cellSize,originY:pose.centre[1]/bat.cellSize,bodyWidth:bat.legacyCanvasWidth};
    }
    if(key==='siren'){
        const frame=enemyActionPose(state),pose=siren.frames[frame],displaySize=bodyHeight*siren.cellSize/siren.idleHeight;
        return {frame,displaySize,originX:.5,originY:pose.baseline/siren.cellSize-footOffset/displaySize,
            bodyWidth:(siren.frames[0].bounds[2]-siren.frames[0].bounds[0])*bodyHeight/siren.idleHeight};
    }
    if(key==='kite'){
        const frame=enemyActionPose(state),pose=kite.frames[frame];
        return {frame,displaySize:bodyHeight*kite.cellSize/kite.idleHeight,
            originX:pose.centre[0]/kite.cellSize,originY:pose.centre[1]/kite.cellSize,bodyWidth:kite.flightBodyWidth};
    }
    const row = enemyActionRows.find(row => row.key === key)!;
    const pose = enemyActionPose(state);
    const displaySize = bodyHeight * atlas.cellSize / row.idleHeight;
    return {frame: row.row * atlas.columns + pose, displaySize,
        originX:.5,originY: row.baseline[pose] / atlas.cellSize - footOffset / displaySize,
        bodyWidth: (row.bounds[0][2] - row.bounds[0][0]) * bodyHeight / row.idleHeight};
}

export function actionDefeatKind(key: EnemyActionKey) {
    return ['bandit', 'guard', 'pirate'].includes(key) ? 'human' : ['snake', 'tiger', 'dragon', 'crab', 'siren', 'bat', 'roc'].includes(key) ? 'animal' : 'magic';
}
