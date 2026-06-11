# Phase 3 Learning Log: Node Selection + Inspector Panel

## Goal

Phase 3 の目的は、キャンバスを**初めて「操作できる」ようにする**こと。

ノードをクリックしたら選択状態になり、見た目が変わり、
Inspector Panel にそのノードの情報が出る。空白をクリックしたら選択解除。

```txt
Phase 2 = 静的表示（見るだけ、クリックしても何も起きない）
Phase 3 = ノード選択（初めての useState、クリックで状態が変わる） ← ここ
Phase 4 以降 = Add to Canvas / エッジ作成 / ドラッグなど
```

## 今回の一番大事な概念: state（状態）

Phase 2 までは、データは props で「上から下へ流れる」だけだった。
画面は一度表示したら変わらない。

でも今回は「どのノードが選ばれているか」を**覚えておく**必要がある。
クリックするたびに変わる。こういう「時間とともに変わる値」を React では **state** と呼ぶ。

```ts
import { useState } from "react";

const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
```

読み方:

* `useState(null)` … 初期値は null（最初は何も選ばれていない）
* `selectedNodeId` … 今の値（読む用）
* `setSelectedNodeId` … 値を更新する関数（書く用）
* `<string | null>` … 型。「文字列または null」

`setSelectedNodeId("node-001")` を呼ぶと、React が自動で画面を再描画してくれる。
これが React の一番の便利なところ：**state が変わる → 画面が自動で追従する**。

## state は「共通の親」に置く

選択状態は `App.tsx` に置いた。なぜか？

```txt
App（selectedNodeId を持つ）
 ├─ NodeCanvas    … クリックで選択を「変える」
 └─ InspectorPanel … 選択を「読む」
```

NodeCanvas（変える側）と InspectorPanel（読む側）の**両方が見える場所**に
置く必要がある。それが共通の親である `App`。
これを React では「lifting state up（状態の持ち上げ）」と呼ぶ。

App からは props で渡す：

* NodeCanvas へ → `selectedNodeId`, `onSelectNode`, `onDeselect`
* InspectorPanel へ → `selectedNodeId`

## コールバック（onSelectNode など）= 子から親に「知らせる」

データは props で下へ流れるけど、「クリックされた！」という出来事は
子（NodeCanvas）から親（App）に伝えたい。
そのために「関数を props として下に渡す」。これをコールバックと呼ぶ。

```tsx
// App側: 関数を渡す
<NodeCanvas onSelectNode={setSelectedNodeId} ... />

// NodeCanvas側: クリックされたらそれを呼ぶ
onClick={() => onSelectNode(node.id)}
```

つまり、データは下へ、出来事（イベント）は上へ、という流れ。

## stopPropagation（イベントの伝播を止める）

今回の重要なハマリポイント。

キャンバスの背景には「クリックされたら選択解除」の処理がある。
でもノードはキャンバスの**上に**あるので、ノードをクリックすると
クリックが背景にも「伝わって（bubble）」しまい、せっかく選んだのに
すぐ解除されてしまう。

それを防ぐのが `stopPropagation()`：

```tsx
onClick={(event) => {
  event.stopPropagation();  // 背景に伝わらないように止める
  onSelect();
}}
```

* ノードをクリック → 選択（背景には伝わらない）
* 空白をクリック → 解除

これで「選択」と「解除」がちゃんと使い分けられる。

## id だけを state に持つ（ノード本体を持たない）

state には `selectedNodeId`（文字列）だけを持ち、ノード本体は持たない。
表示するときは id から find で探す。

```ts
const node = nodes.find((n) => n.id === selectedNodeId);
```

理由: id が「唯一の正しい出所」。
ノード本体を state にコピーして持つと、もとのデータとずれる危険がある
（特に後のフェーズでノードを編集できるようになると）。

## 検証（verification）

```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && nvm use 22
npm run build   # 型チェック + ビルド
npm run lint    # スタイルチェック
npm run dev     # ブラウザで「クリックして動くか」を確認
```

結果:

* build 成功（23 modules, 0 errors）
* lint 成功
* dev で確認:
  - ノードをクリック → 紫の枠でハイライト + Inspector に情報表示
  - 空白をクリック → 選択解除、Inspector は「Select a node」
  - 別のノードをクリック → 選択が切り替わる

Phase 3 からは、見た目だけでなく**「クリックして振る舞いを確認」**するのが重要になった。

## What I Should Remember

* state = 時間とともに変わる値。`useState` で作る
* `const [値, set値] = useState(初期値)`
* state が変わる → React が自動で画面を再描画
* state は「それを使うコンポーネントたちの共通の親」に置く（lifting state up）
* データは props で下へ、イベントはコールバックで上へ
* 重なった要素のクリックは `stopPropagation()` で伝播を止める
* state には id だけ持ち、本体は find で探す

## Phase 3 Result

初めてキャンバスが「反応」した！

ノードをクリックすると選ばれ、Inspector に情報が出る。
ただしまだ表示は read-onlyで、ノードを追加・移動・編集はできない。

次のステップ：

```txt
Phase 4: Add to Canvas ボタン（実行時にノードを追加。nodes を state 化する）
```
