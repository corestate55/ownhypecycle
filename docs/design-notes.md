# 設計メモ

## Current Status

**フェーズ**: 設計完了 / コード実装前

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
├── Header
│   └── DownloadSVGButton
├── HypeCycleChart
│   ├── CurveBackground      # 曲線・フェーズ区切り・軸ラベル
│   ├── EntryLabel (×N)      # ドラッグ可能なキーワードラベル
│   └── Legend               # 実現時期の凡例
└── TableSection
    ├── TableToolbar          # 行追加・各種インポートエクスポートボタン
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
| 黎明期 | 0 | 200 |
| ピーク期 | 200 | 350 |
| 幻滅期 | 350 | 550 |
| 啓発期 | 550 | 800 |
| 安定期 | 800 | 1000 |

変換式: `x = xStart + position * (xEnd - xStart)`

### ハイプサイクル曲線

キュービックベジェ曲線を複数つなぐ。Y 軸は期待値（高いほど上、SVG では値が小さいほど上）。

主要な制御点（概略）:

| 役割 | x | y |
|------|---|---|
| 開始（黎明期） | 0 | 400 |
| ピーク頂点 | 310 | 30 |
| 幻滅期の谷 | 530 | 460 |
| 安定期プラトー開始 | 820 | 200 |
| 安定期プラトー終端 | 1000 | 200 |

正確な制御点は `src/utils/curve.ts` で定義する。

### ラベル重複回避

1. 全エントリについて曲線上の初期座標 `(x, y)` を算出する
2. ラベルの矩形領域（幅: 文字数×推定px、高さ: 固定）を比較する
3. 重なりがある場合、Y 方向に押し出す（上下交互に）
4. 最大 20 回の反復で収束させる
5. ラベル座標と曲線上の点をスパイク線（細い `<line>`）で結ぶ

### ドラッグ実装

SVG 要素の `onMouseDown` → `window` の `mousemove` / `mouseup` でドラッグ追跡。

```
onMouseDown:
  ドラッグ対象の id を state に保持

onMouseMove:
  SVG のクライアント座標 → viewBox 座標に変換
  x をフェーズ区間にクランプ
  position = (x - xStart) / (xEnd - xStart) として更新

onMouseUp:
  ドラッグ対象の id をリセット
```

### インポート・エクスポート

- **CSVエクスポート**: entries を `keyword,timeToAdoption,stage,position\n...` に変換して Blob ダウンロード
- **JSONエクスポート**: `JSON.stringify(entries, null, 2)` をそのままダウンロード
- **インポート**: `FileReader.readAsText()` でパース後、バリデーションして `setEntries()`
- **SVGエクスポート**: `document.querySelector('svg')` の `outerHTML` を Blob ダウンロード。フォントや色はインラインスタイルで持つ

### 実現時期の記号（SVG）

| 値 | SVG 要素 |
|----|---------|
| `lt2` | `<circle fill="white" stroke="#333" />` |
| `2to5` | `<circle fill="#4A90D9" />` |
| `5to10` | `<circle fill="#1A3A6B" />` |
| `gt10` | `<polygon fill="#D94A4A" />` （三角形） |
| `obsolete` | `<circle fill="none" stroke="red" />` + 2本の `<line stroke="red" />` |

## 未決事項

| # | 事項 | 優先度 | 備考 |
|---|------|--------|------|
| 1 | ラベル重複回避の品質 | 中 | 20回反復で不十分な場合は上限を増やすか別アルゴリズムを検討 |
| 2 | SVG エクスポート時のフォント埋め込み | 低 | 環境によってフォントが変わる可能性あり |
| 3 | モバイル対応（タッチドラッグ） | 低 | 初期実装はマウス操作のみ |
| 4 | テーブルの行並び替え | 低 | ドラッグ並び替えは初期実装では対応しない |

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-09-13 | 初版作成（設計フェーズ完了） |
