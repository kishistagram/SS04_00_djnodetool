# Phase 8 Learning Log: Simple audio playback（音を鳴らす）

## Goal

Phase 8 の目的は、**選んだノードの音を鳴らす（そして止める）**こと。

今回は音楽ファイル（mp3）は使わず、**oscillator（発振器）**で「ピー」という音を出す。
目的は「音楽を鳴すこと」より、**Web Audio API の基本構造を導入すること**。

```txt
Phase 12 (step) = シンプルな再生 ← ここ
Phase 13 (step) = crossfade
その後 = Suno mp3 対応（別フェーズ）
```

## Web Audio API の基本: 「部品をつないで出口まで流す」

Web Audio API は、音の部品（ノード）を線でつないで作る。

```txt
OscillatorNode → GainNode → destination（スピーカー）
   音を作る     音量      出口
```

* `AudioContext` … 音の世界全体。これがないと何も鳴らせない。
* `OscillatorNode` … 波（sine/square…）を出す音源。今回の「仮の音」。
* `GainNode`    … 音量（0～1）。フェードやクロスフェードもここでやる（Phase 13）。
* `destination` … 最終出口（スピーカー/イヤホン）。

この `音源 -> gain -> destination` という形は、将来 mp3 にしても**同じ**。
だから今作っておけば、音源だけ差し替えれば済む。

## 大事な考え方その1: UI は oscillator を知らない

UI（PlayerControls）は、音の出し方を一切知らない。
高レベルな「再生」「停止」だけを叩く。

```ts
// UI 側（PlayerControls）
onClick={() => onPlay(selectedNode)}   // 「このノードを再生」と言うだけ
onClick={onStop}                       // 「止めて」と言うだけ
```

oscillator / frequency / waveform は全部 `src/audio/` の中。
UI は `AudioEngine` すら直接見ず、`onPlay`/`onStop` というコールバックだけを受け取る。

## 大事な考え方その2: 差し替え点を 1 か所に集める

将来 mp3 にするとき、あちこち直したくない。
そこで「音源を作る」処理を `createSourceForNode` という 1 つの関数に集めた。

```ts
private createSourceForNode(context, node) {
  // 今：oscillator を返す
  // 将来：node.audioUrl があれば AudioBufferSourceNode を返すに変えるだけ
}
```

wiring（`source -> gain -> destination`）や再生/停止/片付けは音源の種類に依存しない。
だから Suno 対応のときは**この関数だけ**変えればよい（decision log に記録済み）。

## 大事な考え方その3: 2 重の「遅延生成（lazy）」

### (1) AudioEngine 自体を lazy に

```ts
const audioEngineRef = useRef<AudioEngine | null>(null);
function getAudioEngine() {
  if (!audioEngineRef.current) {
    audioEngineRef.current = new AudioEngine();  // 初回だけ作る
  }
  return audioEngineRef.current;
}
```

`useRef(new AudioEngine())` だと、レンダーのたびに `new` が評価されて無駄（使われないインスタンスも作られる）。
null 始まりにして「初回アクセス時にだけ作る」のが lazy なパターン。

### (2) AudioContext を lazy に

ブラウザは「ユーザーが操作するまで勝手に音を鳴らさない」（autoplay policy）。
だから `AudioContext` はコンストラクタでは作らず、**最初の `playNode()`**（＝ボタン押下）で作る。

```ts
private ensureContext() {
  if (!this.context) this.context = new AudioContext();  // 初回の再生時
  if (this.context.state === "suspended") this.context.resume();
  return this.context;
}
```

検証でも、ノードを選んだだけでは AudioContext は 0 個、Play で 1 個になることを確認した。

## 片付け（cleanup）を忘れない

* App が unmount されたら `dispose()`（stop + context.close）を呼ぶ。
* 再生を切り替えるときは古い oscillator を stop して `disconnect()`。
* AudioContext は**1つだけ**使い回す（何個も作らない）。

```ts
useEffect(() => {
  return () => { audioEngineRef.current?.dispose(); };  // unmount 時
}, []);
```

## テスト: 純粋な部分だけ

Web Audio API は jsdom（テスト環境）にないのでテストしにくい。
だから「ノード → 周波数/波形」のマッピングだけ `nodeSound.ts` に純粋関数として分け、そこをテストした。

```ts
it("returns the same sound for the same node id", () => {
  expect(soundForNode(makeNode("node-001")))
    .toEqual(soundForNode(makeNode("node-001")));  // 同じ id は同じ音
});
```

`id` をハッシュして周波数表にマップ → 同じノードはいつも同じ音、という「決定的」な設計。

## まとめ

* Web Audio は `音源 -> gain -> destination` をつないで鳴らす
* UI は `playNode`/`stop` の高レベル API だけ、oscillator の詳細は知らない
* 音源生成は `createSourceForNode` に集約、将来 mp3 に差し替えやすくする
* AudioEngine も AudioContext も lazy（context はユーザー操作起点で生成）
* unmount 時に dispose、context は 1 つだけ使い回す
* 純粋関数（音のマッピング）だけテストする
