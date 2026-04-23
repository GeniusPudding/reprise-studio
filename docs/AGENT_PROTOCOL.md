# AGENT_PROTOCOL.md — Scene / Layer / Palette Designer Protocol

這份文件定義「**怎麼操作 agent 幫你做畫面**」的標準協定。
目的：讓你未來可以隨時切換不同 agent（Claude、Codex、其他 LLM、甚至人類協作者）接手特定 scene 的設計，**不用每次重新解釋整個 repo**。

> 這份 protocol 不綁定特定 agent 廠商，但預設你用 Claude Code。
> 對 Claude Code 的補充約束見 `../CLAUDE.md`。

---

## 零、為什麼要有這個 protocol

1. **Scene 是可替換單位**：一個 scene = 一個檔案，可以由不同 agent 獨立實作、任意抽換。
2. **視覺探索是多方向的**：同一個段落你可能想看 3 種設計方向，這 protocol 讓你同時發 3 個 agent 跑而不互相干擾。
3. **品質一致性靠約束不靠運氣**：把「不要 AI slop」這類要求寫進標準 brief 和驗收清單，agent 才會穩定產出符合美學的東西。

---

## 一、Agent 角色（Roles）

| 角色 | 負責範圍 | 不能碰 |
|---|---|---|
| **Engine Maintainer** | `src/engine/`、`src/utils/`、`src/remotion/`、`src/layers/LyricLayer`、`CueFlashLayer` | scene 視覺、palette、tokens |
| **Scene Designer** | 一個 `src/scenes/SceneXxx.tsx` (+ CSS module) | engine、tokens、palette 定義；也不能改別的 scene |
| **Layer Designer** | 一個跨 scene 疊加層（`GrainLayer`、`CueFlashLayer` 等） | scene、engine |
| **Palette Designer** | `src/theme/palettes/<song-id>.ts` + `tokens.ts` 新增色 | scene、engine、既有 palette（除非是重構 migration） |
| **Reviewer** | 依「驗收清單」審稿，不寫 code | — |

同一個 agent 可以跨角色，但 **一次 session 只處理一個角色的工作**，避免一次改太多層。

---

## 二、核心不變量（Invariants）— 任何 agent 都不能違反

這些是**停止規則**。Agent 寫出違反這些的 code，一律拒收。

### 資料層
1. **Scene 只消費 props**（`SceneProps`），不自行 fetch、不讀全域 store、不讀 localStorage。
2. **歌詞文字不出現在 scene 裡**：scene 只收 `lyric`（可能是 null），文字渲染由 `LyricLayer` 負責。
3. **Timeline JSON schema 只由 engine 修改**。Scene/Layer agent 不能擴 schema；要擴請走 Engine Maintainer 並更新 `examples/timeline.example.json`。

### 視覺層
4. **沒有 magic number**：顏色、時長、緩動函式一律從 `@/theme/tokens` 或 `palette` 讀取；需要新 token 時先改 `tokens.ts` 並在 `DESIGN.md` 加一段說明。
5. **字體固定**：預設是 Noto Serif TC + Cormorant Garamond；要換字體必須走 Palette Designer 角色 + `DESIGN.md` 更新。
6. **Cue 特效限縮在 `DESIGN.md` 列出的七種**：`flash-warm / flash-cold / color-flip / shake-subtle / iris-open / iris-close / static-burst`。新增要先更新 doc。
7. **Loop 動畫週期 ≥ 3s**，且不得自己消耗全螢幕閃爍、持續發光、持續粒子洪水。

### 工程層
8. **Scene 單檔原則**：`SceneXxx.tsx`（+ 同名 CSS module）= 一個 scene 的全部。不要把子元件拆到其他檔案——拆了就破壞「swap 一個檔案 = 換一個 scene」的約定。
9. **不引入新依賴**（除非被要求）。允許的棧：`motion`、`gsap`、CSS、SVG、Canvas 2D。
10. **Scene 檔名規則**：`Scene<意象大駝峰>.tsx`（例：`SceneBrokenWings.tsx`），對應 CSS 是 `Scene<意象>.module.css`。
11. **必須註冊進 `src/scenes/registry.ts`**，key 與 class 名字完全相同。

