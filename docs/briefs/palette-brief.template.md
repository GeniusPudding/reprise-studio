# Palette Brief: <song-id>

> 使用方法：複製整份檔案，填好，貼給 Palette Designer agent。
> 必讀：`docs/AGENT_PROTOCOL.md` §6.3、`docs/DESIGN.md` §二。

## 1. 歌曲資訊

- **song_id**:
- **title**:
- **情緒 one-liner**:

## 2. 色溫走向（S 曲線，對照 section 順序）

intro → verse1 → pre_chorus → chorus1 → verse2 → chorus2 → bridge → chorus_last → outro

例：
```
冷（still）→ 微暖（soft）→ 陰冷（ache）→ 大暖（open）
        → 微暖（soft）→ 大暖（open）→ 反轉冷黑（defy）→ 極暖（open）→ 紙感（fin）
```

## 3. 情緒錨點（每個 mood 要給什麼感覺）

| mood | 形容詞（3 個以內） | 建議色向 |
|---|---|---|
| still | | |
| soft  | | |
| ache  | | |
| open  | | |
| defy  | | |
| fin   | | |

## 4. 反色錨點

DESIGN.md 原則：「最暖的畫面也要有一抹冷色」。
這首歌的反色錨點是什麼？（例：副歌金光裡的一道藍影）

## 5. 禁忌色

- （例：紫色漸層、深紅…）

## 6. 交付物

- `src/theme/palettes/<song-id>.ts`
- 若需新 base 色：`src/theme/tokens.ts` + `docs/DESIGN.md` §二新增說明

## 7. 不得變動

- 既有 palettes（除非被明確指派為重構）
- scene、engine
