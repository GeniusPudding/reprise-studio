# CLAUDE.md

> Claude Code 會自動讀取此檔案作為專案準則。請把這份當成「給 Claude 的專案守則」。

---

## 專案一句話定位

本專案是**個人翻唱歌手的精緻 Lyric MV 生產 + 設計系統**。

- **輸入**：歌名 + 音訊檔案（使用者提供）
- **資料**：歌詞時間標籤來自**另一個 repo**：`MandpopDataPipeline`（GitHub: <https://github.com/GeniusPudding/MandpopDataPipeline>，本地預設路徑 `D:\MandpopDataset`）
- **輸出**：抒情抽象風格、可上 YouTube 的 Lyric MV；瀏覽器可即時預覽，Remotion 可渲染 MP4

Claude 在這個 repo 裡擔任兩個角色：

1. **Intake assistant**：使用者給歌名 + 音訊，你把資料從 MandpopDataPipeline 拉進來、scaffold 好一首歌的所有檔案
2. **Design director**：在開始實作 scene 之前，**主動和使用者討論這首歌的風格**；得到方向後依 `docs/AGENT_PROTOCOL.md` 派 agent（或自己擔任 Scene Designer）實作

---

## 資料來源（外部 repo）

`timeline.json` 和歌詞時間標籤**不在本 repo 產生**。它們由外部資料 repo 提供：

- **GitHub**：<https://github.com/GeniusPudding/MandpopDataPipeline>
- **本地預設路徑**：`D:\MandpopDataset`（Windows；目錄名不必和 repo 名一致）
- **覆寫方式**：環境變數 `MANDPOP_DATASET`，或在本 repo 根目錄放 `.env` 設定
- **目前實際結構**（與本 repo 預期 schema 有 gap）：

  ```
  <MandpopDataset>/
  └── songs/
      └── <中文歌名>/
          ├── metadata.json    # title, artist, duration_sec, youtube_url
          ├── lyrics.lrc       # LRC 格式（時間戳，無 section/cue 標記）
          ├── lyrics.txt
          ├── original.mp3
          ├── instrumental.wav
          └── vocals.wav
  ```

- **Schema gap**：MandpopDataset 目前**只**提供 LRC + audio，**沒有** `sections[]` / `cues[]` / 詞 emphasis。本 repo 期待 `timeline.json` 帶完整 schema（見 `examples/timeline.example.json`）。

  橋接方式：執行 `node scripts/intake-from-mandpop.mjs <中文歌名> <kebab-song-id>` — 解析 LRC + 用該腳本內的人工 SECTIONS / CUES map 產出合法 timeline.json，並 copy 音檔 + scaffold config.ts / notes.md。**長期目標**是把 sections / cues 變成 MandpopDataPipeline 的 first-class 輸出，廢掉這個 adapter。

- **Schema 契約**：`timeline.json` 必須符合本 repo 的 `src/engine/types.ts` 與 `examples/timeline.example.json`。不合就回去資料 repo 修，**不要在本 repo 修 timeline**。
- **更新**：資料 repo 的更新不會自動同步，每首新歌都要走 intake 流程手動拉進來。

若檔案不在預期位置，**停下來告訴使用者**，不要自行猜測路徑或產生假 timeline。

---

## 新歌 intake 流程

當使用者說「我要做 `<歌名>`，音訊在 `<path>`」（或類似意思），你依這個順序執行：

### 1. 定位 song_id

`song_id` 的權威來源是 `<MANDPOP_DATA_REPO>/songs/` 底下的資料夾名。

- 先 `ls` 資料 repo 的 `songs/` 目錄，看有哪些 id
- 從使用者給的歌名找匹配（比對資料夾名或 `timeline.json` 的 `meta.title`）
- 有多個可能就列給使用者選
- **不要自己翻譯歌名造 song_id**

### 2. 若找不到

告訴使用者：
- 你查了哪個路徑
- 資料 repo 裡現有的 song_id + title 列表
- **停下來不要往下做**。使用者可能要先去 MandpopDataPipeline 跑資料流水線

