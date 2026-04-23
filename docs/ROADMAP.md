# ROADMAP.md — 技術路線圖

本文件定義專案的技術選型、檔案結構、Phase 分期、以及每個 Phase 的驗收標準。
**開發前請先讀完這份，再動手。**

---

## 專案目標（Success Criteria）

1. 輸入一份標準 timeline JSON + 音檔，可以在瀏覽器裡播放**完全對齊的 MV**
2. 視覺風格統一、可辨識，不是通用 AI slop
3. 新做一首歌的時間：熟練後 **1 工作天內**完成（含 timeline 標註 + MV 設計）
4. 最終可輸出 **1080p / 60fps MP4** 直接上傳 YouTube

---

## 技術棧（Tech Stack）

### 前端框架層
| 項目 | 選擇 | 原因 |
|---|---|---|
| Build tool | Vite | 熱重載快、設定少 |
| UI 框架 | React 18 | 生態最大、Remotion 原生支援 |
| 語言 | TypeScript | 時間戳/段落等資料結構複雜，型別很重要 |
| 樣式 | CSS Modules | 細膩自訂動畫需要，Tailwind 反而綁手 |

### 動畫與視覺
| 項目 | 選擇 | 用途 |
|---|---|---|
| 主動畫引擎 | Motion (framer-motion) | React 友善、宣告式 |
| Timeline 動畫 | GSAP | 複雜 cue 點序列、sequence 控制 |
| 圖形基礎 | CSS + SVG | 漸層、幾何、光、文字 |
| 粒子/流體 | Canvas 2D | 雨雪、羽毛、光點 |
| Shader 效果 | OGL 或 Three.js（可選） | 抽象氛圍、流體光影 |

### 音訊層
| 項目 | 選擇 | 用途 |
|---|---|---|
| 播放 | HTMLAudioElement | 最穩、跨瀏覽器 |
| 分析 | Web Audio API `AnalyserNode` | 即時頻譜、能量曲線 |
| 精準時鐘 | `AudioContext.currentTime` | 高精度同步 |

### 輸出層
| 項目 | 選擇 | 用途 |
|---|---|---|
| MP4 渲染 | Remotion | React 元件 → 影片 |
| 備援方案 | OBS 螢幕錄影 | Remotion 做不了的快速產出 |

### 資料層（**不在本 repo**）

音檔分離、歌詞對齊、段落標註由**另一個資料 repo** 負責。
本 repo 消費符合 `src/engine/types.ts` 和 `examples/timeline.example.json` schema 的 `timeline.json`。

---

## 檔案結構（建議）

