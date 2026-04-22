# DESIGN.md — 視覺設計系統

本文件是**視覺決策的權威來源**。所有 scene、歌詞排版、色彩、動畫選擇都必須對照這份。
**若發現此文件與 code 衝突，以此文件為準，修 code。**

---

## 一、設計哲學

### 總體定位

> 抒情、抽象、有紙張感、有光、有呼吸、有溫度。
> **不是**科技感、不是商業廣告感、不是 music visualizer 頻譜跳動風。

### 三條底線（絕不違反）

1. **歌詞永遠是主角**。視覺為歌詞服務，不能搶戲。字體排版的品質高於背景特效的複雜度。
2. **沒有內容的動畫是雜訊**。每一個運動都要有音樂或情緒上的理由（對應到 beat、cue、energy、或段落切換）。隨機浮動、裝飾性旋轉、持續發光 — 禁用。
3. **冷暖色溫變化 > 視覺元素堆疊**。用光與色的流動承擔情緒敘事，不要靠不斷換元素。

### 參考坐標（Inspiration）

- **侘寂、留白美學**：日本平面設計、原研哉、杉本博司
- **膠片感**：王家衛電影的氤氳、盧貝松《碧海藍天》的藍
- **編輯設計**：Kinfolk、MONOCLE 的雜誌排版節奏
- **當代抽象音樂視覺**：Max Cooper、Nicolas Jaar 的 live visual

### 要避免的反例（AI Slop 清單）

- ❌ 紫色漸層 + 白色無襯線字
- ❌ 粒子四處亂飛無規則
- ❌ Glitch 效果、賽博龐克
- ❌ 所有元素都在發光、都在動
- ❌ 千篇一律的 Space Grotesk 字體
- ❌ 通用 hero section 式的大標配副標
- ❌ 「乾淨極簡」但其實只是空虛無意圖
- ❌ 爆米花感的副歌特效（閃白、震屏、彩色煙火）

---

## 二、色彩系統（Color Tokens）

### 基底色票（永不改動，做為 fallback）

```ts
// theme/tokens.ts
export const base = {
  ink:    '#0b0f14',  // 最深底色（近黑非黑）
  paper:  '#f5efe3',  // 紙張米白（主要文字用）
  mist:   '#dce4ea',  // 霧感冷灰
  cold:   '#6b8ca8',  // 冷藍灰
  warm:   '#f2a65a',  // 暖橘（副歌用）
  sun:    '#ffd27d',  // 陽光金（高潮用）
  blush:  '#e8b8a0',  // 粉桃（柔情段落）
  wound:  '#3a1e24',  // 酒紅（傷感段落）
};
```

### 每首歌的 palette（獨立設定）

每首歌在 `theme/palettes/xxx.ts` 定義**情緒映射**，不直接用 base 色：

```ts
export const seeingFarthestPalette = {
  intro:       { primary: base.ink,   accent: base.cold,  mood: 'still' },
  verse:       { primary: base.mist,  accent: base.cold,  mood: 'soft'  },
  preChorus:   { primary: base.wound, accent: base.blush, mood: 'ache' },
  chorus:      { primary: base.sun,   accent: base.warm,  mood: 'open' },
  bridge:      { primary: base.ink,   accent: base.sun,   mood: 'defy' },
  outro:       { primary: base.paper, accent: base.wound, mood: 'fin'  },
};
```

### 色溫變化原則

- **走 S 曲線，不要單調上升**：冷 → 暖 → 冷 → 暖 比 冷 → 暖 有張力
- **對比留給高潮**：副歌爆發前一段越冷越好，曙光才有重量
- **永遠保留一抹「反色」**：即使在最暖的畫面裡，也要有一小塊冷色（例如一道藍影）作為錨點

---

## 三、字體系統（Typography）

### 預設組合

| 用途 | 字體 | Weight | 說明 |
|---|---|---|---|
| 中文歌詞正文 | Noto Serif TC | 400 | 襯線、穩重、情緒容器 |
| 中文歌詞強調 | Noto Serif TC | 600 | 僅用於段落首句、副歌關鍵字 |
| 英文副題 | Cormorant Garamond | 300 italic | 手寫感、像書頁注腳 |
| 功能文字（時間、控制） | Cormorant Garamond | 400 | 不用系統字體 |

**絕對禁止**：Inter, Roboto, Arial, Noto Sans 系列, San Francisco, Helvetica（太通用、無性格）。

### 排版原則

1. **行高 1.8–2.0**，抒情歌的文字需要呼吸空間
2. **字距 `letter-spacing: 0.08em~0.14em`**，中文襯線字要鬆一點才優雅
3. **主要文字 `clamp(28px, 4.2vw, 56px)`**，不要固定像素
4. **關鍵字單獨一行**，不要硬擠在長句裡
5. **英文副標永遠小、永遠斜體、永遠次要**，它是注解不是標題

### 歌詞進場動畫

- **單句浮現**：`opacity 0 → 1`, `translateY(18px → 0)`, `transition: 1.6s cubic-bezier(.2,.7,.2,1)`
- **多行交錯**：第二行延遲 450ms，第三行 900ms（依情緒可調慢）
- **退場**：`opacity 1 → 0`, 持續 1.0–1.4s
- **禁用**：逐字跳出、旋轉進場、彈性 bounce、打字機效果（除非特殊段落刻意為之）

---

## 四、Scene 設計原則

### 每個 scene 必須回答三個問題

