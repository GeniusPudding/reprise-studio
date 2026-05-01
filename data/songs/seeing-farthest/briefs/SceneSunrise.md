# Scene Brief: SceneSunrise

## 1. 定位

- **song_id**: seeing-farthest
- **section(s)**: chorus1（fixture 74–108s；之後 chorus2 / chorus_last 暫沿用此 scene，待真實 timeline 來再判斷是否各自再做）
- **mood**: open
- **palette reference**: `@/theme/palettes/seeing-farthest`

## 2. 情緒一句話

「曙光不是被給予，是被撐開 — 明白疼痛仍選擇相信。」

## 3. 主視覺意象（最多三個）

1. **緩升曙光**：大型 radial gradient 從畫面下方中央緩慢往上撐開的暖光。**整段 scene 期間光的 y 位置和 spread 都在緩變**，不是進場到位就停。用 motion 跟 `progress` prop（0–1）綁定
2. **肩線剪影**（直接歌詞錨）：畫面下半，從左到右一條波狀地平線，**右側（畫面 1/3 處）隆起一個極小的肩線弧度** — 不要畫整個人，只是地平線輕微的「有人在那」起伏
3. **過去自我的重影**（鏡像錨）：在主肩線剪影的左側，**極淡**的第二肩線（alpha < 0.3，blur 較重，位置偏低 5–10px）— 過去的我也在曙光裡，但較模糊

## 4. 動態規則（能量綁定）

- 曙光中心 y 座標：與 `progress` 線性綁定，0 時光在畫面外、1 時光中心約在畫面下 1/3 處
- 曙光亮度：`brightness = 0.6 + energy * 0.25 + progress * 0.15`（progress 主導、能量微調）
- spread（光的擴散半徑）：`baseSpread + progress * 0.4 + energy * 0.1`
- 重影 alpha：固定 0.25，不隨 energy 變
- 整體**禁止**：任何閃爍、瞬間爆亮、白光全屏 flash

## 5. 進退場

- 進場：由 `BaseScene` 2s fade，**但**內部 progress 已從 pre_chorus 切換瞬間從 0 開始爬，所以視覺上是「光從無到有的撐開」
- 額外：cue 點 `iris-open`（在 74.0s）會被 `CueFlashLayer` 處理，**這個 scene 不要再寫額外的進場閃光**，避免雙重視覺事件
- 退場：`BaseScene` fade

## 6. 禁忌

- **不要太亮**（reference 「克制的金」）— max overall brightness 不超過 0.95
- **不要爆破式 iris**（cue layer 已經做了輕量版）
- **不要射線狀光芒**（那是宗教感 / 救贖感，與「自己撐起」不符）
- 重影不要明顯到變第二個人（要曖昧，要可被解讀為「就是同一個人的影子」）

## 7. 交付物

- `src/scenes/SceneSunrise.tsx`（已有 placeholder，內容換新）
- `src/scenes/SceneSunrise.module.css`
- registry 已有條目

## 8. 參考

- `docs/DESIGN.md` §五「能量綁定範例」 — 但本 scene 主要用 `progress`，不是 `energy`
- `src/scenes/SceneSilence.tsx` 的 CSS-vars-from-React 模式照抄
- `notes.md` 「跨 scene 統一語彙：鏡像」 — 重影是這首歌貫串元素之一
