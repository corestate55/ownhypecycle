# 設計メモ

## Current Status

**フェーズ**: 初期実装完了

実装済み機能:
- ハイプサイクル曲線（ベジェ近似）
- フェーズ区切り・ラベル
- 実現時期アイコンを曲線上に直接配置
- キーワードラベル（重複回避 + スパイク線）
- 凡例（右上・縦並び）
- ドラッグ操作（フェーズ内制約）
- インライン編集テーブル（キーワードはリアルタイム反映）
- CSV / JSON エクスポート・インポート
- SVG ダウンロード
- Docker マルチステージビルド

## アーキテクチャ

### 全体構成

```
[ブラウザ]
  └─ React SPA (Vite ビルド)
       ├─ HypeCycleChart  (SVG チャート)
       └─ DataTable       (キーワードテーブル)

[コンテナ]
  └─ nginx:alpine
       └─ /usr/share/nginx/html/  ← Vite の dist/ をコピー
```

バックエンドなし。状態はすべて React の `useState` で管理する。

### コンポーネント構成

```
App
├── ヘッダー（インライン）
│   └── SVGダウンロードボタン
├── HypeCycleChart
│   ├── 曲線・フェーズ区切り・軸ラベル（インライン SVG）
│   ├── EntryLabel (×N)      # ドラッグ可能なアイコン + ラベル
│   └── Legend               # 実現時期の凡例（右上）
└── TableSection（インライン）
    ├── TableToolbar          # 行追加・インポート・エクスポートボタン
    └── DataTable
        └── EntryRow (×N)    # インライン編集可能な行
```

## 設計上の決定

### 座標系

- SVG の viewBox を `0 0 1000 500` で固定する
- `position [0,1]` → SVG 上の X 座標への変換は `src/utils/curve.ts` が担う

フェーズの X 区間（SVG 座標）:

| フェーズ | xStart | xEnd |
|---------|--------|------|
| 黎明期 | 30 | 200 |
| ピーク期 | 200 | 350 |
| 幻滅期 | 350 | 540 |
| 啓発期 | 540 | 790 |
| 安定期 | 790 | 970 |

変換式: `x = xStart + position * (xEnd - xStart)`

### ハイプサイクル曲線

キュービックベジェ曲線を6セグメントつないで本家 Gartner の特徴的な形状を近似する。Y 軸は期待値（高いほど上、SVG では値が小さいほど上）。

セグメント一覧（各行: `[x0,y0, cx1,cy1, cx2,cy2, x1,y1]`）:

| セグメント | 形状 |
|-----------|------|
| [30,430 → 200,200] | 黎明期の緩やかな上昇 |
| [200,200 → 310,25] | ピークへの急上昇 |
| [310,25 → 400,350] | ピーク後の急降下 |
| [400,350 → 540,450] | 幻滅期の谷 |
| [540,450 → 790,230] | 啓発期の緩やかな回復 |
| [790,230 → 970,210] | 安定期のプラトー |

正確な制御点は `src/utils/curve.ts` の `CURVE_SEGMENTS` 定数で定義する。

### アイコン配置とラベルレイアウト

実現時期アイコンは **曲線上に直接配置** する（旧: ラベル横）。

ラベルの配置方針:
1. 初期位置: アイコン中心 (cx, cy) から横に並べた位置（lx = cx, ly = cy）
2. 反復押し出し（最大30回）でY方向に重複を解消
3. `|ly - cy| > 20px` の場合は「displaced」とみなしスパイク線を描画
4. 安定期フェーズのエントリはテキストをアイコンの左側に配置（右端からはみ出し防止）

`src/utils/labelLayout.ts` が担当する。

### ドラッグ実装

SVG 要素の `onMouseDown` → `window` の `mousemove` / `mouseup` でドラッグ追跡。

```
onMouseDown:
  window に mousemove / mouseup リスナーを登録

onMouseMove:
  SVG のクライアント座標 → viewBox 座標に変換
  x をフェーズ区間 [xStart, xEnd] にクランプ
  position = (x - xStart) / (xEnd - xStart) として entries を更新

onMouseUp:
  window リスナーを解除
```

### インポート・エクスポート

- **CSVエクスポート**: `keyword,timeToAdoption,stage,position` ヘッダー + 各行を Blob ダウンロード
- **JSONエクスポート**: `id` を除いた配列を `JSON.stringify(data, null, 2)` でダウンロード
- **インポート**: `FileReader.readAsText()` でパース後、型バリデーションして `setEntries()` で上書き
- **SVGエクスポート**: `XMLSerializer.serializeToString(svgElement)` を Blob ダウンロード

### 実現時期の記号（SVG）

| 値 | SVG 要素 |
|----|---------|
| `lt2` | `<circle fill="white" stroke="#333" strokeWidth="1.5" />` |
| `2to5` | `<circle fill="#4A90D9" />` |
| `5to10` | `<circle fill="#1A3A6B" />` |
| `gt10` | `<polygon fill="#D94A4A" />` （上向き三角形） |
| `obsolete` | `<circle fill="none" stroke="#D94A4A" />` + 斜め2本の `<line stroke="#D94A4A" />` |

## 未決事項

| # | 事項 | 優先度 | 備考 |
|---|------|--------|------|
| 1 | SVG エクスポート時のフォント埋め込み | 低 | 環境によってフォントが変わる可能性あり |
| 2 | モバイル対応（タッチドラッグ） | 低 | 初期実装はマウス操作のみ |
| 3 | テーブルの行並び替え | 低 | ドラッグ並び替えは初期実装では対応しない |

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-09-13 | 初版作成（設計フェーズ完了） |
| 2026-09-13 | 初期実装完了（React + Vite + カスタム SVG） |
| 2026-09-13 | アイコンを曲線上に直接配置、ラベル重複時のみスパイク線、凡例を右上縦並びに変更 |
