# Phase 7 Learning Log: Edge creation（エッジ作成）

## Goal

Phase 7 の目的は、**2つのノードを線（エッジ）でつなげるようにする**こと。

つなぎ方は「2段階クリック」。

```txt
1. ノードを選ぶ（ソース）
2. Inspector の「Start Connection」を押す → 接続モードに入る
3. 別のノードをクリック（ターゲット）→ ソース→ターゲットのエッジができる
```

空白をクリック、またはソースをもう一度クリックするとキャンセル。

## 大事な考え方その1: 「モード」を state ひとつで表す

接続中かどうかを、`connectionSourceId` という変数ひとつで表す。

```ts
const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);
```

* `null`     … 通常モード（選択やドラッグができる）
* `"あるid"` … 接続モード（その id がソースノード）

「接続中か？」と「どのノードから？」を**1つの値で同時に**表しているのがポイント。
boolean と id を別々に持つと、ていしてズレる（矛盾する）バグのもとになる。

## 大事な考え方その2: クリックの意味をモードで分ける

同じ「ノードをクリック」でも、モードによって意味が変わる。

```ts
function handleNodeClick(nodeId) {
  if (connectionSourceId) {           // 接続モードなら
    if (nodeId !== connectionSourceId) {
      // 別のノード → エッジを作る
    }
    setConnectionSourceId(null);      // モードを抜ける（選択はそのまま）
    return;
  }
  setSelectedNodeId(nodeId);          // 通常モードならただ選択
}
```

背景クリックも同じ考え方。接続中ならキャンセル、そうでなければ選択解除。

## 今回一番ハマりやすいところ: ドラッグとクリックの衝突

ノードは mousedown でドラッグを始めていた（Phase 5）。
でも接続モードでは、ターゲットを「クリック」したい。
ドラッグとクリックは**どちらも mousedown から始まる**ので、ぜんぶ反応させるとかぶる。

解決：**接続モード中はドラッグを完全に止める**。

```ts
function handleMouseDown(event) {
  if (event.button !== 0) return;
  event.stopPropagation();
  if (isConnecting) return;   // ← 接続中はここで打ち切り、ドラッグを始めない
  onSelect();
  // 以下、ドラッグ処理…
}
```

ドラッグを始めなければ、そのあとに来る click がそのまま「接続完了」になる。

## stopPropagation を忘れない

ノードをクリックしたとき、その click が親（キャンバス背景）に**伝わってしまう**と、
接続完了の直後に背景クリックが走ってキャンセルされてしまう。

```ts
onClick={(event) => {
  event.stopPropagation();  // ← これがないと背景に伝わり、せっかく作った接続が消える
  ...
  onClickNode();
}}
```

「ノードのクリック」と「背景のクリック」をはっきり分けるための定番。

## エッジのデフォルト値

作るエッジは、ドキュメントで決めた既定値を使う。

```ts
const newEdge: TransitionEdge = {
  id: crypto.randomUUID(),
  fromNodeId: connectionSourceId,
  toNodeId: nodeId,
  transitionType: "crossfade",
  fadeDurationSec: 3,
};
```

`note` は付けない（undefined）。エッジの中身をあとで編集する機能は次フェーズ以降。

## なぜエッジを足すだけで線が出るのか

`EdgeView` は以前から、ノードの x/y から線の位置を計算している。
だから `project.edges` に1つ足すだけで、`EdgeView` をいじらずに線が描かれる。
追加（`[...edges, newEdge]`）のイミュータブル更新は Phase 4 と同じパターン。

## まとめ

* 接続中かどうかは `connectionSourceId`（null / id）ひとつで表す
* 同じクリックでも、モードで「選択」か「接続完了」かを分岐させる
* 接続中はドラッグを完全に止めて、click を接続完了に使う
* `stopPropagation` で背景クリックとの衝突を防ぐ
* エッジを足すだけで EdgeView が自動で線を描く
