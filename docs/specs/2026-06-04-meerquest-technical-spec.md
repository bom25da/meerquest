# MeerQuest 설계 명세

## 플랫폼

- React Native 기반으로 개발한다.
- 초기 개발 및 배포 구조는 Expo 를 사용한다.
- 스마트폰과 태블릿을 모두 지원한다.
- 초기 MVP 는 오프라인에서도 동작할 수 있도록 퀘스트 콘텐츠와 진행 상태를 로컬에
  저장한다.

## 앱 구조

- Expo Router 기반으로 화면을 구성한다.
- TypeScript 를 사용한다.
- Expo 의 splash 설정과 `expo-splash-screen` 을 사용해 초기 화면 노출과 숨김
  타이밍을 제어한다.
- 초기 상태 관리는 Zustand 또는 React state 로 시작한다.
- 퀘스트 콘텐츠는 로컬 JSON 데이터로 관리한다.
- 진행 상태는 AsyncStorage 또는 Expo SecureStore 계열 저장소를 사용한다.
- 서버 연동은 MVP 범위에서 제외하고, 2단계에서 프로필, 진행도, 콘텐츠 API 로
  분리한다.

## 화면 설계

### 라우트

- `Splash`: 앱 초기화와 스플래시 노출을 담당한다.
- `ProfileSelect`: 아이 프로필 선택과 생성 진입점을 제공한다.
- `Home`: 카테고리와 다음 추천 퀘스트를 보여준다.
- `QuestMap`: 카테고리별 단계형 퀘스트 맵을 보여준다.
- `QuestPlay`: 퀘스트 활동을 진행하고, 퀘스트 상태에 맞는 캐릭터 애니메이션을
  보여준다.
- `Reward`: 퀘스트 완료 보상과 미어캣 축하 애니메이션을 보여준다.
- `GuardianDashboard`: 보호자용 진행도 화면을 제공한다.

### 스플래시 화면

Expo 기본 스플래시 설정에는 MeerQuest 로고와 미어캣 캐릭터 이미지를 사용한다. 앱
초기화 중에는 `expo-splash-screen` 으로 자동 숨김을 막고, 로컬 진행 상태와 주요
에셋 준비가 끝난 뒤 스플래시를 숨긴다.

기본 노출 시간은 1.5~2.5초 범위로 유지한다. 초기화가 빠르게 끝나더라도 너무
짧게 깜박이지 않도록 최소 노출 시간을 둔다.

### 스마트폰 레이아웃

스마트폰에서는 한 화면에 하나의 핵심 활동을 크게 보여준다. 퀘스트 화면은 캐릭터
안내, 문제 영역, 선택지 영역을 세로로 배치한다.

### 태블릿 레이아웃

태블릿에서는 같은 기능을 제공하되 레이아웃 밀도를 다르게 적용한다.

- 태블릿 세로: 스마트폰보다 넓은 간격과 큰 그림을 사용한다.
- 태블릿 가로: 왼쪽에는 캐릭터 안내, 오른쪽에는 퀘스트 활동을 배치할 수 있다.
- 버튼과 터치 영역은 아이 손가락 기준으로 충분히 크게 유지한다.
- 태블릿 화면에서도 과도하게 많은 정보를 한 번에 보여주지 않는다.

## 캐릭터 애니메이션 설계

캐릭터 애니메이션은 퀘스트 상태와 피드백 상태에 따라 재생한다. 애니메이션의 목적은
정답/오답을 강하게 평가하는 것이 아니라, 아이와 함께 탐험하는 친구가 반응하는 느낌을
주는 것이다.

### 기본 상태

