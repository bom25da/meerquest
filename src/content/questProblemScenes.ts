import type { QuestCategoryId } from '@/src/content/categories';

export type QuestProblemSceneLayout = 'compare' | 'count' | 'sequence' | 'story';

export type QuestProblemSceneItemKind =
  | 'action'
  | 'character'
  | 'count'
  | 'danger'
  | 'emotion'
  | 'object'
  | 'path'
  | 'place'
  | 'safe'
  | 'sequence'
  | 'shape';

export interface QuestProblemSceneItem {
  id: string;
  kind: QuestProblemSceneItemKind;
  label: string;
  count?: number;
  detail?: string;
  role?: 'answer' | 'danger' | 'safe';
  size?: 'large' | 'medium' | 'small';
  values?: string[];
}

export interface QuestProblemScene {
  categoryId: QuestCategoryId;
  items: QuestProblemSceneItem[];
  layout: QuestProblemSceneLayout;
  summary: string;
}

const item = (
  id: string,
  kind: QuestProblemSceneItemKind,
  label: string,
  options: Omit<QuestProblemSceneItem, 'id' | 'kind' | 'label'> = {},
): QuestProblemSceneItem => ({ id, kind, label, ...options });

const scene = (
  categoryId: QuestCategoryId,
  summary: string,
  layout: QuestProblemSceneLayout,
  items: QuestProblemSceneItem[],
): QuestProblemScene => ({ categoryId, summary, layout, items });

