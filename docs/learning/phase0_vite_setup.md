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



このビルドが通るか確認するためのコマンド：
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



