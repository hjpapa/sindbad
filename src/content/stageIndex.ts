import raw from './campaign.json' with { type: 'json' };
export interface StageRegistration {
    id: string;
    title: string;
    chapter: number;
    childSceneRefs: string[];
    status: 'planned' | 'implemented' | 'verified';
    artStatus: string;
    nextStageId: string | null;
    entryItems: string[];
    entryFlags: string[];
    rewardId: string;
    clearXp: number;
    mandatoryItems: string[];
    optionalItems: string[];
    rewardFlags: string[];
    flow: string;
    clearDescription: string;
    rewardDescription: string;
    optionalDescription: string;
    safety: string;
}
const campaign: StageRegistration[] = raw as StageRegistration[];
export default campaign;
