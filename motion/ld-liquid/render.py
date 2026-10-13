"""Blender studio lighting and rendering for the LD fluid identity sequence."""
import bpy, math, sys
from pathlib import Path
from mathutils import Vector
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
CACHE=Path('/tmp/ld-liquid-meshes')
OUT=Path('/tmp/ld-liquid-frames'); OUT.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.cycles.max_bounces=6
scene.render.resolution_x=720
scene.render.resolution_y=926
scene.render.resolution_percentage=100
scene.render.fps=24
scene.frame_start=1; scene.frame_end=168
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
try:
 prefs=bpy.context.preferences.addons['cycles'].preferences
 prefs.compute_device_type='METAL'; prefs.get_devices()
 for d in prefs.devices: d.use=(d.type=='METAL')
 scene.cycles.device='GPU'
 print('RENDER DEVICES',[(d.name,d.type,d.use) for d in prefs.devices],flush=True)
except Exception as e: print('CPU fallback',e,flush=True)
world=bpy.data.worlds.new('Studio environment'); scene.world=world
world.use_nodes=True
world.node_tree.nodes['Background'].inputs['Color'].default_value=(0.17,0.19,0.23,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.4
mat=bpy.data.materials.new('Liquid metal — gold to silver'); mat.use_nodes=True
bs=mat.node_tree.nodes.get('Principled BSDF'); bs.inputs['Metallic'].default_value=1
bs.inputs['Roughness'].default_value=.17
bs.inputs['Coat Weight'].default_value=.25
bs.inputs['Coat Roughness'].default_value=.1

def aim(obj,p=(0,0,0)):
 obj.rotation_euler=(Vector(p)-obj.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,power,size,size_y,color):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='RECTANGLE';data.size=size;data.size_y=size_y;data.color=color
 ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=loc;aim(ob)
area('Tall ivory softbox',(-3,-4,2),650,2.2,5,(1,.94,.84))
area('Silver rim',(3,-2,1),900,1,4,(.85,.91,1))
area('Top strip',(0,0,4),850,4,1,(1,.95,.85))
area('Lower edge',(-1,-2,-3),350,2,.5,(1,1,1))
camdata=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',camdata);scene.collection.objects.link(cam)
cam.location=(0,-10,0);aim(cam);camdata.type='ORTHO';camdata.ortho_scale=4.4;scene.camera=cam
mesh=bpy.data.meshes.new('Liquid surface');obj=bpy.data.objects.new('LD liquid sculpture',mesh);scene.collection.objects.link(obj)
obj.data.materials.append(mat)

def smooth(a,b,t):
 v=max(0,min(1,(t-a)/(b-a)));return v*v*(3-2*v)
def frame(f):
 data=np.load(CACHE/f'{f:04d}.npz')
 new=bpy.data.meshes.new('Liquid surface')
 new.from_pydata(data['vertices'].tolist(),[],data['faces'].tolist());new.materials.append(mat)
 for poly in new.polygons:poly.use_smooth=True
 old=obj.data;obj.data=new;bpy.data.meshes.remove(old)
 # Constant-facing final state retains the source logo silhouette.
 t=(f-1)/24; turn=(1-smooth(2.5,5,t))*math.sin(t*1.6)*.23
 obj.rotation_euler=(0,0,turn)
 silver=smooth(4.8,6.3,t)
 gold=(.83,.45,.115);steel=(.58,.62,.68)
 bs.inputs['Base Color'].default_value=tuple(a+(b-a)*silver for a,b in zip(gold,steel))+(1,)
 bs.inputs['Roughness'].default_value=.14+.06*silver
 scene.frame_set(f)
 scene.render.filepath=str(OUT/f'{f:04d}.png')
 bpy.ops.render.render(write_still=True)
 print('FRAME_DONE',f,flush=True)

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
frames=[int(v) for v in args] if args else list(range(1,169))
for f in frames:frame(f)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'motion/ld-liquid/ld-liquid.blend'))
