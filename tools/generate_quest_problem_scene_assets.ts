import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import sharp from 'sharp';

import { getQuestProblemScene, type QuestProblemSceneItem } from '../src/content/questProblemScenes';
import { quests } from '../src/content/quests';

const workspaceRoot = process.cwd();
const outputDir = resolve(workspaceRoot, 'assets/images/quests/problem-scenes');
const assetFileModulePath = resolve(workspaceRoot, 'src/content/questProblemSceneAssetFiles.ts');
const assetModulePath = resolve(workspaceRoot, 'src/content/questProblemSceneAssets.ts');
const imageWidth = 1200;
const imageHeight = 714;

const categoryPalettes = {
  language: {
    accent: '#68B76C',
    background: '#DDF5E9',
    ground: '#86C66B',
    shadow: '#3F6E42',
    sky: '#CDEFFD',
  },
  math: {
    accent: '#F2B647',
    background: '#F5DFB1',
    ground: '#B27642',
    shadow: '#674024',
    sky: '#8D684B',
  },
  safety: {
    accent: '#F28C36',
    background: '#FFE1B3',
    ground: '#D99145',
    shadow: '#835025',
    sky: '#BFEAF3',
  },
  social: {
    accent: '#E68CCB',
    background: '#F6E0F1',
    ground: '#8BC976',
    shadow: '#6B4B66',
    sky: '#DDF2FF',
  },
} as const;

async function main() {
  const [meeroImage, friendImage] = await Promise.all([
    readDataUri('assets/images/brand/meero-character.png'),
    readDataUri('assets/images/characters/desert-fox-girl-simple-dress.png'),
  ]);
  const fallbackQuests = quests.filter((quest) => !quest.visualLayout);

  await mkdir(outputDir, { recursive: true });

  const assetFiles: Record<string, string> = {};

  for (const quest of fallbackQuests) {
    const scene = getQuestProblemScene(quest.id, quest.categoryId);
    const svg = renderSceneSvg({
      categoryId: scene.categoryId,
      friendImage,
      items: scene.items,
      meeroImage,
      questId: quest.id,
    });
    const filePath = resolve(outputDir, `${quest.id}.png`);

    await sharp(Buffer.from(svg)).png().toFile(filePath);
    assetFiles[quest.id] = `assets/images/quests/problem-scenes/${quest.id}.png`;
  }

  await writeFile(assetFileModulePath, renderAssetFileModule(assetFiles));
  await writeFile(assetModulePath, renderAssetModule(assetFiles));
}

