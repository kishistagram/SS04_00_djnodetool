# Phase 1 Learning Log: Domain Types and Mock Data

## Goal

Phase 1 の目的は、画面や音を作ることではなく、**アプリが扱うデータの「形」を決めること**だった。

まだ何も表示しない。ユーザーには見えない。でも、ここで決めるデータ構造が、この先の Canvas / Audio / Storage すべての土台になる。

```txt
Phase 0 = 開発環境（Vite + React + TS）
Phase 1 = データの形（domain types + mock data） ← ここ
Phase 2 以降 = そのデータを画面に出す・操作する・再生する
```

## ドメイン（domain）とは何か

「ドメイン」とは、そのアプリが扱う**本質的なデータと概念**のこと。

NodeMix Canvas の場合、本質は「曲をノードとして並べ、線でつなぐグラフ」なので、ドメインの中心はこの4つになる。

```txt
Track         … 曲そのもの（タイトル、アーティスト、BPMなど）
TrackNode     … その曲をキャンバスのどこに置いたか（位置）
TransitionEdge… ノードとノードをつなぐ線（つなぎ方）
Project       … 上の全部をまとめた1つの作品
```

### Track と TrackNode を分ける理由（重要）

ここが今回の一番大事な設計ポイント。

* `Track` = 曲のデータ（音楽そのものの情報）
* `TrackNode` = その曲を「キャンバスのどこに置いたか」という配置情報

分ける理由は、**同じ曲を将来キャンバス上に何回も置けるようにするため**。
曲データ（Track）と、置いた場所（TrackNode）を別にしておくと、
「同じ曲を2か所に置く」ようなことが自然にできる。

```txt
Track（曲は1つ） ──┬── TrackNode A（左上に配置）
                  └── TrackNode B（右下に配置）
```

TrackNode は `trackId` で Track を参照する。これは「曲そのものをコピーする」のではなく「どの曲かを指し示す」やり方。

## TypeScript の `type` で「形」を書く

今回は `type` を使ってデータの形を定義した。

```ts
export type Track = {
  id: string;
  title: string;
  artist?: string;   // ? は「あってもなくてもよい」という意味
  tags: string[];    // string[] は「文字列の配列」
};
```

ポイント:

* `id: string` … 必ず文字列が入る（必須）
* `artist?: string` … `?` が付くと **省略可能（optional）**
* `tags: string[]` … 配列。`["night", "drive"]` のような形

なぜ optional があるのか:

* `artist`（アーティスト名）は、自分で作った曲だと無いかもしれない
* `bpm` は MVP では自動検出しないので、無いことがある

「必須」と「任意」を型で区別しておくと、後でコードを書くとき
「この値は無いかもしれない」と TypeScript が教えてくれる。

## Union 型（決まった選択肢だけを許す）

`TransitionType` は、決まった3つの文字列だけを許す型にした。

```ts
export type TransitionType = "cut" | "fade" | "crossfade";
```

`|`（パイプ）は「または」の意味。
こう書くと、`"cut"` / `"fade"` / `"crossfade"` 以外の文字列を入れると
TypeScript がエラーにしてくれる。タイプミスを防げる。

## ドメインは React に依存させない

`CLAUDE.md` のルールで、ドメイン型は **React を import してはいけない**。

理由:

* データの形は、UIライブラリ（React）とは独立しているべき
* そうしておくと、後で UI を変えても、データの形は影響を受けない
* JSON として保存・読み込みするときも、純粋なデータの方が扱いやすい

だから `types.ts` の中には `import React ...` のような行は1つも無い。

## `import type` を使った理由

`mockProject.ts` では、型を読み込むのにこう書いた。

```ts
import type { Project } from "./types";
```

ふつうの `import` ではなく `import type` にした理由:

* `Project` は「型チェックのため」だけに使う
* 実行時（ブラウザで動くとき）には不要
* `import type` と書くと「これは型専用」とはっきりさせられる

## モックデータ（mock data）とは

「モック」= 本物の代わりに使う**仮のデータ**。

まだ本物の音楽ファイルもデータベースも無いので、
手書きのサンプル（曲2つ・ノード2つ・線1本）を用意した。
これで、次のフェーズで「画面に出す」作業を、本物のデータ無しで始められる。

### ID の付け方の使い分け

```txt
モックデータ   → "track-001" のような読みやすい文字列
実行時に作る   → crypto.randomUUID() （ランダムな一意ID）
```

モックは人間が読んで分かりやすい方がいいので手書きの文字列。
実際にユーザーが操作して作るノードは、かぶらないように自動生成のIDを使う（これは後のフェーズで使う）。

## 検証（verification）

Phase 0 と同じく、ビルドと lint で確認した。

```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && nvm use 22
npm run build   # 型チェック + 本番ビルドが通るか
npm run lint    # コードのスタイル・問題チェック
```

結果:

* build 成功（16 modules, 0 errors）
* lint 成功（warning も error も無し）
* `git status` … 追加されたのは `src/domain/` の新規ファイルだけ
* 既存ファイルは変更していない

注意点:

`mockProject` はまだどこからも import されていない（export しただけ）。
それでも lint は通った。export された module レベルの値は「未使用」とは扱われないため。
次のフェーズで Track Library / Canvas が import して使う。

## What I Should Remember

* ドメイン = アプリが扱う本質的なデータの形
* `Track`（曲データ）と `TrackNode`（配置）は分ける → 同じ曲を複数置けるようにするため
* `?` = optional（任意）、`|` = union（決まった選択肢）
* ドメイン型は React に依存させない（純粋なデータに保つ）
* 型だけ欲しいときは `import type`
* モックは読みやすいID、実行時生成は `crypto.randomUUID()`
* 画面に出す前に「データの形」を先に固めると、後がラクになる

## Phase 1 Result

アプリのデータ層（domain types + mock data）が完成した。

まだ何も表示しないし、音も鳴らない。
but, これで「データの形」という土台ができた。

次のステップ:

```txt
Phase 2: モックデータから Track Library と Canvas を静的に表示する
```
