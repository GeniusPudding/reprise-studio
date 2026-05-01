# Scene Brief: SceneBrokenWings

## 1. 定位

- **song_id**: seeing-farthest
- **section(s)**: pre_chorus（fixture timeline 中的 52–74s 區段）
- **mood**: ache
- **palette reference**: `@/theme/palettes/seeing-farthest`

## 2. 情緒一句話

「過去的我看著現在的我跌倒，沒伸手 — 是允許，不是無情。」

## 3. 主視覺意象（最多三個）

1. **羽毛緩降**：5–8 片羽毛從畫面上方以**極慢**速度向下飄移（每片 8–14s 走完全程）。Canvas 2D 粒子，不要太具象的羽毛 SVG，靠 alpha 漸層 + 微旋轉
2. **冷地平線**：低於畫面中線的單色橫帶 + 微弱發光（同 SceneSilence 的 horizon 但更冷、更高位）
3. **觀看的剪影**（鏡像錨）：畫面邊緣（右下或左下）一個半透明、模糊的人形剪影輪廓 — **不要五官**，只是一個站立的暗形。代表「過去的自己在旁邊看，沒介入」

## 4. 動態規則（能量綁定）

- 羽毛**速度**：固定，不綁能量（要保留「靜靜墜落」的時間感）
- 羽毛**數量**：section 進入時生成，**不逐幀變動**；energy 影響整體 alpha（`opacity = 0.5 + energy * 0.2`）
- 地平線發光：`glow = 0.3 + energy * 0.15`
- 剪影 alpha：固定，不變動

## 5. 進退場

- 進場：由 `BaseScene` 2s fade
- 額外：羽毛在進場後 1s 才開始生成（讓畫面先靜下來，再開始落）
- 退場：`BaseScene` 處理；羽毛被 BaseScene 的 opacity 帶走即可，不自寫 exit

## 6. 禁忌

- **羽毛不要碎裂、不要被吹散、不要爆破效果** — 「忍痛」是承受不是受傷
- 不要紅色（DESIGN.md base 沒有紅，但 wound 是酒紅，**這個 scene 不引用 wound**，純用 cold）
- 剪影不要動（不要轉頭、不要伸手、不要任何手勢）
- 不要打雷、下雨、視覺暴力

## 7. 交付物

- `src/scenes/SceneBrokenWings.tsx`
- `src/scenes/SceneBrokenWings.module.css`
- Canvas 粒子用 `requestAnimationFrame`，記得 cleanup
- registry 已有條目（內容從 placeholder 換）

## 8. 參考

- `docs/DESIGN.md` §四「Scene 設計原則」、§五「動畫原則」（loop 動畫週期 ≥ 3s — 羽毛符合）
- `src/scenes/SceneSilence.tsx` 的 horizon 寫法可複用
- `notes.md` 的「跨 scene 統一語彙：鏡像」 — 羽毛建議在水面（畫面下方）有微弱倒影
