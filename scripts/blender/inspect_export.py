"""Independently reimport the shipped GLB and render that export for acceptance."""
import bpy
import json
import math
import hashlib
from pathlib import Path
from mathutils import Vector

root = Path(__file__).resolve().parents[2]
asset = root/'public/models/mellon.glb'
before = hashlib.sha256(asset.read_bytes()).hexdigest()
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(asset))
objects=list(bpy.context.scene.objects)
meshes=[obj for obj in objects if obj.type=='MESH']
errors=[]
triangles=0
degenerate=0
for obj in meshes:
    obj.data.calc_loop_triangles()
    triangles += len(obj.data.loop_triangles)
    for vertex in obj.data.vertices:
        if not all(math.isfinite(n) for n in vertex.co): errors.append('Non-finite vertex')
        if not all(math.isfinite(n) for n in vertex.normal): errors.append('Non-finite normal')
    degenerate += sum(t.area<1e-12 for t in obj.data.loop_triangles)
if not 50000 <= triangles <= 80000: errors.append('Triangle budget')
if degenerate: errors.append(f'{degenerate} zero-area triangles')
if any(o.type in {'CAMERA','LIGHT'} for o in objects): errors.append('Non-mesh scene content')
images=[im for im in bpy.data.images if im.type=='IMAGE']
# Blender decodes packed image pixels lazily; force a read before checking availability.
if not images or any(len(im.pixels)==0 for im in images): errors.append('Missing embedded image')
for im in images:
    if not im.packed_file: errors.append('Unpacked texture')
report={'errors':errors,'triangles':triangles,'mesh_objects':len(meshes),'materials':len(bpy.data.materials),
    'embedded_images':len(images),'degenerate_triangles':degenerate,'sha256':before,'bytes':asset.stat().st_size}
(root/'assets/previews/reimport-report.json').write_text(json.dumps(report,indent=2))
print('REIMPORT_REPORT',json.dumps(report))
if errors: raise RuntimeError('GLB geometry validation failed')

scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.render.resolution_x=640
scene.render.resolution_y=768
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.world.color=(.2,.2,.2)
def aim(obj,target): obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
for loc,energy,size in [((-3,-4,6),650,4),((4,-2,4),450,3),((0,3,5),850,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    lamp=bpy.context.object
    lamp.data.energy=energy
    lamp.data.size=size
    aim(lamp,(0,0,2))
bpy.ops.object.camera_add(location=(0,-9,3.2))
camera=bpy.context.object
camera.data.type='ORTHO'
camera.data.ortho_scale=4.85
scene.camera=camera
for name,loc in [('export-front',(0,-9,3.2)),('export-three-quarter',(2.8,-9,3.6))]:
    camera.location=loc
    aim(camera,(0,0,2.08))
    scene.render.filepath=str(root/f'assets/previews/{name}.png')
    bpy.ops.render.render(write_still=True)
assert before==hashlib.sha256(asset.read_bytes()).hexdigest()
