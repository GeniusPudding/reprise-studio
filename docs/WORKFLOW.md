# WORKFLOW.md — 單首歌完整生產 SOP

從「我想做這首歌的 MV」到「YouTube 上線」的完整流程。
**每做一首歌跟著這份走**，累積到 5 首後回來檢討改進。

---

## 時間估算（熟練後）

| 階段 | 新手首次 | 熟練後 |
|---|---|---|
| 1. 素材準備 | 30 min | 15 min |
| 2. 機器預處理 | 1 hr | 20 min |
| 3. 人工 timeline 校正 | 3 hr | 1 hr |
| 4. 設計層決策 | 2 hr | 30 min |
| 5. Scene 實作（Claude Code） | 1 天 | 2–3 hr |
| 6. 細修與迭代 | 1 天 | 2 hr |
| 7. 輸出 MP4 | 1 hr | 20 min |
| **總計** | **3 工作天** | **~1 工作天** |

---

## Step 1：素材準備

### 必備
- 翻唱音檔（.wav 或 48kHz 以上的 mp3）— 放在 `data/raw/<song_id>/song.wav`
- 歌詞純文字 — 放在 `data/raw/<song_id>/lyrics.txt`，一句一行
- `song_id`：命名規則 `kebab-case`（如 `seeing-farthest`、`blue-moon`）

### 可選但建議
- 原版 MV 連結（當參考，不直接抄）
- 3–5 張 moodboard 圖片（你覺得調性接近的畫面）放到 `data/raw/<song_id>/moodboard/`
- 情緒 one-liner：**用一句話描述這首翻唱的核心情緒**
  - 例：「不是勵志副歌，是一個人對另一個人遲到多年的感謝」
  - 這句會寫進 `notes.md`，Claude Code 做設計時讀它

### 建立專案目錄

```bash
cp -r docs/templates/song_template data/songs/<song_id>
mkdir data/raw/<song_id>
```

---

## Step 2：機器預處理

依照 `docs/DATA_PIPELINE.md` 的階段 A 跑完四個腳本。

產出：
```
data/raw/<song_id>/
├── song.wav
├── lyrics.txt
├── separated/
│   ├── vocals.wav
│   └── no_vocals.wav
└── drafts/
    ├── whisperx.json        # 歌詞時間戳草稿
    ├── features.json        # BPM, RMS, 能量曲線
    └── structure.json       # 段落結構草稿
```

**檢查點**：
- [ ] vocals.wav 聽起來人聲清晰（Demucs 分離成功）
- [ ] whisperx.json 每句都有時間戳，字可能錯沒關係
- [ ] features.json 有 bpm, duration, rms_curve
- [ ] structure.json 至少區分出 verse/chorus

---

## Step 3：人工 Timeline 校正

依照 `docs/DATA_PIPELINE.md` 的階段 B + C 執行。

**工作流**：
1. 開 Aegisub
2. 載入 vocals.wav（看波形）
3. 載入 whisperx 草稿（轉成 .ass）
4. 一句一句校正（逐句替換正確歌詞 + 微調時間）
5. 另開 Audacity 或 Reaper 標 section 邊界與 cues
6. 執行轉檔腳本產出 `data/songs/<song_id>/timeline.json`
7. 執行驗證腳本

**完成標準**：
- [ ] `validate_timeline.py` 無 error
- [ ] 在 Phase 1 的 dev 環境載入，歌詞時序正確
- [ ] 5 句抽樣偏差 < 100ms

---

## Step 4：設計層決策（Design Brief）

**這步很重要，不要跳過直接寫 code。**

在 `data/songs/<song_id>/notes.md` 寫下：

```markdown
# <歌名> 設計筆記

## 一句話情緒
（你的 one-liner）

## 核心意象（3 個以內）
1. XXX
2. XXX
3. XXX

## 色溫走向
intro: 冷 → verse: 微暖 → chorus: 大暖 → bridge: 反轉冷 → last chorus: 極暖

## Section → Scene 對應表
| Section | Scene 元件 | 主意象 | Palette mood |
|---|---|---|---|
| intro | SceneSilence | 月與霧 | still |
| verse1 | SceneMist | 薄光霧中 | soft |
| chorus1 | SceneSunrise | 曙光 | open |
| ... |

## 特殊 cue 視覺決策
- 52.0s 副歌第一拍：flash-warm + 同時 iris-open
- 150.0s 最後副歌前：iris-open 大招（整曲只用這一次）

## 字體決策
（沿用預設 / 或這首特別改動）

## 禁忌清單（這首歌不要出現什麼）
- 紅色（原版情境不適合）
- 文字過大（這首要留白）
```

