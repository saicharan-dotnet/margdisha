#!/bin/bash
# usage: endfix.sh <GN> <out-mp4>
set -e
cd "$(dirname "$0")"; GN=$1; OUT=$2
M=$(python3 -c "import json,math;t=json.load(open('g-$GN.json'))['TL'];print(int(math.floor((t['v'][-1][0]-0.45)*30))-3)")
rm -rf gtail-$GN; GN=$GN node grender.cjs tail $M
mkdir -p endfix; T=endfix/$GN.mp4
ffmpeg -v error -y -i "$OUT" -framerate 30 -i gtail-$GN/%04d.jpg -filter_complex "[0:v]trim=end_frame=$M,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0,format=yuv420p[v]" -map "[v]" -map 0:a -c:v libx264 -preset medium -crf 19 -c:a copy -movflags +faststart $T
echo "$GN M=$M old=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT") new=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $T)"
rm -rf gtail-$GN