async function readDataUri(relativePath: string) {
  const buffer = await readFile(resolve(workspaceRoot, relativePath));

  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function renderSceneSvg({
  categoryId,
  friendImage,
  items,
  meeroImage,
  questId,
}: {
  categoryId: keyof typeof categoryPalettes;
  friendImage: string;
  items: QuestProblemSceneItem[];
  meeroImage: string;
  questId: string;
}) {
  const palette = categoryPalettes[categoryId];
  const objectItems = items.filter((item) => item.kind !== 'character');
  const itemVisuals = objectItems
    .map((item, index) => renderItemVisual(item, index, objectItems.length, palette.accent))
    .join('\n');

  return svg`
    <svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" viewBox="0 0 ${imageWidth} ${imageHeight}">
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="${palette.shadow}" flood-opacity="0.24"/>
        </filter>
        <linearGradient id="backdrop" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="${palette.sky}"/>
          <stop offset="0.58" stop-color="${palette.background}"/>
          <stop offset="1" stop-color="${palette.ground}"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${imageWidth}" height="${imageHeight}" rx="42" fill="url(#backdrop)"/>
      ${renderCategoryBackdrop(categoryId)}
      <ellipse cx="600" cy="610" rx="430" ry="58" fill="${palette.shadow}" opacity="0.14"/>
      <g filter="url(#softShadow)">
        <image href="${meeroImage}" x="92" y="338" width="220" height="260" preserveAspectRatio="xMidYMid meet"/>
        <image href="${friendImage}" x="908" y="330" width="210" height="270" preserveAspectRatio="xMidYMid meet"/>
      </g>
      <g data-quest-id="${questId}" filter="url(#softShadow)">
        ${itemVisuals}
      </g>
    </svg>
  `;
}

function renderCategoryBackdrop(categoryId: keyof typeof categoryPalettes) {
  if (categoryId === 'math') {
    return svg`
      <path d="M0 0h1200v185c-105 36-205 44-334 21-125-21-233-13-351 31-137 50-292 48-515 10z" fill="#72513C" opacity="0.28"/>
      <path d="M58 116l42 92 43-92zM1044 84l52 118 54-118z" fill="#E8B852" opacity="0.5"/>
      <path d="M100 542c190-74 326-82 520-20 167 53 304 42 480-34v226H0V576c35-10 69-21 100-34z" fill="#8F5F37" opacity="0.38"/>
    `;
  }

  if (categoryId === 'language') {
    return svg`
      <circle cx="1010" cy="118" r="58" fill="#FFE083" opacity="0.9"/>
      <path d="M0 515c156-105 291-110 450-15 147 88 263 87 412 4 131-72 225-68 338 11v199H0z" fill="#5FAF62" opacity="0.45"/>
      <path d="M100 174c62-66 124-64 185 0M778 180c73-75 143-74 211 0" fill="none" stroke="#FFFFFF" stroke-width="28" stroke-linecap="round" opacity="0.62"/>
    `;
  }

  if (categoryId === 'social') {
    return svg`
      <rect x="106" y="105" width="162" height="18" rx="9" fill="#E07ABB" opacity="0.8"/>
      <rect x="179" y="110" width="18" height="138" rx="9" fill="#8D6C57" opacity="0.7"/>
      <path d="M1020 170c0 75-51 136-114 136s-114-61-114-136 51-136 114-136 114 61 114 136z" fill="#95CE73" opacity="0.5"/>
      <path d="M0 540c126-60 230-67 374-28 174 47 314 48 474 6 132-35 235-27 352 38v158H0z" fill="#6DBA65" opacity="0.4"/>
    `;
  }

  return svg`
    <circle cx="1025" cy="115" r="60" fill="#FFE08F" opacity="0.85"/>
    <path d="M70 540c100-92 186-120 286-87 92 30 179 17 270-34 115-65 216-61 318 13 69 51 150 75 256 62v220H0V590c27-14 51-31 70-50z" fill="#C77D38" opacity="0.38"/>
    <path d="M132 372c-12-110 66-158 94-53 42-101 105-62 72 39 95-24 115 47 19 74-79 22-143 0-185-60z" fill="#5FAE54" opacity="0.46"/>
  `;
}

function renderItemVisual(
  item: QuestProblemSceneItem,
  index: number,
  itemCount: number,
  accentColor: string,
) {
  const { x, y } = getItemPosition(index, itemCount);

  if (item.kind === 'path') {
    return renderPathItem(item, x, y, accentColor);
  }

  if (item.kind === 'count') {
    return renderCountItem(item, x, y);
  }

  if (item.kind === 'sequence') {
    return renderSequenceItem(item, x, y, accentColor);
  }

  if (item.kind === 'danger') {
    return renderDangerItem(item, x, y);
  }

  if (item.kind === 'safe') {
    return renderSafeItem(item, x, y);
  }

  if (item.kind === 'emotion') {
    return renderEmotionItem(item, x, y);
  }

  if (item.kind === 'place') {
    return renderPlaceItem(item, x, y);
  }

  if (item.kind === 'action') {
    return renderActionItem(item, x, y, accentColor);
  }

  return renderObjectItem(item, x, y, accentColor);
}

function getItemPosition(index: number, itemCount: number) {
  if (itemCount <= 1) {
    return { x: 560, y: 330 };
  }

  if (itemCount === 2) {
    return [
      { x: 455, y: 334 },
      { x: 710, y: 334 },
    ][index];
  }

  return [
    { x: 400, y: 332 },
    { x: 600, y: 284 },
    { x: 800, y: 332 },
    { x: 500, y: 470 },
    { x: 700, y: 470 },
  ][index] ?? { x: 600, y: 380 };
}

function renderPathItem(item: QuestProblemSceneItem, x: number, y: number, accentColor: string) {
  const length = item.size === 'large' ? 250 : item.size === 'small' ? 145 : 195;
  const stones = item.size === 'large' ? 6 : item.size === 'small' ? 3 : 4;
  const stoneStep = length / Math.max(stones - 1, 1);

  return svg`
    <g>
      <path d="M${x - length / 2} ${y + 42}C${x - length / 4} ${y - 8} ${x + length / 4} ${y + 92} ${x + length / 2} ${y + 35}" fill="none" stroke="#8B918A" stroke-width="36" stroke-linecap="round"/>
      ${Array.from({ length: stones })
        .map((_, stoneIndex) => {
          const stoneX = x - length / 2 + stoneIndex * stoneStep;
          const stoneY = y + 42 + Math.sin(stoneIndex * 1.6) * 20;

          return `<ellipse cx="${stoneX}" cy="${stoneY}" rx="31" ry="19" fill="#BBC0BE" stroke="#69716D" stroke-width="5"/>`;
        })
        .join('')}
      <circle cx="${x + length / 2 + 20}" cy="${y + 18}" r="15" fill="${accentColor}" opacity="0.86"/>
    </g>
  `;
}

function renderCountItem(item: QuestProblemSceneItem, x: number, y: number) {
  const count = Math.min(item.count ?? 1, 10);
  const isGem = item.label.includes('보석');
  const fill = isGem ? '#54C8EE' : '#B7BCBA';
  const stroke = isGem ? '#177AA2' : '#737A76';

  return svg`
    <g>
      ${Array.from({ length: count })
        .map((_, dotIndex) => {
          const column = dotIndex % 5;
          const row = Math.floor(dotIndex / 5);
          const dotX = x - 96 + column * 48 + (row % 2) * 24;
          const dotY = y + row * 50;

          if (isGem) {
            return `<path d="M${dotX} ${dotY - 23}l25 25-25 25-25-25z" fill="${fill}" stroke="${stroke}" stroke-width="5"/>`;
          }

          return `<ellipse cx="${dotX}" cy="${dotY}" rx="25" ry="18" fill="${fill}" stroke="${stroke}" stroke-width="5"/>`;
        })
        .join('')}
    </g>
  `;
}

function renderSequenceItem(item: QuestProblemSceneItem, x: number, y: number, accentColor: string) {
  const values = item.values ?? ['?'];
  const startX = x - (values.length - 1) * 45;

  return svg`
    <g>
      ${values
        .map((value, valueIndex) => {
          const badgeX = startX + valueIndex * 90;
          const fill = value === '?' ? '#FFF8DF' : '#EFE2BE';
          const dash = value === '?' ? 'stroke-dasharray="10 9"' : '';

          return svg`
            <ellipse cx="${badgeX}" cy="${y}" rx="43" ry="33" fill="${fill}" stroke="${accentColor}" stroke-width="6" ${dash}/>
            <text x="${badgeX}" y="${y + 11}" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#493427">${escapeXml(value)}</text>
          `;
        })
        .join('')}
    </g>
  `;
}

function renderDangerItem(item: QuestProblemSceneItem, x: number, y: number) {
  if (item.id.includes('light')) {
    return svg`
      <g>
        <rect x="${x - 45}" y="${y - 98}" width="90" height="178" rx="36" fill="#363D3F" stroke="#1F2425" stroke-width="7"/>
        <circle cx="${x}" cy="${y - 50}" r="24" fill="#F25544"/>
        <circle cx="${x}" cy="${y + 2}" r="24" fill="#E7C842"/>
        <circle cx="${x}" cy="${y + 54}" r="24" fill="#5FBF56"/>
      </g>
    `;
  }

  if (item.id.includes('pot')) {
    return svg`
      <g>
        <path d="M${x - 80} ${y - 8}h160l-18 96H${x - 62}z" fill="#7F8589" stroke="#444B4E" stroke-width="7"/>
        <rect x="${x - 110}" y="${y + 2}" width="220" height="28" rx="14" fill="#60666A"/>
        <path d="M${x - 48} ${y - 52}c-28-35 34-43 4-84M${x + 12} ${y - 51}c-28-35 34-43 4-84M${x + 70} ${y - 48}c-28-35 34-43 4-84" fill="none" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" opacity="0.82"/>
      </g>
    `;
  }

  if (item.id.includes('fire')) {
    return svg`
      <path d="M${x} ${y - 124}c50 48 23 82 63 121 27 26 23 96-63 96s-98-68-57-123c34-45 20-74 57-94z" fill="#F58238" stroke="#C64128" stroke-width="7"/>
      <path d="M${x + 2} ${y - 45}c25 23 13 48 34 68 14 13 9 44-34 44s-49-33-27-61c17-21 12-38 27-51z" fill="#FFD45B"/>
    `;
  }

  if (item.id.includes('road') || item.id.includes('wet')) {
    return svg`
      <path d="M${x - 135} ${y + 92}L${x - 48} ${y - 118}h96l87 210z" fill="#585E61" stroke="#393E40" stroke-width="6"/>
      <path d="M${x} ${y + 70}v-166" stroke="#FFE88A" stroke-width="12" stroke-linecap="round" stroke-dasharray="28 26"/>
      ${item.id.includes('road') ? `<circle cx="${x - 78}" cy="${y + 15}" r="32" fill="#F2A52E" stroke="#B56D1E" stroke-width="6"/>` : `<path d="M${x - 86} ${y + 22}c48-45 83-45 132 0-37 33-86 35-132 0z" fill="#7FD8F4" opacity="0.82"/>`}
    `;
  }

  if (item.id.includes('outlet')) {
    return svg`
      <rect x="${x - 82}" y="${y - 82}" width="164" height="164" rx="32" fill="#F8F3E8" stroke="#8F8A80" stroke-width="7"/>
      <circle cx="${x - 34}" cy="${y}" r="13" fill="#575D60"/>
      <circle cx="${x + 34}" cy="${y}" r="13" fill="#575D60"/>
    `;
  }

  if (item.id.includes('pill')) {
    return svg`
      <g transform="rotate(-28 ${x} ${y})">
        <rect x="${x - 98}" y="${y - 39}" width="196" height="78" rx="39" fill="#FFFFFF" stroke="#6B7377" stroke-width="6"/>
        <path d="M${x} ${y - 39}v78" stroke="#6B7377" stroke-width="6"/>
        <path d="M${x - 98} ${y - 39}h98v78h-98z" fill="#FF8C7C" opacity="0.78"/>
      </g>
    `;
  }

  if (item.id.includes('scissors')) {
    return svg`
      <circle cx="${x - 58}" cy="${y + 42}" r="31" fill="none" stroke="#4E5961" stroke-width="12"/>
      <circle cx="${x + 10}" cy="${y + 42}" r="31" fill="none" stroke="#4E5961" stroke-width="12"/>
      <path d="M${x - 28} ${y + 20}L${x + 98} ${y - 92}M${x - 22} ${y + 20}L${x + 108} ${y + 96}" stroke="#AEB8BE" stroke-width="17" stroke-linecap="round"/>
    `;
  }

  if (item.id.includes('door')) {
    return svg`
      <rect x="${x - 94}" y="${y - 120}" width="188" height="212" rx="20" fill="#C98B4B" stroke="#7B4E2A" stroke-width="8"/>
      <rect x="${x - 58}" y="${y - 76}" width="116" height="132" rx="16" fill="#9A6534" opacity="0.55"/>
    `;
  }

  if (item.id.includes('dog')) {
    return renderObjectItem({ ...item, label: '강아지' }, x, y, '#E5A650');
  }

  return svg`
    <g>
      <path d="M${x} ${y - 115}l112 202H${x - 112}z" fill="#FFE0D8" stroke="#E04F40" stroke-width="8"/>
      <text x="${x}" y="${y + 23}" text-anchor="middle" font-family="Arial, sans-serif" font-size="98" font-weight="900" fill="#D53C32">!</text>
    </g>
  `;
}

function renderSafeItem(item: QuestProblemSceneItem, x: number, y: number) {
  return svg`
    <g>
      <circle cx="${x}" cy="${y}" r="92" fill="#DCF4CF" stroke="#63A84E" stroke-width="8"/>
      <path d="M${x - 52} ${y + 4}l34 35 74-86" fill="none" stroke="#4E9A3D" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      ${item.id.includes('adult') || item.id.includes('guardian') || item.id.includes('teacher') || item.id.includes('owner') ? `<circle cx="${x + 76}" cy="${y - 64}" r="38" fill="#FFF4DE" stroke="#B8794A" stroke-width="6"/><rect x="${x + 43}" y="${y - 28}" width="66" height="82" rx="28" fill="#6FB9D8" stroke="#3B7890" stroke-width="6"/>` : ''}
    </g>
  `;
}

function renderEmotionItem(item: QuestProblemSceneItem, x: number, y: number) {
  const sad = item.id.includes('sad') || item.label.includes('슬');
  const angry = item.id.includes('angry') || item.label.includes('화');

  return svg`
    <g>
      <circle cx="${x}" cy="${y}" r="88" fill="#FFE28A" stroke="#C88D2C" stroke-width="8"/>
      <circle cx="${x - 32}" cy="${y - 18}" r="10" fill="#453127"/>
      <circle cx="${x + 32}" cy="${y - 18}" r="10" fill="#453127"/>
      ${sad ? `<path d="M${x - 38} ${y + 42}c24-30 52-30 76 0" fill="none" stroke="#453127" stroke-width="9" stroke-linecap="round"/><path d="M${x + 50} ${y + 2}c20 27-2 43-16 28-14-15 6-29 16-28z" fill="#6CC4F2"/>` : angry ? `<path d="M${x - 43} ${y - 48}l34 18M${x + 43} ${y - 48}l-34 18M${x - 36} ${y + 38}c25 15 47 15 72 0" stroke="#453127" stroke-width="9" stroke-linecap="round" fill="none"/>` : `<path d="M${x - 42} ${y + 22}c26 36 58 36 84 0" fill="none" stroke="#453127" stroke-width="9" stroke-linecap="round"/>`}
    </g>
  `;
}

function renderPlaceItem(item: QuestProblemSceneItem, x: number, y: number) {
  return svg`
    <g>
      <rect x="${x - 115}" y="${y - 92}" width="230" height="184" rx="18" fill="#B88A5B" stroke="#6F4F32" stroke-width="7"/>
      ${Array.from({ length: 4 })
        .map((_, row) => `<rect x="${x - 82}" y="${y - 60 + row * 34}" width="164" height="18" rx="9" fill="${row % 2 === 0 ? '#EBD07C' : '#90C9E8'}"/>`)
        .join('')}
    </g>
  `;
}

function renderActionItem(item: QuestProblemSceneItem, x: number, y: number, accentColor: string) {
  const isJump = item.id.includes('jump');
  const isBreathe = item.id.includes('breathe');
  const isBye = item.id.includes('bye');

  return svg`
    <g>
      <path d="M${x - 98} ${y - 52}q98-74 196 0v98q-98 73-196 0z" fill="#FFF8EA" stroke="${accentColor}" stroke-width="8"/>
      ${isJump ? `<path d="M${x - 52} ${y + 35}c35-92 69-92 104 0" fill="none" stroke="#4F8B45" stroke-width="16" stroke-linecap="round"/><path d="M${x + 36} ${y - 66}l35 20-35 20" fill="none" stroke="#4F8B45" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      ${isBreathe ? `<path d="M${x - 62} ${y - 18}c38-36 87-36 126 0M${x - 42} ${y + 28}c26-23 58-23 84 0" fill="none" stroke="#63A84E" stroke-width="12" stroke-linecap="round"/>` : ''}
      ${isBye ? `<path d="M${x - 46} ${y + 30}c56-78 86-80 122-16M${x - 11} ${y - 34}l45-30M${x + 8} ${y - 17}l55-10" fill="none" stroke="#4F8B45" stroke-width="13" stroke-linecap="round"/>` : ''}
      ${!isJump && !isBreathe && !isBye ? `<circle cx="${x}" cy="${y}" r="42" fill="${accentColor}" opacity="0.85"/><path d="M${x - 23} ${y + 3}l18 18 39-47" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    </g>
  `;
}

function renderObjectItem(item: QuestProblemSceneItem, x: number, y: number, accentColor: string) {
  if (item.label.includes('바위') || item.label.includes('조약돌')) {
    const scale = item.size === 'large' ? 1.28 : item.size === 'small' ? 0.72 : 1;
    const rockWidth = 160 * scale;
    const rockHeight = 112 * scale;

    return svg`
      <g>
        <ellipse cx="${x}" cy="${y + 26 * scale}" rx="${rockWidth / 2}" ry="${rockHeight / 2}" fill="#8B7B68" stroke="#5C5146" stroke-width="${7 * scale}"/>
        <path d="M${x - 46 * scale} ${y + 3 * scale}c36-24 78-22 113 5" fill="none" stroke="#B5A286" stroke-width="${10 * scale}" stroke-linecap="round" opacity="0.48"/>
        <ellipse cx="${x - 30 * scale}" cy="${y + 52 * scale}" rx="${48 * scale}" ry="${16 * scale}" fill="#4B4037" opacity="0.16"/>
      </g>
    `;
  }

  if (item.id.includes('banana')) {
    return `<path d="M${x - 95} ${y + 30}c98 80 202 14 200-96-45 83-111 106-190 57z" fill="#FFD449" stroke="#B98720" stroke-width="7"/>`;
  }

  if (item.id.includes('wind')) {
    return svg`
      <path d="M${x - 105} ${y - 55}h128c62 0 62 68 0 68H${x - 20}" fill="none" stroke="#83CDEA" stroke-width="18" stroke-linecap="round"/>
      <path d="M${x - 60} ${y + 42}h130c45 0 45 52 0 52H${x + 14}" fill="none" stroke="#83CDEA" stroke-width="15" stroke-linecap="round"/>
    `;
  }

  if (item.id.includes('rabbit') || item.id.includes('ears')) {
    return svg`
      <ellipse cx="${x - 32}" cy="${y - 74}" rx="22" ry="70" fill="#FFF5F0" stroke="#B47A6A" stroke-width="6"/>
      <ellipse cx="${x + 34}" cy="${y - 74}" rx="22" ry="70" fill="#FFF5F0" stroke="#B47A6A" stroke-width="6"/>
      <circle cx="${x}" cy="${y + 12}" r="83" fill="#FFF5F0" stroke="#B47A6A" stroke-width="7"/>
      <circle cx="${x - 26}" cy="${y - 8}" r="8" fill="#453127"/><circle cx="${x + 26}" cy="${y - 8}" r="8" fill="#453127"/>
    `;
  }

  if (item.id.includes('umbrella')) {
    return svg`
      <path d="M${x - 112} ${y + 5}a112 112 0 0 1 224 0z" fill="#F46F64" stroke="#B83D36" stroke-width="7"/>
      <path d="M${x} ${y + 5}v102c0 45 60 45 60 0" fill="none" stroke="#5E4A3E" stroke-width="13" stroke-linecap="round"/>
    `;
  }

  if (item.id.includes('clock')) {
    return svg`
      <circle cx="${x}" cy="${y}" r="92" fill="#FFF6DD" stroke="#9B7A45" stroke-width="8"/>
      <path d="M${x} ${y}v-54M${x} ${y}l47 28" stroke="#453127" stroke-width="10" stroke-linecap="round"/>
      <circle cx="${x}" cy="${y}" r="8" fill="#453127"/>
    `;
  }

  if (item.id.includes('sky') || item.id.includes('blue')) {
    return svg`
      <rect x="${x - 114}" y="${y - 84}" width="228" height="168" rx="34" fill="#8FD7F5" stroke="#4598C1" stroke-width="7"/>
      <path d="M${x - 64} ${y + 10}c36-44 81-44 118 0 41-12 70 13 67 45H${x - 103}c-4-31 14-52 39-45z" fill="#FFFFFF" opacity="0.84"/>
    `;
  }

  if (item.id.includes('drawing')) {
    return svg`
      <rect x="${x - 94}" y="${y - 80}" width="188" height="160" rx="18" fill="#FFFDF8" stroke="#AD8A5E" stroke-width="7"/>
      <circle cx="${x - 34}" cy="${y - 12}" r="28" fill="#F5C75D"/>
      <path d="M${x - 73} ${y + 52}l57-54 37 38 35-30 44 46z" fill="#80C77A"/>
    `;
  }

  if (item.id.includes('blocks') || item.id.includes('tower') || item.id.includes('game')) {
    return svg`
      <rect x="${x - 80}" y="${y + 24}" width="72" height="72" rx="12" fill="#4DB6E7" stroke="#26789A" stroke-width="6"/>
      <rect x="${x - 8}" y="${y - 50}" width="72" height="72" rx="12" fill="#F2C84B" stroke="#A98220" stroke-width="6"/>
      <rect x="${x + 58}" y="${y + 18}" width="72" height="72" rx="12" fill="#EE6A5F" stroke="#AB3E38" stroke-width="6"/>
    `;
  }

  if (item.id.includes('toy') || item.id.includes('puzzle')) {
    return svg`
      <path d="M${x - 90} ${y - 74}h180v148h-180z" fill="#FFF6DD" stroke="#A97B3E" stroke-width="7"/>
      <path d="M${x - 90} ${y}h180M${x} ${y - 74}v148" stroke="#A97B3E" stroke-width="7"/>
      <circle cx="${x - 45}" cy="${y - 36}" r="18" fill="#F0665A"/><circle cx="${x + 45}" cy="${y + 36}" r="18" fill="#62B75C"/>
    `;
  }

  if (item.id.includes('books')) {
    return renderPlaceItem(item, x, y);
  }

  if (item.id.includes('water')) {
    return svg`
      <path d="M${x - 108} ${y + 54}c52-73 130-73 216 0-48 60-163 61-216 0z" fill="#79D5F3" stroke="#2C91B6" stroke-width="7"/>
      <path d="M${x + 70} ${y - 72}c36 30 52 60 52 93 0 34-25 56-52 56s-52-22-52-56c0-33 16-63 52-93z" fill="#9DE6FA" stroke="#2C91B6" stroke-width="6"/>
    `;
  }

  if (item.id.includes('pencil')) {
    return svg`
      <g transform="rotate(-18 ${x} ${y})">
        <rect x="${x - 130}" y="${y - 22}" width="210" height="44" rx="18" fill="#F2C94C" stroke="#9E7620" stroke-width="6"/>
        <path d="M${x + 80} ${y - 22}l58 22-58 22z" fill="#F7E0B3" stroke="#9E7620" stroke-width="6"/>
        <path d="M${x + 124} ${y - 8}l14 8-14 8z" fill="#3E3328"/>
      </g>
    `;
  }

  if (item.id.includes('swing')) {
    return svg`
      <path d="M${x - 118} ${y + 100}l70-190M${x + 118} ${y + 100}l-70-190" stroke="#8D6A4D" stroke-width="11" stroke-linecap="round"/>
      <path d="M${x - 44} ${y - 58}v102M${x + 44} ${y - 58}v102" stroke="#6D5B4D" stroke-width="7"/>
      <rect x="${x - 66}" y="${y + 42}" width="132" height="30" rx="12" fill="#E9B04D" stroke="#9B692C" stroke-width="6"/>
    `;
  }

  if (item.id.includes('snack')) {
    return svg`
      <circle cx="${x}" cy="${y}" r="92" fill="#F2C070" stroke="#A96828" stroke-width="7"/>
      ${Array.from({ length: 8 }).map((_, i) => `<circle cx="${x + Math.cos(i * 0.8) * 45}" cy="${y + Math.sin(i * 0.8) * 45}" r="8" fill="#A96828" opacity="0.55"/>`).join('')}
    `;
  }

  if (item.id.includes('marble')) {
    return svg`
      <circle cx="${x}" cy="${y}" r="84" fill="#72C5EC" stroke="#2C80A6" stroke-width="7"/>
      <path d="M${x - 42} ${y - 40}c48-37 92-29 117 14" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity="0.75"/>
    `;
  }

  return svg`
    <g>
      <rect x="${x - 100}" y="${y - 78}" width="200" height="156" rx="38" fill="#FFF8EA" stroke="${accentColor}" stroke-width="8"/>
      <circle cx="${x}" cy="${y}" r="46" fill="${accentColor}" opacity="0.84"/>
    </g>
  `;
}

function renderAssetFileModule(assetFiles: Record<string, string>) {
  return `// Generated by tools/generate_quest_problem_scene_assets.ts\n\nexport const questProblemSceneAssetFiles = ${JSON.stringify(assetFiles, null, 2)} as const;\n\nexport type QuestProblemSceneAssetId = keyof typeof questProblemSceneAssetFiles;\n`;
}

function renderAssetModule(assetFiles: Record<string, string>) {
  const entries = Object.keys(assetFiles)
    .map(
      (questId) =>
        `  '${questId}': require('../../assets/images/quests/problem-scenes/${questId}.png'),`,
    )
    .join('\n');

  return `// Generated by tools/generate_quest_problem_scene_assets.ts\n\nimport type { QuestProblemSceneAssetId } from '@/src/content/questProblemSceneAssetFiles';\n\nexport const questProblemSceneAssets: Record<QuestProblemSceneAssetId, number> = {\n${entries}\n};\n\nexport function getQuestProblemSceneAsset(questId: string) {\n  return questProblemSceneAssets[questId as QuestProblemSceneAssetId];\n}\n`;
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function svg(strings: TemplateStringsArray, ...values: unknown[]) {
  return strings.reduce((result, current, index) => `${result}${current}${values[index] ?? ''}`, '');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
