# CLAUDE.md

> Claude Code 會自動讀取此檔案作為專案準則。請把這份當成「給 Claude 的專案守則」。

## 專案一句話定位

本專案是**個人翻唱歌手的 MV 生產系統**：輸入（歌曲音檔 + 歌詞 timeline JSON）→ 輸出（抒情抽象風格的 Lyric MV 影片）。

## 工作原則（請嚴格遵守）

### 1. 先讀文件再寫 code

每次接到任務前，**必須**確認已讀過：
- 本檔 `CLAUDE.md`
- `docs/ROADMAP.md`（目前處於哪個 Phase）
- `docs/DESIGN.md`（視覺規範，不能違背）
- `docs/WORKFLOW.md`（對應當前任務的 SOP）

如果任務涉及新場景設計，**必須**先看 `examples/scene.example.tsx` 和 `DESIGN.md` 的 scene 設計原則。

### 2. 資料與視覺嚴格分離

- Timeline JSON 是**單一真實來源（single source of truth）**
- Scene 元件**只消費 timeline**，不內建歌詞文字、不內建時間戳
- 若發現視覺層寫死了歌詞或時間，**視為 bug**，要重構

### 3. 設計決策收斂到 tokens

所有顏色、字體、間距、時長、緩動函式 — **不能 hardcode 在 scene 裡**，必須走 `src/theme/tokens.ts`。
新增視覺參數時，先加進 tokens，再在 scene 引用。

### 4. 每個 scene 獨立、可替換

- 一個 scene = 一個檔案 = 一種視覺語言
- Scene 之間不互相依賴
- Scene 接收統一 props（`{ progress, energy, section, lyric }`），不自己讀全局狀態

### 5. 先可運行，再求精緻

- 任何新功能先做**最小可運行版本**（ugly but works），讓使用者看到效果
- 得到確認後，再進入精修階段
- 不要一次性寫 500 行才給使用者看

### 6. 精準對齊是底線

音訊同步的正確性**高於一切視覺效果**。任何動畫不能破壞 `audio.currentTime` 作為主時鐘的原則。
發現對齊偏差先修對齊，再調視覺。

## 技術棧（已決定，請勿擅自更換）

- **框架**：Vite + React + TypeScript
- **動畫**：Motion (framer-motion) 為主，GSAP 作為補充（timeline 需求）
- **圖形**：CSS/SVG 優先，Canvas/WebGL 僅在必要時使用（粒子、shader 效果）
- **音訊**：原生 `<audio>` + Web Audio API `AnalyserNode`
- **最終輸出**：Remotion（為了乾淨的 MP4 渲染）
- **樣式**：CSS Modules 或 vanilla CSS，不用 Tailwind（因為要做細膩自訂動畫）

## 目前進度

（每完成一個 Phase 更新此處）

- [ ] Phase 0：專案骨架
- [ ] Phase 1：Timeline 載入與音訊同步
- [ ] Phase 2：第一個完整 scene + 歌詞渲染層
- [ ] Phase 3：完整一首歌（所有 scene + cue 點特效）
- [ ] Phase 4：Remotion 輸出管線
- [ ] Phase 5：第二首歌驗證流程複用性

## 對使用者的溝通原則

- 使用者是**懂技術但不是前端專家**，動畫相關細節要解釋清楚
- 每個 Phase 結束後主動產一份**驗收清單**給使用者勾
- 發現設計規範不清楚的地方，**停下來問**，不要自己假設
- 建議更動 tokens 或 design doc 時，寫明「原因」和「影響範圍」

## 特別提醒

- 當歌詞渲染對齊失敗，**優先檢查**：timeline JSON 格式是否正確、音檔是否解碼完成、`currentTime` 是否被動畫邏輯覆寫
- 做新 scene 前先看 `DESIGN.md` 的「scene 設計原則」章節，避免產出 AI slop
- 中文字體非常重要，預設是 Noto Serif TC + Cormorant Garamond 斜體，更換前必須在 `DESIGN.md` 討論
