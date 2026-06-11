# Phase 4.5 Learning Log: Delete selected node（選択中ノードを削除）

## Goal

Phase 4.5 の目的は、**ノードを削除できるようにする**こと。

Phase 4 で「追加」はできたが、消す手段がなかった。
今回は Inspector Panel に「Delete node」ボタンを付けて、
選択中のノードを削除できるようにする。

```txt
Phase 4   = Add to Canvas（ノードを増やす）
Phase 4.5 = Delete selected node（選択中ノードを消す） ← ここ
Phase 5 以降 = ドラッグ移動 / エッジ作成 など
```

Phase 4 と機能は対になっているが、履歴を分けたいので別フェーズ・別 PR にした。

## 今回の一番大事な概念: filter で「消す」

Phase 4 では「追加」を `[...current.nodes, newNode]`（スプレッドで足す）で書いた。
削除はその逆で、`filter` を使って「残すものだけの新しい配列」を作る。

```ts
setProject((current) => ({
  ...current,
  nodes: current.nodes.filter((node) => node.id !== nodeId),
}));
```

* `filter` は条件が `true` の要素だけを集めた**新しい配列**を返す
* `node.id !== nodeId` … 「消したい id 以外は残す」
* 元の配列は変更しない（Phase 4 と同じイミュータブル更新の考え方）

追加も削除も「元を書き換えず、新しい配列を作って渡す」点は同じ。

## 関連するデータも一緒に消す（孤立エッジを残さない）

ノードを消すとき、そのノードにつながっている **edge（線）** も消す必要がある。
消し忘れると「存在しないノードを指す線」が残ってしまう（= 壊れたデータ）。

```ts
setProject((current) => ({
  ...current,
  nodes: current.nodes.filter((node) => node.id !== nodeId),
  edges: current.edges.filter(
    (edge) => edge.fromNodeId !== nodeId && edge.toNodeId !== nodeId,
  ),
}));
```

* `fromNodeId`（始点）と `toNodeId`（終点）の**どちらも**消すノードでないものだけ残す
* つまり、消すノードに片方でも繋がっている edge は除外される

### ⚠️ フィールド名は推測せず実際の型に合わせる

edge のフィールド名は「たぶん sourceNodeId かな？」と推測してはいけない。
実際に `src/domain/types.ts` の `TransitionEdge` 型を見て確認した:

```ts
export type TransitionEdge = {
  fromNodeId: string;
  toNodeId: string;
  ...
};
```

確認の結果 `fromNodeId` / `toNodeId` だったので、それに合わせた。
**コードを書く前に、関係する型を必ず実物で確認する**のが大事。

## 削除のあとは選択を解除する

消したノードの id を `selectedNodeId` に残したままだと、
「存在しないものを選んでいる」状態になってしまう。

```ts
setSelectedNodeId(null);
```

`null` に戻すと Inspector が「Select a node」プレースホルダーに戻る。
これが正しい「何も選んでいない」状態。

## ボタンは「選択中のときだけ」出す

Delete ボタンは、ノードが選択されているときだけ表示する。
InspectorPanel では、node が見つかったときの JSX の中にボタンを置いた。

```tsx
if (!node) {
  return <p>Select a node</p>;   // 選択なし → ボタンは出ない
}
// node がある場合のみ
return (
  <section>
    ...詳細...
    <button onClick={() => onDeleteNode(node.id)}>Delete node</button>
  </section>
);
```

「選択がないときは消すものがない」ので、ボタンも出さないのが自然。

## 子から親へ「消して」と頼む（コールバック）

Phase 3・4 と同じパターン。状態を持っているのは App なので、
削除を実行するのも App。Inspector は「この id を消して」と頼むだけ。

```ts
// App 側：実際に消す関数を渡す
<InspectorPanel ... onDeleteNode={handleDeleteNode} />

// Inspector 側：ボタンで親に知らせるだけ
<button onClick={() => onDeleteNode(node.id)}>Delete node</button>
```

## 今回やらなかったこと（スコープ外）

* Delete / Backspace キーでの削除
* ゴミ箱へドラッグして削除
* 「本当に削除しますか？」の確認ダイアログ

これらは UX の改善であって、まずは「ボタンで正しく消える」最小実装を優先した。
必要になったら後で足せる。

## 検証（verification）

```
npm run build   # 型チェック + ビルド
npm run lint    # コードスタイル確認
npm run dev     # ブラウザで手動確認
```

ブラウザで確認したこと:

* ノードを選択したときだけ Delete ボタンが出る
* 押すとノードが消え、Inspector が「Select a node」に戻る
* mock データの edge につながっている node-001 を消すと、その edge も消える
  （存在しないノードを指す線が残らない）

## What I Should Remember

* 追加は `[...arr, x]`、削除は `arr.filter(...)`。どちらも新しい配列を作る。
* ノードを消すときは、関連する edge も一緒に消して整合性を保つ。
* フィールド名は推測しない。必ず型定義を実物で確認してから使う。
* 削除後は selection を null に戻す（存在しないものを選んだままにしない）。
* 操作ボタンは「対象があるときだけ」表示すると UI が素直になる。

## Phase 4.5 Result

Inspector Panel に Delete node ボタンを追加。選択中のノードと、それに繋がる
edge をまとめて削除し、選択を解除するところまで完成。
キーボード・ドラッグ削除・確認ダイアログは入れていない。