1. **這一段歌詞的情緒是什麼？**（一個詞，例如「釋放」「懷念」「掙扎」）
2. **用什麼視覺語彙承載？**（一個主元素 + 一個輔助元素，不超過三種）
3. **這個 scene 跟前後如何銜接？**（色溫轉換、元素延續、節奏對比）

### Scene 內部結構（標準四層）

```
z-index  層級                                  類比
-------  ----                                  ----
  1     背景層（漸層、色塊）                   舞台底色
  2     氛圍層（霧、光、紋理）                 舞台燈光
  3     主元素層（月、羽毛、太陽、星）         演員
  4     疊加層（顆粒、vignette）               濾鏡
 10     歌詞層（LyricLayer 獨立管理）           字卡
 50     cue 特效層（閃光、震動）                 特殊燈效
```

每個 scene 只管 1–3 層，其他層由全局 layer 處理。

### 主元素 vocabulary（建立你自己的視覺詞典）

| 意象 | 視覺元素 | 實作方式 |
|---|---|---|
| 寂靜 | 月、靜水面、地平線 | SVG + CSS 漸層 |
| 懂得 | 雙束光、漂浮光點 | CSS beam + 光球動畫 |
| 受傷 | 羽毛墜落、裂紋、深水 | Canvas 2D 粒子 |
| 掙扎 | 雨、雪、風 | Canvas 2D 粒子 |
| 希望 | 曙光、地平線發亮 | 大型 radial gradient |
| 昇華 | 太陽、金光放射 | SVG ray + blur |
| 仰望 | 星空、光柱 | Canvas + CSS 光柱 |
| 釋然 | 紙張質感、圓的脈動 | 純 CSS |

**禁用**：火焰、閃電、爆炸、3D 幾何體旋轉（科技感）、波形頻譜（music visualizer 感）。

---

## 五、動畫原則（Motion）

### 時長參考表

| 類型 | 時長 | 緩動 |
|---|---|---|
| Scene 之間 crossfade | 1.8–2.4s | ease-in-out |
| 歌詞單句淡入 | 1.2–1.8s | cubic-bezier(.2,.7,.2,1) |
| 歌詞單句淡出 | 1.0–1.4s | ease-out |
| Cue 點閃光 | 0.15s 進 + 0.6s 退 | ease-out |
| 背景呼吸（能量驅動） | 3–8s 週期 | sin wave |
| 色溫轉換（段落切換） | 4–6s | ease-in-out |

### 運動規則

1. **不要無止境的動**。每個動畫有起點有終點，loop 的東西（例如呼吸）必須慢（週期 ≥ 3s）
2. **能量驅動 > 時間驅動**。背景呼吸的振幅由 `useAudioEnergy` 的 RMS 值決定，音樂大聲自然強，音樂小聲自然弱
3. **Cue 點才是戲劇瞬間**。除了 cue 點以外，畫面應該是「微動」而非「炸裂」
4. **尊重靜止**。某些段落的最佳動畫是「幾乎不動」，讓歌詞自己發聲

### 能量綁定範例

```ts
// 背景亮度 = 基底 + 能量 × 係數
const brightness = 0.6 + energy * 0.4;

// 粒子數量 = 基底 + 能量 × 係數（但 scene 切換時才更新，不逐幀變）
const particleCount = Math.floor(40 + sectionEnergy * 60);

// 模糊度反向綁定
const blur = 20 - energy * 15;  // 音樂大聲 → 畫面更清晰
```

---

## 六、Cue 點特效庫

所有 cue 點特效**限縮在這個清單內**，不要臨時發明新特效：

| 名稱 | 觸發時機 | 效果 |
|---|---|---|
| `flash-warm` | 副歌第一拍 | 全屏暖色閃光 0.15s，peak 後退回 |
| `flash-cold` | 橋段轉冷 | 全屏冷色閃光，稍弱 |
| `color-flip` | 情緒反轉點 | 主色與 accent 互換，持續下個段落 |
| `shake-subtle` | 強鼓點 | 畫面位移 3px，0.1s 內回正 |
| `iris-open` | 最高點 | 從中心擴散的白光圈，1.5s |
| `iris-close` | 尾幕前 | 反向，收縮至消失 |
| `static-burst` | 情緒破裂 | 0.1s 短暫雜訊顆粒增強 |

**禁用**：彩色撒花、像素閃爍、RGB 錯位（glitch）、時鐘倒轉。

---

## 七、可用性與技術細節

### 字體載入策略

- 使用 `font-display: swap`，但在**播放前**等待字體 ready（避免 MV 第一幕閃爍）
- `document.fonts.ready.then(startPlayback)`

### 解析度與效能

- 目標：1080p / 60fps 穩定
- 粒子總數 < 200（Canvas），CSS 動畫元素 < 100
- 長時間動畫用 `will-change: transform, opacity`，結束後移除

### 無障礙（降低但不忽略）

- `prefers-reduced-motion: reduce` 時，停用所有微動畫，只保留場景切換
- 歌詞顏色與背景對比度 ≥ 4.5:1

---

## 八、設計系統演進紀律

- 新增 token 前先**在此文件新增段落說明**
- 新增 cue 特效前先**在 Cue 點特效庫寫明**
- 廢棄 scene 或元素要**在 notes.md 記錄**原因
- 每完成一首歌，回來檢視 design doc 有沒有要更新

**這份文件是活的。但每次改動都要有紀錄。**
