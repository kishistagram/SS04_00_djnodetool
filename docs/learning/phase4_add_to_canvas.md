# Phase 4 Learning Log: Add to Canvas（トラックからノードを作る）

## Goal

Phase 4 の目的は、**データを実行中に増やせるようにする**こと。

Track Library の各トラックに「Add to Canvas」ボタンを付けて、
押すとそのトラックから新しいノードが作られ、キャンバスに表示される。

```txt
Phase 2 = 静的表示（mockProject を見るだけ）
Phase 3 = ノード選択（初めての useState、選択状態を覚える）
Phase 4 = Add to Canvas（project 自体を state にして、ノードを増やす） ← ここ
Phase 4.5 = Delete selected node（選択中ノードを削除）
Phase 4 以降 = ドラッグ移動 / エッジ作成 / 保存・読込 など
```

## 今回の一番大事な概念: 「データそのもの」を state にする

Phase 3 では `selectedNodeId`（どれを選んでいるか）だけを state にした。
プロジェクトのデータ（`mockProject`）は固定のまま、ただ参照していた。

```ts
// Phase 3 まで：固定の参照（変わらない）
const project = mockProject;
```

でも「ノードを増やす」には、`project.nodes` が**変わらないといけない**。
だから今回はプロジェクト全体を state にする。

```ts
// Phase 4：project を state にする（変えられる）
const [project, setProject] = useState<Project>(mockProject);
```

`mockProject` は「最初の値（種）」として使うだけ。
一度 state に入れたら、その後は `setProject` で更新していく。

## state は「書き換えない」（イミュータブル更新）

React の state は、中身を直接いじってはいけない。
配列に `push` するのも NG。

```ts
// ❌ ダメ：元の配列を直接変更している
project.nodes.push(newNode);

// ⭕ OK：新しい配列・新しいオブジェクトを作る
setProject((current) => ({
  ...current,                       // 既存の project をコピー
  nodes: [...current.nodes, newNode], // 既存ノード + 新ノードの新しい配列
}));
```

ポイント:

* `...current` … 既存の project の中身を全部コピー（スプレッド構文）
* `nodes: [...]` … nodes だけ新しい配列に差し替える
* 「元を変えず、新しいものを作って渡す」ので React が変化に気づける

`setProject((current) => ...)` のように**関数を渡す**のは、
「今の最新の値をもとに次の値を作る」ための安全な書き方。

## 新しいノードを作る

```ts
const newNode: TrackNodeData = {
  id: crypto.randomUUID(),       // 実行中に作る id は UUID
  trackId: track.id,             // どのトラックから作ったか
  x: 200 + offset,               // 簡単な固定オフセットで配置
  y: 200 + offset,
  label: track.title,            // 表示名はトラック名
  color: "#64748B",              // トラックは色を持たないのでデフォルト色
};
```

* `crypto.randomUUID()` … ブラウザ標準で「世界で一意の id」を作る関数。
  mock データは `"node-001"` のような手書き id だが、実行中に作るものは
  カウンタを管理しなくていい UUID を使う。
* `offset = nodes.length * 30` … ノードが増えるたびに少しずらして、
  完全に重ならないようにするだけの簡単な工夫。本格的な自動レイアウトはやらない。

## 型名とコンポーネント名の衝突を避ける（alias）

このプロジェクトには `TrackNode` が2つある:

* 型の `TrackNode`（`domain/types.ts`）
* コンポーネントの `TrackNode`（`components/TrackNode.tsx`）

App.tsx で両方使うと名前がぶつかるので、型のほうに別名を付ける。

```ts
import type { TrackNode as TrackNodeData } from "./domain/types";
```

これで「型は `TrackNodeData`」「コンポーネントは `TrackNode`」と区別できる。

## 子から親へ「作って」と頼む（コールバック）

ノードを作るのは App の仕事（project を持っているのが App だから）。
TrackLibrary は「このトラックを追加して」と頼むだけ。

```ts
// App 側：実際に作る関数を渡す
<TrackLibrary tracks={project.tracks} onAddToCanvas={handleAddToCanvas} />

// TrackLibrary 側：ボタンで親に知らせるだけ
<button onClick={() => onAddToCanvas(track.id)}>Add to Canvas</button>
```

Phase 3 の `onSelectNode` と同じ考え方。
**子はイベントを伝えるだけ、状態を変えるのは親。**

## 検証（verification）

```
npm run build   # 型チェック + ビルド
npm run lint    # コードスタイル確認
npm run dev     # ブラウザで手動確認
```

ブラウザで確認したこと:

* 各トラックに「Add to Canvas」ボタンが出る
* 押すとノードがキャンバスに増える
* 増えたノードが自動で選択され、Inspector に情報が出る
* 同じトラックを何度も追加でき、少しずつずれて並ぶ

## What I Should Remember

* 「変わるデータ」は state にする。今回は selection だけでなく project 全体。
* state は直接書き換えない。コピーして新しいものを渡す（イミュータブル更新）。
* `...spread` で既存をコピーし、変えたい部分だけ差し替える。
* 実行中に作るエンティティの id は `crypto.randomUUID()`。
* 型とコンポーネントの名前がぶつかったら `import type { X as XData }` で逃がす。

## Phase 4 Result

Add to Canvas を実装。project を useState 化し、ボタンでノードを追加して
自動選択するところまで完成。ノードの削除は Phase 4.5 で別途実装する。
