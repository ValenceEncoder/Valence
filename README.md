<<<<<<< HEAD
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


| File                   | Description                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------------|
| `src/lib/App.ts`       | Simple bootstrap script for electron. Imports `Electron.Application` and calls `Main.Init(app)`  |
| `src/lib/Main.ts`      | Main `BrowserWindow` manager, creates the main window and sets up basic IPC                      |
| `src/lib/IndexView.ts` | View Controller for `index.html`                                                                 |


## `npm` Script Tasks
We use `npm-run-all` to manage parallel and sequential task running. The available tasks are:


| Task Command           | Task Description                                                                                                              |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `npm start`            | Runs `build` and `electron` tasks sequentially                                                                                |
| `npm run build`        | Runs `clean`, `build:all` and `html` tasks sequentially                                                                       |                   
| `npm run electron`     | Runs  shell command: `cross-env NODE_ENV=dev electron .`. Starts the Electron Application                                     |                   
| `npm run build:all`    | Runs `ts` and `css` tasks in parallel                                                                                         |
| `npm run ts`           | Runs shell command: `tsc`. Compiles TypeScripts to `dist/lib/*`                                                               |
| `npm run css`          | Creates the `dist` and `dist/css` directories and then runs shell command: `uglifycss src/css/Index.css > dist/css/Index/css` |
| `npm run clean`        | Runs shell command: `rm -rf dist/`. Deletes all generated/compiled files.                                                     |
| `npm run html`         | Runs shell command: `cd dist && mkdir views && cd .. && cp src/views/*.html dist/views`. Copies HTML files to `dist/views`    |

=======
 [![Build Status](https://travis-ci.org/ValenceEncoder/Valence.svg?branch=master)](https://travis-ci.org/ValenceEncoder/Valence) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

![Valence Video Encoder](./logo/banner-gh.png)
# Valence Video Encoder

> ### NOTICE: 
> Valence is in prerelease at the moment, it is currently maintined by 1 developer and I work on it in my spare time. Features are added whenever I get a chance but if you want to see them come along more quickly, please feel free to submit a PR!
### Project Goals
#### Long Term
Over the long term, Valence aims to:
1. Make FFMpeg easier to use by providing a clean and easy-to-use graphical user interface
2. Allow GPU accelerated encoding/decoding of [supported codecs on supported GPUs](https://trac.ffmpeg.org/wiki/HWAccelIntro)  
3. Be a one-stop-app for encoding/decoding, converting and tagging video files 
4. Be seen or used by at least 1 person on the planet who is not either:

   4a. my wife; or
   
   4b. my mother.

#### Short Term
The alpha release of Valence v0.1.0-alpha allows users to:
1. Convert `x264` encoded `MKV` video files to `MP4` without needlessly re-encoding the video stream, speeding up conversion significantly, for playback on devices with limited container/codec support such as [AppleTV](https://www.apple.com/apple-tv/specs/). 
2. Convert non-`AAC` audio streams to `AAC` so they can be played on devices with limited audio codec support such as [AppleTV](https://www.apple.com/apple-tv/specs/)



It is particularly useful can speed up converting video for Apple iTunes and AppleTV.

### What does Valence do?
It should really be called **MKV to MP4** (in fact it nearly was, but I decided to pay my respects to [Electron](https://electron.atom.io)) 
as all it really does is change the container of a video file that is already encoded using the `x264` or `h264` codec from `.mkv` to `.mp4` 
and ensuring the audio is in an iTunes supported codec. 

### How does it work? (and why did you bother creating it?)
Well I created it for 2 primary reasons:

1. I was sick of using the command line to change the container of a video file just so iTunes would acknowledge it's existence; and
2. I wanted to tinker with [Typescript](https://typescriptlang.org) (try it! you won't regret it)


#### But a better explanation is:
Let's say you have a video file `homevideo.x264.mkv` and you want to add it to your nicely formatted iTunes video collection. Great, I'll just drag it into iTunes! But of course:

iTunes doesn't support the Matroska `.mkv` container, so you open up your trusty video converter tool like [Handbrake :pineapple: ](https://handbrake.fr)  and convert it to `MP4`.

This works great but... it takes a long time and wastes alot of CPU computation in the process because it **re-encodes** a `h264` video in `h264`.

So you look for a free alternative to [Handbrake :pineapple: ](https://handbrake.fr) and find, as I did, that the obvious solution is [FFmpeg](https://ffmpeg.org) and that means command line.

By using FFMPEG to preserve (copy) `x264` / `h264` encoded video streams stored in MKV containers and converting them to MP4 containers, we can save a heap of CPU cycles and time!


### Valence is basically just a wrapper/interface for the following amazing open source projects
* [FFmpeg](https://ffmpeg.org) binaries for conversion and video file analysis
* [Electron](https://electron.atom.io/) for a quick and easy cross-platform GUI application
* [electron-prebuilt-compile](https://github.com/electron-userland/electron-prebuilt-compile) which runs Typescript, LESS, and other Javascript superset languages directly without transpiling.
* [Node.js](https://nodejs.org) runs javascript Server-side like a champ

### LICENCE
Valence Video Encoder is Copyright &copy; 2017 Liam Whan. Valence is Free and Open Source Software. 
No warranties either express or implied are provided, and by downloading this software or repository you are doing so at your own risk. 
Valence-specific source code is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for the Valence License as well as the Licenses of all third party packages used. 
>>>>>>> 9e6a13cdb519236655b10acb14793a75a3b529f4
