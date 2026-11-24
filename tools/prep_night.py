#!/usr/bin/env python3
"""Lit-window layers for night time: finds the window panes in every facade (sprites/village/bldg_*.png)
and writes sprites/village/night_*.png with some of them glowing. Usage: python3 -I tools/prep_night.py"""
import sys,glob,os
import numpy as np
from PIL import Image
from scipy import ndimage
V='/home/claude/friends-trivia/sprites/village'
rng=np.random.default_rng(7)
for f in sorted(glob.glob(V+'/bldg_*.png')):
    if os.path.basename(f).startswith('bldg_night'):continue
    im=np.asarray(Image.open(f).convert('RGBA')).astype(int);H,W=im.shape[:2]
    r,g,b,a=im[...,0],im[...,1],im[...,2],im[...,3]
    mx=np.maximum(np.maximum(r,g),b)
    pane=(a>200)&(mx<110)&(b>=r-12)
    pane[int(H*.86):]=False   # skip the street level (doors, shop interiors)
    pane=ndimage.binary_opening(pane,iterations=2)
    lab,n=ndimage.label(pane)
    out=np.zeros((H,W,4),np.uint8);lit=0
    for i,sl in enumerate(ndimage.find_objects(lab),1):
        h=sl[0].stop-sl[0].start;w=sl[1].stop-sl[1].start;m=lab[sl]==i;area=m.sum()
        if area<250 or h<16 or w<10 or h>H*.3 or w>W*.4: continue
        if area/(h*w)<.45: continue
        if sl[0].stop>H*.62 and h>w*1.35: continue   # doors
        if sl[0].stop>H*.8: continue               # street level: doors and shopfronts
        if rng.random()<.35: continue
        warm=np.array([255,214,120]) if rng.random()<.8 else np.array([190,220,255])
        shade=0.75+0.25*np.linspace(1,0,h)[:,None]
        box=im[sl];m=(box[...,3]>200)&(np.maximum(np.maximum(box[...,0],box[...,1]),box[...,2])<150)
        blk=out[sl];blk[m,0]=(warm[0]*shade.repeat(w,1))[m];blk[m,1]=(warm[1]*shade.repeat(w,1))[m];blk[m,2]=(warm[2]*shade.repeat(w,1))[m];blk[m,3]=235;lit+=1
    name=os.path.basename(f).replace('bldg_','night_')
    Image.fromarray(out).save(os.path.join(V,name),optimize=True)
    print(name,lit)
