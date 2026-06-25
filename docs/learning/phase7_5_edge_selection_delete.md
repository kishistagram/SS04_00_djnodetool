# Phase 7.5 Learning Log: Edge selection and delete（エッジの選択と削除）

## Goal

Phase 7.5 の目的は、**エッジ（線）をクリックして選び、選んだエッジを削除できるようにする**こと。

Phase 4.5 で「ノードの削除」をやったのと同じノリを、今度はエッジでやる。

```txt
Phase 7   = エッジを作る
Phase 7.5 = エッジを選ぶ＋消す ← ここ
```

## 今回一番ハマりやすいところ: SVG の細い線はクリックしにくい

問題が2つあった。

1. `.edge-layer`（SVG全体）に `pointer-events: none` がついていた
   → これがないと、背面の SVG がノードのクリックを妨げてしまうので、外せない。
2. 見えている線は太さ 2px しかなく、クリックしづらい。

解決：**透明で太い「当たり判定用の線」を上に重ねる**。

```tsx
<g>
  {/* 当たり判定: 透明・太い・click を受ける */}
  <line className="edge-hit" ... onClick={...} />
  {/* 見た目: 細い・click は受けない */}
  <line className={isSelected ? "edge-line selected" : "edge-line"} ... />
</g>
```

CSS：

```css
.edge-layer { pointer-events: none; }          /* SVG全体はクリックを通す */
.edge-line  { pointer-events: none; }          /* 見た目の線はクリックを受けない */
.edge-hit {
  stroke: transparent;     /* 透明（見えない） */
  stroke-width: 12;        /* 太い（押しやすい） */
  pointer-events: stroke;  /* 「線の上」だけクリックを受ける */
}
```

### `pointer-events: stroke` とは

SVG 専用の値。「描かれた線（stroke）の部分だけ」クリックを受ける。
線の四角い範囲（bounding box）全体ではないので、斜めの線でも
周りの余白を誤クリックしにくい。

## 大事な考え方: 選択は「排他的」に保つ

ノードとエッジの両方が同時に選ばれている状態を作らない。
それを小さな関数に閉じ込める。

```ts
function selectNode(id) { setSelectedEdgeId(null); setSelectedNodeId(id); }
function selectEdge(id) { setSelectedNodeId(null); setSelectedEdgeId(id); }
```

「片方を選ぶときは、必ずもう片方を null にする」。
この不変条件（invariant）を 2 つの関数だけで守る。

別案として `selection: {type, id} | null` という 1 つの state にまとめる方法もあるが、
Phase 3〜7 で使っている `selectedNodeId` を全部書き換える必要が出るので、
今回は見送った（スコープを小さく保つ）。

## stopPropagation を忘れない（再登場）

エッジの click が背景（`<main>`）に伝わると、
選択した瞬間に背景クリックが走って deselect されてしまう。

```ts
onClick={(event) => {
  event.stopPropagation();  // ← これがないと選んだ瞬間に解除される
  onSelect();
}}
```

Phase 7 のノードと同じパターン。「要素のクリック」と「背景のクリック」を分ける。

## 接続モード中のエッジクリックは「何もしない」

Phase 7 の接続フローを壊さないため、接続中はエッジ選択を無視する。

```ts
function handleEdgeClick(edgeId) {
  if (connectionSourceId) return;  // 接続中は何もしない
  selectEdge(edgeId);
}
```

ただし `stopPropagation` は残すので、背景キャンセルも誤発火しない。

## import 成功時は選択状態を全部クリア

読み込んだ project は id が違うので、古い選択は迷子になる。
3 つとも null にして、古い project を指さないようにする。

```ts
setSelectedNodeId(null);
setSelectedEdgeId(null);
setConnectionSourceId(null);
```

## 削除は filter で 1 つだけ除く

```ts
function handleDeleteEdge(edgeId) {
  setProject((current) => ({
    ...current,
    edges: current.edges.filter((edge) => edge.id !== edgeId),
  }));
  setSelectedEdgeId(null);
}
```

ノード削除（Phase 4.5）と同じ `filter` パターン。エッジは他に影響しないので、
ノード削除のように「つながるものも一緒に消す」必要はない。

## まとめ

* SVG の細い線は、透明で太い `.edge-hit` を重ねてクリックしやすくする
* `.edge-layer` は `pointer-events: none` のまま、hit 線だけ `pointer-events: stroke`
* ノード選択とエッジ選択は `selectNode`/`selectEdge` で排他的に保つ
* `stopPropagation` で背景クリックとの衝突を防ぐ
* 接続中のエッジクリックは no-op、import 成功時は選択 state を全部クリア
