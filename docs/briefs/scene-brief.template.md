# Scene Brief: Scene<Name>

> 使用方法：複製這整份檔案，填好每一節，然後貼給 agent。
> 必讀：`docs/AGENT_PROTOCOL.md`（agent 不讀 protocol 就拒收）。

## 1. 定位

- **song_id**:
- **section(s)**:        （例：`chorus1`, `chorus2`）
- **mood**:              （`still | soft | ache | open | defy | fin`）
- **palette reference**: （例：`@/theme/palettes/seeing-farthest`）

## 2. 情緒一句話

「<一句話描述這一段要給人的感受>」

## 3. 主視覺意象（最多三個）

1. **主元素**：<what> — <how: SVG / CSS gradient / Canvas particles / Motion layout>
2. **輔助元素**：<what> — <how>
3. **可選第三元素**：

## 4. 動態規則（能量綁定）

說明 `energy: 0–1` 如何影響畫面。例：

- `brightness = 0.6 + energy * 0.25`
- `particleCount = floor(40 + sectionEnergy * 60)`（section 切換時才更新）
- `blur = 20 - energy * 15` px

## 5. 進退場

- **Scene 進場**：
- **Scene 退場**：由 `BaseScene` 統一處理，scene 不要自己寫 exit 動畫

## 6. 禁忌

- （這首歌 / 這個 scene 特別不要出現什麼）
- （參考 `docs/DESIGN.md` §1.3「要避免的反例」）

## 7. 交付物

- `src/scenes/Scene<Name>.tsx`
- `src/scenes/Scene<Name>.module.css`（如果需要）
- 在 `src/scenes/registry.ts` 加一行註冊

## 8. 參考

- `docs/DESIGN.md` §四「Scene 設計原則」
- 既有範本：`src/scenes/SceneSilence.tsx`
- 同 song 的 palette：見「定位」段落

---

## 備註區（給 agent 自由筆記，回報時用）

- 用到的 tokens：
- 已知限制：
