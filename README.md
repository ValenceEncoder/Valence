# Electron App Starter
My boilerplate for new Electron based apps.

## Components
- Electron
- TypeScript
- Bootstrap 4

## Requirements
- Node >= v8.10.*
- Windows: GNU Utils. NPM Scripts use commands like `rm -rf` so to use them on Windows you'll need to have GNU Utils installed or use WSL etc. 

## Setup
- Clone the repo `git clone git@github.com:hammus/electron-ts`
- Install the npm dependancies `npm install`
- Start the application `npm start`

## Source File Overview

|------------------------|--------------------------------------------------------------------------------------------------|
| `src/lib/App.ts`       | Simple bootstrap script for electron. Imports `Electron.Application` and calls `Main.Init(app)`  |
| `src/lib/Main.ts`      | Main `BrowserWindow` manager, creates the main window and sets up basic IPC                      |
| `src/lib/IndexView.ts` | View Controller for `index.html`                                                                 |
|------------------------|--------------------------------------------------------------------------------------------------|


## `npm` Script Tasks
We use `npm-run-all` to manage parallel and sequential task running. The available tasks are:

|------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `npm start`            | Runs `build` and `electron` tasks sequentially                                                                                |
| `npm run build`        | Runs `clean`, `build:all` and `html` tasks sequentially                                                                       |                   
| `npm run electron`     | Runs  shell command: `cross-env NODE_ENV=dev electron .`. Starts the Electron Application                                     |                   
| `npm run build:all`    | Runs `ts` and `css` tasks in parallel                                                                                         |
| `npm run ts`           | Runs shell command: `tsc`. Compiles TypeScripts to `dist/lib/*`                                                               |
| `npm run css`          | Creates the `dist` and `dist/css` directories and then runs shell command: `uglifycss src/css/Index.css > dist/css/Index/css` |
| `npm run clean`        | Runs shell command: `rm -rf dist/`. Deletes all generated/compiled files.                                                     |
| `npm run html`         | Runs shell command: `cd dist && mkdir views && cd .. && cp src/views/*.html dist/views`. Copies HTML files to `dist/views`    |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------|
