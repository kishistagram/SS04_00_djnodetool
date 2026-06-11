# Phase 5 Learning Log: Drag nodes（ノードをドラッグして移動）

## Goal

Phase 5 の目的は、**ノードをドラッグして動かせるようにする**こと。

動かしたら、その位置（x/y）を project の state に書き戻す。
つながっている edge（線）も、新しい位置に自動で追従する。

```txt
Phase 4   = Add to Canvas（ノードを増やす：配列に足す）
Phase 4.5 = Delete node（ノードを消す：配列から除く）
Phase 5   = Drag nodes（ノードを動かす：配列の1つを書き換える） ← ここ
Phase 9 以降 = エッジ作成 / 保存・読込 / 音声 など
```

Phase 4・4.5 で「追加」「削除」をやったので、今回は「更新」。
配列操作の3点セットがそろう。

## 今回の一番大事な概念: map で「1つだけ更新する」

追加は `[...arr, x]`、削除は `arr.filter(...)`。
更新は **`arr.map(...)`** を使う。

```ts
function handleMoveNode(nodeId: string, x: number, y: number) {
  setProject((current) => ({
    ...current,
    nodes: current.nodes.map((node) =>
      node.id === nodeId ? { ...node, x, y } : node,
    ),
  }));
}
```

読み方:

* `map` … 配列の各要素を変換して、**新しい配列**を作る
* `node.id === nodeId ? ... : node` … 動かす対象だけ作り替え、それ以外はそのまま
* `{ ...node, x, y }` … 元の node をコピーして x と y だけ新しい値に差し替え

ここでも「元を書き換えず、新しいものを作る」イミュータブル更新は同じ。

## ドラッグの仕組み: mousedown → mousemove → mouseup

ライブラリは使わず、ブラウザ標準のマウスイベントだけで作る。

```txt
mousedown（押した） … ドラッグ開始。選択もここでやる。
mousemove（動かした）… 指の位置に合わせて x/y を更新（何度も呼ばれる）
mouseup（離した）   … ドラッグ終了。リスナーを片付ける。
```

ポイント:「mousemove と mouseup は `window` に登録する」

```ts
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mouseup", handleMouseUp);
```

ノード自身ではなく window に付ける理由は、**速く動かしてカーソルがノードから
外れても、動きを追い続けられる**から。終わったら必ず外す（後始末）。

## 座標の変換: 画面座標 → キャンバス座標

マウスイベントの `clientX / clientY` は「ブラウザ画面の左上」が基準。
でもノードの x/y は「キャンバスの左上」が基準。だから変換が必要。

```ts
const canvasRect = canvas.getBoundingClientRect(); // キャンバスの画面上の位置
const x = moveEvent.clientX - canvasRect.left - offsetX;
const y = moveEvent.clientY - canvasRect.top  - offsetY;
```

* `canvasRect.left/top` を引く … 画面基準 → キャンバス基準へ
* `offsetX/offsetY` を引く … 「ノードのどこをつかんだか」のズレを補正

offset を入れないと、つかんだ瞬間にノードがカーソルの位置へ
ピョンと飛んでしまう。掴んだ場所を保つために、最初のズレを覚えておく。

```ts
// mousedown のとき：カーソルとノード左上の差を記録
const offsetX = event.clientX - (canvasRect.left + node.x);
const offsetY = event.clientY - (canvasRect.top + node.y);
```

## canvas の ref は NodeCanvas が持つ（DOM を直接探さない）

座標変換に canvas の位置（`getBoundingClientRect()`）が要る。
このとき TrackNode が `document.querySelector('.node-canvas')` のように
DOM を自分で探すのは避けたい（壊れやすく、構造に依存してしまう）。

そこで **NodeCanvas が `useRef` で canvas 要素を持ち**、それを props で渡す。

```tsx
// NodeCanvas 側
const canvasRef = useRef<HTMLElement>(null);
<main ref={canvasRef} ...>
  <TrackNode canvasRef={canvasRef} ... />

// TrackNode 側
const canvas = canvasRef.current;       // 渡された ref から読むだけ
const canvasRect = canvas.getBoundingClientRect();
```

`useRef` は「再描画をまたいで覚えておく入れ物」。DOM 要素を指すのに使う。
`ref.current` で中身（実際の要素）にアクセスする。

## ドラッグと「クリック選択」をどう両立させるか

問題: ドラッグして指を離すと、ブラウザは最後に `click` も発火させる。
そのままだと「ドラッグ」が「クリック選択」も巻き込んでしまう。

対策:

1. **選択は mousedown でやる**（押した瞬間に選択）。
2. 実際に動いたら `didDrag` という旗（ref）を立てる。
3. 後から来る `click` は、`didDrag` が立っていたら無視する。

```ts
const didDragRef = useRef(false);
// mousemove で didDragRef.current = true
// click のとき：
if (didDragRef.current) { didDragRef.current = false; return; } // ドラッグ後は無視
onSelect(); // 動いていない普通のクリックなら選択
```

これで「ドラッグ＝動かす（選択は最初に済み）」「ただのクリック＝選択」を
きれいに分けられる。

## edge は何もしなくても追従する

線を描く `EdgeView` は、**node の x/y からノード中心を計算して**線を引いている。
だから node の x/y を更新するだけで、線も自動で新しい位置に再描画される。
今回 `EdgeView.tsx` は一切変更していない。これは設計がきれいだった証拠。

## 検証（verification）

```
npm run build   # 型チェック + ビルド
npm run lint    # コードスタイル確認
npm run dev     # ブラウザで手動確認
```

ブラウザで確認したこと:

* Night Drive をドラッグすると動き、Inspector の Position もリアルタイム更新
* つながっている edge も新しい位置に追従
* ドラッグ中・後もノードの選択は維持される
* 動かさず普通にクリックしたときは、ちゃんと別ノードを選択できる

## What I Should Remember

* 配列の更新は `map`。追加 `[...]`・削除 `filter`・更新 `map` の3点セット。
* ドラッグは mousedown→mousemove→mouseup。move/up は window に付けて、最後に外す。
* 画面座標とキャンバス座標は別物。`getBoundingClientRect()` で変換する。
* 掴んだ位置のズレ（offset）を覚えておかないと、ノードが飛ぶ。
* DOM 要素は ref（NodeCanvas が所有）で渡す。子が querySelector で探さない。
* ドラッグ直後の click は無視する旗を立てて、選択と分ける。

## Phase 5 Result

ノードのドラッグ移動を実装。mousedown で選択＋ドラッグ開始、mousemove で
project の x/y を更新、edge も自動追従。クランプ（範囲制限）は入れていない。
