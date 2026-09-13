# CLAUDE.md — OwnHypeCycle

このファイルはClaude Codeがこのリポジトリで作業する際に従うべきルールを定義する。

## プロジェクト概要

ブラウザで動作する自作ハイプサイクル作成ツール。詳細は [docs/requirements.md](docs/requirements.md) を参照。

## 技術スタック

- **フレームワーク**: React + Vite + TypeScript
- **スタイル**: Tailwind CSS v4（`@tailwindcss/vite` プラグイン経由）
- **可視化**: カスタム SVG（外部チャートライブラリは使わない）
- **コンテナ**: マルチステージ Dockerfile → nginx:alpine
- **バックエンド**: なし（すべてクライアントサイドで完結）

## ディレクトリ構成

```
ownhypecycle/
├── CLAUDE.md
├── README.md
├── Dockerfile
├── .dockerignore
├── docs/
│   ├── requirements.md
│   └── design-notes.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/
    │   ├── HypeCycleChart/       # SVGチャート本体
    │   │   ├── index.tsx         #   チャート全体
    │   │   ├── EntryLabel.tsx    #   ドラッグ可能なキーワードラベル
    │   │   ├── Legend.tsx        #   実現時期の凡例（右上）
    │   │   └── TimeToAdoptionIcon.tsx  # 実現時期アイコン（SVG）
    │   ├── DataTable/            # キーワード管理テーブル
    │   │   └── index.tsx
    │   └── TableToolbar.tsx      # 行追加・インポート・エクスポートボタン
    ├── types/                    # TypeScript 型定義
    │   └── index.ts
    └── utils/                    # 曲線計算・レイアウト・CSV/JSON変換
        ├── curve.ts
        ├── labelLayout.ts
        └── io.ts
```

## コーディングルール

### 全般
- TypeScript strict モードを使う。`any` は原則禁止
- コンポーネントはすべて関数コンポーネント（クラスコンポーネント不使用）
- 状態管理は React の `useState` / `useReducer` で完結させる（外部状態管理ライブラリは導入しない）
- コメントは WHY が非自明な場合のみ書く（WHAT は書かない）

### SVG / チャート
- SVG の座標系は `viewBox="0 0 1000 500"` を基準とする
- 曲線の制御点・フェーズ区間は `src/utils/curve.ts` に集約する
- ドラッグ処理は SVG 要素の `onMouseDown` → `window` の `mousemove` / `mouseup` で実装する（ドラッグライブラリは使わない）
- 実現時期アイコンは曲線上に直接配置する（ラベルは原則アイコンの横）

### データ
- エントリの `position` はフェーズ内 [0, 1] の相対値（グローバル X 座標ではない）
- CSV / JSON のインポート・エクスポートはブラウザの `Blob` + `<a download>` で実装する
- データの永続化は行わない（localStorage も使わない）

### スタイル
- Tailwind CSS のユーティリティクラスを優先する
- インラインスタイルは SVG 属性（`fill`, `stroke` 等）のみ許可

## ドキュメント管理ルール

| ファイル | 更新タイミング |
|---------|--------------|
| `CLAUDE.md` | 長期間変わらないルールが変わったとき |
| `docs/requirements.md` | 要件が追加・変更されたとき |
| `docs/design-notes.md` | 設計方針・未決事項・実装状況が変わったとき |
| `README.md` | 起動方法・使い方が変わったとき |

コードを変更したとき、影響があるドキュメントも合わせて更新すること。
