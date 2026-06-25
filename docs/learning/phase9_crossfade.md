# Phase 9 Learning Log: Crossfade（トランジション再生）

## Goal

Phase 9 の目的は、**エッジでつないだ 2 つのノード間を、遷移（transition）しながら再生する**こと。
これで MVP の 13 ステップが完了。

```txt
Phase 8  = 1 つのノードを鳴らす
Phase 9  = 2 つのノードをつないで遷移する ← ここ（MVP 最終）
```

## 3 つの遷移タイプ（transitionType）

```txt
cut       : source を止めて target を即再生
fade      : source をフェードアウト → その後 target を再生
crossfade : source と target を同時に鳴らし、source 1→0 / target 0→1
```

どれも `fadeDurationSec`（フェードの長さ）を使う。

## 今回一番大事な考え方: gain（音量）を時間で ramp する

Web Audio の `GainNode` は、音量を0～1で変えられる。
「何秒かけて 0 から 1 にする」という時間変化が ramp。

```ts
gain.gain.setValueAtTime(0, now);                       // 今 0
gain.gain.linearRampToValueAtTime(0.2, now + fade);     // fade 秒で 0.2 まで上げる
```

crossfade はこれを 2 つ同時にやるだけ：

```txt
source: 0.2 → 0   （fade 秒かけて下げる）
target: 0   → 0.2 （fade 秒かけて上げる）
```

両方を `now` から同時に始めれば、片方が小さくなりながらもう片方が大きくなる。

## 大事な考え方: voice を 1 つから「配列」に

Phase 8 は「同時に鳴るのは 1 つ」だったので `currentVoice: Voice | null`。
でも crossfade は source と target が**同時に鳴る**ので、配列に変えた。

```ts
private activeVoices: Voice[] = [];   // 今鳴っている声を全部保持
```

* `playNode` / `cut` … voice 1 つ
* `fade` / `crossfade` … voice 2 つ
* `stop()` … **配列の全部**を止めて disconnect → 配列を空に

これで「crossfade 中に Stop を押したら両方止まる」が自然に実現される。

## 「新しい再生で前のを止める」

`playNode` も `playTransition` も、最初に必ず `stop()` を呼ぶ。

```ts
playTransition(edge, source, target) {
  const context = this.ensureContext();
  this.stop();          // ← 前の再生・遷移を全部止める
  // … transitionType で分岐…
}
```

## 異常値の防御: fadeDurationSec をサニタイズ

import した project には 0 / 負 / NaN / Infinity など変な値が入っているかもしれない。
そのまま ramp に使うと壊れるので、純関数で丈夫（クランプ）する。

```ts
export function sanitizeFadeDuration(sec) {
  if (!Number.isFinite(sec) || sec <= 0.01) return 0.01;  // 異常は 0.01s に丸める
  if (sec > 60) return 60;
  return sec;
}
```

方針：異常値は**3s などに戸さず、ほぼ即時（0.01s）に丸める**。
勝手に 3s にすると「なぜ長い？」とデバッグが迷うので、データがおかしいとすぐ分かる方がよい。

Web Audio 本体はテストしにくいが、この純関数は Phase 6/8 と同じく Vitest でテストした。

## UI は選択状態で表示を切り替える

PlayerControls は 3 状態：

```txt
node 選択   : Play / Stop
edge 選択   : Play transition / Stop
何もなし   : Play 系 disabled（Stop は常に有効）
```

Stop を常に有効にする理由：「選択状態」と「再生状態」は別。
何も選んでいなくても、鳴っている音は止められるべき。

UI は依然として `onPlayNode` / `onPlayTransition` / `onStop` を呼ぶだけ。
oscillator / gain / AudioContext は一切知らない（Phase 8 の方針継続）。

## 今回の遷移は「プレビュー」

重要: 今回の transition は「今再生中の曲から遷移する」本格 DJ 動作ではなく、
**source node → target node の遷移プレビュー**。
将来 mp3 / Suno 音源を入れたときに、実際の track 再生へ拡張する（decision log に記録）。

## まとめ

* 遷移 = GainNode の ramp。crossfade は 2 つの gain を逆方向に ramp
* voice を `activeVoices` 配列にして、同時複数の音を管理 & 一括 cleanup
* 新しい再生は必ず `stop()` から → 前の遷移を止める
* 異常な `fadeDurationSec` は 0.01s に丸める（純関数 + テスト）
* UI は選択状態で表示を切り替え、Stop は常に有効
* 今回は遷移プレビュー、将来 mp3 で実トラック再生に拡張