### 音訊主時鐘
12. **永遠不動 `audio.currentTime`**。scene / layer 的動畫只能「讀」目前時間，任何動畫若拉扯了播放位置，視為 bug。

---

## 三、標準 Brief（Input Contract）

> 這是你（User）給 agent 的東西。模板在 `docs/briefs/scene-brief.template.md`。

**一份合法的 Scene Brief 必須包含**：

```
# Scene Brief: Scene<Name>

## 1. 定位
- song_id:           <e.g. seeing-farthest>
- section(s):        <e.g. chorus1, chorus2>
- mood:              <still | soft | ache | open | defy | fin>
- palette reference: <import path to the song palette>

## 2. 情緒一句話
「<一句話描述這一段要給人的感受>」

## 3. 主視覺意象（最多三個）
1. <主元素>：<如何呈現（SVG / CSS / Canvas）>
2. <輔助元素>：<如何呈現>
3. <可選>

## 4. 動態規則（能量綁定）
- 背景亮度 / 粒子數 / 模糊度 這類與 `energy: 0–1` 的綁定關係
- 例：brightness = 0.6 + energy * 0.25

## 5. 進退場
- Scene 進場：<例：fade 2s，月亮從中心縮放 1.02 → 1.0>
- Scene 退場：由 BaseScene 統一處理，不要自己寫 exit 動畫

## 6. 禁忌
<從 DESIGN.md 的「要避免的反例」裡挑這首歌特別要避開的>
<這首歌專屬的禁忌，例如：不要紅色>

## 7. 交付物
- src/scenes/Scene<Name>.tsx
- src/scenes/Scene<Name>.module.css（如需）
- 更新 src/scenes/registry.ts

## 8. 參考
- DESIGN.md 的「Scene 設計原則」
- 既有範本：src/scenes/SceneSilence.tsx
```

**Brief 的品質直接決定 agent 產出的品質**。模糊的 brief 產出 AI slop。

---

## 四、Delivery Contract（Agent 交付清單）

Agent **必須**回覆：

1. **檔案列表**：新增或修改的所有檔案（絕對路徑）
2. **Token 引用列表**：用到哪些 `tokens.*`、`palette.*`（方便 Reviewer 檢查 magic number）
3. **動態規則摘要**：一段 pseudo-code 或文字，描述能量 / 時間 / 進度如何驅動動畫
4. **已知限制**：有什麼沒做到、為什麼（例：「粒子數超過 200 時 FPS 掉到 45，目前限縮到 180」）
5. **測試方式**：如何在瀏覽器裡看到這個 scene 單獨運作（建議：在 App.tsx 暫時掛進 Player 的 section）

Agent **不能**：
- 同時動多個 scene
- 改 `engine/`（除非它被指派為 Engine Maintainer）
- 改 `tokens.ts` 但不更新 `DESIGN.md`
- 自行安裝 npm 套件

---

## 五、驗收清單（Reviewer 角色走這個）

審一個新 scene，跑這份 checklist。任何一項打 ✗ 就退回：

### 結構
- [ ] 檔名符合 `Scene<Name>.tsx` 規範
- [ ] 只有一個 scene 檔被新增/修改（單檔原則）
- [ ] 已註冊進 `src/scenes/registry.ts`
- [ ] 沒有碰 `engine/`、`utils/`、既有 palette、既有其他 scene

### 資料潔癖
- [ ] Scene 函式簽名是 `(props: SceneProps) => JSX.Element`
- [ ] 沒有 `useEffect` 做副作用（粒子類 scene 除外，需解釋）
- [ ] 沒有直接讀歌詞文字
- [ ] 沒有 fetch / localStorage / window 全域讀取

### 視覺
- [ ] 沒有 hex 色字面量（除了 CSS module 裡從 token 派生的輔助色）
- [ ] 沒有 hardcoded 時長 / duration 字面量
- [ ] 字體沿用 tokens.typography，沒有自己引入新字體
- [ ] Crossfade 交給 `BaseScene` 管理，沒有自己寫進退場
- [ ] Loop 動畫週期 ≥ 3s
- [ ] `prefers-reduced-motion: reduce` 時有明確退化行為（至少靜止）

