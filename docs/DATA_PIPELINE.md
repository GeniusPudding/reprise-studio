# DATA_PIPELINE.md — Timeline 資料生產流程

本文件定義「從音檔 + 歌詞純文字 → 精準 timeline JSON」的完整流程。
Timeline 是整個系統的核心資料，**品質直接決定 MV 品質**。

---

## 一、Timeline JSON Schema

### 完整範例

```json
{
  "meta": {
    "song_id": "seeing-farthest",
    "title": "看得最遠的地方",
    "artist": "Original by 范瑋琪 / Cover by XXX",
    "duration": 248.3,
    "bpm": 72,
    "key": "C major",
    "created_at": "2026-04-22",
    "version": 1
  },

  "sections": [
    { "t": 0.0,   "end": 18.5,  "type": "intro",      "mood": "still"  },
    { "t": 18.5,  "end": 52.0,  "type": "verse1",     "mood": "soft"   },
    { "t": 52.0,  "end": 74.0,  "type": "chorus1",    "mood": "open"   },
    { "t": 74.0,  "end": 108.0, "type": "verse2",     "mood": "ache"   },
    { "t": 108.0, "end": 130.0, "type": "chorus2",    "mood": "open"   },
    { "t": 130.0, "end": 150.0, "type": "bridge",     "mood": "defy"   },
    { "t": 150.0, "end": 230.0, "type": "chorus_last","mood": "open"   },
    { "t": 230.0, "end": 248.3, "type": "outro",      "mood": "fin"    }
  ],

  "lyrics": [
    {
      "t": 18.4,
      "end": 22.1,
      "text": "你是第一個發現我",
      "emphasis": null
    },
    {
      "t": 22.1,
      "end": 26.5,
      "text": "越面無表情 越是心裡難過",
      "emphasis": ["面無表情"]
    }
  ],

  "cues": [
    { "t": 52.0,  "type": "flash-warm",  "label": "副歌第一拍" },
    { "t": 74.0,  "type": "color-flip",  "label": "轉入 verse2" },
    { "t": 150.0, "type": "iris-open",   "label": "最後副歌前最高點" }
  ],

  "beats": [0.83, 1.66, 2.49, 3.32, 4.15]
}
```

### 欄位規範

**所有時間以「秒」為單位**，浮點數，小數點後 2 位（精度 10ms）。

- `sections[].type`：列舉值，限定：`intro | verse1 | verse2 | verse3 | pre_chorus | chorus1 | chorus2 | chorus_last | bridge | solo | outro`
- `sections[].mood`：列舉值，對應 palette 的 key（見 `DESIGN.md`）
- `lyrics[].emphasis`：可選，要強調顯示的詞（字體更重、顏色更亮）
- `cues[].type`：必須是 `DESIGN.md` 裡定義的 cue 特效之一
- `beats`：可選，主要用於需要 beat-sync 的特效；不是每首歌都需要逐拍標記

### Schema 驗證

專案內 `scripts/validate_timeline.py` 必須做以下檢查：

- 時間戳遞增（`lyrics[n].t >= lyrics[n-1].end`）
- 所有 `lyrics[].end <= meta.duration`
- 所有 `sections` 無重疊且連續（除非刻意有純音樂 gap）
- 所有 `cues[].t` 落在某個 section 內
- 所有 `sections[].mood` 在當首歌的 palette 裡有定義

---

## 二、標註流程（三階段）

### 階段 A：機器預處理（半小時，可批次跑）

```bash
# 1. 人聲分離（關鍵！後續所有對齊都用 vocals.wav）
demucs --two-stems=vocals data/raw/seeing-farthest/song.wav \
  -o data/raw/seeing-farthest/separated/

# 2. 歌詞強制對齊（詞級）
whisperx data/raw/seeing-farthest/separated/vocals.wav \
  --language zh \
  --model large-v3 \
  --output_format json \
  --output_dir data/raw/seeing-farthest/drafts/

# 3. 音訊特徵分析（BPM、段落、能量曲線）
python scripts/analyze.py data/raw/seeing-farthest/song.wav \
  --output data/raw/seeing-farthest/drafts/features.json

# 4. 結構分析（可選，節省人工時間）
python scripts/structure.py data/raw/seeing-farthest/song.wav \
  --output data/raw/seeing-farthest/drafts/structure.json
```

### 階段 B：人工校正（1–2 小時，每首）

**工具**：Aegisub（推薦）或 Audacity

**流程**：

