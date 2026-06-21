import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppText as Text } from '@/src/components/AppText';
import { MeeroDigPeekAnimation } from '@/src/components/quest/MeeroDigPeekAnimation';
import { MeeroThinkAgainAnimation } from '@/src/components/quest/MeeroThinkAgainAnimation';
import { QuestProblemScene } from '@/src/components/quest/QuestProblemScene';
import { QuestScreenFrame } from '@/src/components/quest/QuestScreenFrame';
import { categories, type QuestCategoryId } from '@/src/content/categories';
import { getQuestProblemSceneAsset } from '@/src/content/questProblemSceneAssets';
import { getQuestProblemScene } from '@/src/content/questProblemScenes';
import {
  getQuestStageRect,
  type QuestStageFillLayout,
  type QuestStageSourceRect,
} from '@/src/content/questStageLayout';
import { quests } from '@/src/content/quests';
import {
  getChoiceFeedback,
  getNextIncorrectChoiceIds,
  getQuestContinueAction,
  getQuestResultOverlay,
  isQuestRewardAvailable,
  type QuestResultOverlay,
} from '@/src/features/quests/questPlayFeedback';
import {
  getEarnedStarCount,
  getNextQuest,
  type QuestBackgroundAsset,
  type QuestSoundAsset,
  type QuestStep,
} from '@/src/features/quests/questProgress';
import { useQuestProgress } from '@/src/features/quests/useQuestProgress';
import { supertonic3SpeechService } from '@/src/features/speech/supertonic3Speech';
import { meerQuestSpeechDefaults } from '@/src/features/speech/supertonic3VoiceProfile';
import { colors } from '@/src/theme/colors';

const appleCountScreen = require('../assets/images/quests/apple-count/apple-count-screen.png');
const appleCountApplesImage = require('../assets/images/quests/apple-count/apple-count-meero-apple-tree-v1.png');
const animalSoundSceneImage = require('../assets/images/quests/animal-sound/animal-sound-meero-hill-v1.png');
const bananaFoodSceneImage = require('../assets/images/quests/food-name/food-name-meero-banana-v1.png');
const carrotAdditionSceneImage = require('../assets/images/quests/carrot-addition/carrot-addition-meero-fena-v1.png');
const footprintSequenceSceneImage = require('../assets/images/quests/footprint-sequence/footprint-sequence-cave-trail-v6.png');
const gemCountSceneImage = require('../assets/images/quests/gem-count/gem-count-meero-gems-v1.png');
const giftThanksSceneImage = require('../assets/images/quests/gift-thanks/gift-thanks-meero-fena-v1.png');
const helpThanksSceneImage = require('../assets/images/quests/help-thanks/help-thanks-meero-fena-v3.png');
const happyMeeroEmotionImage = require('../assets/images/quests/emotion-face/emotion-face-meero-happy-v1.png');
const seedStorySceneImage = require('../assets/images/quests/story-sequence/story-sequence-meero-seed-v3.png');
const shapeMatchSceneImage = require('../assets/images/quests/shape-match/shape-match-meero-door-groove-v1.png');
const slideWaitSceneImage = require('../assets/images/quests/slide-wait/slide-wait-fena-meero-v2.png');
const smallNumberSceneImage = require('../assets/images/quests/small-number/small-number-meero-door-buttons-v1.png');
const stoneStackSceneImage = require('../assets/images/quests/stone-stack-addition/stone-stack-addition-meero-pebbles-v1.png');
const toyShareSceneImage = require('../assets/images/quests/toy-share/toy-share-meero-fena-v1.png');
const dogBarkSound = require('../assets/audio/quests/language-1/language-1-dog-bark-v1.mp3');
const categorySafetyBackground = require('../assets/images/home/category-safety-background.png');
const languageHillBackground = require('../assets/images/home/category-language-background.png');
const mathCaveBackground = require('../assets/images/quests/math-cave-background.png');
const socialPlaygroundBackground = require('../assets/images/home/category-social-background.png');
const shapeFindDoorImage = require('../assets/images/quests/shape-find/shape-find-meero-door-v1.png');
const patternPathStonesImage = require('../assets/images/quests/pattern-path/pattern-path-meero-crossing-v1.png');
const sizeCompareHolesImage = require('../assets/images/quests/size-compare/size-compare-meero-holes-v2.png');

const questBackgroundSources: Record<QuestBackgroundAsset, number> = {
  'language-hill-background': languageHillBackground,
  'math-cave-background': mathCaveBackground,
  'social-playground-background': socialPlaygroundBackground,
};

const questSoundSources: Record<QuestSoundAsset, number> = {
  'dog-bark': dogBarkSound,
};

const initialFeedbackMessage = '미어로가 땅굴에서 빼꼼 나와 기다려요.';