| state | 용도 | 연출 |
|-------|------|------|
| `burrowGreeting` | 화면 진입 | 땅굴에서 빼꼼 나와 인사 |
| `lookoutIdle` | 대기 | 두 발로 서서 주변을 살핌 |
| `burrowHint` | 힌트 제공 | 땅을 파고 들어갔다가 다시 나와 힌트 |
| `thinkingTogether` | 반복 시도 | 옅은 다크서클, 고개 갸웃, 같이 고민하는 표정 |
| `pawClap` | 정답 | 작은 앞발로 빠르게 박수 |
| `jumpCelebrate` | 퀘스트 완료 | 모래 먼지를 털며 점프 |

### 트리거

- 퀘스트 시작: `burrowGreeting`
- 입력 대기: `lookoutIdle`
- 첫 오답: `lookoutIdle` 에서 고개 갸웃 모션
- 반복 오답 또는 시도 지연: `thinkingTogether`
- 힌트 표시: `burrowHint`
- 정답: `pawClap`
- 퀘스트 완료와 보상 표시: `jumpCelebrate`

`thinkingTogether` 의 다크서클 표현은 아이의 실패를 강조하지 않도록 옅고 귀엽게
표현한다. 화면 문구와 음성도 "우리 같이 생각해보자"처럼 공동 해결의 톤을 유지한다.

## 난이도 진행 설계

퀘스트는 카테고리별로 `level` 1~5를 가진다. 같은 카테고리 안에서 이전 퀘스트를
완료하면 다음 `level` 또는 다음 `order` 의 퀘스트가 열린다.

### 난이도 단계

| level | 목적 | UX 변화 |
|-------|------|---------|
| 1 | 처음 만나는 개념 | 2개 선택지, 강한 그림/음성 힌트 |
| 2 | 구분하기 | 3개 선택지, 짧은 힌트 |
| 3 | 적용하기 | 드래그, 순서 맞추기, 짝 맞추기 |
| 4 | 연결하기 | 2개 활동 연결, 복합 상황 |
| 5 | 도전하기 | 힌트 감소, 스스로 선택 |

### 잠금 해제 규칙

- 각 카테고리의 `level: 1` 첫 퀘스트는 기본으로 열린다.
- 현재 퀘스트를 완료하면 같은 카테고리의 다음 `order` 퀘스트가 열린다.
- 오답이나 재시도만으로 다음 퀘스트를 열지 않는다.
- 재시도 횟수가 많아도 진행을 차단하지 않고, 현재 퀘스트 재도전 또는 이전 단계 복습을
  추천한다.
- 보호자 화면에는 카테고리별 최고 도달 난이도와 복습 추천을 표시한다.

### 계산 함수

- `getUnlockedQuests(profileId, categoryId)`: 완료 기록을 기준으로 열린 퀘스트 목록을
  반환한다.
- `getNextQuest(profileId, categoryId)`: 아이가 다음에 진행할 추천 퀘스트를 반환한다.
- `getHighestCompletedLevel(profileId, categoryId)`: 카테고리별 최고 완료 난이도를
  반환한다.
- `getReviewRecommendation(profileId, categoryId)`: 재시도 횟수가 많은 퀘스트를 복습
  추천으로 반환한다.

## 데이터 모델

### ChildProfile

- id
- name
- age
- avatarId
- createdAt

### Category

- id
- title
- description
- icon
- color

### Quest

- id
- categoryId
- title
- level
- order
- steps
- reward
- unlockCondition

### QuestStep

- id
- type
- difficultyLevel
- instructionText
- instructionAudio
- assets
- choices
- hintPolicy
- feedbackAnimations
- answerRule

### FeedbackAnimation

- trigger
- animationState
- audioCue
- minAttempts
- maxAttempts

### Progress

- profileId
- questId
- status
- attempts
- completedAt
- lastPlayedAt

### CategoryProgress

- profileId
- categoryId
- highestCompletedLevel
- unlockedQuestIds
- recommendedQuestId

### Reward

- id
- type
- title
- asset
- unlockedAt

## 상태와 저장소