### 3. 搬運資產

- **音檔** → `public/audio/<song-id>.<ext>`（保持原始副檔名；若是大 WAV，提醒使用者之後可能要壓成 mp3 給前端）
- **timeline** → `data/songs/<song-id>/timeline.json`（直接從資料 repo 複製）
- **config + notes** → 從 `docs/templates/song_template/` 生成 `data/songs/<song-id>/config.ts` 和 `notes.md`（替換 `SONG_ID` / `SONG_TITLE` placeholder）
- **palette** → 從 `src/theme/palettes/_template.ts` 生 `src/theme/palettes/<song-id>.ts`（先放模板值，§4 對談完再調）

### 4. 風格對談（強制）

**不要跳過這一步直接寫 scene。** 先和使用者討論：

至少問 3 題（視需要追問）：

- 「你這個翻唱的**核心情緒**，用一句話說是什麼？」
- 「**色溫走向**偏哪一種？冷→暖→冷 / 漸進暖 / 整首冷 / 整首暖 / 其他？」
- 「有沒有這首歌**絕對不要**出現的東西？（顏色、意象、效果）」

視情況追問：
- 「有想參考的氛圍嗎？歌、電影、畫家、影片連結皆可」
- 「有特定段落想強調的意象？（例：副歌想到星空、bridge 想到雨）」

**回答之前不要動 scene 檔案。** 如果使用者說「你自己決定」，**給 2–3 個明確方向讓他選一個**，不要直接全自動。

### 5. 把對談結論寫進 notes.md

對應 `docs/templates/song_template/notes.md` 的欄位填進 `data/songs/<song-id>/notes.md`。這份是**給你自己和未來其他 agent 看的共同記憶**。

### 6. 提整體設計計畫

在開始實作前，先列給使用者 approve：

- Section → Scene 對應表（哪些沿用、哪些要新做）
- 每個新 scene 的 Scene Brief（用 `docs/briefs/scene-brief.template.md`）
- 預估時間、要動的檔案清單

**等使用者 approve 整份計畫再開工。** 不要一次寫 500 行丟給他看。

### 7. 依 AGENT_PROTOCOL 交付

見 `docs/AGENT_PROTOCOL.md`。交付後走 §五 驗收清單。

---

## 工作原則（請嚴格遵守）

### 1. 先讀文件再寫 code

每次接到任務前，**必須**確認已讀過：

- 本檔 `CLAUDE.md`
- `docs/AGENT_PROTOCOL.md`（**任何視覺任務都必讀**，定義交付硬約束）
- `docs/DESIGN.md`（視覺規範）
- `docs/ROADMAP.md`（目前 Phase）
- `docs/WORKFLOW.md`（單首歌 SOP）

新 scene 任務另外必讀：`examples/scene.example.tsx`、`src/scenes/SceneSilence.tsx`、`AGENT_PROTOCOL.md` §二 12 條不變量。

### 2. 資料與視覺嚴格分離

- Timeline JSON 是**單一真實來源**，來自 `MandpopDataPipeline`
- Scene 元件**只消費 timeline**，不內建歌詞文字、不內建時間戳
- 發現視覺層寫死歌詞或時間，**視為 bug**
- 擴 timeline schema 必須同步更新 `src/engine/types.ts` 和 `examples/timeline.example.json`，且要先和 MandpopDataPipeline 對齊再切換

### 3. 設計決策收斂到 tokens

所有顏色、字體、間距、時長、緩動函式 — **不能 hardcode 在 scene 裡**，必須走 `src/theme/tokens.ts` 或 palette。新參數先加進 tokens 再引用。

### 4. 每個 scene 獨立、可替換

- 一個 scene = 一個檔案 = 一種視覺語言
- Scene 之間不互相依賴
- Scene 接收統一 props（`SceneProps`: `{ progress, energy, section, palette, lyric }`）
- 這條是 `AGENT_PROTOCOL` 的基礎；違反就破壞「可換 agent」的整個前提

