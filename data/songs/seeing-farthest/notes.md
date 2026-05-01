# 看得最遠的地方 — 設計筆記

## 一句話情緒

「給過去的自己。不是被救贖，是被允許自己學會痛。」

歌詞中的「你」= 過去的自我。整首是一場跨時間的對話：現在的我向曾經的我告白，告白裡面有感謝、有疼惜、有「你看，我們走到了這裡」的那種欣慰。

## 核心意象（3 個以內）

1. **鏡像 / 反射**（貫串視覺語彙）— 水面、延遲的光影、雙重曝光感的剪影
2. **曙光與肩線**（chorus 的視覺錨點，直接來自歌詞「披第一道曙光在肩膀」）
3. **羽毛的降落**（pre_chorus 的疼痛，但是被觀看而不是被介入的那種）

## 色溫走向（前半 — 後半待真實 timeline）

```
intro       still   深藍灰夜霧
verse1      soft    冷感但被允許靠近的米光
pre_chorus  ache    退暗、收緊、近於獨白
chorus1     open    緩開的曙光 — 克制的金，不是大爆發
```

**關鍵判斷**：`pre_chorus → chorus1` 不是「黑→金」的反差爆破，是「暗收 → 緩開」。曙光要慢，要承載「明白疼痛仍選擇相信」的重量。

## Section → Scene 對應表

| Section | Scene 元件 | 主意象 | Palette mood | 狀態 |
|---|---|---|---|---|
| intro | SceneSilence | 月、霧、水面反射（reference 已實作） | still | 沿用 |
| verse1 | SceneUnderstanding | 一道光 + 其延遲的微弱反射 | soft | 新做 |
| pre_chorus | SceneBrokenWings | 羽毛緩降 + 冷地平線 + 觀看的剪影 | ache | 新做 |
| chorus1 | SceneSunrise | 緩升曙光 + 肩線剪影 + 過去自我的重影 | open | 新做 |
| verse2 | （待真實 timeline） | | | |
| chorus2 | （待真實 timeline） | | | |
| bridge | （待真實 timeline） | | | |
| chorus_last | （待真實 timeline） | | | |
| outro | （待真實 timeline） | | | |

## 特殊 cue 視覺決策

依現有 timeline.json 的 cues：

- 18.4s `flash-cold` 第一句人聲進入 → 配合 SceneSilence → SceneUnderstanding 的銜接，極淡的冷光
- 52.0s `color-flip` pre-chorus 轉折 → 主色 / accent 對調，導入 ache mood
- 74.0s `iris-open` 副歌爆發 → **降低振幅**：不是炸開，是緩開
- 92.0s `flash-warm` 「敢飛就有天空那樣」→ 信念句的微暖閃，**極短**
- 後續 cue 等真實 timeline

## 字體決策

沿用預設：中文 Noto Serif TC 400 / 強調 600；英文副標 Cormorant Garamond 300 italic。
emphasis 強調的詞（「面無表情」「你不扶我」「敢飛就有天空」）三句都很短，視覺上會單獨提亮。

## 禁忌清單

無使用者明示禁忌。從 DESIGN.md 通則 + 「過去的自己」這個 frame 衍生的隱性禁忌：

- 不要兩道對等的光束（雙光束會變成戀人感，不是 self-vs-self）
- 不要太具象的人臉剪影（剪影要曖昧，是「你也是我」的可置換性）
- 不要把曙光做成爆破式 iris（違反「克制的金」的整體判斷）
- 不要把羽毛做成碎裂感（pre_chorus 是允許自己痛，不是受傷展示）

## 跨 scene 統一語彙：鏡像

每個 scene 都應隱約有一個「reflection / 重影 / 延遲影」的元素，作為「過去的自己」這個主題的視覺錨：

- SceneSilence：月在霧水面上的延遲倒影（reference impl 已有 water gradient，可加強）
- SceneUnderstanding：光束 + 延遲 0.4s 的 paler 反射光
- SceneBrokenWings：墜落的羽毛 + 水面對應的浮動倒影
- SceneSunrise：肩線剪影 + 微弱的第二剪影（過去的我，半透明）

## 生產紀錄

- 開工日：2026-04-29
- 風格對談：基於歌詞讀解，使用者選定「過去的自己」frame、無禁忌
- 交付日：
- 總工時：
- YouTube 連結：
- 試過的 agent 方向 / 為什麼選這個：
