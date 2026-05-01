# Scene Brief: SceneNameless

## 1. 定位

- **song_id**: yi-zhi-hen-an-jing
- **section(s)**: chorus1 / chorus2 / chorus_last
- **mood**: ache
- **palette reference**: `@/theme/palettes/yi-zhi-hen-an-jing`

## 2. 情緒一句話

「明明是三個人的電影，我卻始終不能有姓名 — 缺席的存在。」

不是失戀的痛，是「**從未被命名**」的痛。痛覺極度安靜、克制、向內收。

## 3. 主視覺意象（最多三個）

1. **三道光，其中一道極淡**（核心意象）
   畫面有三條垂直細光柱（或三個微光圓點，垂直排列），等距分佈於畫面中下半。**其中一道（中間或左側其中一個）的 alpha 極低（< 0.15）、blur 較重，幾乎看不見**。另外兩道明顯但仍克制（alpha 0.4–0.6）。這是「三個人的電影 / 沒有姓名」的視覺化 — 我在那裡，但你看不見。

2. **空白名牌 / 留白卡片**
   畫面右側或左側偏低處，一個極小的細邊矩形（aspect ratio 約 3:2，寬度 clamp(60px, 6vw, 100px)）。**內部全空、透明、無文字、僅一條極細的邊框**。代表姓名空缺。位置稍微偏離中軸（不要正中），可帶極輕微的浮動（amplitude < 2px，週期 ≥ 6s）。

3. **大量負空間 + 一條低地平線**
   背景沿用 `palette.primary`（cold）的 radial gradient，但 fade 範圍要更廣、更暗，整體比例上**留白超過 60% 是空的**。低地平線（畫面 70% 高度）一條極淡的橫線（同 SceneSilence 的 horizon 寫法），但顏色用 `palette.accent`（paper）的極低透明度。

## 4. 動態規則（能量綁定）

- **三道光的整體亮度**：`brightness = 0.55 + energy * 0.18`（克制範圍）
- **「淡的那道光」alpha**：基底 0.12，**反向綁定能量**（`alpha = 0.12 + (1 - energy) * 0.06`）— 音樂越大聲它越淡（更隱形），音樂越靜它隱約現身（這是這首歌核心意義的視覺化）
- **空白名牌 stroke 寬度**：固定 1px，**不隨 energy 變**
- **空白名牌的水平浮動**：`x_offset = sin(currentTime * 0.5) * 1.5px`（極微）
- **地平線發光**：`glow_alpha = 0.15 + energy * 0.08`

> 拿不到 `currentTime` 就用 motion 的 infinite loop 做（週期 ≥ 6s）。

## 5. 進退場

- 進場：由 `BaseScene` 的 2s fade — **不要**在 scene 內額外寫進場
- 退場：`BaseScene` 處理

## 6. 禁忌

- **絕對禁止暖色** — 不要 sun、warm、blush、wound 任何色（這首副歌不是釋放，是更深的內收）
- **不要爆破式 iris** — `CueFlashLayer` 已經在 cues 裡安排輕量版，scene 不要再加
- **三道光不要對等明亮** — 必須有一道明顯偏弱，否則整個概念就壞了
- **空白名牌不要任何文字、不要圖示、不要動態填入文字效果**
- 不要粒子洪水、不要光暈過度（會變成「神聖光輝」與「沒有姓名」的孤單感衝突）
- 不要任何「三道光裡那道淡的逐漸亮起」的安慰式動畫 — 它**永遠**淡，這就是這首歌的意思

## 7. 交付物

- `src/scenes/SceneNameless.tsx`（新檔）
- `src/scenes/SceneNameless.module.css`（新檔）
- 在 `src/scenes/registry.ts` **加入**新的 import 與 entry（**只加一行 import + 一行進 registry**，不要動既有條目）

## 8. 參考

- `docs/DESIGN.md` §一「設計哲學」、§四「Scene 設計原則」
- `src/scenes/SceneSilence.tsx` + `SceneSilence.module.css`：**reference 實作模式**，必須沿用 CSS-vars-from-React + `color-mix()` 從 token 衍生色的寫法。**不要硬編 hex / rgba。**
- `src/theme/tokens.ts` — 所有顏色 / 時長 / 緩動取自此
- `data/songs/yi-zhi-hen-an-jing/notes.md` — 整體設計意圖
