# 一直很安靜 — 設計筆記

> Intake 自 MandpopDataset (`一直很安靜`)。設計依據基於歌詞讀解（Claude）+ 使用者確認 frame。

## YouTube 參考
https://www.youtube.com/watch?v=9apxVjMDtS8

## 一句話情緒

「給你的愛一直很安靜 — 不是失戀的痛，是『**從未被命名**』的痛。」

歌詞核心：「明明是三個人的電影 / 我卻始終不能有姓名」。視覺軸是「**缺席的存在**」 — 我深愛、我在那裡，但你的故事裡沒有寫進我。

## 核心意象（3 個以內）

1. **三道光，其中一道極淡**（核心 — 三人電影、沒有姓名的視覺化）
2. **空白名牌 / 留白卡片**（姓名空缺）
3. **大量負空間 + 低地平線**（這首歌是「沒有」的歌：沒姓名、沒回應、沒擁有）

## 色溫走向（**全冷主導，禁止暖色**）

```
intro       still   深藍灰夜霧
verse1      soft    冷感街燈光暈、無暖意
chorus1     ache    冷主導 + paper 微光（淚 / 負空間）
solo        still   雨絲（極靜）— 暫沿用 SceneSilence
verse2      soft    同 verse1
chorus2     ache    同 chorus1，第二段加碼「卻發現愛一定要有回應」
bridge      still   最深的靜，幾乎全黑
chorus_last ache    同 chorus，加眼淚意象
```

**關鍵判斷**：副歌**比主歌更冷**，不是更暖。這跟一般抒情翻唱直覺相反，但跟歌詞情緒一致。

## Section → Scene 對應表（demo Level B）

| Section | Scene 元件 | 主意象 | Palette mood | 狀態 |
|---|---|---|---|---|
| intro | SceneSilence | 月、霧、低地平線 | still | 沿用 reference |
| verse1 | SceneSilence（暫） | 同上但 palette 為 cold | soft | 暫用 — 真要做有 city/rain 主題 scene |
| chorus1 | **SceneNameless**（新做） | 三道光裡一道極淡 + 空白名牌 | ache | 新做（subagent 交付中） |
| solo | SceneSilence | 同 intro | still | 沿用 |
| verse2 | SceneSilence | 同 verse1 | soft | 暫用 |
| chorus2 | SceneNameless | 同 chorus1 | ache | 共用 |
| bridge | SceneSilence | 最深的靜 | still | 沿用 |
| chorus_last | SceneNameless | 同 chorus | ache | 共用 |

> 後續可能升級：SceneEmptyStreet（verse 城市孤獨）、SceneRain（solo/bridge 雨絲版）。Level B 暫不做。

## 特殊 cue 視覺決策

依 `timeline.json` 的 cues：
- 19.33s `flash-cold` — 第一句人聲進入（現有 CueFlashLayer 自動處理）
- 58.89s `color-flip` — 副歌進入，主色 / accent 互換
- 116.27s `iris-open` — 副歌二（**振幅要降低**，這首不該是擴張感，要改的話之後說）
- 150s `shake-subtle` — 橋段進入內收
- 176.42s `color-flip` — 最後副歌
- 195s `iris-close` — 「你突然不愛我」前的收束

## 字體決策

沿用預設：中文 Noto Serif TC 400、emphasis 600；英文副標 Cormorant Garamond 300 italic。

## 禁忌清單

- **暖色**（sun / warm / blush / wound）— 副歌絕不暖
- 三道光對等明亮（壞掉「沒有姓名」的核心）
- 空白名牌任何文字 / 圖示 / 動態填入
- 神聖光輝、安慰式淡光漸亮
- 粒子洪水、視覺暴力

## 跨 scene 統一語彙

「**負空間 / 缺席**」貫串所有 scene：
- SceneSilence：月與霧之間大量空間（reference 已有）
- SceneNameless：空白名牌 + 三道光的「缺一」
- 未來新 scene 都應保留 60%+ 留白

## 生產紀錄

- Intake 日：2026-05-01
- Frame 確認：2026-05-02（使用者確認「沒有姓名的存在」frame、無禁忌）
- 開工：路徑 2（dispatch subagent 為 Scene Designer）
- 交付日：
- 總工時：
- YouTube 連結：
- 試過的 agent 方向 / 為什麼選這個：
