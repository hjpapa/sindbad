import atlas from './enemy-actions.generated.json' with {type:'json'};

export type EnemyActionKey = 'skeleton' | 'bandit' | 'guard' | 'pirate' | 'snake' | 'tiger' | 'dragon' | 'crab' | 'stone' | 'kuura';
export type EnemyState = 'idle' | 'telegraph' | 'attack' | 'recover' | 'defeated';
export const enemyActionRows = atlas.rows;

export function enemyActionPose(state: EnemyState) {
    return state === 'telegraph' ? 1 : state === 'attack' ? 2 : state === 'defeated' ? 3 : 0;
}

// Keep the old combat centre and chosen resting foot position, despite transparent
// margins or a crouching pose. Pose changes never move the collision target.
export function enemyActionLayout(key: EnemyActionKey, state: EnemyState, bodyHeight: number, footOffset: number) {
    const row = enemyActionRows.find(row => row.key === key)!;
    const pose = enemyActionPose(state);
    const displaySize = bodyHeight * atlas.cellSize / row.idleHeight;
    return {frame: row.row * atlas.columns + pose, displaySize,
        originY: row.baseline[pose] / atlas.cellSize - footOffset / displaySize,
        bodyWidth: (row.bounds[0][2] - row.bounds[0][0]) * bodyHeight / row.idleHeight};
}

export function actionDefeatKind(key: EnemyActionKey) {
    return ['bandit', 'guard', 'pirate'].includes(key) ? 'human' : ['snake', 'tiger', 'dragon', 'crab'].includes(key) ? 'animal' : 'magic';
}
