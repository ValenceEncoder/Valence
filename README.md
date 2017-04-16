# MKV to AppleTV
MKV to AppleTV (MKV2ATV) is a simple cross platform GUI application that can speed up converting video for Apple iTunes and AppleTV. `

### What does MKV2ATV do?
It should really be called **MKV to MP4** as all it really does is change the container of a video file that is already encoded using the `x264` or `h264` codec from `.mkv` to `.mp4` and ensuring the audio is in an iTunes supported codec. 

### How does it work? (and why did you bother creating it?)
Well I created it because I was sick of using the command line to change the container of a video file just so iTunes would acknowledge it's existence.

**But a better explanation is:**
Let's say you have a video file `homevideo.x264.mkv` and you want to add it to your nicely formatted iTunes video collection.

Well, iTunes doesn't support the Matroska `.mkv` container, so you open up your trusty video converter tool (e.g. `Handbrake`) and convert it to `MP4`. 

This works great but... it takes a long time and wastes alot of CPU computation in the process because it **re-encodes** a `h264` video in `h264`. 

By using FFMPEG to preserve (copy) `x264` / `h264` encoded video streams stored in MKV containers and converting them to MP4 containers, we can save a heap of CPU cycles and time!

### MKV2ATV utilizes the following technologies
* [FFmpeg](https://ffmpeg.org) binaries for conversion and video file analysis
* [nw.js](https://nwjs.io/) for a quick and easy cross-platform GUI
