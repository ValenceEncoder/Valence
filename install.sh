#!/usr/bin/env bash

if [ "$(uname)" == "Darwin" ]; then
    BASENAME="Lion_Mountain_Lion_Mavericks_Yosemite_El-Captain_15.05.2017"
    ARCHIVE="${BASENAME}.zip"
    URL="http://www.ffmpegmac.net/resources/${ARCHIVE}"
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    BASENAME="ffmpeg-git-64bit-static"
    ARCHIVE="${BASENAME}.tar.xz"
    CHECKSUM="${ARCHIVE}.md5"
    URL="https://johnvansickle.com/ffmpeg/builds/${ARCHIVE}"
fi


OUTDIR="./ffmpeg/bin"

ARCHIVE_DIR="${OUTDIR}/${BASENAME}"
FFMPEG=${ARCHIVE_DIR}/ffmpeg
FFPROBE=${ARCHIVE_DIR}/ffprobe
mkdir -p ${OUTDIR}


if [ "$(uname)" == "Darwin" ]; then
    echo -e "\e[92mGetting macOS binaries\e[0m"
    wget ${URL}
    echo "Extracting archive to ${OUTDIR}"
    unzip ${ARCHIVE} -d ${OUTDIR}
    rm ${ARCHIVE}
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    echo "Getting Linux binaries"
    wget ${URL} && tar -xvf ${ARCHIVE} -C ${OUTDIR}
    GENSUM="$(md5sum ${ARCHIVE})"
    ACTSUM="$(cat ${CHECKSUM})"
    if [ "${GENSUM}" == "${ACTSUM}" ]; then
        echo "Checksums Validated"
        rm ${ARCHIVE}
        rm ${CHECKSUM}
        mv ${FFMPEG} ${OUTDIR}
        mv ${FFPROBE} ${OUTDIR}
        rm -rf ${ARCHIVE_DIR}
    else
         echo "Checksum Failed"
         rm ${ARCHIVE}
         rm ${CHECKSUM}
         mv ${FFMPEG} ${OUTDIR}
         mv ${FFPROBE} ${OUTDIR}
         rm -rf ${ARCHIVE_DIR}
         exit 1
    fi
fi


# Compare Checksums
