import json,sys,os,subprocess
name=sys.argv[1]; src=sys.argv[2]; G=json.load(open(src))
v=[];t=1.0
for i,s in enumerate(G['scenes']):
    w=f"ga/{name}/v{i+1:02d}-f.wav"
    if os.path.exists(w): d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',w]))
    else: d=len(s['say'].split())/2.6
    v.append([round(t,3),round(d,3)])
    t+=d+(1.3 if s['type'] in('tree','journey','map') else 1.0)
end=round(v[-1][0]+v[-1][1]+1.6,3)
json.dump({'G':G,'TL':{'v':v,'end':end}},open(f'g-{name}.json','w'),ensure_ascii=False)
print(end, v)