```
your-project/
├── CLAUDE.md                      # Claude Code 準則（移自 kit）
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── docs/                          # 從 kit 移入
│   ├── ROADMAP.md
│   ├── DESIGN.md
│   ├── DATA_PIPELINE.md
│   └── WORKFLOW.md
│
├── src/
│   ├── main.tsx                   # 入口
│   ├── App.tsx                    # 主 layout
│   │
│   ├── theme/
│   │   ├── tokens.ts              # 色票、字體、間距、時長（核心）
│   │   ├── fonts.css              # 字體載入
│   │   └── palettes/              # 每首歌可有獨立色票
│   │       └── seeing-farthest.ts
│   │
│   ├── engine/                    # 核心引擎（換歌不動）
│   │   ├── Player.tsx             # 主控元件
│   │   ├── useAudioClock.ts       # 音訊主時鐘 hook
│   │   ├── useTimeline.ts         # timeline 查詢 hook
│   │   ├── useAudioEnergy.ts      # 能量/頻譜 hook
│   │   ├── SceneRouter.tsx        # 依 section 切換 scene
│   │   └── types.ts               # TimelineEntry, Section, Cue 等型別
│   │
│   ├── scenes/                    # 每一幕一個檔案
│   │   ├── _BaseScene.tsx         # 共用殼層（透明過場、grain 濾鏡）
│   │   ├── SceneSilence.tsx       # 寂靜之海（冷色、月、霧）
│   │   ├── SceneUnderstanding.tsx # 懂得（雙光束 + 光球）
│   │   ├── SceneBrokenWings.tsx   # 跌斷翅膀（羽毛墜落）
│   │   ├── SceneSunrise.tsx       # 看得最遠的地方（曙光高潮）
│   │   ├── SceneRainSnow.tsx      # 雨雪堅持（冷雨 + 暖光核心）
│   │   ├── SceneSkyward.tsx       # 仰望星空
│   │   └── SceneFin.tsx           # 尾幕
│   │
│   ├── layers/                    # 跨 scene 的疊加層
│   │   ├── LyricLayer.tsx         # 歌詞文字渲染
│   │   ├── GrainLayer.tsx         # 顆粒濾鏡
│   │   ├── CueFlashLayer.tsx      # cue 點觸發的閃光
│   │   └── ProgressBar.tsx
│   │
│   ├── remotion/                  # 輸出配置
│   │   ├── Root.tsx
│   │   └── Composition.tsx
│   │
│   └── utils/
│       ├── timeline.ts            # JSON 讀取、校驗、查詢
│       ├── interp.ts              # easing, lerp, smoothstep
│       └── audio.ts
│
├── public/
│   ├── audio/
│   │   └── seeing-farthest.mp3
│   └── fonts/                     # 本地字體（若有）
│
└── data/
    └── songs/
        └── seeing-farthest/
            ├── timeline.json      # 從資料 repo 拉進來
            ├── config.ts          # 本首歌的 scene 順序與 palette
            └── notes.md           # 設計筆記
```

> 音檔放 `public/audio/<song-id>.mp3`（前端播放用，壓縮版即可）。
> 原始 WAV 和對齊草稿屬於資料 repo 的範圍，不進本 repo。

---

## Phase 0 — 專案骨架

**目標**：把空專案跑起來、能載入 timeline、能播放音檔。

### 任務
1. 專案結構已就緒（Vite + React + TS + Motion + GSAP + Remotion 依賴已在 `package.json`）
2. `npm install`
3. `src/engine/types.ts` 定義資料型別（已完成）
4. `src/engine/useAudioClock.ts`（最小實作，已完成）
5. `App.tsx` 載入音檔 → 按 play → 顯示當前時間（已完成）

### 驗收
- [ ] `npm run dev` 可以跑
- [ ] 頁面有音訊控制、顯示 `currentTime`
- [ ] TypeScript 沒有 error（`npm run typecheck`）
- [ ] `types.ts` 定義了 `TimelineEntry`, `Section`, `Cue`, `SongConfig`

**預估時間**：1–2 小時

---

## Phase 1 — Timeline 載入與同步

**目標**：歌詞能依照 timeline 在正確時間點顯示。

### 任務
1. 實作 `useTimeline(currentTime, timeline)` hook，回傳 `{ currentLyric, currentSection, nextCue }`
2. 實作 `LyricLayer.tsx`，顯示當前歌詞，有淡入淡出過場
3. 建立 `data/songs/seeing-farthest/timeline.json`（可先手動填 5–10 句）
4. `App.tsx` 載入 timeline + 音檔 → 播放時歌詞跟著顯示
5. 寫 `utils/timeline.ts`：JSON 載入與基本驗證

### 驗收
- [ ] 播放音檔時歌詞精準顯示（人眼看不出延遲）
- [ ] 暫停、拖曳進度條，歌詞即時跟上
- [ ] 歌詞切換有 fade 動畫，不會跳
- [ ] 如果 timeline 有 gap（純音樂段），歌詞區域乾淨不殘留

**預估時間**：3–4 小時

---

## Phase 2 — 第一個完整 scene

**目標**：做出一幕完整、可重用的 scene，建立後續 scene 的範本。

