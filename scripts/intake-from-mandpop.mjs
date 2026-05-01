#!/usr/bin/env node
/**
 * One-shot adapter: MandpopDataset song folder → reprise-studio data/songs/<id>/
 *
 * Bridges the schema gap between what MandpopDataset currently produces
 * (LRC + metadata.json + audio) and what reprise-studio's engine expects
 * (timeline.json with sections, lyrics{t,end,text,emphasis}, cues, beats).
 *
 * Section boundaries and cue placement are NOT auto-detected — they're
 * hand-curated per song in the SECTIONS map below. Long term, sections +
 * cues should become a first-class output of MandpopDataPipeline.
 *
 * Usage:
 *   node scripts/intake-from-mandpop.mjs <chinese-title> <song-id>
 *
 * Example:
 *   node scripts/intake-from-mandpop.mjs 一直很安靜 yi-zhi-hen-an-jing
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DATASET_ROOT = process.env.MANDPOP_DATASET ?? 'D:\\MandpopDataset';

// ---- Hand-curated section + cue maps -------------------------------------

const SECTIONS = {
  '一直很安靜': [
    { t: 0.0,    end: 19.33,  type: 'intro',       mood: 'still' },
    { t: 19.33,  end: 58.89,  type: 'verse1',      mood: 'soft'  },
    { t: 58.89,  end: 78.0,   type: 'chorus1',     mood: 'ache'  },
    { t: 78.0,   end: 98.42,  type: 'solo',        mood: 'still' },
    { t: 98.42,  end: 116.27, type: 'verse2',      mood: 'soft'  },
    { t: 116.27, end: 150.0,  type: 'chorus2',     mood: 'ache'  },
    { t: 150.0,  end: 176.42, type: 'bridge',      mood: 'still' },
    { t: 176.42, end: 207.0,  type: 'chorus_last', mood: 'ache'  },
  ],
};

const CUES = {
  '一直很安靜': [
    { t: 19.33,  type: 'flash-cold',   label: '第一句人聲進入' },
    { t: 58.89,  type: 'color-flip',   label: '副歌「給你的愛一直很安靜」' },
    { t: 116.27, type: 'iris-open',    label: '副歌二：情緒撐開' },
    { t: 150.0,  type: 'shake-subtle', label: '橋段進入：靜默內收' },
    { t: 176.42, type: 'color-flip',   label: '最後副歌：回到主題' },
    { t: 195.0,  type: 'iris-close',   label: '尾段「你突然不愛我這件事情」前' },
  ],
};

// Lines starting with these prefixes are LRC credits, not lyrics.
const CREDIT_PREFIXES = ['作词', '作曲', '编曲', '原唱', '出品', '【', '制作', '吉他', '大提琴',
  '和声', '混音', '弦乐', '统筹', '监制', '企划', '出品人', '营销', 'OP：', 'SP：'];

// ---- LRC parsing ---------------------------------------------------------

function parseLrc(content) {
  const out = [];
  for (const raw of content.split(/\r?\n/)) {
    const m = raw.match(/^\[(\d+):(\d+)\.(\d+)\](.*)$/);
    if (!m) continue;
    const [, mm, ss, ms, text] = m;
    const t = Number(mm) * 60 + Number(ss) + Number(`0.${ms}`);
    const cleaned = text.trim();
    if (!cleaned) { out.push({ t, text: '', isMarker: true }); continue; }
    if (CREDIT_PREFIXES.some((p) => cleaned.startsWith(p))) continue;
    out.push({ t, text: cleaned, isMarker: false });
  }
  return out;
}

function buildLyricsArray(parsed, duration) {
  const lyrics = [];
  for (let i = 0; i < parsed.length; i += 1) {
    const cur = parsed[i];
    if (cur.isMarker) continue;
    let end = duration;
    for (let j = i + 1; j < parsed.length; j += 1) {
      end = parsed[j].t;
      break;
    }
    // For last lyric, give it a 4-second tail (or until duration).
    const span = end - cur.t;
    if (span > 6) end = cur.t + Math.min(span, 6);
    lyrics.push({ t: round2(cur.t), end: round2(end), text: cur.text });
  }
  return lyrics;
}

const round2 = (x) => Math.round(x * 100) / 100;

// ---- Main ----------------------------------------------------------------

const [chineseTitle, songId] = process.argv.slice(2);
if (!chineseTitle || !songId) {
  console.error('Usage: node scripts/intake-from-mandpop.mjs <chinese-title> <song-id>');
  process.exit(1);
}

const sourceDir = path.join(DATASET_ROOT, 'songs', chineseTitle);
if (!fs.existsSync(sourceDir)) {
  console.error(`✗ Not found: ${sourceDir}`);
  console.error(`  Set MANDPOP_DATASET env var if your dataset lives elsewhere.`);
  process.exit(1);
}

const sections = SECTIONS[chineseTitle];
const cues = CUES[chineseTitle] ?? [];
if (!sections) {
  console.error(`✗ No hand-curated section map for "${chineseTitle}" in scripts/intake-from-mandpop.mjs.`);
  console.error(`  Add an entry to SECTIONS (and optionally CUES) and re-run.`);
  process.exit(1);
}

// Read source files
const metadata = JSON.parse(fs.readFileSync(path.join(sourceDir, 'metadata.json'), 'utf8'));
const lrc = fs.readFileSync(path.join(sourceDir, 'lyrics.lrc'), 'utf8');
const parsed = parseLrc(lrc);
const duration = metadata.duration_sec;
const lyrics = buildLyricsArray(parsed, duration);

// Compose timeline.json
const timeline = {
  meta: {
    song_id: songId,
    title: metadata.title,
    artist: metadata.artist,
    duration: round2(duration),
    bpm: 0,
    key: '',
    created_at: new Date().toISOString().slice(0, 10),
    version: 1,
    source: {
      dataset: 'MandpopDataset',
      youtube_url: metadata.youtube_url,
      lyrics_origin: metadata.lyrics?.source ?? 'lrc',
    },
  },
  sections,
  lyrics,
  cues,
  beats: [],
};

// Output paths
const outDir = path.join(REPO_ROOT, 'data', 'songs', songId);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'timeline.json'), JSON.stringify(timeline, null, 2) + '\n');
console.log(`✓ wrote ${path.relative(REPO_ROOT, path.join(outDir, 'timeline.json'))}`);

// Copy audio (prefer original.mp3, fallback to vocals/instrumental)
const audioCandidates = ['original.mp3', 'vocals.wav', 'instrumental.wav'];
const audioSrcFile = audioCandidates.find((f) => fs.existsSync(path.join(sourceDir, f)));
if (!audioSrcFile) {
  console.warn('! no audio file found (looked for original.mp3 / vocals.wav / instrumental.wav)');
} else {
  const ext = path.extname(audioSrcFile);
  const audioOut = path.join(REPO_ROOT, 'public', 'audio', `${songId}${ext}`);
  fs.mkdirSync(path.dirname(audioOut), { recursive: true });
  fs.copyFileSync(path.join(sourceDir, audioSrcFile), audioOut);
  console.log(`✓ copied audio → ${path.relative(REPO_ROOT, audioOut)}`);
}

// Scaffold config.ts
const audioExt = audioSrcFile ? path.extname(audioSrcFile) : '.mp3';
const configContent = `import type { SongConfig } from '@/engine/types';
import { templatePalette } from '@/theme/palettes/_template';

const config: SongConfig = {
  songId: '${songId}',
  audioSrc: '/audio/${songId}${audioExt}',
  timelineSrc: '/data/songs/${songId}/timeline.json',
  palette: templatePalette,
  sceneMap: {
    intro:       'SceneSilence',
    verse1:      'SceneUnderstanding',
    verse2:      'SceneUnderstanding',
    pre_chorus:  'SceneRainSnow',
    chorus1:     'SceneBrokenWings',
    chorus2:     'SceneBrokenWings',
    chorus_last: 'SceneBrokenWings',
    bridge:      'SceneSilence',
    solo:        'SceneSilence',
    outro:       'SceneFin',
  },
};

export default config;
`;
fs.writeFileSync(path.join(outDir, 'config.ts'), configContent);
console.log(`✓ wrote ${path.relative(REPO_ROOT, path.join(outDir, 'config.ts'))}`);

// Scaffold notes.md if missing
const notesPath = path.join(outDir, 'notes.md');
if (!fs.existsSync(notesPath)) {
  const notes = `# ${metadata.title} — 設計筆記

> Intake 自 MandpopDataset (\`${chineseTitle}\`)，等風格對談後填寫。

## YouTube 參考
${metadata.youtube_url}

## 一句話情緒
（待風格對談）

## 核心意象（3 個以內）
1.
2.
3.

## 色溫走向
intro → verse1 → chorus1 → solo → verse2 → chorus2 → bridge → chorus_last

## Section → Scene 對應表
（先用 config.ts 預設，對談後調整）

## 特殊 cue 視覺決策

## 字體決策
沿用預設

## 禁忌清單

## 跨 scene 統一語彙

## 生產紀錄
- Intake 日：${new Date().toISOString().slice(0, 10)}
- 開工日：
- 交付日：
- 總工時：
- YouTube 連結：
`;
  fs.writeFileSync(notesPath, notes);
  console.log(`✓ wrote ${path.relative(REPO_ROOT, notesPath)}`);
}

console.log(`\nDone. Visit http://localhost:5173/?song=${songId}`);
