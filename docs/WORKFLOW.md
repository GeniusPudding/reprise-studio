# WORKFLOW.md — 單首歌完整生產 SOP

從「拿到一份對齊好的 timeline」到「YouTube 上線」的完整流程。
**前提假設：資料層（音檔分離、歌詞對齊、段落標註、cue 標點）已在另一個資料 repo 完成**，本 repo 只接一份符合 schema 的 `timeline.json` + 一份音檔。

---

## 時間估算（熟練後）

| 階段 | 新手首次 | 熟練後 |
|---|---|---|
| 1. 匯入資料集 | 20 min | 5 min |
| 2. 設計層決策（Design Brief） | 2 hr | 30 min |
| 3. Scene 實作（Agent） | 1 天 | 2–3 hr |
| 4. 細修與迭代 | 1 天 | 2 hr |
| 5. 輸出 MP4 | 1 hr | 20 min |
| **總計** | **~2.5 工作天** | **~0.5 工作天** |

---

## Step 1：匯入資料集

### 從資料 repo 拉進來

```
data/songs/<song-id>/
└── timeline.json      # 來自資料 repo
public/audio/
└── <song-id>.mp3      # 來自資料 repo（或另外壓縮的播放版）
```

### 在本 repo 建立配置

```bash
cp -r docs/templates/song_template/ data/songs/<song-id>/
# 編輯 data/songs/<song-id>/config.ts 和 notes.md
```

### Schema 檢查（輕量）

打開 `data/songs/<song-id>/timeline.json`，目視檢查：

- [ ] `meta.song_id` / `meta.title` / `meta.duration` 都有值
- [ ] `sections[]` 連續不重疊，`type`/`mood` 在 `src/engine/types.ts` 列舉內
- [ ] `lyrics[].t` 遞增，`end > t`
- [ ] `cues[].type` 在七種合法特效內

瀏覽器跑 `npm run dev` 載入音檔，聽一遍對位。若偏差明顯，**問題回到資料 repo 修**，不要在本 repo 修 timeline。

---

## Step 2：設計層決策（Design Brief）

**這步很重要，不要跳過直接派 agent 寫 code。**

在 `data/songs/<song-id>/notes.md` 寫：

```markdown
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
| ... |

## 特殊 cue 視覺決策
- 52.0s 副歌第一拍：flash-warm + 同時 iris-open
- 150.0s 最後副歌前：iris-open 大招（整曲只用這一次）

## 禁忌清單
- （這首歌不要出現什麼）
```

### Palette 設定

複製 `src/theme/palettes/_template.ts` → `src/theme/palettes/<song-id>.ts`，調整 mood 色值。
需要新 base 色 → 改 `tokens.ts` + `DESIGN.md`（走 Palette Designer 協定，見 `AGENT_PROTOCOL.md` §6.3）。

### Scene 實作計畫

對每個需要新做的 scene，複製 `docs/briefs/scene-brief.template.md`，填好之後存到 `data/songs/<song-id>/briefs/Scene<Name>.md`（或直接貼給 agent，不一定要存檔）。

---

## Step 3：Scene 實作（交給 Agent）

**依 `docs/AGENT_PROTOCOL.md` 操作**。不要自己寫散裝指令。

### 派 agent 的最小指令

用 `AGENT_PROTOCOL.md` §6.1 的模板，貼上你在 Step 2 準備好的 Scene Brief。

### 分階段驗收

**a. 骨架階段**（30 分鐘）
- [ ] SceneRouter 能依 timeline 的 section 切換 scene
- [ ] 整首歌至少每段都有**佔位 scene**（可以只是一個色塊）

**b. 各 scene 初版**（每個 scene 30–60 分鐘）
- [ ] 每個 scene 單獨看都 ok
- [ ] 色彩符合 palette
- [ ] 沒有硬編碼（過 `AGENT_PROTOCOL.md` §五 驗收清單）

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

### 並行探索（選用）

想同時試三種方向？看 `AGENT_PROTOCOL.md` §6.2 + §七「並行設計」。

---

## Step 4：細修與迭代

這是最花時間、也最重要的階段。**不要急著輸出 MP4**。

### 反覆觀看

- 瀏覽器全螢幕、耳機聽歌、從頭到尾至少 10 遍
- 記錄「卡卡的時刻」：哪一幕情緒沒接上、哪個動畫太吵、哪個字沒讀清楚
- 把這些丟回 agent 改（必要時派**新**的 agent session，帶著更新後的 brief，比讓舊 session 反覆修 context 更乾淨）

### 常見修正

- 歌詞出現太早或太晚 → 問題在 timeline，回到資料 repo
- Cue 點效果太強 → 調 `tokens.motion.cueFlashIn/Out` 或 `CueFlashLayer` 的振幅
- 某 scene 太空 → 加一個次要元素（**不超過三種**）
- 色溫轉換太快 → 拉長 `tokens.motion.sceneTransition`
- 能量綁定抖動 → 在 `useAudioEnergy` 加平滑 smoothing

### 找人看

最好的品管：**給一個沒聽過這首歌的人看**。他們的反應最誠實。

---

## Step 5：輸出 MP4

### Remotion 路線（推薦）

```bash
npm run remotion:render
# or：
npx remotion render src/remotion/Root.tsx LyricMV out/<song-id>.mp4 \
  --props='{"songId":"<song-id>"}' \
  --codec=h264 \
  --crf=18
```

注意事項：

- Remotion 用 frame 不用 `currentTime`，部分 CSS 動畫要改寫
- 音訊在 Remotion 裡用 `<Audio src={}>` 元件
- 首次渲染耗時可能 5–20 分鐘（依長度與特效）

### 備援：OBS 螢幕錄影

- 適用：Remotion 暫時搞不定、或臨時要出片
- 品質：足夠 YouTube，但畫質不如 Remotion 原生渲染

### 後製

- 輸出的 MP4 匯入 Premiere / DaVinci / Final Cut
- 換成高音質音軌（渲染時可能用了預覽版本）
- 加開頭封面、片尾訊息（翻唱聲明、致謝）

---

## Step 6：上線與歸檔

### YouTube

- 標題、描述、tag（從 `notes.md` 複製）
- 縮圖（可以用 scene 的一幀）
- 翻唱權利聲明

### 專案歸檔

在 `data/songs/<song-id>/notes.md` 最後補：

```markdown
## 生產紀錄
- 開工日：
- 交付日：
- 總工時：
- YouTube 連結：
- 新增的通用元件：SceneXxx（可被其他歌沿用）
- 這首歌學到什麼：
- 下一首要改進什麼：
- 試過哪些 agent 方向、為什麼選這個：
```

這份紀錄是**你最寶貴的資產**，累積 5 首後會長出自己的 style playbook。