### Palette 設定

複製 `theme/palettes/_template.ts` → `theme/palettes/<song-id>.ts`，調整 mood 色值。

---

## Step 5：Scene 實作（交給 Claude Code）

在 Claude Code 裡開啟專案，逐步下指令：

### 給 Claude Code 的第一個指令範本

```
請閱讀 CLAUDE.md、docs/DESIGN.md、data/songs/<song-id>/notes.md。

本次任務：為 <歌名> 實作 MV。

請依以下順序：
1. 先產出一份「scene 實作計畫」：列出需要哪些 scene 元件、
   哪些可以沿用既有的、哪些要新做。等我確認後再動手。
2. 新 scene 先寫最小可運行版本，每做完一個停下來讓我在瀏覽器檢查。
3. 所有顏色、時長引用 tokens 和 palette，不要 hardcode。

timeline 在 data/songs/<song-id>/timeline.json，
config 在 data/songs/<song-id>/config.ts。
```

### 分階段驗收

**a. 骨架階段**（30 分鐘）
- [ ] SceneRouter 能依 timeline 的 section 切換 scene
- [ ] 整首歌至少每段都有**佔位 scene**（可以只是一個色塊）

**b. 各 scene 初版**（每個 scene 30–60 分鐘）
- [ ] 每個 scene 單獨看都 ok
- [ ] 色彩符合 palette
- [ ] 沒有硬編碼

**c. 過場與連貫性**（1 小時）
- [ ] Scene 之間 crossfade 順暢
- [ ] 色溫變化有張力不突兀
- [ ] 歌詞在所有 scene 上都可讀

**d. Cue 點特效**（1 小時）
- [ ] 每個 cue 點觸發正確
- [ ] 特效時長符合 DESIGN.md 規範
- [ ] 不會遮住歌詞

**e. 能量綁定**（30 分鐘）
- [ ] 背景亮度/粒子數/模糊度隨音量變化
- [ ] 變化幅度自然（不要抖動）

---

## Step 6：細修與迭代

這是最花時間、也最重要的階段。**不要急著輸出 MP4**。

### 反覆觀看

- 把瀏覽器全螢幕，耳機聽歌，從頭看到尾至少 10 遍
- 每次記錄「卡卡的時刻」：哪一幕情緒沒接上、哪個動畫太吵、哪個字沒讀清楚
- 把這些丟回 Claude Code 改

### 常見修正

- 歌詞出現太早或太晚（微調 timeline）
- Cue 點效果太強（降低振幅或縮短時長）
- 某 scene 太空（加一個次要元素，但不要超過三種）
- 色溫轉換太快（把 crossfade 拉長）
- 能量綁定抖動（在 `useAudioEnergy` 加平滑 smoothing）

### 找人看

最好的品管：**給一個沒聽過這首歌的人看**。他們的反應最誠實。

---

## Step 7：輸出 MP4

### Remotion 路線（推薦）

```bash
npx remotion render src/remotion/Root.tsx LyricMV out/<song-id>.mp4 \
  --props='{"songId":"<song-id>"}' \
  --codec=h264 \
  --crf=18
```

注意事項：
- Remotion 用 frame 不用 `currentTime`，部分 CSS 動畫要改寫
- 音訊在 Remotion 裡用 `<Audio src={}>` 元件
- 首次渲染耗時可能 5–20 分鐘（依長度與特效）

### 備援路線：OBS 螢幕錄影

- 適用：Remotion 暫時搞不定、或臨時要出片
- 品質：足夠 YouTube，但畫質不如 Remotion 原生渲染
- 流程：瀏覽器全螢幕 → OBS 設 1080p 60fps → 錄 → 剪掉頭尾

### 後製

- 輸出的 MP4 匯入 Premiere/DaVinci/Final Cut
- 換成高音質音軌（渲染時可能用了預覽版本）
- 加開頭封面（3 秒）
- 加片尾訊息（翻唱聲明、致謝）
- 輸出最終版

---

## Step 8：上線與歸檔

### YouTube

- 標題、描述、tag（從 `notes.md` 複製）
- 縮圖（可以用 scene 的一幀）
- 翻唱權利聲明

### 專案歸檔

在 `data/songs/<song-id>/notes.md` 最後補上：

```markdown
## 生產紀錄
- 開工日：2026-04-22
- 交付日：2026-04-25
- 總工時：X 小時
- YouTube 連結：
- 新增的通用元件：SceneXxx（可被其他歌沿用）
- 這首歌學到什麼：
- 下一首要改進什麼：
```

這份紀錄是**你最寶貴的資產**。累積 5 首後會長出自己的 style playbook。