export const questProblemScenes: Record<string, QuestProblemScene> = {
  'math-11': scene('math', '짧은 돌길과 더 멀리 이어지는 긴 돌길', 'compare', [
    item('short-path', 'path', '짧은 돌길', { size: 'small' }),
    item('long-path', 'path', '긴 돌길', { role: 'answer', size: 'large' }),
    item('meero', 'character', '미어로가 길을 살펴봐요'),
  ]),
  'math-12': scene('math', '조약돌 5개에서 하나를 빼고 남은 4개', 'count', [
    item('before', 'count', '조약돌 5개', { count: 5 }),
    item('minus', 'object', '주머니에 1개'),
    item('after', 'count', '남은 4개', { count: 4, role: 'answer' }),
  ]),
  'math-13': scene('math', '숫자가 새겨진 문양과 같은 숫자 돌', 'sequence', [
    item('wall', 'object', '숫자 문양', { role: 'answer' }),
    item('choices', 'sequence', '같은 수 찾기', { values: ['6', '9', '10'] }),
  ]),
  'math-14': scene('math', '보석 3개 묶음과 2개 묶음을 합치는 장면', 'count', [
    item('first', 'count', '보석 3개', { count: 3 }),
    item('second', 'count', '보석 2개', { count: 2 }),
    item('total', 'count', '모두 5개', { count: 5, role: 'answer' }),
  ]),
  'math-15': scene('math', '숫자 3, 7, 5가 새겨진 돌 중 가장 큰 7', 'sequence', [
    item('numbers', 'sequence', '숫자 돌멩이', { values: ['3', '7', '5'] }),
    item('answer', 'object', '가장 큰 수 7', { role: 'answer' }),
  ]),
  'math-16': scene('math', '4, 5 다음에 6을 놓는 숫자 돌길', 'sequence', [
    item('path', 'sequence', '4, 5, 다음 수', { values: ['4', '5', '?'] }),
    item('answer', 'object', '다음은 6', { role: 'answer' }),
  ]),
  'math-17': scene('math', '조약돌 4개를 미어로와 친구가 똑같이 나누는 장면', 'count', [
    item('stones', 'count', '조약돌 4개', { count: 4 }),
    item('meero', 'character', '미어로 2개', { role: 'answer' }),
    item('friend', 'character', '친구 2개', { role: 'answer' }),
  ]),
  'math-18': scene('math', '숫자 길의 빈칸에서 9를 찾는 장면', 'sequence', [
    item('sequence', 'sequence', '숫자 길', { values: ['7', '8', '?', '10'] }),
    item('answer', 'object', '빈칸은 9', { role: 'answer' }),
  ]),
  'math-19': scene('math', '보석 6개에 새 보석 2개를 더해 8개가 되는 장면', 'count', [
    item('before', 'count', '보석 6개', { count: 6 }),
    item('more', 'count', '새 보석 2개', { count: 2 }),
    item('total', 'count', '모두 8개', { count: 8, role: 'answer' }),
  ]),
  'math-20': scene('math', '10에서 두 걸음을 더 세어 20에 도착하는 발자국 길', 'sequence', [
    item('start', 'sequence', '10에서 두 걸음', { values: ['10', '두 걸음', '20'] }),
    item('goal', 'object', '20번째 발자국', { role: 'answer' }),
  ]),

  'language-6': scene('language', '큰 바위와 작은 조약돌을 보고 작다를 말하는 장면', 'compare', [
    item('big', 'object', '큰 바위', { size: 'large' }),
    item('small', 'object', '작은 조약돌', { role: 'answer', size: 'small' }),
  ]),
  'language-7': scene('language', '바나나와 같은 바 소리로 시작하는 바람', 'story', [
    item('banana', 'object', '바나나'),
    item('wind', 'object', '바람', { role: 'answer' }),
    item('mouth', 'action', '바 소리'),
  ]),
  'language-8': scene('language', '폴짝폴짝 뛰는 움직임을 고르는 장면', 'story', [
    item('meero', 'character', '미어로가 폴짝'),
    item('jump', 'action', '뛰어요', { role: 'answer' }),
  ]),
  'language-9': scene('language', '새 장난감을 받고 활짝 웃는 장면', 'story', [
    item('toy', 'object', '새 장난감'),
    item('happy', 'emotion', '기뻐요', { role: 'answer' }),
  ]),
  'language-10': scene('language', '긴 귀와 깡충 뛰는 토끼를 떠올리는 장면', 'story', [
    item('ears', 'object', '긴 귀'),
    item('rabbit', 'object', '토끼', { role: 'answer' }),
    item('jump', 'action', '깡충깡충'),
  ]),
  'language-11': scene('language', '비 오는 날 머리 위에 우산을 쓰는 장면', 'story', [
    item('rain', 'object', '빗방울'),
    item('umbrella', 'object', '우산', { role: 'answer' }),
  ]),
  'language-12': scene('language', '손을 씻은 뒤 수건으로 닦는 순서', 'sequence', [
    item('wash', 'action', '손 씻기'),
    item('dry', 'action', '수건으로 닦기', { role: 'answer' }),
  ]),
  'language-13': scene('language', '친구 그림을 보고 멋지다고 말하는 장면', 'story', [
    item('drawing', 'object', '친구 그림'),
    item('nice', 'action', '멋지다', { role: 'answer' }),
  ]),
  'language-14': scene('language', '책이 많은 조용한 도서관 장면', 'story', [
    item('books', 'object', '책 여러 권'),
    item('library', 'place', '도서관', { role: 'answer' }),
  ]),
  'language-15': scene('language', '시계 바늘이 째깍째깍 움직이는 장면', 'story', [
    item('clock', 'object', '시계'),
    item('tick', 'action', '째깍째깍', { role: 'answer' }),
  ]),
  'language-16': scene('language', '맑은 하늘처럼 파란 색을 고르는 장면', 'story', [
    item('sky', 'object', '맑은 하늘'),
    item('blue', 'object', '파랑', { role: 'answer' }),
  ]),
  'language-17': scene('language', '친구에게 부드럽게 부탁하는 말풍선', 'story', [
    item('friend', 'character', '친구'),
    item('please', 'action', '해줄래?', { role: 'answer' }),
  ]),
  'language-18': scene('language', '넘어진 아이를 선생님이 도와주는 장면', 'story', [
    item('child', 'character', '넘어진 아이'),
    item('teacher', 'safe', '선생님', { role: 'answer' }),
  ]),
  'language-19': scene('language', '빠르게 움직이는 모습과 재빠르다 말', 'story', [
    item('fast', 'action', '빠르다'),
    item('quick', 'action', '재빠르다', { role: 'answer' }),
  ]),
  'language-20': scene('language', '친구와 헤어질 때 손을 흔들며 인사하는 장면', 'story', [
    item('friends', 'character', '친구'),
    item('bye', 'action', '잘 가', { role: 'answer' }),
  ]),

  'social-4': scene('social', '친구 블록을 무너뜨린 뒤 미안해를 전하는 장면', 'story', [
    item('blocks', 'object', '무너진 블록'),
    item('sorry', 'action', '미안해', { role: 'answer' }),
  ]),
  'social-5': scene('social', '슬픈 친구에게 괜찮아 하고 묻는 장면', 'story', [
    item('sad-friend', 'emotion', '슬픈 친구'),
    item('comfort', 'safe', '괜찮아?', { role: 'answer' }),
  ]),
  'social-6': scene('social', '눈물을 글썽이는 친구의 슬픈 마음', 'story', [
    item('tears', 'emotion', '눈물'),
    item('sad', 'emotion', '슬퍼요', { role: 'answer' }),
  ]),
  'social-7': scene('social', '친구와 블록을 같이 만들자고 초대하는 장면', 'story', [
    item('blocks', 'object', '블록 놀이'),
    item('invite', 'action', '같이 만들자', { role: 'answer' }),
  ]),
  'social-8': scene('social', '화가 날 때 천천히 숨 쉬는 장면', 'story', [
    item('angry', 'emotion', '화가 나요'),
    item('breathe', 'safe', '천천히 숨', { role: 'answer' }),
  ]),
  'social-9': scene('social', '높은 블록을 올리기 어려워 도움을 부탁하는 장면', 'story', [
    item('tower', 'object', '높은 블록'),
    item('help', 'action', '도와줄래?', { role: 'answer' }),
  ]),
  'social-10': scene('social', '친구 이야기를 귀 기울여 듣는 장면', 'story', [
    item('friend-talk', 'character', '말하는 친구'),
    item('listen', 'safe', '귀 기울여요', { role: 'answer' }),
  ]),
  'social-11': scene('social', '색연필 하나를 둘이 번갈아 쓰는 장면', 'sequence', [
    item('pencil', 'object', '색연필 하나'),
    item('turns', 'sequence', '번갈아 쓰기', { role: 'answer', values: ['내 차례', '친구 차례'] }),
  ]),
  'social-12': scene('social', '친구가 퍼즐을 완성해서 칭찬하는 장면', 'story', [
    item('puzzle', 'object', '완성 퍼즐'),
    item('praise', 'action', '정말 잘했어', { role: 'answer' }),
  ]),
  'social-13': scene('social', '흩어진 장난감을 함께 정리하는 장면', 'story', [
    item('toys', 'object', '흩어진 장난감'),
    item('clean', 'safe', '함께 정리', { role: 'answer' }),
  ]),
  'social-14': scene('social', '새 친구를 안녕 같이 놀자 하고 맞이하는 장면', 'story', [
    item('new-friend', 'character', '새 친구'),
    item('welcome', 'action', '같이 놀자', { role: 'answer' }),
  ]),
  'social-15': scene('social', '급한 친구에게 먼저 물을 마시게 양보하는 장면', 'story', [
    item('water', 'object', '물컵'),
    item('yield', 'safe', '먼저 마셔', { role: 'answer' }),
  ]),
  'social-16': scene('social', '내 그림을 가져간 친구에게 돌려달라고 말하는 장면', 'story', [
    item('drawing', 'object', '내 그림'),
    item('say-feeling', 'action', '돌려주면 좋겠어', { role: 'answer' }),
  ]),
  'social-17': scene('social', '게임에서 내 차례를 기다리는 장면', 'sequence', [
    item('game', 'object', '놀이 게임'),
    item('wait-turn', 'safe', '차례 기다리기', { role: 'answer' }),
  ]),
  'social-18': scene('social', '무너진 친구의 탑을 다시 해보자고 위로하는 장면', 'story', [
    item('tower', 'object', '무너진 탑'),
    item('comfort', 'safe', '다시 해보자', { role: 'answer' }),
  ]),
  'social-19': scene('social', '줄을 서서 차례대로 기다리는 장면', 'sequence', [
    item('line', 'sequence', '줄서기', { values: ['1', '2', '3'] }),
    item('stand', 'safe', '차례대로 서요', { role: 'answer' }),
  ]),
  'social-20': scene('social', '다툰 뒤 우리 화해하자고 말하는 장면', 'story', [
    item('friends', 'character', '다툰 친구들'),
    item('make-up', 'safe', '우리 화해하자', { role: 'answer' }),
  ]),

  'safety-1': scene('safety', '빨간불 앞에서 멈춰 서는 장면', 'story', [
    item('red-light', 'danger', '빨간불'),
    item('stop', 'safe', '멈춰요', { role: 'answer' }),
  ]),
  'safety-2': scene('safety', '김이 나는 냄비를 보고 어른에게 말하는 장면', 'story', [
    item('pot', 'danger', '뜨거운 냄비'),
    item('adult', 'safe', '어른에게 말해요', { role: 'answer' }),
  ]),
  'safety-3': scene('safety', '낯선 사람이 부를 때 믿는 어른에게 알리는 장면', 'story', [
    item('stranger', 'danger', '낯선 사람'),
    item('trusted-adult', 'safe', '믿는 어른', { role: 'answer' }),
  ]),
  'safety-4': scene('safety', '불이 났을 때 출구로 대피하는 장면', 'story', [
    item('fire', 'danger', '불'),
    item('exit', 'safe', '밖으로 나가요', { role: 'answer' }),
  ]),
  'safety-5': scene('safety', '전화번호를 물어볼 때 보호자에게 확인하는 장면', 'story', [
    item('phone', 'danger', '전화번호 질문'),
    item('guardian', 'safe', '보호자에게 물어봐요', { role: 'answer' }),
  ]),
  'safety-6': scene('safety', '차도로 굴러간 공을 어른에게 말하는 장면', 'story', [
    item('road-ball', 'danger', '차도의 공'),
    item('adult', 'safe', '어른에게 말해요', { role: 'answer' }),
  ]),
  'safety-7': scene('safety', '계단 손잡이를 잡고 천천히 내려가는 장면', 'story', [
    item('stairs', 'object', '계단'),
    item('rail', 'safe', '손잡이를 잡아요', { role: 'answer' }),
  ]),
  'safety-8': scene('safety', '물가에서 어른과 함께 있는 장면', 'story', [
    item('water', 'danger', '물가'),
    item('adult', 'safe', '어른과 함께', { role: 'answer' }),
  ]),
  'safety-9': scene('safety', '콘센트 구멍을 만지지 않고 지나가는 장면', 'story', [
    item('outlet', 'danger', '콘센트'),
    item('leave', 'safe', '만지지 않아요', { role: 'answer' }),
  ]),
  'safety-10': scene('safety', '알약을 보고 보호자에게 물어보는 장면', 'story', [
    item('pill', 'danger', '알약'),
    item('guardian', 'safe', '보호자에게 물어봐요', { role: 'answer' }),
  ]),
  'safety-11': scene('safety', '날카로운 가위를 어른에게 부탁하는 장면', 'story', [
    item('scissors', 'danger', '날카로운 가위'),
    item('adult', 'safe', '어른에게 부탁해요', { role: 'answer' }),
  ]),
  'safety-12': scene('safety', '길을 잃었을 때 그 자리에서 기다리는 장면', 'story', [
    item('lost', 'danger', '보호자가 안 보여요'),
    item('stay', 'safe', '그 자리에서 기다려요', { role: 'answer' }),
  ]),
  'safety-13': scene('safety', '그네에 앉아서 손잡이를 잡고 타는 장면', 'story', [
    item('swing', 'object', '그네'),
    item('sit', 'safe', '앉아서 잡아요', { role: 'answer' }),
  ]),
  'safety-14': scene('safety', '작은 구슬을 입에 넣지 않는 장면', 'story', [
    item('marble', 'danger', '작은 구슬'),
    item('no-mouth', 'safe', '입에 넣지 않아요', { role: 'answer' }),
  ]),
  'safety-15': scene('safety', '문틈에서 손을 빼는 장면', 'story', [
    item('door-gap', 'danger', '닫히는 문'),
    item('away', 'safe', '손을 빼요', { role: 'answer' }),
  ]),
  'safety-16': scene('safety', '처음 보는 강아지는 주인에게 먼저 물어보는 장면', 'story', [
    item('dog', 'object', '처음 보는 강아지'),
    item('owner', 'safe', '주인에게 물어봐요', { role: 'answer' }),
  ]),
  'safety-17': scene('safety', '간식을 천천히 씹어 먹는 장면', 'story', [
    item('snack', 'object', '간식'),
    item('slow', 'safe', '천천히 씹어요', { role: 'answer' }),
  ]),
  'safety-18': scene('safety', '젖은 바닥에서 천천히 걷는 장면', 'story', [
    item('wet-floor', 'danger', '젖은 바닥'),
    item('walk-slow', 'safe', '천천히 걸어요', { role: 'answer' }),
  ]),
  'safety-19': scene('safety', '큰 소리에 놀라 가까운 어른에게 말하는 장면', 'story', [
    item('loud', 'danger', '큰 소리'),
    item('adult', 'safe', '어른에게 말해요', { role: 'answer' }),
  ]),
  'safety-20': scene('safety', '위험해 보이면 멈추고 어른에게 말하는 장면', 'story', [
    item('danger', 'danger', '위험한 상황'),
    item('stop-tell', 'safe', '멈추고 말해요', { role: 'answer' }),
  ]),
};

export function getQuestProblemScene(questId: string, categoryId: QuestCategoryId) {
  return (
    questProblemScenes[questId] ??
    scene(categoryId, `${categoryId} 대표 이미지`, 'story', [
      item('default-1', 'object', '탐험 장면'),
      item('default-2', 'character', '미어로'),
    ])
  );
}
