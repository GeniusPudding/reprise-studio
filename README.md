# Reprise Studio

**精緻翻唱 Lyric MV 的生產系統。**
輸入一份已對齊的（音檔 + 歌詞 timeline）資料集，輸出一支抒情抽象風格、可交付到 YouTube 的 Lyric MV。

這個 repo **只做視覺層**。資料層（音源、歌詞校對、段落標註）假設已經在另一個 repo 裡做完，
以 `timeline.json` 的形式交付過來。見下方的「資料集契約」一節。

---

## 為什麼做這個

一般 AI 生成的 MV 看起來「可以但就這樣」。這個專案要反著做：

- **風格收斂到設計系統**：色、字、動畫都在 `docs/DESIGN.md` 裡寫死，不是每次隨興發揮
- **資料與視覺嚴格分離**：換歌不換 code，換畫面不動資料
- **可換的 agent 設計協定**：任何畫面都可以由不同 agent 獨立設計、隨時替換，見 `docs/AGENT_PROTOCOL.md`
- **最終可輸出 MP4**：Remotion 走標準流程，不靠瀏覽器錄影

---

## Quick start

需求：Node 18+。

```bash
npm install
npm run dev
```

Remotion（Phase 4 之後用）：

```bash
npm run remotion:studio
npm run remotion:render
```

---

## 資料集契約（Dataset Contract）

本 repo **不處理音檔分離、歌詞對齊、段落標註**。這些工作請在另外的資料 repo 完成，
並交付一份符合下列 schema 的 `timeline.json`。Schema 的權威定義在：

- TypeScript 型別：`src/engine/types.ts`
- 範例：`examples/timeline.example.json`
- 欄位規範：見下表

### 必備資產（per 歌）

```
data/songs/<song-id>/
├── timeline.json    # 來自資料 repo，入 git
├── config.ts        # 本 repo 寫：section → scene 對應、palette 引用
└── notes.md         # 本 repo 寫：設計意圖

public/audio/
└── <song-id>.mp3    # 播放用音檔（壓縮版即可）
```

### Timeline JSON 規範

| 欄位 | 型別 | 說明 |
|---|---|---|
| `meta` | `TimelineMeta` | song_id / title / duration / bpm 等 |
| `sections[]` | `Section[]` | `{ t, end, type, mood }`，type 和 mood 是列舉 |
| `lyrics[]` | `TimelineEntry[]` | `{ t, end, text, emphasis? }`，時間單位秒 |
| `cues[]` | `Cue[]` | `{ t, type, label? }`，type 限定七種特效 |
| `beats?` | `number[]` | 選填；需要 beat-sync 才填 |

所有時間單位**秒（float，精度 10ms）**。允許的 `section.type` / `section.mood` / `cue.type` 列舉值請見 `src/engine/types.ts`。

> 資料 repo 若要擴充 schema：請先在本 repo 發 PR 同步 `types.ts` 和 `examples/timeline.example.json`，否則會被視為不合法的 timeline。

---

## 目錄結構

```
reprise-studio/
├── CLAUDE.md                       # Claude Code 專案守則（自動讀取）
├── README.md                       # 本檔
├── package.json
│
├── docs/
│   ├── AGENT_PROTOCOL.md           # ⭐ 如何操作 agent 做畫面（新）
│   ├── DESIGN.md                   # 視覺規範（scene / palette / typography / cue）
│   ├── ROADMAP.md                  # Phase 規劃與驗收
│   ├── WORKFLOW.md                 # 單首歌完整 SOP
│   ├── briefs/                     # Agent brief 模板
│   │   ├── scene-brief.template.md
│   │   └── palette-brief.template.md
│   └── templates/song_template/    # 新歌資料夾模板
│
├── examples/
│   ├── timeline.example.json       # Dataset 契約範例
│   └── scene.example.tsx           # Scene 寫法範例
│
├── src/
│   ├── main.tsx / App.tsx          # 入口
│   ├── theme/                      # tokens + palettes（設計系統）
│   ├── engine/                     # 換歌不動：時鐘、timeline、router、types
│   ├── scenes/                     # 一幕一檔（可被任何 agent 獨立替換）
│   ├── layers/                     # 跨 scene 疊加層（歌詞、grain、cue flash）
│   ├── remotion/                   # MP4 輸出
│   └── utils/                      # 載入、插值、音訊輔助
│
├── data/songs/<song-id>/           # 每首歌一個資料夾（timeline + config + notes）
├── public/audio/                   # 前端播放用音檔
└── out/                            # Remotion 輸出（.gitignore）
```

---

## 怎麼做一首新歌

1. 從資料 repo 拉 `timeline.json`，放到 `data/songs/<song-id>/timeline.json`
2. 把音檔放到 `public/audio/<song-id>.mp3`
3. 複製 `docs/templates/song_template/` → `data/songs/<song-id>/config.ts` + `notes.md`
4. 挑/調 palette：`src/theme/palettes/<song-id>.ts`
5. 依 `docs/AGENT_PROTOCOL.md` 為每個 section 寫 Scene Brief，派 agent 實作
6. 審收（AGENT_PROTOCOL §五 的驗收清單）
7. 細修 → Remotion 輸出 MP4

每一步的詳細 SOP 見 `docs/WORKFLOW.md`。

---

## Agent 操作協定（重點）

因為這個專案的核心假設是「畫面會持續迭代 / 探索 / 替換」，
我們把「怎麼叫 agent 做事」寫成了正式 protocol：`docs/AGENT_PROTOCOL.md`。

重點：

- **Scene 是單檔單位**，可以被任何 agent 獨立接手、替換、A/B 測試
- **標準 brief 模板**在 `docs/briefs/`，貼給 agent 就能開工
- **12 條不變量**（AGENT_PROTOCOL §二）是硬底線，違反即退回
- **驗收清單**（§五）把「符合美學」變成可檢查的項目，而不是玄學

並行探索多方向、切換 agent 供應商（Claude / Codex / 其他）、換設計師——都走同一個 protocol。

---

## 目前進度

依 `docs/ROADMAP.md`：

- [x] **Phase 0**：專案骨架、engine types、SceneSilence placeholder
- [ ] **Phase 1**：Timeline 載入與歌詞同步
- [ ] **Phase 2**：第一個完整 scene（SceneSilence 全實作）
- [ ] **Phase 3**：完整一首歌（所有 scenes + cue 特效 + 能量綁定）
- [ ] **Phase 4**：Remotion MP4 輸出
- [ ] **Phase 5**：第二首歌驗證流程複用性

---

## 技術棧（已決定，請勿擅自更換）

Vite + React 18 + TypeScript + Motion (framer-motion) + GSAP + Remotion + CSS Modules。
原生 `<audio>` + Web Audio AnalyserNode 做音訊分析。
詳見 `docs/ROADMAP.md`。
