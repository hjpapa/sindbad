import type { StoryMechanic } from '../core/storyMechanics';

const rotate = (target: number, symbol: string): StoryMechanic => ({type:'rotate', target, symbol});
const carry = (distance=130): StoryMechanic => ({type:'carry',distance});
const channel = (symbol:string, duration=900): StoryMechanic => ({type:'channel',duration,symbol});
const memory = (text:string): StoryMechanic => ({type:'memory',text});

// Authored devices rather than a stage-number-derived random layout.
export const storyDevices: Record<string, StoryMechanic[]> = {
 S09:[channel('깃털 봉인'),channel('바람 봉인'),channel('둥지 봉인')],
 S11:[rotate(1,'반사석'),rotate(2,'반사석'),rotate(3,'반사석'),channel('상승 바람')],
 S12:[channel('독 분출구'),channel('독 분출구'),rotate(1,'정화 바람')],
 S13:[carry(),carry(),carry(),memory('하미드: 지붕을 고쳐 주었군! 오늘은 여기서 쉬어 가게.'),memory('마진: 모험가도 밥 먹고 자야 힘을 쓰지. 따뜻한 식사를 준비했어.')],
 S14:[memory('장부에는 빼돌린 물품과 촌장의 이름이 남아 있어요.'),memory('검은 표식이 창고와 수레에서 똑같이 발견됐어요.'),memory('열쇠로 갇힌 주민을 구했어요. 경비대에 증거를 전달하세요.'),channel('증거 공개')],
 S15:[channel('선원 철창'),rotate(2,'도르래'),channel('선원 철창'),rotate(1,'뗏목 도르래')],
 S16:[rotate(1,'소라'),rotate(2,'진주'),rotate(3,'산호'),channel('수영 훈련')],
 S17:[channel('철창'),channel('철창'),channel('철창'),rotate(2,'선장실 열쇠')],
 S18:[carry(100),channel('화약고 봉인'),rotate(1,'선장실')],
 S19:[{type:'treasure',item:'T02',symbol:'진실의 계단'},{type:'treasure',item:'T02',symbol:'진실의 계단'},{type:'treasure',item:'T02',symbol:'진실의 계단'}],
 S20:[{type:'treasure',item:'T01',symbol:'덩굴 점화'},memory('작은 발자국은 안전한 나무 다리로 이어져요.'),memory('큰 발자국은 뱀의 계곡으로 이어져요.'),memory('나뭇가지에 항해 표식을 남겼어요.'),channel('야영지 등불')],
 S21:[rotate(1,'뱀 문양'),rotate(3,'기둥 문양'),rotate(2,'빛 문양')],
 S22:[channel('바위 북'),channel('바위 북'),{type:'treasure',item:'T02',symbol:'저주 띠'}],
 S23:[channel('맑은 종'),channel('맑은 종'),channel('맑은 종')],
 S24:[rotate(2,'보호막 장치'),rotate(1,'보호막 장치')],
 S25:[carry(100),carry(140),carry(110),channel('달빛 다리')],
 S26:[channel('달빛 다리'),rotate(1,'물길 장치'),rotate(3,'별빛 출구')],
 S27:[carry(150),carry(120),carry(170),memory('미라: 여행자를 돕는 길은 서로 이어져 있어요. 신전에서 이 추천서를 보여 주세요.')],
 S28:[rotate(1,'연꽃'),rotate(2,'소라'),rotate(3,'원형 문양')],
 S29:[rotate(1,'덫 잠금'),rotate(2,'덫 잠금'),rotate(3,'덫 잠금'),rotate(1,'덫 잠금'),channel('아기 코끼리 구조',1200)],
 S30:Array.from({length:7},(_,i)=>({type:'treasure' as const,item:`T0${i+1}`,symbol:['불씨 점화','진실의 빛','깃털 바람','진주의 물결','방울 다리','연꽃 보호','새벽 정화'][i]})),
 S31:[channel('봉인석'),channel('봉인석'),channel('아리아나의 보호 결계')],
 S32:[rotate(1,'아리아나의 별'),rotate(3,'아리아나의 별'),rotate(2,'아리아나의 별'),channel('두 사람의 빛',1400)],
 S34:[memory('아리아나: 새 지도에는 나이라의 궁전과 로크의 둥지도 표시할게요.'),memory('일곱 보물은 길을 밝히고 친구들을 지킨 방법들이에요.'),memory('왕: 무사히 돌아와 다행이구나. 이웃들의 이야기도 함께 들려다오.')],
 S35:[carry(110),channel('축제 음악'),carry(140)],
 S36:[memory('항해 전시 ① · 나이라와 불꽃 수호자, 지니와 로크새가 길을 이어 주었어요.'),memory('항해 전시 ② · 하미드와 마진, 바루와 미라. 친구들의 편지가 전시됐어요.'),memory('항해 전시 ③ · 구한 동물들과 평온한 신전. 보물보다 소중한 도움의 기록이에요.'),memory('아리아나: 이번 지도에는 우리가 도운 친구들도 표시해요. 신밧드: 가장 값진 보물은 함께 돌아온 이야기였군요.')],
};

// Optional upper routes use low steps, keeping the main route forgiving.
export const storyLedges:Record<string,number[][]>={
 S09:[[610,536,180],[820,464,180]], S11:[[620,536,180],[840,464,180],[1080,392,180]],
 S12:[[620,544,200],[1880,528,220]],S13:[[600,548,240],[1750,536,240]],
 S14:[[670,536,180],[880,464,180]], S15:[[530,536,200],[760,464,220],[1010,392,180]],
 S16:[[660,536,220],[1840,520,220]],S17:[[610,536,220],[1850,464,220]],
 S18:[[650,536,180],[860,464,200]],S19:[[630,536,180],[840,464,180],[1050,392,180]],
 S20:[[510,536,180],[720,464,180],[1640,536,240]],S21:[[650,536,240],[1780,536,240]],
 S22:[[670,536,240],[1650,520,240]],S23:[[680,560,220],[1600,552,220]],
 S24:[[600,536,240],[1700,536,240]],S25:[[650,536,240],[1800,536,240]],
 S26:[[650,536,220],[1720,512,220]],S27:[[630,548,220],[1650,536,220]],
 S28:[[650,560,220],[1620,544,220]],S29:[[590,536,180],[800,464,180],[1720,536,220]],
 S30:[[620,536,180],[840,464,180]],S31:[[540,536,200],[1770,536,240]],
 S32:[[610,536,220],[1730,536,220]],S34:[[580,560,220]],S35:[[570,552,240]],S36:[[580,560,220],[1720,544,220]],
};
