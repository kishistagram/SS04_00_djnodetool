# Phase 0 Learning Log: Vite React TypeScript Setup

## Goal

Set up the initial frontend development environment for NodeMix Canvas.

At this stage, the goal was not to implement product features. The goal was only to create a minimal React + TypeScript application that can run in the browser.

## What Vite Does

Vite is the development tool used to run and build the frontend app.

In this project:

* React is used to build UI components.
* TypeScript is used to write typed JavaScript.
* Vite is used to scaffold, run, and build the app.

The relationship is:

```txt
NodeMix Canvas = the product
React = the UI library
TypeScript = typed JavaScript
Vite = the development/build tool
```

## Why We Used `/tmp` First

Instead of running the scaffold command directly in the project root, the Vite scaffold was first created in `/tmp`.

This was safer because it allowed us to inspect the generated files before copying them into the real repository.

The temporary scaffold was created here:

```txt
/tmp/vite-scaffold
```

The real project was here:

```txt
/home/exedev/SS04_00_djnodetool
```

## What `npm create vite@latest` Did

This command generated a new Vite project template.

```bash
npm create vite@latest vite-scaffold -- --template react-ts
```

Meaning:

* `npm create vite@latest` runs the latest Vite project generator.
* `vite-scaffold` is the folder name to create.
* `--template react-ts` means React + TypeScript.

## Why We Used `rsync`

The generated scaffold was copied from `/tmp/vite-scaffold` into the real project using `rsync`.

Before copying, a dry-run was used:

```bash
rsync -avn --exclude='.gitignore' --exclude='README.md' /tmp/vite-scaffold/ /home/exedev/SS04_00_djnodetool/
```

Important point:

* `-n` means dry-run.
* Dry-run shows what would be copied without actually copying files.

After confirming the file list, the real copy was performed:

```bash
rsync -av --exclude='.gitignore' --exclude='README.md' /tmp/vite-scaffold/ /home/exedev/SS04_00_djnodetool/
```

The scaffold's `.gitignore` and `README.md` were excluded because the repository already had its own versions.

## What `npm install` Did

```bash
npm install
```

This installed the packages listed in `package.json`.

It created:

* `node_modules/`
* `package-lock.json`

`node_modules/` should not be committed to Git.
`package-lock.json` should be committed because it records exact dependency versions.

## Why Demo Files Were Removed

The default Vite app includes demo files such as React logos, Vite logos, and sample CSS.

These were not part of NodeMix Canvas, so they were removed:

```txt
src/App.css
src/assets/
```

`src/App.tsx` was replaced with a minimal NodeMix Canvas placeholder.

## Why Vite Config Was Updated

The app is running inside exe.dev, not just a normal local machine.

So `vite.config.ts` needed development server settings:

```ts
server: {
  host: true,
  allowedHosts: 'all',
}
```

This allows the dev server to be accessible through the exe.dev environment.

## What I Should Remember

The general flow for setting up a Vite React TypeScript project is:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

For an existing repository, it is safer to scaffold in `/tmp` first, inspect the files, then copy only what is needed.

## Safety Lessons

Read-only commands are usually safe:

```bash
cat
ls
grep
git status
git diff
```

Write commands need more care:

```bash
rsync
cp
rm
npm install
```

Network/install commands need extra care:

```bash
curl | bash
npm install
npm create vite@latest
```

Before allowing a command, ask:

1. Does it only read files?
2. Does it write files?
3. Does it delete files?
4. Does it install packages?
5. Does it fetch code from the internet?
6. Does it affect Git history?

## Phase 0 Result

The project now has a working Vite + React + TypeScript frontend foundation.

No product features have been implemented yet.

Next step:

```txt
Add core domain types and mock project data.
```


Phase 0で検証すべきこと:
1. 既存docsやREADMEを壊していない
2. Vite + React + TypeScript のファイルが追加されている
3. node_modules がGit管理対象になっていない
4. package.json の name/scripts/dependencies が自然
5. vite.config.ts が exe.dev 用に設定されている
6. App.tsx がViteデモではなくNodeMix Canvas placeholder
7. npm run build が通る
8. npm run lint が通る
9. npm run dev が起動する



### このビルドが通るか確認するためのコマンド：
```
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && nvm use 22 && npm run build 2>&1
```

***何を確認しているか***
- TypeScriptの型エラーがないか
- Viteの設定エラーがないか
- 本番用ファイルを生成できるか

成功すると`dist/`が作られるはず(.gitignoreされている)

難しいので解体すると以下をやっている: 
nvm の場所を指定。
```
export NVM_DIR="$HOME/.nvm"
```

nvm を読み込む。
```
\. "$NVM_DIR/nvm.sh"
```

Node.js 22 を使う。
```
nvm use 22
```

package.json の build script を実行
```
npm run build

```

### 開発サーバ起動確認
`npm run build `の次にやる

`timeout 10 npm run dev`
→ 開発サーバーとして起動できるか確認1

```
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && nvm use 22 && timeout 10 npm run dev 2>&1 || true
```
とは？

nvm の場所を指定:
```
export NVM_DIR="$HOME/.nvm"
```

nvm を読み込む:
```
\. "$NVM_DIR/nvm.sh"
```

Node.js 22 を使う:
```
nvm use 22
```

ここまでは毎回同じ.
本体はここ.
npm run dev は Vite の開発サーバーを起動します:
```
timeout 10 npm run dev
```


普通に実行すると：
```
npm run dev
```
ブラウザで開発中の画面を見続けるためのサーバーだから,これだと終了しないので、`timeout 10`
を付けて、10秒だけ起動して自動で止めるようにする。

