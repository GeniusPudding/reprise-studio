# Reprise Studio — Lyric MV 生產系統

個人翻唱歌手的 Lyric MV 生產流水線：輸入（歌曲音檔 + timeline JSON）→ 輸出（抒情抽象風格的 MV 影片）。

> 詳細工作原則請見 `CLAUDE.md`；技術路線見 `docs/ROADMAP.md`；設計規範見 `docs/DESIGN.md`。

---

## Quick start

### 一行初始化（建立 venv + 安裝 Python & Node 依賴）

Windows（PowerShell）：

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

macOS / Linux / Git Bash：

```bash
bash setup.sh
```

這個腳本會：

1. 建立 `.venv/`（Python 虛擬環境）
2. 安裝 `scripts/requirements.txt`（Demucs / WhisperX / librosa / …）
3. 執行 `npm install`（Vite / React / Motion / Remotion / …）

### 跑起來

```bash
# 啟動 venv（後續下 Python 指令才會用到）
source .venv/Scripts/activate      # Git Bash on Windows
# or: .venv\Scripts\Activate.ps1   # PowerShell
# or: source .venv/bin/activate    # macOS / Linux

# 前端 dev server
npm run dev

# Remotion studio（Phase 4 開始用）
npm run remotion:studio
```

---

## 目錄結構

```
reprise-studio/
├── CLAUDE.md                        # Claude Code 協作準則（會自動讀取）
├── README.md
├── setup.sh / setup.ps1             # 一行 bootstrap
├── package.json / vite.config.ts    # 前端
├── tsconfig*.json
│
├── docs/                            # 設計與流程文件
│   ├── ROADMAP.md                   # 技術路線 + Phase 規劃
│   ├── DESIGN.md                    # 視覺規範（scene / palette / typography）
│   ├── DATA_PIPELINE.md             # Timeline 生產流程
│   ├── WORKFLOW.md                  # 單首歌完整 SOP
│   └── templates/song_template/     # 新歌資料模板
│
├── examples/                        # 啟動參考（timeline 格式、scene 寫法）
│   ├── timeline.example.json
│   └── scene.example.tsx
│
├── src/
│   ├── main.tsx / App.tsx           # Phase 0 骨架：音檔 + 時鐘
│   ├── theme/                       # design tokens（顏色、時長、字體）
│   ├── engine/                      # 換歌不動：時鐘、timeline、scene router
│   ├── scenes/                      # 每一幕一個檔案
│   ├── layers/                      # 歌詞層、顆粒、cue 閃光、進度條
│   ├── remotion/                    # MP4 輸出（Phase 4）
│   └── utils/                       # timeline 載入、插值、音訊輔助
│
├── scripts/                         # Python 資料流水線
│   ├── requirements.txt
│   ├── separate.py                  # Demucs wrapper（人聲分離）
│   ├── align.py                     # WhisperX（詞級時間戳）
│   ├── analyze.py                   # librosa（BPM、RMS、能量）
│   ├── structure.py                 # 段落切分草稿
│   ├── ass_to_timeline.py           # .ass / .srt → timeline.json
│   ├── validate_timeline.py         # Schema 檢查
│   └── preview_timeline.py          # 視覺化對位檢查
│
├── data/
│   ├── songs/<song_id>/             # 送去正片的資料（進 git）
│   │   ├── timeline.json
│   │   ├── config.ts
│   │   └── notes.md
│   └── raw/<song_id>/               # 原始音檔、WhisperX 草稿（.gitignore）
│
├── public/audio/                    # 前端可直接播的音檔
└── out/                             # Remotion 輸出（.gitignore）
```

---

## 目前進度

依 `docs/ROADMAP.md` 分 Phase：

- [x] **Phase 0**：專案骨架（audio clock、types、engine 架構、scene placeholder）
- [ ] **Phase 1**：Timeline 載入與歌詞同步
- [ ] **Phase 2**：第一個完整 scene（SceneSilence）
- [ ] **Phase 3**：完整一首歌（所有 scenes + cue 特效 + 能量綁定）
- [ ] **Phase 4**：Remotion MP4 輸出
- [ ] **Phase 5**：第二首歌驗證流程複用性

---

## 做新歌的流程（簡版）

1. 放原始素材進 `data/raw/<song_id>/`（`song.wav`、`lyrics.txt`）
2. 跑資料流水線（見 `docs/DATA_PIPELINE.md` 的階段 A）
3. Aegisub 人工校正 timeline
4. `python scripts/validate_timeline.py data/songs/<song_id>/timeline.json`
5. 在 `data/songs/<song_id>/notes.md` 寫設計筆記
6. 交給 Claude Code 依 `docs/WORKFLOW.md` 的第一則指令範本做 scene
7. 細修 → Remotion 輸出 MP4

---

## 核心理念

- **資料與視覺嚴格分離**：timeline JSON 是 single source of truth。
- **設計 tokens 收斂**：顏色、時長不 hardcode 在 scene。
- **每首歌 = config + 少量新 scene**：第二首歌起，修改行數集中在 `data/` 和 `theme/palettes/`。
- **音訊對齊優先於視覺**：任何動畫不得覆寫 `audio.currentTime` 作為主時鐘。