- 현재 선택된 아이 프로필은 앱 전역 상태로 관리한다.
- 퀘스트 진행 상태와 보상 획득 상태는 로컬 저장소에 저장한다.
- 퀘스트 콘텐츠는 정적 JSON 또는 TypeScript fixture 로 시작한다.
- 열린 퀘스트, 다음 추천 퀘스트, 최고 도달 난이도는 저장된 `Progress` 를 기준으로
  계산한다.
- 프로필, 진행도, 보상 데이터는 앱 재시작 후에도 유지되어야 한다.

## 에셋

- 캐릭터 이미지는 PNG 또는 Lottie 애니메이션으로 관리한다.
- 미어캣 애니메이션은 `burrowGreeting`, `lookoutIdle`, `burrowHint`,
  `thinkingTogether`, `pawClap`, `jumpCelebrate` 상태 단위로 분리한다.
- 카테고리 아이콘과 보상 스티커는 앱 내 정적 에셋으로 관리한다.
- 음성 안내 파일은 카테고리와 퀘스트 단위로 분리한다.
- 스플래시용 로고와 캐릭터 이미지는 앱 아이콘/브랜드 에셋과 별도로 관리한다.

## 접근성

- 주요 버튼은 큰 터치 영역을 가진다.
- 색상만으로 상태를 구분하지 않고 아이콘과 모양을 함께 사용한다.
- 음성 안내를 기본 제공한다.
- 글자는 짧고 크게 표시한다.
- 오답 피드백은 부정적인 표현을 피하고 다시 시도할 수 있는 안내를 제공한다.
- 반복 오답 시 다크서클 표현을 사용하더라도 아이를 비난하거나 실패자로 보이게 하는
  문구와 조합하지 않는다.

## 테스트 기준

- 앱 실행 시 스플래시 화면이 먼저 표시되고, 초기화 후 프로필 선택 화면으로 전환되어야
  한다.
- 스마트폰 화면에서 주요 퀘스트를 터치로 완료할 수 있어야 한다.
- 태블릿 세로/가로 화면에서 텍스트와 버튼이 겹치지 않아야 한다.
- 퀘스트 완료 상태가 앱 재시작 후에도 유지되어야 한다.
- 퀘스트 완료 후 같은 카테고리의 다음 난이도 퀘스트가 열려야 한다.
- 아직 완료 조건을 만족하지 않은 다음 퀘스트는 잠금 상태로 보여야 한다.
- 재시도 횟수가 많은 퀘스트는 보호자 화면의 복습 추천에 포함되어야 한다.
- 오답 선택 시에도 아이에게 부정적인 메시지가 표시되지 않아야 한다.
- 반복 시도 상태에서는 `thinkingTogether` 애니메이션이 표시되고, 힌트 제공 시
  `burrowHint` 애니메이션으로 전환되어야 한다.
- 정답과 보상 상태에서는 `pawClap` 또는 `jumpCelebrate` 애니메이션이 표시되어야 한다.
- 보호자 화면에는 카테고리별 진행률이 정확히 표시되어야 한다.

## 구현 전 확정된 방향

- 플랫폼은 Expo 기반 React Native 로 시작한다.
- 첫 버전은 스마트폰과 태블릿을 모두 지원한다.
- 대상 연령은 미취학아동으로 한정한다.
- 캐릭터는 첨부 레퍼런스와 같은 친근한 미어캣 교육 캐릭터 방향으로 잡는다.
- 캐릭터 애니메이션은 땅굴, 빼꼼 등장, 앞발 박수, 같이 고민하는 표정처럼 미어캣의
  특징을 살린다.
- 앱 실행 시 MeerQuest 로고와 미어캣 캐릭터가 포함된 스플래시 화면을 제공한다.
- 퀘스트는 카테고리별 1~5단계 난이도로 구성하고, 완료에 따라 다음 단계가 열린다.
- MVP 는 로컬 데이터 기반으로 시작한다.
- 서버 연동은 MVP 이후 2단계 범위로 분리한다.