### 任務
1. 設計 `_BaseScene.tsx`：提供 scene 的標準殼層（進場/退場過場、統一 z-index）
2. 實作 `SceneSilence.tsx`（建議從這幕開始，氣氛靜、元素單純）
3. 實作 `SceneRouter.tsx`：依 `currentSection` 切換 scene，處理 crossfade
4. 在 `config.ts` 設定 section → scene 的對應
5. 調整 `theme/tokens.ts`：把 SceneSilence 用到的所有顏色、時長抽出去

### 驗收
- [ ] 音樂播到 intro 段，SceneSilence 出現
- [ ] 進場有 2 秒 fade，不突兀
- [ ] 切到下一段會順暢淡出
- [ ] Scene 內所有參數都在 tokens 裡，沒有 magic number

**預估時間**：4–6 小時

---

## Phase 3 — 完整一首歌

**目標**：一首歌從頭到尾都是完整的 MV。

### 任務
1. 依 `seeing-farthest/config.ts` 實作所有 scene（參考第一次 demo 的七幕）
2. 實作 `CueFlashLayer.tsx`：cue 點觸發的閃光、震動、色彩翻轉
3. 實作 `useAudioEnergy.ts`：把 RMS 能量曲線綁到 scene 的呼吸感
4. 整份 timeline 標註完整（每句 + 所有 cue 點 + section 邊界）
5. 加 `GrainLayer.tsx` 與其他共用疊加層
6. Bug 修正：對齊偏差、過場卡頓、字體載入閃爍

### 驗收
- [ ] 整首歌從頭到尾可播放，視覺連貫
- [ ] 副歌爆發點有明顯但不俗氣的視覺回應
- [ ] 歌詞字體呈現優雅，無 FOUC（閃爍）
- [ ] 瀏覽器 performance monitor 幀率 > 50fps

**預估時間**：2–3 個工作天

---

## Phase 4 — MP4 輸出

**目標**：能輸出給 YouTube 用的 MP4。

### 任務
1. 設定 `src/remotion/`（Composition + Root）
2. 把現有 scene 包進 Remotion 的 `<Sequence>` / 依 frame 驅動
3. 音訊掛到 Remotion（注意：Remotion 用 frame 而非 `currentTime`）
4. `npx remotion render` 輸出測試
5. 解決 CSS 動畫與 Remotion frame 模型的差異（有些 CSS animation 不能用，要改成 frame-based）

### 驗收
- [ ] 輸出 1080p / 60fps / H.264 MP4
- [ ] 畫面與音訊完全對齊，無漂移
- [ ] 檔案大小合理（4 分鐘 < 200MB）
- [ ] 在 VLC / QuickTime / YouTube 播放正常

**預估時間**：1–2 個工作天（Remotion 首次學習曲線）

---

## Phase 5 — 流程驗證（第二首歌）

**目標**：證明這套系統「換歌不換 code」。

### 任務
1. 選第二首歌，走完整個 `docs/WORKFLOW.md`
2. 新增 `data/songs/second-song/` 目錄
3. **禁止修改 engine 和 scenes 目錄**（除非發現 bug），只能加新 scene、改 tokens、改 config
4. 完成後統計：總耗時、哪些步驟卡住、哪些 scene 可以再抽象

### 驗收
- [ ] 第二首歌能跑完整流程
- [ ] 修改行數集中在 `data/` 和 `theme/palettes/`
- [ ] 實際耗時 ≤ 第一首的 40%
- [ ] 寫一份 retrospective 到 `docs/`

---

## 後續可擴展方向

- **Pitch sync**：抽取人聲音高曲線，讓視覺跟著旋律起伏
- **多語言歌詞層**：中文 + 羅馬拼音 + 英文翻譯
- **互動式 MV**：滑鼠 hover 切換視角、按空白鍵慢動作
- **Live mode**：翻唱直播時即時產生視覺
- **AI 生成輔助**：用 Stable Diffusion 生成每段的背景素材圖
