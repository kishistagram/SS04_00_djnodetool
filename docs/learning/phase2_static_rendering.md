# Phase 2 Learning Log: Static Rendering (Library + Canvas)

## Goal

Phase 2 の目的は、Phase 1 で作った**データ（mockProject）を初めて画面に出す**こと。

だけど、まだ「見るだけ」。クリックもドラッグも音もなし。
つまり「データ → ピクセル（見た目）」に変換するだけのフェーズ。

```txt
Phase 1 = データの形（見えない）
Phase 2 = そのデータを静的に表示（見える！） ← ここ
Phase 3 以降 = クリック・選択・ドラッグなどの「操作」
```

## React コンポーネントとは

今回初めて React のコンポーネントを複数作った。

コンポーネント = 「画面の一部を返す関数」。
データ（props）を受け取って、HTMLのようなもの（JSX）を返す。

```tsx
function TrackLibrary({ tracks }: TrackLibraryProps) {
  return (
    <aside>...</aside>  // この JSX が画面になる
  );
}
```

今回作った5つのファイルの役割：

```txt
App.tsx          … 一番上。mockProject を持ち、左（Library）と右（Canvas）に渡す
TrackLibrary.tsx … 左パネル。曲の一覧を表示
NodeCanvas.tsx   … 右のキャンバス。ノードとエッジをまとめて表示
TrackNode.tsx    … ノード1つ（カード）
EdgeView.tsx     … エッジ1本（線）
```

「小さく・1つの仕事だけ」に分けるのが CLAUDE.md のルール。
「一覧を出すコンポーネント」と「1つを出すコンポーネント」を分けると読みやすい。

## props（プロップス）= データを上から下に渡す

React では、データは「上のコンポーネント → 下のコンポーネント」へ props で渡す。

```txt
App（mockProject を持つ）
 ├─ TrackLibrary  ← tracks を渡す
 └─ NodeCanvas    ← tracks, nodes, edges を渡す
       ├─ EdgeView   ← from/to のノードを渡す（エッジの数だけ）
       └─ TrackNode  ← node とその track を渡す（ノードの数だけ）
```

今回重要なのは、**useState（状態）を一切使っていない**こと。
データは mockProject から流れてくるだけで、画面は変化しない。
「状態」が必要になるのは「選択」が出てくる Phase 3 から。

## `.map()` でリストを描画する

配列を画面に出すときは `.map()` を使う。

```tsx
{tracks.map((track) => (
  <li key={track.id}>{track.title}</li>
))}
```

* `tracks.map(...)` … 配列の各要素を JSX に変換
* `key={track.id}` … React が「どれがどれ」を区別するための印。重要。

`key` は必ず一意なIDを使う（今回は `track.id` や `node.id`）。
これがないと React が警告を出すし、更新がおかしくなることがある。

## ID で探す（find）

データが「IDでつながっている」ので、表示時に探す必要がある。

```ts
// ノードから、その曲（artist表示用）を探す
const track = tracks.find((t) => t.id === node.trackId);

// エッジから、両端のノードを探す
const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
```

Phase 1 で「Track と TrackNode を分けた」理由が、ここで実際に効いてくる。
ノードは `trackId` しか持たないので、アーティスト名は Track を find して取る。

## 絶対位置（absolute）でノードを置く

ノードは x/y 座標を持っているので、CSS の `position: absolute` でその位置に置く。

```tsx
<div style={{ left: node.x, top: node.y }} />
```

* 親要素（canvas）に `position: relative`
* 子要素（node）に `position: absolute` + `left/top`
* すると、キャンバスの左上を基準に、指定したピクセル位置に置かれる

これが domain doc にあった「x, y はキャンバス左上からのCSSピクセル」の意味。

## エッジは SVG で線を引く

ノード同士をつなぐ線は SVG で描いた。

```tsx
<svg className="edge-layer">
  <line x1={...} y1={...} x2={...} y2={...} markerEnd="url(#arrow)" />
</svg>
```

ポイント：

* 線は、ノードの**中心**から中心へ引く
  （中心 = x + 幅/2, y + 高さ/2）
* そのためノードのサイズを固定（140x60）にした → `canvasLayout.ts` に定数として置き、
  TrackNode（見た目）と EdgeView（線の計算）の両方で使う
* 矢印（向き）は SVG の `marker` で表現
* SVG レイヤーはノードの**背面**に置き、`pointer-events: none` にして
  将来のクリック操作を邪魔しないようにした

## 検証（verification）

```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && nvm use 22
npm run build   # 型チェック + ビルド
npm run lint    # スタイルチェック
npm run dev     # ブラウザで見た目を確認（Phase 2 からはこれが大事！）
```

結果：

* build 成功（22 modules, 0 errors）
* lint 成功
* dev で、左に曲2つ、右にノード2つとエッジが表示された

Phase 0/1 と違うのは、**見た目の確認（npm run dev）が重要になった**こと。
ビルドが通っても、見た目が壊れていることはあるので、画面を見るのが大事。

## What I Should Remember

* コンポーネント = props を受け取って JSX（見た目）を返す関数
* データは上から下へ props で渡す
* リストは `.map()`、そのとき `key` に一意なIDを必ず付ける
* IDでつながったデータは `find` で探す
* x/y のノードは `position: absolute` + `left/top`
* 線や矢印は SVG（`line` と `marker`）
* 静的表示だけなら useState は不要。状態は必要になってから

## Phase 2 Result

初めて画面にデータが表示された！

左に Track Library、右のキャンバスにノードとエッジ。
ただしまだ「見るだけ」で、クリックしても何も起きない。

次のステップ：

```txt
Phase 3: ノードの選択（初めての useState と Inspector Panel）
```
