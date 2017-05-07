[![Build Status](https://travis-ci.org/hammus/Valence.svg?branch=master)](https://travis-ci.org/hammus/Valence)

![Valence Video Encoder](./logo/banner-gh.png)
# Valence Video Encoder
Valence is an simple cross platform GUI application that uses the amazing Open Source video encoder [FFmpeg](https://ffmpeg.org) a little more user friendly. 

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
When released Valence v1.0.0 will allow users to:
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


### Valence is basically just a wrapper/plugin for the following amazing open source projects
* [FFmpeg](https://ffmpeg.org) binaries for conversion and video file analysis
* [Electron](https://electron.atom.io/) for a quick and easy cross-platform GUI application
* [electron-prebuilt-compile](https://github.com/electron-userland/electron-prebuilt-compile) which allows me to use T