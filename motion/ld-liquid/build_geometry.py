"""Build a fluid-to-monogram surface from the actual logo alpha, not retyped letters."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter
from skimage.measure import marching_cubes

ROOT = Path(__file__).resolve().parents[2]
OUT = Path('/tmp/ld-liquid-meshes'); OUT.mkdir(exist_ok=True)
N = 244
H = 4.4
W = H * 1106 / 1422
NX = round(N * W / H)
x = np.linspace(-W/2, W/2, NX, dtype=np.float32)
z = np.linspace(-H/2, H/2, N, dtype=np.float32)
y = np.linspace(-1.2, 1.2, 78, dtype=np.float32)
X, Y, Z = np.meshgrid(x, y, z, indexing='ij')
alpha = np.array(Image.open(ROOT/'src/assets/ld-transparent.png').getchannel('A').resize((NX,N), Image.Resampling.LANCZOS))
mask = (alpha[::-1,:].T > 128)
# Positive outside, negative inside. Small smoothing removes pixel stair stepping.
sd = (distance_transform_edt(~mask) - distance_transform_edt(mask)) * H/(N-1)
sd = gaussian_filter(sd, 0.65).astype(np.float32)
q1 = sd[:,None,:] + 0.027
q2 = np.abs(Y) - 0.065
logo = np.sqrt(np.maximum(q1,0)**2 + np.maximum(q2,0)**2) + np.minimum(np.maximum(q1,q2),0) - 0.027

def smooth(a,b,t):
 t=np.clip((t-a)/(b-a),0,1); return t*t*(3-2*t)
def union(a,b,k):
 h=np.maximum(k-np.abs(a-b),0)/k
 return np.minimum(a,b)-h*h*k*.25

def geometry(frame):
 t=(frame-1)/24
 morph=smooth(2.25,4.9,t)
 orbit=1-smooth(1.65,2.5,t)
 ang=t*2.7
 cx=.8*np.sin(ang)*orbit; cz=.8*np.cos(ang)*orbit
 dx=X-cx; dz=Z-cz
 # A stretched, revolving liquid body with subtle surface tension oscillation.
 u=dx*np.cos(ang)+dz*np.sin(ang)
 v=-dx*np.sin(ang)+dz*np.cos(ang)
 stretch=1+0.35*np.sin(t*2.4)**2*(1-morph)
 radius=.62 + .045*np.sin(t*3.7)
 blob=np.sqrt((u/stretch)**2+(Y/0.88)**2+(v*stretch)**2)-radius
 blob+=.025*np.sin(8*X+t*3)*np.sin(7*Z-t*2)*np.cos(6*Y)*(1-morph)
 field=(1-morph)*blob+morph*logo
 if morph<.88:
  for i in range(3):
   ph=ang+i*2.1
   r=(.085+i*.025)*(1-smooth(.3,.88,morph))
   sat=np.sqrt((X-cx-.78*np.cos(ph))**2+(Y-.18*np.sin(ph))**2+(Z-cz-.7*np.sin(ph))**2)-r
   field=union(field,sat,.3*(1-morph))
 verts,faces,_,_=marching_cubes(field,level=0,spacing=(float(x[1]-x[0]),float(y[1]-y[0]),float(z[1]-z[0])))
 verts+=np.array([x[0],y[0],z[0]])
 np.savez(OUT/f'{frame:04d}.npz',vertices=verts.astype(np.float32),faces=faces.astype(np.int32))

if __name__=='__main__':
 import sys
 frames=[int(v) for v in sys.argv[1:]] or list(range(1,169))
 for f in frames:
  geometry(f)
  if f%12==0 or len(frames)<10: print('mesh',f,flush=True)
