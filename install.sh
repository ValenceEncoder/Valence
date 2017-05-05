#!/usr/bin/env bash

FFMPEG_OUTDIR="./ffmpeg/bin"
FFMPEG_ARCHIVE="ffmpeg-git-64bit-static.tar.xz"
FFMPEG_CHECKSUM="ffmpeg-git-64bit-static.tar.xz.md5"
FFMPEG_ARCHIVE_DIR="${FFMPEG_OUTDIR}/ffmpeg-git-20170417-64bit-static"
FFMPEG=${FFMPEG_ARCHIVE_DIR}/ffmpeg
FFPROBE=${FFMPEG_ARCHIVE_DIR}/ffprobe
mkdir -p ${FFMPEG_OUTDIR}
wget https://johnvansickle.com/ffmpeg/builds/${FFMPEG_ARCHIVE} && tar -xvf ${FFMPEG_ARCHIVE} -C ${FFMPEG_OUTDIR}
wget https://johnvansickle.com/ffmpeg/builds/${FFMPEG_CHECKSUM}
# Compare Checksums
GENSUM="$(md5sum ${FFMPEG_ARCHIVE})"
ACTSUM="$(cat ${FFMPEG_CHECKSUM})"

if [ "${GENSUM}" == "${ACTSUM}" ]; then
    echo "Checksums Validated"
else
     echo "Checksum Failed"
     exit 1
fi

mv ${FFMPEG} ${FFMPEG_OUTDIR}
mv ${FFPROBE} ${FFMPEG_OUTDIR}
rm -rf ${FFMPEG_ARCHIVE_DIR}
rm ${FFMPEG_ARCHIVE}
rm ${FFMPEG_CHECKSUM}