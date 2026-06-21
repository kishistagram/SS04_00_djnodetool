# Phase 6 Learning Log: JSON save/load（プロジェクトの保存と読み込み）

## Goal

Phase 6 の目的は、**いまのプロジェクトを JSON ファイルに保存（Export）し、
あとで読み込んで（Import）復元できるようにする**こと。

バックエンドもデータベースも使わない。ブラウザだけで完結する。

```txt
Phase 4   = Add to Canvas（追加）
Phase 4.5 = Delete node（削除）
Phase 5   = Drag nodes（更新）
Phase 6   = JSON save/load（保存・読込） ← ここ
Phase 9 以降 = エッジ作成 / 音声 など
```

ここまでで「いじれる」ようになった project を、**外に出して持ち帰る**フェーズ。

## 大事な考え方その1: state を「外に出す」のが保存

このアプリの真実（source of truth）は `App` が持っている `project` という
state ひとつ。保存とは、その JavaScript オブジェクトを
**文字列（JSON）に変換してファイルにする**だけ。

```ts
JSON.stringify(project, null, 2)
```

* `null` … 変換のカスタマイズなし（普通に全部出す）
* `2`    … インデント2スペースで、人が読める形にする

読み込みは逆向き。文字列を `JSON.parse` でオブジェクトに戻し、
`setProject(...)` で state を丸ごと差し替える。

```txt
保存:  project（オブジェクト） → JSON.stringify → 文字列 → ファイル
読込:  ファイル → 文字列 → JSON.parse → オブジェクト → setProject
```

## 大事な考え方その2: 「純粋な関数」と「DOMをさわる関数」を分ける

`src/storage/projectStorage.ts` には3つの関数がある。

```ts
serializeProject(project)  // オブジェクト → 文字列（純粋）
parseProject(text)         // 文字列 → オブジェクト＋検証（純粋）
downloadProject(project)   // ブラウザにダウンロードさせる（DOMをさわる）
```

* **純粋な関数** … 入力が同じなら出力も必ず同じ。画面もファイルもさわらない。
  → だから **テストが書きやすい**。
* **DOMをさわる関数** … `document.createElement("a")` など、ブラウザが必要。
  → テストしにくいので、純粋な部分と**分けておく**。

この「副作用を端に追いやる」設計が、テストしやすいコードの基本。

## 大事な考え方その3: 壊れた入力は throw して state を守る

ユーザーが変なファイルを読ませるかもしれない。だから読む前に検証する。

```ts
if (typeof obj.id !== "string") throw new Error(...);
if (!Array.isArray(obj.tracks)) throw new Error(...);
// id, title, tracks, nodes, edges の最低限だけチェック
```

おかしければ `throw`。呼び出し側（App）は `try/catch` で受け止めて、
**今の project はそのまま**にし、`alert` でエラーを出すだけ。

```ts
try {
  const loaded = parseProject(text);
  setProject(loaded);
  setSelectedNodeId(null);   // 選択は古くなるのでリセット
} catch (error) {
  window.alert(`Import failed: ${error.message}`);
}
```

ポイント: **読み込みが成功したときだけ** state を書き換える。
失敗しても画面が壊れない、という安心感を作る。

## なぜ selectedNodeId を null に戻すのか

読み込んだ project は、ノードの id が今までと違う。
古い `selectedNodeId` はもう存在しないノードを指しているかもしれない（迷子）。
だから読み込み直後に `null` にして、選択をいったん解除する。

## 今回はじめて出てきたもの: テスト（Vitest）

このプロジェクト初のテストを入れた。テスト対象は純粋な関数だけ。

```ts
it("round-trips a serialized project", () => {
  const json = serializeProject(sampleProject);
  expect(parseProject(json)).toEqual(sampleProject);  // 行って戻って同じ
});

it("throws on invalid JSON", () => {
  expect(() => parseProject("{ not json")).toThrow();  // 壊れたら throw
});
```

* `expect(...).toEqual(...)` … 中身が同じか比べる
* `expect(() => ...).toThrow()` … その関数を呼ぶと例外が出るか確認
* `round-trip`（往復）テスト … 保存→読込で**元に戻る**ことを保証する定番

実行は `npm run test`（中身は `vitest run`：一度走って終わる）。

## UIメモ: 隠しファイル入力

読み込みボタンは、見た目はただのボタンだが、中身は隠した
`<input type="file">` をクリックさせている。

```tsx
<button onClick={() => fileInputRef.current?.click()}>Import JSON</button>
<input ref={fileInputRef} type="file" accept=".json" style={{display:"none"}} />
```

ブラウザ標準のファイル選択ダイアログを、好きな見た目のボタンで開くための定番テク。

## まとめ

* 保存 = state を `JSON.stringify` で文字列にしてダウンロード
* 読込 = ファイルを読んで `JSON.parse` → 検証 → `setProject`
* 純粋な関数（変換・検証）と DOM をさわる関数（ダウンロード）を分ける
* 壊れた入力は `throw`、成功したときだけ state を書き換える
* 純粋な関数は Vitest で往復テストできる