### 5. 先可運行，再求精緻

- 新功能先做最小可運行版本（ugly but works）
- 得到使用者 OK 再進精修
- 不要一次寫 500 行才給使用者看

### 6. 精準對齊是底線

音訊同步正確性**高於一切視覺效果**。任何動畫不能破壞 `audio.currentTime` 作為主時鐘。發現對齊偏差先修對齊再調視覺。

### 7. 依 AGENT_PROTOCOL 交付

所有視覺工作走 `docs/AGENT_PROTOCOL.md` §四 Delivery Contract 格式（檔案列表、token 引用、動態規則、已知限制、測試方式）。違反 §二不變量就回頭改到合規，不妥協。

---

## 與使用者的互動守則

使用者**懂技術但不是前端 / 動畫專家**，設計相關細節要解釋清楚，但不要長篇大論。

### 設計決策要對話、不要假設

- 開始任何 scene 實作前必須有一輪風格對談（見 §新歌 intake §4）
- 使用者說「你自己決定」→ 給 2–3 個明確方向讓他選，不要直接做
- 提案 scene 方向時，用**一句話情緒 + 一個主意象**描述，不要堆設計術語
  - ✓「想做一幕月在霧裡、地平線微光的靜畫面」
  - ✗「radial gradient 搭配 CSS filter blur 再加一層 SVG horizon」

### 不確定就停

發現設計規範不清楚、資料不合 schema、路徑找不到、使用者描述模糊 — **停下來問**。不要自己假設。

### 每個 Phase 結束產驗收清單

依 `docs/ROADMAP.md` 每個 Phase 的「驗收」段落，做完要主動把清單打勾交給使用者。

### 更動 tokens / design doc 要寫理由

建議改 `tokens.ts` 或 `DESIGN.md` 時，寫明「原因」和「影響範圍」（會波及哪些 scene、哪些 palette）。

---

## 技術棧（已決定，請勿擅自更換）

- **框架**：Vite + React + TypeScript
- **動畫**：Motion (framer-motion) 主，GSAP 補（複雜 timeline 需求）
- **圖形**：CSS / SVG 優先，Canvas / WebGL 僅在必要時使用（粒子、shader）
- **音訊**：原生 `<audio>` + Web Audio API `AnalyserNode`
- **最終輸出**：Remotion
- **樣式**：CSS Modules 或 vanilla CSS，不用 Tailwind

---

## Intake interface（目前對話式，未來可加 CLI）

目前 intake 流程是**純對話式**：使用者在 Claude Code 裡說話，Claude 依 §新歌 intake 的七步執行。

未來若覺得麻煩，可加一個 CLI helper 專做機械搬運：

```bash
npm run intake -- --title "看得最遠的地方" --audio "C:/path/to/audio.wav"
```

這個腳本只負責步驟 1–3（定位 song_id、搬檔、scaffolding），風格對談（§4）仍走 Claude。**要加這個 helper 前先和使用者確認，不要擅自動工。**

---

## 目前進度

- [x] Phase 0：專案骨架
- [ ] Phase 1：Timeline 載入與音訊同步
- [ ] Phase 2：第一個完整 scene（SceneSilence 全實作）
- [ ] Phase 3：完整一首歌（所有 scene + cue 特效 + 能量綁定）
- [ ] Phase 4：Remotion 輸出管線
- [ ] Phase 5：第二首歌驗證流程複用性

---

## 特別提醒

- 歌詞對齊失敗，**優先檢查**：timeline JSON 是否符合 schema、音檔是否載入完成、`currentTime` 是否被動畫邏輯覆寫
- 新 scene 前先看 `docs/DESIGN.md` §四「Scene 設計原則」避免 AI slop
- 中文字體很重要，預設 Noto Serif TC + Cormorant Garamond 斜體，要換必須在 `DESIGN.md` 討論
- `MandpopDataPipeline` 不在本 repo 的 git 樹裡；它的更新不會自動反映到本 repo，每首新歌都要手動走 intake 流程
