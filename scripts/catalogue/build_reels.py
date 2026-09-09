import pathlib
ROOT = str(pathlib.Path(__file__).resolve().parents[2])
import json, os
root=ROOT
d=os.path.join(root,'public/media/reels')
codes=sorted(f[:-4] for f in os.listdir(d) if f.endswith('.mp4')) if os.path.isdir(d) else []
out={c: f'/media/reels/{c}.mp4' for c in codes}
json.dump(out, open(os.path.join(root,'src/data/instagram.reels.json'),'w'), indent=0)
total=sum(os.path.getsize(os.path.join(d,c+'.mp4')) for c in codes)
print(f'reels.json: {len(codes)} local clips, {total/1048576:.1f} MB')