1. 開 Aegisub，載入原始音檔（或人聲軌）
2. Import → Subtitles from → 載入 WhisperX 的 JSON 或轉換後的 .srt
3. 逐行做三件事：
   - **替換文字**：WhisperX 辨識錯字直接用原始歌詞取代
   - **微調開始時間**：按 Ctrl+3 在當前播放位置設為 start
   - **微調結束時間**：按 Ctrl+4 設為 end
4. 校正 section 邊界（用 Aegisub 的 marker 或單獨用 Audacity）
5. 標 cue 點（每個副歌進入、bridge、最高點、最靜處）

**校正重點**：
- **進入時間**比結束時間重要（歌詞出現的瞬間人眼最敏感）
- **拖音段**結束時間設在人聲真正收尾處，不要包含氣音
- **間奏段**可以留空白（那段歌詞區域應該是空的）
- 懷疑自己聽錯時，放慢 0.5x 速度再聽

### 階段 C：轉檔與驗證（10 分鐘）

```bash
# .ass / .srt → timeline.json
python scripts/ass_to_timeline.py \
  data/raw/seeing-farthest/corrected.ass \
  data/raw/seeing-farthest/drafts/structure.json \
  --output data/songs/seeing-farthest/timeline.json

# 驗證 schema
python scripts/validate_timeline.py \
  data/songs/seeing-farthest/timeline.json

# 視覺化檢查（可選）
python scripts/preview_timeline.py \
  data/songs/seeing-farthest/timeline.json
```

---

## 三、標註準則（Annotation Guidelines）

當以下情況出現時，依照本節規則處理（確保多首歌之間一致）：

### 歌詞斷句

- **以自然換氣為準**，不要跟著樂句或 bar
- 一句最長不超過 **12 個中文字**，超過就切
- **不要**把一句硬拆兩半只為了湊時間

### 拖音 / 長尾音

- `end` 時間設在**聽得出來還在同一個母音**的最後時刻
- 氣音、呼吸聲**不包含**在內
- 副歌尾音拖很長時，若下一句進來還很久，可以把 `end` 提早 1–2 秒（留空間給畫面呼吸）

### 間奏與純音樂段

- 不需要在 `lyrics` 陣列放空 entry
- `sections` 中該段標為 `solo` 或維持上一個 `verse/chorus` 但拉長，依情境決定

### Section 邊界

- **以樂器進入/退出**為主要依據，而非人聲
- Pre-chorus 必定標出來（這是 MV 情緒鋪陳最重要的轉折點）
- 若一首歌最後副歌有「半拍延遲進入」的效果（很常見），把 `chorus_last.t` 設在延遲後的實際進入點

### Cue 點標註

每首歌**至少標 8 個，最多 30 個**，太少無聊、太多吵雜。必標：

- 每個副歌的第一拍
- Bridge 進入與離開
- 全曲能量最高點（通常是最後副歌的某處）
- 全曲最靜的一刻
- 尾音結束點

---

## 四、品管（QA）

每首歌 timeline 完成後，跑這個 checklist：

- [ ] `validate_timeline.py` 通過無 error
- [ ] 打開 preview tool 從頭播到尾，歌詞跟音訊對齊（人耳測試）
- [ ] 在 Phase 1 驗收專案裡載入，歌詞顯示正確
- [ ] 抽 5 句歌詞，實際偏差 < 100ms（用波形對照）
- [ ] 所有 section 的 mood 在 palette 中有對應
- [ ] Cues 數量在 8–30 之間，涵蓋所有副歌與 bridge

---

## 五、特殊情境處理

### 翻唱版本與原版時間不同

- **永遠以你的翻唱音檔為準**重新標註，不要直接搬原版 LRC
- 翻唱的 tempo、停頓、rubato 可能差 5–15%

### 有 rap 段落

- 斷句更密（每 3–4 字一句），`end` 時間緊貼下一句 `t`
- 不要把整段 rap 標成一句

### Live 版本 / 不標準拍子

- 不強求 `beats` 陣列準確，該欄位可留空
- 仰賴 `cues` 做情緒節奏

### 多語言歌詞

- 同一個 entry 增加 `text_en`, `text_romaji` 等欄位
- 顯示邏輯由 `LyricLayer.tsx` 根據設定決定

---

## 六、資料集長期管理

當歌曲累積到 10+ 首，開始做：

1. **統一 schema 版本號**，schema 變更走 migration
2. **Timeline 放 Git** 但音檔用 Git LFS 或直接 `.gitignore`
3. **建立 song registry**：`data/songs/_registry.json` 列出所有歌、狀態（draft/reviewed/published）
4. **retrospective 文件**：每首歌做完寫短 notes，累積經驗