チェックしているのは主にこれです。

- Vite dev server が起動するか
- vite.config.ts の server 設定がエラーにならないか
- Reactアプリの開発環境として起動できるか
- exe.dev向けの host 設定で問題が出ないか

npm run build が通っても、npm run dev が起動できないことはあります。
たとえば vite.config.ts の server 設定に問題がある場合、dev server 側でこける可能性があります。

最後のこれ：
```
2>&1 || true
```
は補助です。
```
2>&1
```
エラー出力も普通の出力と一緒に表示する。
```
|| true
```
timeout で10秒後に止めたとき、コマンド全体が「失敗」と扱われすぎないようにする。

このコマンドの目的は：
**開発サーバーが最低限、正常に立ち上がるかを10秒だけ確認する**

## Phase 0 Verification Log

Phase 0 の目的は、NodeMix Canvas の機能を実装することではなく、React + TypeScript + Vite の開発土台が正しく動くことを確認することだった。

そのため、検証ではアプリの機能ではなく、以下を確認した。

### 1. Git の状態確認

```bash
git status
git diff --stat
```

確認したこと:

* 既存ファイルが意図せず変更されていないか
* 新しく追加されたファイルが Vite scaffold の範囲に収まっているか
* `CLAUDE.md`, `README.md`, `LICENSE`, `.gitignore`, `docs/`, `.github/` が勝手に変更されていないか

結果:

* 13個の untracked files があった
* すべて新しい scaffold files だった
* 既存の tracked files は変更されていなかった
* `git diff --stat` は空だった

これは、既存のプロジェクトドキュメントを壊さずに、Vite の土台だけを追加できたことを意味する。

### 2. package.json の確認

`package.json` を確認した。

確認したこと:

* project name が `nodemix-canvas` になっているか
* React, Vite, TypeScript が依存関係に入っているか
* `dev`, `build`, `lint`, `preview` などの scripts があるか

結果:

* name は `nodemix-canvas`
* React 19
* Vite 8
* TypeScript 6

問題なし。

### 3. vite.config.ts の確認

`vite.config.ts` を確認した。

今回、最初は以下のようになっていた。

```ts
server: {
  host: true,
  allowedHosts: 'all',
}
```

しかし、`allowedHosts: 'all'` は Vite 8 の型として不正だった。

Vite 8 では `allowedHosts` は以下のどちらかである必要がある。

```ts
allowedHosts: true
```

または

```ts
allowedHosts: ['example.com']
```

つまり、`'all'` という文字列は使えない。

修正後:

```ts
server: {
  host: true,
  allowedHosts: true,
}
```

この修正により、TypeScript build が通るようになった。

### 4. App.tsx の確認

`src/App.tsx` を確認した。

確認したこと:

* Vite のデモ表示が残っていないか
* React/Vite ロゴの import が残っていないか
* `App.css` や `src/assets` への不要な import が残っていないか
* NodeMix Canvas の最小 placeholder になっているか

結果:

* demo imports は残っていなかった
* `src/App.css` への import はなかった
* `src/assets` への import はなかった
* NodeMix Canvas の placeholder になっていた

問題なし。

### 5. node_modules が Git に入らないことの確認

`node_modules/` は npm install によって作られるが、Git に入れてはいけない。

確認したこと:

* `node_modules/` が `.gitignore` によって無視されているか

結果:

* `.gitignore` によって ignored になっていた
* `node_modules/` は Git 管理対象になっていなかった

問題なし。

### 6. npm run build

```bash
npm run build
```

確認したこと:

* TypeScript の型チェックが通るか
* Vite の本番 build が通るか
* `vite.config.ts` に型エラーがないか

最初の問題:

```ts
allowedHosts: 'all'
```

が Vite 8 の型に合わず、build が失敗した。

修正:

```ts
allowedHosts: true
```

修正後の結果:

* build 成功
* 16 modules
* 0 errors
* built in 128ms

### 7. npm run lint

```bash
npm run lint
```

確認したこと:

* ESLint の警告やエラーがないか

結果:

* warnings なし
* errors なし

問題なし。

### 8. npm run dev

```bash
timeout 10 npm run dev
```

確認したこと:

* Vite dev server が起動するか
* 開発環境として最低限動くか
* `vite.config.ts` の dev server 設定が問題ないか

結果:

* `VITE v8.0.16 ready`
* ready in 125ms
* errors なし

問題なし。

### 今回の重要な学び

今回の一番重要な学びは、`npm run dev` で動いているように見えても、`npm run build` で失敗することがある、という点。

特に TypeScript プロジェクトでは、

```txt
開発サーバーが起動する
```

ことと、

```txt
型チェックと本番ビルドが通る
```

ことは別。

今回は `allowedHosts: 'all'` が dev server では一見問題なさそうに見えたが、`npm run build` の `tsc -b` で型エラーになった。

そのため、Phase 0 のような環境構築でも、最低限以下を確認する必要がある。

```bash
npm run build
npm run lint
timeout 10 npm run dev
```

### Phase 0 Verification Result

Phase 0 は commit 可能な状態。

確認済み:

* 既存ファイルを壊していない
* Vite + React + TypeScript scaffold が追加された
* `node_modules/` は Git に入らない
* `package.json` は妥当
* `vite.config.ts` は Vite 8 の型に合っている
* `src/App.tsx` は NodeMix Canvas placeholder になっている
* build 成功
* lint 成功
* dev server 起動成功

次のステップ:

```txt
Phase 1: domain types and mock project data
```