export default function QuestPlayScreen() {
  const { questId } = useLocalSearchParams<{ questId?: string }>();
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const { isLoaded, profileProgress, recordAttempt } = useQuestProgress();
  const [feedbackMessage, setFeedbackMessage] = useState(initialFeedbackMessage);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [incorrectChoiceIds, setIncorrectChoiceIds] = useState<string[]>([]);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const quest = useMemo(() => {
    const requestedQuest = quests.find((item) => item.id === questId);

    if (requestedQuest) {
      return requestedQuest;
    }

    return (
      categories
        .map((category) =>
          getNextQuest({
            categoryId: category.id,
            quests,
            progress: profileProgress,
          }),
        )
        .find((item) => item !== null) ?? quests[0]
    );
  }, [profileProgress, questId]);
  const category = categories.find((item) => item.id === quest.categoryId);
  const totalSteps = quest.steps.length;
  const step = quest.steps[stepIndex] ?? quest.steps[0];
  const questTitle = `${(category?.title ?? '탐험 지역').replace(/\s+/g, '')} ${quest.level}단계`;
  const earnedStars = getEarnedStarCount({ quests, progress: profileProgress });
  const continueAction = getQuestContinueAction({
    currentStepIndex: stepIndex,
    isStepComplete,
    totalSteps,
  });
  const resultOverlay = getQuestResultOverlay({
    continueAction,
    feedbackMessage,
    isStepComplete,
    selectedChoiceId,
  });
  const isNextAvailable = continueAction !== 'blocked';
  const rewardAvailable = isQuestRewardAvailable(isCompleted);
  const soundPressHandler = handleSoundPress;

  useEffect(() => {
    setFeedbackMessage(initialFeedbackMessage);
    setStepIndex(0);
    setSelectedChoiceId(null);
    setIncorrectChoiceIds([]);
    setIsStepComplete(false);
    setIsCompleted(false);
  }, [quest.id]);

  const handleChoicePress = async (choiceId: string) => {
    if (!isLoaded || isStepComplete || isCompleted || incorrectChoiceIds.includes(choiceId)) {
      return;
    }

    const answeredCorrectly = choiceId === step.correctChoiceId;
    const isFinalCorrectAnswer = answeredCorrectly && stepIndex >= totalSteps - 1;
    const nextProgress = await recordAttempt(quest.id, isFinalCorrectAnswer);
    const attempts = nextProgress?.attempts ?? 1;

    setSelectedChoiceId(choiceId);
    const feedback = getChoiceFeedback({
      answeredCorrectly,
      attempts,
      hintText: step.hintText,
      successMessage: step.successMessage,
    });

    setFeedbackMessage(feedback.feedbackMessage);

    if (feedback.isCompleted) {
      setIsStepComplete(true);

      if (isFinalCorrectAnswer) {
        setIsCompleted(true);
      }

      return;
    }

    setIncorrectChoiceIds((currentChoiceIds) =>
      getNextIncorrectChoiceIds({
        answeredCorrectly,
        choiceId,
        incorrectChoiceIds: currentChoiceIds,
      }),
    );
  };

  const handleRewardPress = () => {
    if (rewardAvailable) {
      router.push(`/reward?questId=${quest.id}` as Href);
    }
  };

  async function handleSoundPress() {
    if (step.soundAsset) {
      const didPlaySound = await playOptionalQuestSound(step.soundAsset);

      if (!didPlaySound) {
        setFeedbackMessage('소리 기능은 앱을 새로 설치한 뒤 들을 수 있어요.');
      }
      return;
    }

    const result = await supertonic3SpeechService.speakText(step.instructionText, {
      ...meerQuestSpeechDefaults,
    });

    if (result.status === 'unavailable') {
      setFeedbackMessage('미어로 목소리를 준비한 뒤 들을 수 있어요.');
    }
  }

  const handleContinue = () => {
    if (continueAction === 'blocked') {
      return;
    }

    if (continueAction === 'reward') {
      router.push(`/reward?questId=${quest.id}` as Href);
      return;
    }

    setFeedbackMessage('좋아, 다음 문제도 살펴보자.');
    setSelectedChoiceId(null);
    setIncorrectChoiceIds([]);
    setIsStepComplete(false);
    setStepIndex((currentStepIndex) => Math.min(currentStepIndex + 1, totalSteps - 1));
  };

  const handleRetry = () => {
    setSelectedChoiceId(null);
  };

  const handleResultOverlayPress = () => {
    if (!resultOverlay) {
      return;
    }

    if (resultOverlay.tone === 'retry') {
      handleRetry();
      return;
    }

    handleContinue();
  };

  if (quest.visualLayout === 'apple-count') {
    return (
      <AppleCountQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : appleCountScreen
        }
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'carrot-addition') {
    return (
      <AppleCountQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : mathCaveBackground
        }
        choiceDots={carrotAdditionChoiceDots}
        choiceRects={carrotAdditionChoiceRects}
        fallbackChoiceRect={carrotAdditionFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        promptRect={carrotAdditionPromptRect}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 당근 2개를 들고 있고 페나가 당근 1개를 건네주는 장면"
        sceneImageRect={carrotAdditionSceneImageRect}
        sceneSource={carrotAdditionSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'gem-count') {
    return (
      <AppleCountQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : mathCaveBackground
        }
        choiceDots={gemCountChoiceDots}
        choiceRects={gemCountChoiceRects}
        fallbackChoiceRect={gemCountFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        promptRect={gemCountPromptRect}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 반짝이는 보석을 바라보는 장면"
        sceneImageRect={gemCountSceneImageRect}
        sceneSource={gemCountSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'small-number') {
    return (
      <AppleCountQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : mathCaveBackground
        }
        choiceDots={smallNumberChoiceDots}
        choiceRects={smallNumberChoiceRects}
        fallbackChoiceRect={smallNumberFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        promptRect={smallNumberPromptRect}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 숫자 2와 5 버튼이 달린 동굴 문을 바라보는 장면"
        sceneImageRect={smallNumberSceneImageRect}
        sceneSource={smallNumberSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'stone-stack-addition') {
    return (
      <AppleCountQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : mathCaveBackground
        }
        choiceDots={stoneStackChoiceDots}
        choiceRects={stoneStackChoiceRects}
        fallbackChoiceRect={stoneStackFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        promptRect={stoneStackPromptRect}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 조약돌 4개 위에 조약돌 1개를 더 쌓으려는 장면"
        sceneImageRect={stoneStackSceneImageRect}
        sceneSource={stoneStackSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'shape-match') {
    return (
      <AppleCountQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : mathCaveBackground
        }
        choiceDots={shapeMatchChoiceDots}
        choiceRects={shapeMatchChoiceRects}
        fallbackChoiceRect={shapeMatchFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        promptRect={shapeMatchPromptRect}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 동굴 문의 동그라미 홈에 같은 모양 조각을 맞추려는 장면"
        sceneImageRect={shapeMatchSceneImageRect}
        sceneSource={shapeMatchSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'footprint-sequence') {
    return (
      <AppleCountQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : mathCaveBackground
        }
        choiceDots={footprintSequenceChoiceDots}
        choiceRects={footprintSequenceChoiceRects}
        fallbackChoiceRect={footprintSequenceFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        promptRect={footprintSequencePromptRect}
        questTitle={questTitle}
        renderSceneOverlay={renderFootprintSequenceOverlay}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 숫자 발자국 길의 마지막 빈칸을 바라보는 장면"
        sceneImageRect={footprintSequenceSceneImageRect}
        sceneSource={footprintSequenceSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'animal-sound') {
    return (
      <AnimalSoundQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : languageHillBackground
        }
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'food-name') {
    return (
      <AnimalSoundQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : languageHillBackground
        }
        choiceRects={foodNameChoiceRects}
        fallbackChoiceRect={foodNameFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 바나나를 먹고 있는 장면"
        sceneImageRect={foodNameSceneImageRect}
        sceneSource={bananaFoodSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'story-sequence') {
    return (
      <AnimalSoundQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : languageHillBackground
        }
        choiceRects={storySequenceChoiceRects}
        fallbackChoiceRect={storySequenceFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 씨앗을 심고 물을 주는 2컷 만화"
        sceneImageRect={storySequenceSceneImageRect}
        sceneSource={seedStorySceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'emotion-face') {
    return (
      <AnimalSoundQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : languageHillBackground
        }
        choiceRects={emotionFaceChoiceRects}
        fallbackChoiceRect={emotionFaceFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 활짝 웃는 표정을 짓는 장면"
        sceneImageRect={emotionFaceSceneImageRect}
        sceneSource={happyMeeroEmotionImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'gift-thanks') {
    return (
      <AnimalSoundQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : languageHillBackground
        }
        choiceRects={giftThanksChoiceRects}
        fallbackChoiceRect={giftThanksFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="페나가 미어로에게 선물을 건네는 장면"
        sceneImageRect={giftThanksSceneImageRect}
        sceneSource={giftThanksSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'toy-share') {
    return (
      <AnimalSoundQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : socialPlaygroundBackground
        }
        choiceRects={toyShareChoiceRects}
        fallbackChoiceRect={toyShareFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="페나가 미어로에게 장난감을 빌려주는 장면"
        sceneImageRect={toyShareSceneImageRect}
        sceneSource={toyShareSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'help-thanks') {
    return (
      <AnimalSoundQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : socialPlaygroundBackground
        }
        choiceRects={helpThanksChoiceRects}
        fallbackChoiceRect={helpThanksFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="미어로가 페나의 짐을 들어주는 장면"
        sceneImageRect={helpThanksSceneImageRect}
        sceneSource={helpThanksSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'slide-wait') {
    return (
      <AnimalSoundQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : socialPlaygroundBackground
        }
        choiceRects={slideWaitChoiceRects}
        fallbackChoiceRect={slideWaitFallbackChoiceRect}
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        sceneAccessibilityLabel="페나가 미끄럼틀을 타려고 하고 미어로가 뒤에서 기다리는 장면"
        sceneImageRect={slideWaitSceneImageRect}
        sceneSource={slideWaitSceneImage}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'shape-find') {
    return (
      <ShapeFindQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : mathCaveBackground
        }
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'pattern-path') {
    return (
      <PatternPathQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : mathCaveBackground
        }
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  if (quest.visualLayout === 'size-compare') {
    return (
      <SizeCompareQuestScreen
        backgroundSource={
          quest.backgroundAsset ? questBackgroundSources[quest.backgroundAsset] : mathCaveBackground
        }
        height={height}
        isCompleted={isCompleted}
        isLoaded={isLoaded}
        incorrectChoiceIds={incorrectChoiceIds}
        isRewardAvailable={rewardAvailable}
        isNextAvailable={isNextAvailable}
        isStepComplete={isStepComplete}
        onBack={() => router.back()}
        onChoicePress={handleChoicePress}
        onContinue={handleContinue}
        onHome={() => router.push('/' as Href)}
        onReward={handleRewardPress}
        onResultOverlayPress={handleResultOverlayPress}
        onSound={soundPressHandler}
        questTitle={questTitle}
        resultOverlay={resultOverlay}
        selectedChoiceId={selectedChoiceId}
        stars={earnedStars}
        step={step}
        width={width}
      />
    );
  }

  return (
    <AnimalSoundQuestScreen
      backgroundSource={
        quest.backgroundAsset
          ? questBackgroundSources[quest.backgroundAsset]
          : getFallbackIllustratedBackgroundSource(quest.categoryId)
      }
      choiceRects={getIndexedChoiceRects(step)}
      fallbackChoiceRect={illustratedChoiceFallbackChoiceRect}
      height={height}
      isCompleted={isCompleted}
      isLoaded={isLoaded}
      incorrectChoiceIds={incorrectChoiceIds}
      isRewardAvailable={rewardAvailable}
      isNextAvailable={isNextAvailable}
      isStepComplete={isStepComplete}
      onBack={() => router.back()}
      onChoicePress={handleChoicePress}
      onContinue={handleContinue}
      onHome={() => router.push('/' as Href)}
      onReward={handleRewardPress}
      onResultOverlayPress={handleResultOverlayPress}
      onSound={soundPressHandler}
      questTitle={questTitle}
      renderScene={(stage) => {
        const sceneAsset = getQuestProblemSceneAsset(quest.id);

        if (sceneAsset) {
          return (
            <Image
              accessibilityLabel={`${questTitle} 문제 장면`}
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              source={sceneAsset}
              style={[styles.animalSoundSceneImage, getQuestStageRect(stage, illustratedChoiceSceneImageRect)]}
            />
          );
        }

        return (
          <QuestProblemScene
            scale={stage.scaleY}
            scene={getQuestProblemScene(quest.id, quest.categoryId)}
            style={getQuestStageRect(stage, illustratedChoiceSceneImageRect)}
          />
        );
      }}
      resultOverlay={resultOverlay}
      sceneAccessibilityLabel={`${questTitle} 문제 일러스트`}
      selectedChoiceId={selectedChoiceId}
      stars={earnedStars}
      step={step}
      width={width}
    />
  );
}

function AppleCountQuestScreen({
  backgroundSource,
  choiceDots = appleCountChoiceDots,
  choiceRects = appleCountChoiceRects,
  fallbackChoiceRect = appleCountFallbackChoiceRect,
  height,
  incorrectChoiceIds,
  isCompleted,
  isLoaded,
  isNextAvailable,
  isRewardAvailable,
  isStepComplete,
  onBack,
  onChoicePress,
  onContinue,
  onHome,
  onReward,
  onResultOverlayPress,
  onSound,
  promptRect = appleCountPromptRect,
  questTitle,
  renderSceneOverlay,
  resultOverlay,
  sceneAccessibilityLabel = '미어로가 사과 3개 달린 나무를 바라보는 장면',
  sceneImageRect = appleCountApplesImageRect,
  sceneSource = appleCountApplesImage,
  selectedChoiceId,
  stars,
  step,
  width,
}: {
  backgroundSource: number;
  choiceDots?: Record<string, number>;
  choiceRects?: Record<string, QuestStageSourceRect>;
  fallbackChoiceRect?: QuestStageSourceRect;
  height: number;
  incorrectChoiceIds: string[];
  isCompleted: boolean;
  isLoaded: boolean;
  isNextAvailable: boolean;
  isRewardAvailable: boolean;
  isStepComplete: boolean;
  onBack: () => void;
  onChoicePress: (choiceId: string) => void;
  onContinue: () => void;
  onHome: () => void;
  onReward: () => void;
  onResultOverlayPress: () => void;
  onSound?: () => void;
  promptRect?: QuestStageSourceRect;
  questTitle: string;
  renderSceneOverlay?: (stage: QuestStageFillLayout) => ReactNode;
  resultOverlay: QuestResultOverlay | null;
  sceneAccessibilityLabel?: string;
  sceneImageRect?: QuestStageSourceRect;
  sceneSource?: number;
  selectedChoiceId: string | null;
  stars: number;
  step: QuestStep;
  width: number;
}) {
  const handleNext = isNextAvailable ? onContinue : () => undefined;

  return (
    <QuestScreenFrame
      backgroundSource={backgroundSource}
      height={height}
      isNextAvailable={isNextAvailable}
      onBack={onBack}
      onHome={onHome}
      onNext={handleNext}
      onPrevious={onBack}
      onReward={onReward}
      onSound={onSound}
      isRewardAvailable={isRewardAvailable}
      questTitle={questTitle}
      stars={stars}
      width={width}>
      {(stage) => (
        <>
          <View
            style={[styles.questContentBackdrop, getQuestStageRect(stage, questContentBackdropRect)]}
          />
          <View style={[styles.appleCountPrompt, getQuestStageRect(stage, promptRect)]}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={2}
              style={[
                styles.appleCountPromptText,
                { fontSize: 30 * stage.scaleY, lineHeight: 36 * stage.scaleY },
              ]}>
              {step.instructionText}
            </Text>
          </View>
          <Image
            accessibilityLabel={sceneAccessibilityLabel}
            resizeMode="contain"
            source={sceneSource}
            style={[styles.appleCountApplesImage, getQuestStageRect(stage, sceneImageRect)]}
          />
          {renderSceneOverlay?.(stage)}
          {step.choices.map((choice) => {
            const choiceRect = choiceRects[choice.id] ?? fallbackChoiceRect;
            const dotCount = choiceDots[choice.id] ?? getChoiceNumber(choice.label);
            const isSelected = selectedChoiceId === choice.id;
            const isCorrect = choice.id === step.correctChoiceId;
            const showCorrect = isStepComplete && isCorrect;
            const showIncorrect = incorrectChoiceIds.includes(choice.id);
            const isChoiceDisabled = !isLoaded || isStepComplete || isCompleted || showIncorrect;

            return (
              <Pressable
                accessibilityLabel={choice.label}
                accessibilityRole="button"
                accessibilityState={{ disabled: isChoiceDisabled, selected: isSelected }}
                disabled={isChoiceDisabled}
                key={choice.id}
                onPress={() => onChoicePress(choice.id)}
                style={({ pressed }) => [
                  styles.appleCountChoiceCard,
                  getQuestStageRect(stage, choiceRect),
                  isSelected && styles.appleCountChoiceSelected,
                  showCorrect && styles.appleCountChoiceCorrect,
                  showIncorrect && styles.appleCountChoiceIncorrect,
                  showIncorrect && styles.appleCountChoiceDisabled,
                  pressed && !isStepComplete && !showIncorrect && styles.appleCountChoicePressed,
                ]}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.appleCountChoiceLabelText,
                    { fontSize: 58 * stage.scaleY, lineHeight: 66 * stage.scaleY },
                  ]}>
                  {choice.label}
                </Text>
                <View style={styles.appleCountDotRow}>
                  {Array.from({ length: dotCount }).map((_, index) => (
                    <View
                      key={`${choice.id}-dot-${index}`}
                      style={[
                        styles.appleCountChoiceDot,
                        { height: 16 * stage.scaleY, width: 16 * stage.scaleY },
                        showCorrect && styles.appleCountChoiceDotCorrect,
                      ]}
                    />
                  ))}
                </View>
                {showCorrect ? (
                  <View style={styles.appleCountCheckBadge}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={[
                        styles.appleCountCheckText,
                        { fontSize: 28 * stage.scaleY, lineHeight: 32 * stage.scaleY },
                      ]}>
                      정답
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          {resultOverlay ? (
            <>
              <View style={[styles.appleCountDimOverlay, getQuestStageRect(stage, questContentBackdropRect)]} />
              <View
                accessibilityLabel={`${resultOverlay.title} ${resultOverlay.message}`}
                accessibilityLiveRegion="polite"
                style={[
                  styles.appleCountResultOverlay,
                  getQuestStageRect(stage, appleCountResultOverlayRect),
                  resultOverlay.tone === 'correct'
                    ? styles.resultOverlayCorrect
                    : styles.resultOverlayRetry,
                ]}>
                {resultOverlay.tone === 'correct' ? (
                  <MeeroDigPeekAnimation style={styles.appleCountResultOverlayAnimation} />
                ) : (
                  <MeeroThinkAgainAnimation style={styles.appleCountResultOverlayAnimation} />
                )}
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.appleCountResultOverlayTitle,
                    { fontSize: 30 * stage.scaleY, lineHeight: 36 * stage.scaleY },
                  ]}>
                  {resultOverlay.title}
                </Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={[
                    styles.appleCountResultOverlayMessage,
                    { fontSize: 22 * stage.scaleY, lineHeight: 28 * stage.scaleY },
                  ]}>
                  {resultOverlay.message}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onResultOverlayPress}
                  style={({ pressed }) => [
                    styles.appleCountResultOverlayAction,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[
                      styles.appleCountResultOverlayActionText,
                      { fontSize: 24 * stage.scaleY, lineHeight: 30 * stage.scaleY },
                    ]}>
                    {resultOverlay.actionLabel}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </>
      )}
    </QuestScreenFrame>
  );
}

function renderFootprintSequenceOverlay(stage: QuestStageFillLayout) {
  return footprintSequenceLabels.map(({ id, isMissing, label }) => {
    const labelRect = footprintSequenceLabelRects[id];

    return (
      <View
        key={id}
        pointerEvents="none"
        style={[styles.footprintSequenceLabel, getQuestStageRect(stage, labelRect)]}>
        {isMissing ? (
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[
              styles.footprintSequenceMissingSlotText,
              { fontSize: 56 * stage.scaleY, lineHeight: 62 * stage.scaleY },
            ]}>
            {label}
          </Text>
        ) : (
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[
              styles.footprintSequenceLabelText,
              { fontSize: 54 * stage.scaleY, lineHeight: 60 * stage.scaleY },
            ]}>
            {label}
          </Text>
        )}
      </View>
    );
  });
}

function AnimalSoundQuestScreen({
  backgroundSource,
  choiceRects = animalSoundChoiceRects,
  fallbackChoiceRect = animalSoundFallbackChoiceRect,
  height,
  incorrectChoiceIds,
  isCompleted,
  isLoaded,
  isNextAvailable,
  isRewardAvailable,
  isStepComplete,
  onBack,
  onChoicePress,
  onContinue,
  onHome,
  onReward,
  onResultOverlayPress,
  onSound,
  questTitle,
  renderScene,
  resultOverlay,
  sceneAccessibilityLabel = '미어로가 언덕 뒤 동물 소리에 귀를 기울이는 장면',
  sceneImageRect = animalSoundSceneImageRect,
  sceneSource = animalSoundSceneImage,
  selectedChoiceId,
  stars,
  step,
  width,
}: {
  backgroundSource: number;
  choiceRects?: Record<string, QuestStageSourceRect>;
  fallbackChoiceRect?: QuestStageSourceRect;
  height: number;
  incorrectChoiceIds: string[];
  isCompleted: boolean;
  isLoaded: boolean;
  isNextAvailable: boolean;
  isRewardAvailable: boolean;
  isStepComplete: boolean;
  onBack: () => void;
  onChoicePress: (choiceId: string) => void;
  onContinue: () => void;
  onHome: () => void;
  onReward: () => void;
  onResultOverlayPress: () => void;
  onSound?: () => void;
  questTitle: string;
  renderScene?: (stage: QuestStageFillLayout) => ReactNode;
  resultOverlay: QuestResultOverlay | null;
  sceneAccessibilityLabel?: string;
  sceneImageRect?: QuestStageSourceRect;
  sceneSource?: number;
  selectedChoiceId: string | null;
  stars: number;
  step: QuestStep;
  width: number;
}) {
  const handleNext = isNextAvailable ? onContinue : () => undefined;

  return (
    <QuestScreenFrame
      backgroundSource={backgroundSource}
      height={height}
      isNextAvailable={isNextAvailable}
      isRewardAvailable={isRewardAvailable}
      onBack={onBack}
      onHome={onHome}
      onNext={handleNext}
      onPrevious={onBack}
      onReward={onReward}
      onSound={onSound}
      questTitle={questTitle}
      stars={stars}
      width={width}>
      {(stage) => (
        <>
          <View
            style={[styles.questContentBackdrop, getQuestStageRect(stage, questContentBackdropRect)]}
          />
          <View style={[styles.appleCountPrompt, getQuestStageRect(stage, animalSoundPromptRect)]}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={2}
              style={[
                styles.appleCountPromptText,
                { fontSize: 30 * stage.scaleY, lineHeight: 36 * stage.scaleY },
              ]}>
              {step.instructionText}
            </Text>
          </View>
          {renderScene ? (
            renderScene(stage)
          ) : (
            <Image
              accessibilityLabel={sceneAccessibilityLabel}
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              source={sceneSource}
              style={[styles.animalSoundSceneImage, getQuestStageRect(stage, sceneImageRect)]}
            />
          )}
          {step.choices.map((choice) => {
            const choiceRect = choiceRects[choice.id] ?? fallbackChoiceRect;
            const isSelected = selectedChoiceId === choice.id;
            const isCorrect = choice.id === step.correctChoiceId;
            const showCorrect = isStepComplete && isCorrect;
            const showIncorrect = incorrectChoiceIds.includes(choice.id);
            const isChoiceDisabled = !isLoaded || isStepComplete || isCompleted || showIncorrect;

            return (
              <Pressable
                accessibilityLabel={choice.label}
                accessibilityRole="button"
                accessibilityState={{ disabled: isChoiceDisabled, selected: isSelected }}
                disabled={isChoiceDisabled}
                key={choice.id}
                onPress={() => onChoicePress(choice.id)}
                style={({ pressed }) => [
                  styles.animalSoundChoiceCard,
                  getQuestStageRect(stage, choiceRect),
                  isSelected && styles.appleCountChoiceSelected,
                  showCorrect && styles.appleCountChoiceCorrect,
                  showIncorrect && styles.appleCountChoiceIncorrect,
                  showIncorrect && styles.appleCountChoiceDisabled,
                  pressed && !isStepComplete && !showIncorrect && styles.appleCountChoicePressed,
                ]}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.animalSoundChoiceLabelText,
                    { fontSize: 42 * stage.scaleY, lineHeight: 50 * stage.scaleY },
                  ]}>
                  {choice.label}
                </Text>
                {showCorrect ? (
                  <View style={styles.animalSoundCheckBadge}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={[
                        styles.appleCountCheckText,
                        { fontSize: 23 * stage.scaleY, lineHeight: 28 * stage.scaleY },
                      ]}>
                      정답
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          {resultOverlay ? (
            <>
              <View
                style={[styles.appleCountDimOverlay, getQuestStageRect(stage, questContentBackdropRect)]}
              />
              <View
                accessibilityLabel={`${resultOverlay.title} ${resultOverlay.message}`}
                accessibilityLiveRegion="polite"
                style={[
                  styles.appleCountResultOverlay,
                  getQuestStageRect(stage, animalSoundResultOverlayRect),
                  resultOverlay.tone === 'correct'
                    ? styles.resultOverlayCorrect
                    : styles.resultOverlayRetry,
                ]}>
                {resultOverlay.tone === 'correct' ? (
                  <MeeroDigPeekAnimation style={styles.appleCountResultOverlayAnimation} />
                ) : (
                  <MeeroThinkAgainAnimation style={styles.appleCountResultOverlayAnimation} />
                )}
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.appleCountResultOverlayTitle,
                    { fontSize: 30 * stage.scaleY, lineHeight: 36 * stage.scaleY },
                  ]}>
                  {resultOverlay.title}
                </Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={[
                    styles.appleCountResultOverlayMessage,
                    { fontSize: 22 * stage.scaleY, lineHeight: 28 * stage.scaleY },
                  ]}>
                  {resultOverlay.message}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onResultOverlayPress}
                  style={({ pressed }) => [
                    styles.appleCountResultOverlayAction,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[
                      styles.appleCountResultOverlayActionText,
                      { fontSize: 24 * stage.scaleY, lineHeight: 30 * stage.scaleY },
                    ]}>
                    {resultOverlay.actionLabel}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </>
      )}
    </QuestScreenFrame>
  );
}

function ShapeFindQuestScreen({
  backgroundSource,
  height,
  incorrectChoiceIds,
  isCompleted,
  isLoaded,
  isNextAvailable,
  isRewardAvailable,
  isStepComplete,
  onBack,
  onChoicePress,
  onContinue,
  onHome,
  onReward,
  onResultOverlayPress,
  onSound,
  questTitle,
  resultOverlay,
  selectedChoiceId,
  stars,
  step,
  width,
}: {
  backgroundSource: number;
  height: number;
  incorrectChoiceIds: string[];
  isCompleted: boolean;
  isLoaded: boolean;
  isNextAvailable: boolean;
  isRewardAvailable: boolean;
  isStepComplete: boolean;
  onBack: () => void;
  onChoicePress: (choiceId: string) => void;
  onContinue: () => void;
  onHome: () => void;
  onReward: () => void;
  onResultOverlayPress: () => void;
  onSound?: () => void;
  questTitle: string;
  resultOverlay: QuestResultOverlay | null;
  selectedChoiceId: string | null;
  stars: number;
  step: QuestStep;
  width: number;
}) {
  const handleNext = isNextAvailable ? onContinue : () => undefined;

  return (
    <QuestScreenFrame
      backgroundSource={backgroundSource}
      height={height}
      isNextAvailable={isNextAvailable}
      isRewardAvailable={isRewardAvailable}
      onBack={onBack}
      onHome={onHome}
      onNext={handleNext}
      onPrevious={onBack}
      onReward={onReward}
      onSound={onSound}
      questTitle={questTitle}
      stars={stars}
      width={width}>
      {(stage) => (
        <>
          <View
            style={[styles.questContentBackdrop, getQuestStageRect(stage, questContentBackdropRect)]}
          />
          <View style={[styles.appleCountPrompt, getQuestStageRect(stage, shapeFindPromptRect)]}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={2}
              style={[
                styles.appleCountPromptText,
                { fontSize: 25 * stage.scaleY, lineHeight: 31 * stage.scaleY },
              ]}>
              {step.instructionText}
            </Text>
          </View>
          <Image
            accessibilityLabel="미어로가 동그라미와 네모 버튼이 있는 문을 바라보는 장면"
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={shapeFindDoorImage}
            style={[styles.shapeFindDoorImage, getQuestStageRect(stage, shapeFindDoorImageRect)]}
          />
          {step.choices.map((choice) => {
            const labelRect =
              shapeFindDoorButtonLabelRects[`${choice.id}-label`] ??
              shapeFindFallbackDoorButtonLabelRect;

            return (
              <View
                key={`${choice.id}-door-label`}
                style={[
                  styles.shapeFindDoorNumberBadge,
                  getQuestStageCircleRect(stage, labelRect),
                ]}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.shapeFindDoorNumberText,
                    { fontSize: 26 * stage.scaleY, lineHeight: 32 * stage.scaleY },
                  ]}>
                  {getChoiceNumber(choice.label)}
                </Text>
              </View>
            );
          })}
          {step.choices.map((choice) => {
            const choiceRect = shapeFindChoiceRects[choice.id] ?? shapeFindFallbackChoiceRect;
            const isSelected = selectedChoiceId === choice.id;
            const isCorrect = choice.id === step.correctChoiceId;
            const showCorrect = isStepComplete && isCorrect;
            const showIncorrect = incorrectChoiceIds.includes(choice.id);
            const isChoiceDisabled = !isLoaded || isStepComplete || isCompleted || showIncorrect;

            return (
              <Pressable
                accessibilityLabel={choice.label}
                accessibilityRole="button"
                accessibilityState={{ disabled: isChoiceDisabled, selected: isSelected }}
                disabled={isChoiceDisabled}
                key={choice.id}
                onPress={() => onChoicePress(choice.id)}
                style={({ pressed }) => [
                  styles.shapeFindChoiceCard,
                  getQuestStageRect(stage, choiceRect),
                  isSelected && styles.appleCountChoiceSelected,
                  showCorrect && styles.appleCountChoiceCorrect,
                  showIncorrect && styles.appleCountChoiceIncorrect,
                  showIncorrect && styles.appleCountChoiceDisabled,
                  pressed && !isStepComplete && !showIncorrect && styles.appleCountChoicePressed,
                ]}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.shapeFindChoiceLabelText,
                    { fontSize: 34 * stage.scaleY, lineHeight: 40 * stage.scaleY },
                  ]}>
                  {choice.label}
                </Text>
                {showCorrect ? (
                  <View style={styles.shapeFindCheckBadge}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={[
                        styles.appleCountCheckText,
                        { fontSize: 24 * stage.scaleY, lineHeight: 29 * stage.scaleY },
                      ]}>
                      정답
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          {resultOverlay ? (
            <>
              <View
                style={[styles.appleCountDimOverlay, getQuestStageRect(stage, questContentBackdropRect)]}
              />
              <View
                accessibilityLabel={`${resultOverlay.title} ${resultOverlay.message}`}
                accessibilityLiveRegion="polite"
                style={[
                  styles.appleCountResultOverlay,
                  getQuestStageRect(stage, shapeFindResultOverlayRect),
                  resultOverlay.tone === 'correct'
                    ? styles.resultOverlayCorrect
                    : styles.resultOverlayRetry,
                ]}>
                {resultOverlay.tone === 'correct' ? (
                  <MeeroDigPeekAnimation style={styles.appleCountResultOverlayAnimation} />
                ) : (
                  <MeeroThinkAgainAnimation style={styles.appleCountResultOverlayAnimation} />
                )}
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.appleCountResultOverlayTitle,
                    { fontSize: 30 * stage.scaleY, lineHeight: 36 * stage.scaleY },
                  ]}>
                  {resultOverlay.title}
                </Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={[
                    styles.appleCountResultOverlayMessage,
                    { fontSize: 22 * stage.scaleY, lineHeight: 28 * stage.scaleY },
                  ]}>
                  {resultOverlay.message}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onResultOverlayPress}
                  style={({ pressed }) => [
                    styles.appleCountResultOverlayAction,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[
                      styles.appleCountResultOverlayActionText,
                      { fontSize: 24 * stage.scaleY, lineHeight: 30 * stage.scaleY },
                    ]}>
                    {resultOverlay.actionLabel}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </>
      )}
    </QuestScreenFrame>
  );
}

function PatternPathQuestScreen({
  backgroundSource,
  height,
  incorrectChoiceIds,
  isCompleted,
  isLoaded,
  isNextAvailable,
  isRewardAvailable,
  isStepComplete,
  onBack,
  onChoicePress,
  onContinue,
  onHome,
  onReward,
  onResultOverlayPress,
  onSound,
  questTitle,
  resultOverlay,
  selectedChoiceId,
  stars,
  step,
  width,
}: {
  backgroundSource: number;
  height: number;
  incorrectChoiceIds: string[];
  isCompleted: boolean;
  isLoaded: boolean;
  isNextAvailable: boolean;
  isRewardAvailable: boolean;
  isStepComplete: boolean;
  onBack: () => void;
  onChoicePress: (choiceId: string) => void;
  onContinue: () => void;
  onHome: () => void;
  onReward: () => void;
  onResultOverlayPress: () => void;
  onSound?: () => void;
  questTitle: string;
  resultOverlay: QuestResultOverlay | null;
  selectedChoiceId: string | null;
  stars: number;
  step: QuestStep;
  width: number;
}) {
  const handleNext = isNextAvailable ? onContinue : () => undefined;

  return (
    <QuestScreenFrame
      backgroundSource={backgroundSource}
      height={height}
      isNextAvailable={isNextAvailable}
      isRewardAvailable={isRewardAvailable}
      onBack={onBack}
      onHome={onHome}
      onNext={handleNext}
      onPrevious={onBack}
      onReward={onReward}
      onSound={onSound}
      questTitle={questTitle}
      stars={stars}
      width={width}>
      {(stage) => (
        <>
          <View
            style={[styles.questContentBackdrop, getQuestStageRect(stage, questContentBackdropRect)]}
          />
          <View style={[styles.appleCountPrompt, getQuestStageRect(stage, patternPathPromptRect)]}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                styles.appleCountPromptText,
                { fontSize: 31 * stage.scaleY, lineHeight: 38 * stage.scaleY },
              ]}>
              {step.instructionText}
            </Text>
          </View>
          <Image
            accessibilityLabel="미어로가 빨강 파랑 빨강 파랑 길을 건너고 다음 칸이 비어 있는 패턴 길"
            resizeMode="contain"
            source={patternPathStonesImage}
            style={[styles.patternPathStonesImage, getQuestStageRect(stage, patternPathStonesRect)]}
          />
          {step.choices.map((choice) => {
            const choiceRect = patternPathChoiceRects[choice.id] ?? patternPathFallbackChoiceRect;
            const choiceColors = getPatternPathChoiceColors(choice.id);
            const isSelected = selectedChoiceId === choice.id;
            const isCorrect = choice.id === step.correctChoiceId;
            const showCorrect = isStepComplete && isCorrect;
            const showIncorrect = incorrectChoiceIds.includes(choice.id);
            const isChoiceDisabled = !isLoaded || isStepComplete || isCompleted || showIncorrect;

            return (
              <Pressable
                accessibilityLabel={choice.label}
                accessibilityRole="button"
                accessibilityState={{ disabled: isChoiceDisabled, selected: isSelected }}
                disabled={isChoiceDisabled}
                key={choice.id}
                onPress={() => onChoicePress(choice.id)}
                style={({ pressed }) => [
                  styles.patternPathChoiceCard,
                  getQuestStageRect(stage, choiceRect),
                  { backgroundColor: choiceColors.surface, borderColor: choiceColors.border },
                  isSelected && styles.appleCountChoiceSelected,
                  showCorrect && styles.appleCountChoiceCorrect,
                  showIncorrect && styles.appleCountChoiceIncorrect,
                  showIncorrect && styles.appleCountChoiceDisabled,
                  pressed && !isStepComplete && !showIncorrect && styles.appleCountChoicePressed,
                ]}>
                <View
                  style={[
                    styles.patternPathChoiceSwatch,
                    {
                      backgroundColor: choiceColors.fill,
                      borderColor: choiceColors.border,
                      height: 48 * stage.scaleY,
                      width: 48 * stage.scaleY,
                    },
                  ]}
                />
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.patternPathChoiceLabelText,
                    { fontSize: 34 * stage.scaleY, lineHeight: 40 * stage.scaleY },
                  ]}>
                  {choice.label}
                </Text>
                {showCorrect ? (
                  <View style={styles.patternPathCheckBadge}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={[
                        styles.appleCountCheckText,
                        { fontSize: 23 * stage.scaleY, lineHeight: 28 * stage.scaleY },
                      ]}>
                      정답
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          {resultOverlay ? (
            <>
              <View
                style={[styles.appleCountDimOverlay, getQuestStageRect(stage, questContentBackdropRect)]}
              />
              <View
                accessibilityLabel={`${resultOverlay.title} ${resultOverlay.message}`}
                accessibilityLiveRegion="polite"
                style={[
                  styles.appleCountResultOverlay,
                  getQuestStageRect(stage, patternPathResultOverlayRect),
                  resultOverlay.tone === 'correct'
                    ? styles.resultOverlayCorrect
                    : styles.resultOverlayRetry,
                ]}>
                {resultOverlay.tone === 'correct' ? (
                  <MeeroDigPeekAnimation style={styles.appleCountResultOverlayAnimation} />
                ) : (
                  <MeeroThinkAgainAnimation style={styles.appleCountResultOverlayAnimation} />
                )}
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.appleCountResultOverlayTitle,
                    { fontSize: 30 * stage.scaleY, lineHeight: 36 * stage.scaleY },
                  ]}>
                  {resultOverlay.title}
                </Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={[
                    styles.appleCountResultOverlayMessage,
                    { fontSize: 22 * stage.scaleY, lineHeight: 28 * stage.scaleY },
                  ]}>
                  {resultOverlay.message}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onResultOverlayPress}
                  style={({ pressed }) => [
                    styles.appleCountResultOverlayAction,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[
                      styles.appleCountResultOverlayActionText,
                      { fontSize: 24 * stage.scaleY, lineHeight: 30 * stage.scaleY },
                    ]}>
                    {resultOverlay.actionLabel}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </>
      )}
    </QuestScreenFrame>
  );
}

function SizeCompareQuestScreen({
  backgroundSource,
  height,
  incorrectChoiceIds,
  isCompleted,
  isLoaded,
  isNextAvailable,
  isRewardAvailable,
  isStepComplete,
  onBack,
  onChoicePress,
  onContinue,
  onHome,
  onReward,
  onResultOverlayPress,
  onSound,
  questTitle,
  resultOverlay,
  selectedChoiceId,
  stars,
  step,
  width,
}: {
  backgroundSource: number;
  height: number;
  incorrectChoiceIds: string[];
  isCompleted: boolean;
  isLoaded: boolean;
  isNextAvailable: boolean;
  isRewardAvailable: boolean;
  isStepComplete: boolean;
  onBack: () => void;
  onChoicePress: (choiceId: string) => void;
  onContinue: () => void;
  onHome: () => void;
  onReward: () => void;
  onResultOverlayPress: () => void;
  onSound?: () => void;
  questTitle: string;
  resultOverlay: QuestResultOverlay | null;
  selectedChoiceId: string | null;
  stars: number;
  step: QuestStep;
  width: number;
}) {
  const handleNext = isNextAvailable ? onContinue : () => undefined;

  return (
    <QuestScreenFrame
      backgroundSource={backgroundSource}
      height={height}
      isNextAvailable={isNextAvailable}
      isRewardAvailable={isRewardAvailable}
      onBack={onBack}
      onHome={onHome}
      onNext={handleNext}
      onPrevious={onBack}
      onReward={onReward}
      onSound={onSound}
      questTitle={questTitle}
      stars={stars}
      width={width}>
      {(stage) => (
        <>
          <View
            style={[styles.questContentBackdrop, getQuestStageRect(stage, questContentBackdropRect)]}
          />
          <View style={[styles.appleCountPrompt, getQuestStageRect(stage, sizeComparePromptRect)]}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                styles.appleCountPromptText,
                { fontSize: 31 * stage.scaleY, lineHeight: 38 * stage.scaleY },
              ]}>
              {step.instructionText}
            </Text>
          </View>
          <Image
            accessibilityLabel="미어로가 두 구멍 앞에서 잠잘 큰 구멍을 고민하는 장면"
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={sizeCompareHolesImage}
            style={[styles.sizeCompareSceneImage, getQuestStageRect(stage, sizeCompareSceneRect)]}
          />
          {step.choices.map((choice) => {
            const labelRect =
              sizeCompareHoleLabelRects[`${choice.id}-label`] ?? sizeCompareFallbackHoleLabelRect;

            return (
              <View
                key={`${choice.id}-hole-label`}
                style={[
                  styles.sizeCompareHoleNumberBadge,
                  getQuestStageCircleRect(stage, labelRect),
                ]}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.sizeCompareHoleNumberText,
                    { fontSize: 28 * stage.scaleY, lineHeight: 34 * stage.scaleY },
                  ]}>
                  {getChoiceNumber(choice.label)}
                </Text>
              </View>
            );
          })}
          <View
            accessibilityLabel="구멍 위 반투명 원형 번호와 1번 2번 선택 버튼"
            pointerEvents="box-none"
            style={styles.sizeCompareChoiceLayer}>
            {step.choices.map((choice) => {
              const choiceRect = sizeCompareChoiceRects[choice.id] ?? sizeCompareFallbackChoiceRect;
              const isSelected = selectedChoiceId === choice.id;
              const isCorrect = choice.id === step.correctChoiceId;
              const showCorrect = isStepComplete && isCorrect;
              const showIncorrect = incorrectChoiceIds.includes(choice.id);
              const isChoiceDisabled = !isLoaded || isStepComplete || isCompleted || showIncorrect;

              return (
                <Pressable
                  accessibilityLabel={choice.label}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isChoiceDisabled, selected: isSelected }}
                  disabled={isChoiceDisabled}
                  key={choice.id}
                  onPress={() => onChoicePress(choice.id)}
                  style={({ pressed }) => [
                    styles.sizeCompareNumberChoiceCard,
                    getQuestStageRect(stage, choiceRect),
                    isSelected && styles.appleCountChoiceSelected,
                    showCorrect && styles.appleCountChoiceCorrect,
                    showIncorrect && styles.appleCountChoiceIncorrect,
                    showIncorrect && styles.appleCountChoiceDisabled,
                    pressed && !isStepComplete && !showIncorrect && styles.appleCountChoicePressed,
                  ]}>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[
                      styles.sizeCompareChoiceLabelText,
                      { fontSize: 34 * stage.scaleY, lineHeight: 40 * stage.scaleY },
                    ]}>
                    {choice.label}
                  </Text>
                  {showCorrect ? (
                    <View style={styles.sizeCompareCheckBadge}>
                      <Text
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        style={[
                          styles.appleCountCheckText,
                          { fontSize: 23 * stage.scaleY, lineHeight: 28 * stage.scaleY },
                        ]}>
                        정답
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          {resultOverlay ? (
            <>
              <View
                style={[styles.appleCountDimOverlay, getQuestStageRect(stage, questContentBackdropRect)]}
              />
              <View
                accessibilityLabel={`${resultOverlay.title} ${resultOverlay.message}`}
                accessibilityLiveRegion="polite"
                style={[
                  styles.appleCountResultOverlay,
                  getQuestStageRect(stage, sizeCompareResultOverlayRect),
                  resultOverlay.tone === 'correct'
                    ? styles.resultOverlayCorrect
                    : styles.resultOverlayRetry,
                ]}>
                {resultOverlay.tone === 'correct' ? (
                  <MeeroDigPeekAnimation style={styles.appleCountResultOverlayAnimation} />
                ) : (
                  <MeeroThinkAgainAnimation style={styles.appleCountResultOverlayAnimation} />
                )}
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.appleCountResultOverlayTitle,
                    { fontSize: 30 * stage.scaleY, lineHeight: 36 * stage.scaleY },
                  ]}>
                  {resultOverlay.title}
                </Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={[
                    styles.appleCountResultOverlayMessage,
                    { fontSize: 22 * stage.scaleY, lineHeight: 28 * stage.scaleY },
                  ]}>
                  {resultOverlay.message}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onResultOverlayPress}
                  style={({ pressed }) => [
                    styles.appleCountResultOverlayAction,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[
                      styles.appleCountResultOverlayActionText,
                      { fontSize: 24 * stage.scaleY, lineHeight: 30 * stage.scaleY },
                    ]}>
                    {resultOverlay.actionLabel}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </>
      )}
    </QuestScreenFrame>
  );
}

const questContentBackdropRect = { height: 504, left: 52, top: 124, width: 1261 };
const appleCountPromptRect = { height: 70, left: 403, top: 145, width: 560 };
const appleCountApplesImageRect = { height: 298, left: 205, top: 272, width: 498 };
const appleCountResultOverlayRect = { height: 365, left: 377, top: 223, width: 612 };
const appleCountChoiceRects: Record<string, QuestStageSourceRect> = {
  three: { height: 136, left: 850, top: 437, width: 252 },
  two: { height: 136, left: 850, top: 270, width: 252 },
};
const appleCountFallbackChoiceRect = { height: 136, left: 850, top: 318, width: 252 };
const appleCountChoiceDots: Record<string, number> = {
  three: 3,
  two: 2,
};
const carrotAdditionPromptRect = { height: 96, left: 233, top: 136, width: 900 };
const carrotAdditionSceneImageRect = { height: 318, left: 152, top: 265, width: 590 };
const carrotAdditionChoiceRects: Record<string, QuestStageSourceRect> = {
  two: { height: 112, left: 850, top: 244, width: 252 },
  three: { height: 112, left: 850, top: 376, width: 252 },
  four: { height: 112, left: 850, top: 508, width: 252 },
};
const carrotAdditionFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const carrotAdditionChoiceDots: Record<string, number> = {
  four: 4,
  three: 3,
  two: 2,
};
const gemCountPromptRect = { height: 96, left: 233, top: 136, width: 900 };
const gemCountSceneImageRect = { height: 360, left: 112, top: 250, width: 622 };
const gemCountChoiceRects: Record<string, QuestStageSourceRect> = {
  three: { height: 112, left: 850, top: 244, width: 252 },
  four: { height: 112, left: 850, top: 376, width: 252 },
  five: { height: 112, left: 850, top: 508, width: 252 },
};
const gemCountFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const gemCountChoiceDots: Record<string, number> = {
  five: 5,
  four: 4,
  three: 3,
};
const smallNumberPromptRect = { height: 96, left: 233, top: 136, width: 900 };
const smallNumberSceneImageRect = { height: 370, left: 72, top: 250, width: 640 };
const smallNumberChoiceRects: Record<string, QuestStageSourceRect> = {
  two: { height: 136, left: 850, top: 296, width: 252 },
  five: { height: 136, left: 850, top: 456, width: 252 },
};
const smallNumberFallbackChoiceRect = { height: 136, left: 850, top: 376, width: 252 };
const smallNumberChoiceDots: Record<string, number> = {
  five: 5,
  two: 2,
};
const stoneStackPromptRect = { height: 96, left: 233, top: 136, width: 900 };
const stoneStackSceneImageRect = { height: 380, left: 112, top: 240, width: 622 };
const stoneStackChoiceRects: Record<string, QuestStageSourceRect> = {
  four: { height: 112, left: 850, top: 244, width: 252 },
  five: { height: 112, left: 850, top: 376, width: 252 },
  six: { height: 112, left: 850, top: 508, width: 252 },
};
const stoneStackFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const stoneStackChoiceDots: Record<string, number> = {
  six: 6,
  five: 5,
  four: 4,
};
const shapeMatchPromptRect = { height: 96, left: 233, top: 136, width: 900 };
const shapeMatchSceneImageRect = { height: 380, left: 92, top: 240, width: 660 };
const shapeMatchChoiceRects: Record<string, QuestStageSourceRect> = {
  circle: { height: 112, left: 850, top: 244, width: 252 },
  triangle: { height: 112, left: 850, top: 376, width: 252 },
  square: { height: 112, left: 850, top: 508, width: 252 },
};
const shapeMatchFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const shapeMatchChoiceDots: Record<string, number> = {
  circle: 0,
  square: 0,
  triangle: 0,
};
const footprintSequencePromptRect = { height: 96, left: 233, top: 136, width: 900 };
const footprintSequenceSceneImageRect = { height: 390, left: 94, top: 238, width: 694 };
const footprintSequenceChoiceRects: Record<string, QuestStageSourceRect> = {
  three: { height: 112, left: 850, top: 244, width: 252 },
  four: { height: 112, left: 850, top: 376, width: 252 },
  five: { height: 112, left: 850, top: 508, width: 252 },
};
const footprintSequenceFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const footprintSequenceChoiceDots: Record<string, number> = {
  five: 0,
  four: 0,
  three: 0,
};
const footprintSequenceLabelRects: Record<string, QuestStageSourceRect> = {
  one: { height: 72, left: 550, top: 372, width: 86 },
  two: { height: 72, left: 470, top: 336, width: 86 },
  three: { height: 72, left: 382, top: 392, width: 86 },
  four: { height: 72, left: 265, top: 336, width: 86 },
  slot: { height: 82, left: 196, top: 432, width: 96 },
};
const footprintSequenceLabels: { id: string; isMissing?: boolean; label: string }[] = [
  { id: 'one', label: '1' },
  { id: 'two', label: '2' },
  { id: 'three', label: '3' },
  { id: 'four', label: '4' },
  { id: 'slot', label: '?', isMissing: true },
];
const animalSoundPromptRect = { height: 80, left: 233, top: 140, width: 900 };
const animalSoundSceneImageRect = { height: 306, left: 108, top: 269, width: 700 };
const animalSoundResultOverlayRect = { height: 365, left: 377, top: 223, width: 612 };
const animalSoundChoiceRects: Record<string, QuestStageSourceRect> = {
  dog: { height: 136, left: 850, top: 270, width: 252 },
  cat: { height: 136, left: 850, top: 437, width: 252 },
};
const animalSoundFallbackChoiceRect = { height: 136, left: 850, top: 318, width: 252 };
const foodNameSceneImageRect = { height: 388, left: 168, top: 230, width: 560 };
const foodNameChoiceRects: Record<string, QuestStageSourceRect> = {
  banana: { height: 112, left: 850, top: 244, width: 252 },
  bread: { height: 112, left: 850, top: 376, width: 252 },
  apple: { height: 112, left: 850, top: 508, width: 252 },
};
const foodNameFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const storySequenceSceneImageRect = { height: 344, left: 104, top: 254, width: 688 };
const storySequenceChoiceRects: Record<string, QuestStageSourceRect> = {
  water: { height: 112, left: 850, top: 244, width: 252 },
  sleep: { height: 112, left: 850, top: 376, width: 252 },
  run: { height: 112, left: 850, top: 508, width: 252 },
};
const storySequenceFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const emotionFaceSceneImageRect = { height: 392, left: 140, top: 226, width: 604 };
const emotionFaceChoiceRects: Record<string, QuestStageSourceRect> = {
  happy: { height: 112, left: 850, top: 244, width: 252 },
  angry: { height: 112, left: 850, top: 376, width: 252 },
  sleepy: { height: 112, left: 850, top: 508, width: 252 },
};
const emotionFaceFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const giftThanksSceneImageRect = { height: 402, left: 98, top: 224, width: 684 };
const giftThanksChoiceRects: Record<string, QuestStageSourceRect> = {
  thanks: { height: 112, left: 850, top: 244, width: 252 },
  no: { height: 112, left: 850, top: 376, width: 252 },
  bye: { height: 112, left: 850, top: 508, width: 252 },
};
const giftThanksFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const toyShareSceneImageRect = { height: 392, left: 104, top: 230, width: 690 };
const toyShareChoiceRects: Record<string, QuestStageSourceRect> = {
  share: { height: 136, left: 850, top: 270, width: 252 },
  push: { height: 136, left: 850, top: 437, width: 252 },
};
const toyShareFallbackChoiceRect = { height: 136, left: 850, top: 318, width: 252 };
const helpThanksSceneImageRect = { height: 402, left: 116, top: 224, width: 660 };
const helpThanksChoiceRects: Record<string, QuestStageSourceRect> = {
  thanks: { height: 112, left: 850, top: 244, width: 252 },
  angry: { height: 112, left: 850, top: 376, width: 252 },
  hide: { height: 112, left: 850, top: 508, width: 252 },
};
const helpThanksFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const slideWaitSceneImageRect = { height: 402, left: 72, top: 224, width: 742 };
const slideWaitChoiceRects: Record<string, QuestStageSourceRect> = {
  wait: { height: 112, left: 850, top: 244, width: 252 },
  push: { height: 112, left: 850, top: 376, width: 252 },
  cut: { height: 112, left: 850, top: 508, width: 252 },
};
const slideWaitFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const shapeFindPromptRect = { height: 96, left: 233, top: 136, width: 900 };
const shapeFindDoorImageRect = { height: 360, left: 108, top: 248, width: 640 };
const shapeFindDoorButtonLabelRects: Record<string, QuestStageSourceRect> = {
  'button-1-label': { height: 48, left: 472, top: 372, width: 48 },
  'button-2-label': { height: 48, left: 564, top: 372, width: 48 },
};
const shapeFindFallbackDoorButtonLabelRect = { height: 48, left: 518, top: 372, width: 48 };
const shapeFindResultOverlayRect = { height: 365, left: 377, top: 223, width: 612 };
const shapeFindChoiceRects: Record<string, QuestStageSourceRect> = {
  'button-1': { height: 136, left: 850, top: 270, width: 252 },
  'button-2': { height: 136, left: 850, top: 437, width: 252 },
};
const shapeFindFallbackChoiceRect = { height: 136, left: 850, top: 318, width: 252 };
const patternPathPromptRect = { height: 70, left: 303, top: 145, width: 760 };
const patternPathStonesRect = { height: 258, left: 303, top: 224, width: 760 };
const patternPathResultOverlayRect = { height: 365, left: 377, top: 223, width: 612 };
const patternPathChoiceRects: Record<string, QuestStageSourceRect> = {
  blue: { height: 132, left: 573, top: 492, width: 220 },
  red: { height: 132, left: 294, top: 492, width: 220 },
  yellow: { height: 132, left: 852, top: 492, width: 220 },
};
const patternPathFallbackChoiceRect = { height: 132, left: 573, top: 492, width: 220 };
const sizeComparePromptRect = { height: 70, left: 233, top: 145, width: 900 };
const sizeCompareSceneRect = { height: 240, left: 108, top: 302, width: 650 };
const sizeCompareResultOverlayRect = { height: 365, left: 377, top: 223, width: 612 };
const sizeCompareHoleLabelRects: Record<string, QuestStageSourceRect> = {
  'hole-1-label': { height: 50, left: 206, top: 410, width: 50 },
  'hole-2-label': { height: 50, left: 540, top: 372, width: 50 },
};
const sizeCompareFallbackHoleLabelRect = { height: 50, left: 371, top: 421, width: 50 };
const sizeCompareChoiceRects: Record<string, QuestStageSourceRect> = {
  'hole-1': { height: 136, left: 850, top: 270, width: 252 },
  'hole-2': { height: 136, left: 850, top: 437, width: 252 },
};
const sizeCompareFallbackChoiceRect = { height: 136, left: 850, top: 318, width: 252 };
const illustratedChoiceSceneImageRect = { height: 392, left: 116, top: 230, width: 660 };
const illustratedChoiceTwoChoiceRects: QuestStageSourceRect[] = [
  { height: 136, left: 850, top: 270, width: 252 },
  { height: 136, left: 850, top: 437, width: 252 },
];
const illustratedChoiceThreeChoiceRects: QuestStageSourceRect[] = [
  { height: 112, left: 850, top: 244, width: 252 },
  { height: 112, left: 850, top: 376, width: 252 },
  { height: 112, left: 850, top: 508, width: 252 },
];
const illustratedChoiceFallbackChoiceRect = { height: 112, left: 850, top: 376, width: 252 };
const fallbackIllustratedBackgroundSources: Record<QuestCategoryId, number> = {
  language: languageHillBackground,
  math: mathCaveBackground,
  safety: categorySafetyBackground,
  social: socialPlaygroundBackground,
};

function getFallbackIllustratedBackgroundSource(categoryId: QuestCategoryId) {
  return fallbackIllustratedBackgroundSources[categoryId];
}

function getIndexedChoiceRects(step: QuestStep) {
  const predefinedRects =
    step.choices.length === 2
      ? illustratedChoiceTwoChoiceRects
      : step.choices.length === 3
        ? illustratedChoiceThreeChoiceRects
        : null;

  if (predefinedRects) {
    return Object.fromEntries(
      step.choices.map((choice, index) => [
        choice.id,
        predefinedRects[index] ?? illustratedChoiceFallbackChoiceRect,
      ]),
    );
  }

  const choiceHeight = step.choices.length <= 4 ? 96 : 82;
  const choiceGap = step.choices.length <= 4 ? 16 : 10;
  const totalHeight = step.choices.length * choiceHeight + (step.choices.length - 1) * choiceGap;
  const top = 384 - totalHeight / 2;

  return Object.fromEntries(
    step.choices.map((choice, index) => [
      choice.id,
      {
        height: choiceHeight,
        left: 850,
        top: top + index * (choiceHeight + choiceGap),
        width: 252,
      },
    ]),
  );
}

function getChoiceNumber(label: string) {
  const parsedNumber = Number(label.replace(/\D/g, ''));

  return Number.isFinite(parsedNumber) && parsedNumber > 0 ? parsedNumber : 1;
}

function getQuestStageCircleRect(layout: QuestStageFillLayout, rect: QuestStageSourceRect) {
  const scaledRect = getQuestStageRect(layout, rect);
  const size = Math.min(scaledRect.width, scaledRect.height);

  return {
    height: size,
    left: scaledRect.left + (scaledRect.width - size) / 2,
    top: scaledRect.top + (scaledRect.height - size) / 2,
    width: size,
  };
}

function getPatternPathChoiceColors(choiceId: string) {
  if (choiceId === 'blue') {
    return { border: '#1F78A0', fill: colors.sky, surface: '#E0F5FF' };
  }

  if (choiceId === 'yellow') {
    return { border: '#B88913', fill: colors.yellow, surface: '#FFF8D7' };
  }

  return { border: '#B9352A', fill: '#EF4F3D', surface: '#FFEDE8' };
}

function isQuestAudioAvailable() {
  try {
    return requireOptionalNativeModule('ExpoAudio') !== null;
  } catch {
    return false;
  }
}

async function playOptionalQuestSound(soundAsset: QuestSoundAsset) {
  if (!isQuestAudioAvailable()) {
    return false;
  }

  try {
    const { createAudioPlayer } = await import('expo-audio');
    const player = createAudioPlayer(questSoundSources[soundAsset], {
      keepAudioSessionActive: true,
      updateInterval: 1000,
    });

    player.play();
    setTimeout(() => {
      player.pause();
      player.remove?.();
    }, 1600);
    return true;
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  animalSoundCheckBadge: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    height: '28%',
    justifyContent: 'center',
    position: 'absolute',
    right: '-6%',
    top: '-14%',
    width: '22%',
  },
  animalSoundChoiceCard: {
    alignItems: 'center',
    backgroundColor: '#FFF9EC',
    borderColor: colors.white,
    borderRadius: 28,
    borderWidth: 6,
    elevation: 8,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#70411F',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  animalSoundChoiceLabelText: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  animalSoundSceneImage: {
    position: 'absolute',
  },
  appleCountApplesImage: {
    position: 'absolute',
  },
  footprintSequenceLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  footprintSequenceLabelText: {
    color: '#FFF2C4',
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
    textShadowColor: 'rgba(45, 22, 8, 0.78)',
    textShadowOffset: { height: 2, width: 0 },
    textShadowRadius: 2,
  },
  footprintSequenceMissingSlot: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 249, 236, 0.76)',
    borderColor: '#5B3924',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 3,
    height: '82%',
    justifyContent: 'center',
    width: '86%',
  },
  footprintSequenceMissingSlotText: {
    color: '#FFF2C4',
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
    textShadowColor: 'rgba(45, 22, 8, 0.78)',
    textShadowOffset: { height: 2, width: 0 },
    textShadowRadius: 2,
  },
  appleCountCheckBadge: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    height: '28%',
    justifyContent: 'center',
    position: 'absolute',
    right: '-6%',
    top: '-14%',
    width: '18%',
  },
  appleCountCheckText: {
    color: colors.white,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  appleCountChoiceCard: {
    alignItems: 'center',
    backgroundColor: '#FFF9EC',
    borderColor: colors.white,
    borderRadius: 28,
    borderWidth: 6,
    elevation: 8,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#70411F',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  appleCountChoiceCorrect: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.green,
  },
  appleCountChoiceDisabled: {
    opacity: 0.68,
  },
  appleCountChoiceDot: {
    backgroundColor: '#E84B3C',
    borderColor: '#B9352A',
    borderRadius: 999,
    borderWidth: 2,
    height: 16,
    width: 16,
  },
  appleCountChoiceDotCorrect: {
    backgroundColor: colors.green,
    borderColor: '#4E8F36',
  },
  appleCountChoiceIncorrect: {
    backgroundColor: '#FFE8E5',
    borderColor: colors.rose,
  },
  appleCountChoicePressed: {
    transform: [{ scale: 0.96 }],
  },
  appleCountChoiceSelected: {
    borderColor: colors.yellow,
  },
  appleCountDimOverlay: {
    backgroundColor: 'rgba(63, 45, 36, 0.42)',
    borderRadius: 32,
    position: 'absolute',
    zIndex: 5,
  },
  appleCountResultOverlay: {
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 4,
    elevation: 11,
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 18,
    position: 'absolute',
    shadowColor: '#4A2A12',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    zIndex: 6,
  },
  appleCountResultOverlayAction: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 48,
    minWidth: 220,
    paddingHorizontal: 20,
  },
  appleCountResultOverlayActionText: {
    color: colors.white,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  appleCountResultOverlayAnimation: {
    height: 156,
    marginBottom: -2,
    width: 206,
  },
  appleCountResultOverlayMessage: {
    color: colors.ink,
    fontWeight: '800',
    includeFontPadding: false,
    textAlign: 'center',
  },
  appleCountResultOverlayTitle: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  shapeFindCheckBadge: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    height: '34%',
    justifyContent: 'center',
    position: 'absolute',
    right: '-6%',
    top: '-18%',
    width: '24%',
  },
  shapeFindChoiceCard: {
    alignItems: 'center',
    backgroundColor: '#FFF9EC',
    borderColor: colors.white,
    borderRadius: 28,
    borderWidth: 6,
    elevation: 8,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#70411F',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  shapeFindChoiceLabelText: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  shapeFindDoorImage: {
    position: 'absolute',
  },
  shapeFindDoorNumberBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(247, 201, 72, 0.92)',
    borderRadius: 999,
    elevation: 8,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#70411F',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
  },
  shapeFindDoorNumberText: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  patternPathCheckBadge: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    height: '34%',
    justifyContent: 'center',
    position: 'absolute',
    right: '-8%',
    top: '-18%',
    width: '28%',
  },
  patternPathChoiceCard: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 6,
    elevation: 8,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#70411F',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  patternPathChoiceLabelText: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  patternPathChoiceSwatch: {
    borderRadius: 999,
    borderWidth: 4,
  },
  patternPathStonesImage: {
    position: 'absolute',
  },
  sizeCompareCheckBadge: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    height: '28%',
    justifyContent: 'center',
    position: 'absolute',
    right: '-6%',
    top: '-14%',
    width: '22%',
  },
  sizeCompareHoleNumberBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(247, 201, 72, 0.9)',
    borderRadius: 999,
    elevation: 8,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#70411F',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
  },
  sizeCompareHoleNumberText: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  sizeCompareNumberChoiceCard: {
    alignItems: 'center',
    backgroundColor: '#FFF9EC',
    borderColor: colors.white,
    borderRadius: 28,
    borderWidth: 6,
    elevation: 8,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#70411F',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  sizeCompareChoiceLabelText: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  sizeCompareChoiceLayer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sizeCompareSceneImage: {
    position: 'absolute',
  },
  appleCountDotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  appleCountChoiceLabelText: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  appleCountPrompt: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 253, 247, 0.92)',
    borderColor: colors.white,
    borderRadius: 26,
    borderWidth: 4,
    justifyContent: 'center',
    paddingHorizontal: 28,
    position: 'absolute',
  },
  appleCountPromptText: {
    color: colors.ink,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
  },
  questContentBackdrop: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 32,
    overflow: 'hidden',
    position: 'absolute',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 22,
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 4,
    gap: 12,
    maxWidth: 680,
    overflow: 'hidden',
    padding: 18,
    position: 'relative',
    width: '62%',
  },
  panelDimOverlay: {
    backgroundColor: 'rgba(63, 45, 36, 0.42)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 5,
  },
  panelResultOverlay: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 4,
    elevation: 10,
    gap: 8,
    justifyContent: 'center',
    left: 24,
    paddingHorizontal: 22,
    paddingVertical: 18,
    position: 'absolute',
    right: 24,
    shadowColor: '#4A2A12',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    top: '18%',
    zIndex: 6,
  },
  eyebrow: {
    color: colors.sky,
    fontSize: 16,
    fontWeight: '900',
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
  },
  prompt: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  instruction: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: colors.skySoft,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 4,
    justifyContent: 'center',
    minHeight: 74,
    minWidth: 136,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  choicePressed: {
    transform: [{ scale: 0.97 }],
  },
  choiceSelected: {
    borderColor: colors.yellow,
  },
  choiceCorrect: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.green,
  },
  choiceDisabled: {
    opacity: 0.62,
  },
  choiceIncorrect: {
    backgroundColor: '#FFE8E5',
    borderColor: colors.rose,
  },
  choiceText: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  choiceResultText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'center',
  },
  feedback: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'center',
  },
  feedbackSuccess: {
    color: colors.green,
  },
  primaryButton: {
    alignSelf: 'center',
    backgroundColor: colors.orange,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 3,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  resultOverlayAction: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 3,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  resultOverlayActionText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  resultOverlayAnimation: {
    height: 144,
    marginBottom: -2,
    width: 192,
  },
  resultOverlayCorrect: {
    backgroundColor: 'rgba(223, 243, 203, 0.97)',
    borderColor: colors.green,
  },
  resultOverlayMessage: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    textAlign: 'center',
  },
  resultOverlayRetry: {
    backgroundColor: 'rgba(255, 243, 214, 0.97)',
    borderColor: colors.yellow,
  },
  resultOverlayTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
});
