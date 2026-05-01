# Scene Brief: SceneUnderstanding

## 1. 定位

- **song_id**: seeing-farthest
- **section(s)**: verse1
- **mood**: soft
- **palette reference**: `@/theme/palettes/seeing-farthest`

## 2. 情緒一句話

「過去的自己第一次看穿了現在的我 — 被看見的脆弱與安心。」

## 3. 主視覺意象（最多三個）

1. **主光束**：一道斜入的微暖光，從畫面右上往中下方向 — CSS conic / linear gradient + blur
2. **延遲反射**：同方向但更冷、更暗、更 blur 的第二道光，左右對稱位置的鏡像 — **這是「過去的自己」frame 的視覺核心**。位置不對等（鏡像但稍微偏移），暗示時間落差
3. **漂浮光點**：3–5 顆 paper 色光點，緩慢上升，呼應 pre_chorus 的羽毛但反方向（光點往上 = 被理解的釋放感）

## 4. 動態規則（能量綁定）

- 主光束亮度：`brightness = 0.55 + energy * 0.2`（克制範圍）
- 反射光亮度：永遠是主光束的 0.45 倍（過去 = 較弱的光）
- 反射光相位：相對主光束的呼吸延遲 ≈ 0.4s（用 motion 的 transition delay 做）
- 光點上升速度：`baseSpeed * (0.7 + energy * 0.3)`，section 切換時才更新粒子數，不逐幀

## 5. 進退場

- 進場：由 `BaseScene` 的 2s fade
- 退場：由 `BaseScene`，scene 不自寫 exit

## 6. 禁忌

- **絕對不要兩道對等的光束**（會變成戀人 / 雙人感，違反「過去的自己」的單人本質）
- 不要紫色、不要 cyber 感、不要粒子洪水
- 光點數量 ≤ 8（DESIGN.md 主元素 ≤ 3 種，光點屬於輔助）

## 7. 交付物

- `src/scenes/SceneUnderstanding.tsx`
- `src/scenes/SceneUnderstanding.module.css`
- 在 `src/scenes/registry.ts` 已有的條目（已存在，內容會從 placeholder 換成真實實作）

## 8. 參考

- `docs/DESIGN.md` §四「Scene 設計原則」
- `src/scenes/SceneSilence.tsx`（reference 實作）
- `notes.md` 的「跨 scene 統一語彙：鏡像」段落