### 執行
- [ ] `npm run typecheck` 通過
- [ ] 在瀏覽器測試 10 秒不掉 FPS（Perf Monitor > 50fps）
- [ ] 字體載入後第一幀沒有 FOUC

### 美學
- [ ] 不屬於 `DESIGN.md` §1.3「要避免的反例」任何一項
- [ ] 「這一段情緒」用一句話能說清楚，且 scene 確實承載那個情緒
- [ ] 冷暖色溫符合 palette 給的方向
- [ ] 主視覺元素 ≤ 3 種

---

## 六、Invocation Templates（貼給 agent 用的指令）

### 6.1 單一 Scene 設計

```
你是本專案的 Scene Designer。

必讀：
- CLAUDE.md（專案守則）
- docs/DESIGN.md（視覺規範）
- docs/AGENT_PROTOCOL.md（本協定，尤其 §二 不變量 + §五 驗收清單）
- src/scenes/SceneSilence.tsx（reference 範本）

任務：依附件 brief 實作 Scene<Name>。

限制（硬約束）：
1. 只能新增 src/scenes/Scene<Name>.tsx (+ optional .module.css)
2. 更新 src/scenes/registry.ts（僅加一行）
3. 其他檔案一律不動
4. 不能加新 npm 套件
5. 所有顏色、時長走 tokens / palette

交付後用 §四 Delivery Contract 的格式回報。

<< Scene Brief 貼在這裡 >>
```

### 6.2 並行三種方向探索

```
我要為 <section> 探索三種設計方向。
請同時產出三個檔案：Scene<Name>_A.tsx / Scene<Name>_B.tsx / Scene<Name>_C.tsx。
三個都要符合 AGENT_PROTOCOL §二 不變量；差異在 §三 brief 的「主視覺意象」段落（見下方三組）。

不要註冊進 registry（我要手動選擇），但要各自寫一段 1 句話的設計意圖註解在檔案頂端。

A: <方向一的意象/氣氛描述>
B: <方向二>
C: <方向三>
```

驗收完選定版本後，改名去掉 _A/_B/_C 後綴並註冊 registry，其餘刪除。

### 6.3 Palette 調整

```
你是 Palette Designer。

任務：為 <song-id> 建立/調整 palette。

必讀：
- docs/DESIGN.md §二「色彩系統」
- src/theme/tokens.ts（base 色票）
- src/theme/palettes/_template.ts

交付：
- 新增/修改 src/theme/palettes/<song-id>.ts
- 若需新 base 色，加到 tokens.ts 並在 DESIGN.md §二新增一段說明

不動：scene 檔、engine、其他 palette。
```

### 6.4 Engine 修改（慎用）

Engine 改動風險高，走 Engine Maintainer 角色，**一次只改一個 hook / 一個元件**，並附加明確 changelog。
Engine agent 必須同時更新 `examples/timeline.example.json` 和 `src/engine/types.ts` 保持同步。

---

## 七、並行 / 替換工作流

### 並行設計（多 agent 探索）
1. 同一份 brief 複製三份，分別派給 agent A / B / C
2. 每個 agent 產出 `Scene<Name>_<AgentId>.tsx`
3. 在瀏覽器切換看（透過 registry 暫時替換）
4. 選定後：保留勝出檔，刪除其他
5. 在 `data/songs/<song-id>/notes.md` 記一筆：為什麼選這個方向

### 替換既有 scene
因為每個 scene 是單一檔案：
```bash
# 保留舊版作為備份
git mv src/scenes/SceneSunrise.tsx src/scenes/SceneSunrise.v1.tsx
# 派 agent 產新版
# ... agent 產出 SceneSunrise.tsx ...
# A/B test 完後刪舊版
git rm src/scenes/SceneSunrise.v1.tsx
```

Registry 只需改對應那一行（或不改，因為名字不變）。

---

## 八、Protocol 演進紀律

- 新增不變量 → 加到本文件 §二 並寫明緣由
- 刪除不變量 → 附 retrospective 解釋為什麼當初加了又拿掉
- 驗收清單每做完 5 首歌回來回顧一次

這份 protocol **一定會漏掉某些東西**。發現漏洞後立即補，不要「之後再說」。
