set -e
G=$1; J=g-$G.json
read A B END <<< $(python3 -c "import json;t=json.load(open('$J'))['TL'];print(t['v'][1][0]-0.5, t['v'][-1][0]-0.4, t['end'])")
python3 /home/user/margdisha/scripts/shorts/score.py $A $B $END gmusic-$G.wav
N=$(ls ga/$G/v*-f.wav | wc -l); IN=""; F=""; L=""
for k in $(seq 1 $N); do kk=$(printf %02d $k); st=$(python3 -c "import json;print(int(json.load(open('$J'))['TL']['v'][$k-1][0]*1000))"); IN="$IN -i ga/$G/v$kk-f.wav"; F="$F[$k:a]adelay=$st|$st,aformat=channel_layouts=stereo[d$k];"; L="$L[d$k]"; done
ffmpeg -v error -y -i gmusic-$G.wav $IN -filter_complex "${F}${L}amix=inputs=$N:normalize=0[vo];[vo]apad=whole_dur=$END,asplit[vo1][vo2];[0:a]volume=0.32[mu];[mu][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];[duck][vo2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5[out]" -map "[out]" -ar 48000 gaudio-$G.wav
ffmpeg -v error -y -framerate 30 -i gfr-$G/%04d.jpg -i gaudio-$G.wav -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart guide-$G.mp4
rm -rf gfr-$G
