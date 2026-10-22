"""Build the Mellon mascot. Run with Blender --background --python this_file.

All geometry is authored in Blender; no image billboard is used in the GLB.
The supplied PNG remains an immutable visual reference and browser fallback.
"""
import bpy
import math
import json
import hashlib
from pathlib import Path
from mathutils import Vector
from array import array

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/models/mellon.glb'
PREVIEW = ROOT / 'assets/previews'
for p in [OUT.parent, PREVIEW, ROOT / 'assets/blender']:
    p.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, roughness=.32, metallic=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Coat Weight'].default_value = .2
    return mat

green = material('Mellon forest green', (.012, .16, .045), .26)
leafmat = material('Fresh leaf', (.13, .38, .012), .29)
vein = material('Leaf veins', (.025, .12, .012), .35)
yellow = material('Golden face', (1.0, .60, .055), .38)
cream = material('Warm ivory', (1, .94, .78), .3)
white = material('Eye catchlights', (1, 1, 1), .15)
black = material('Pupils and eyebrows', (.005, .015, .008), .18)
iris = material('Jade irises', (.018, .26, .065), .17)
cheek = material('Watermelon blush', (1, .16, .14), .34)
mouthmat = material('Smile interior', (.14, .009, .013), .45)
tonguemat = material('Tongue', (.9, .07, .13), .33)
gold = material('Golden keys and piping', (.95, .49, .065), .24, .72)
roofmat = material('Honey roof', (.38, .105, .008), .38)
tilelight = material('Sunlit terracotta', (.65, .25, .025), .36)
tiledark = material('Deep terracotta', (.23, .06, .004), .4)
sole = material('Sneaker sole', (.91, .79, .56), .45)
windowmat = material('Chimney windows', (1, .84, .27), .27)

def finish(obj, name, mat, smooth=True):
    obj.name = name
    obj.data.materials.append(mat)
    if smooth and obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True
    return obj

def sphere(name, location, scale, mat, segments=28, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.object
    obj.scale = scale
    return finish(obj, name, mat)

def box(name, loc, scale, mat, bevel=.04, rotation=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new('Soft manufactured edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod = obj.modifiers.new('Weighted corner normals', 'WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(obj, name, mat)

def tube(name, points, radius, mat, cyclic=False):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 8
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points)-1)
    for pt, co in zip(spline.bezier_points, points):
        pt.co = co
        pt.handle_left_type = pt.handle_right_type = 'AUTO'
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat, False)

def torus(name, loc, major, minor, mat, rotation=(math.pi/2,0,0), scale=(1,1,1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
        major_segments=40, minor_segments=10, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.scale = scale
    return finish(obj, name, mat)

def badge_text(text, loc, size, mat, name):
    curve = bpy.data.curves.new(name, 'FONT')
    curve.body = text
    curve.align_x = 'CENTER'
    curve.align_y = 'CENTER'
    curve.size = size
    curve.extrude = .002
    curve.bevel_depth = .001
    curve.resolution_u = 4
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = (math.pi/2, 0, 0)
    return finish(obj, name, mat, False)

# An embedded UV texture makes the stripes portable to all glTF renderers.
bodymat = material('Watermelon striped skin', (.18,.38,.025), .3)
size = 1024
texture = bpy.data.images.new('Mellon watermelon stripes', width=size, height=size)
pixels = array('f')
for row in range(size):
    v = row / size
    for col in range(size):
        u = col / size
        bend = .025*math.sin(v*18) + .009*math.sin(v*57+u*9)
        stripe = math.sin((u+bend)*math.pi*20)
        blend = max(0, min(1, (stripe+.05)*8+.5))
        fine = .016*math.sin(u*730+math.sin(v*570))
        a = (.045,.25,.025)
        b = (.58,.76,.075)
        pixels.extend([max(0,a[c]*(1-blend)+b[c]*blend+fine) for c in range(3)]+[1])
texture.pixels.foreach_set(pixels)
texture.pack()
texnode = bodymat.node_tree.nodes.new('ShaderNodeTexImage')
texnode.image = texture
bodymat.node_tree.links.new(texnode.outputs['Color'], bodymat.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
sphere('Watermelon body', (0,0,1.76), (1.08,.78,1.03), bodymat, 64,40)
sphere('Golden face mask', (0,-.645,1.95), (.85,.275,.74), yellow, 48,28)

# Eyes: modeled rims, globes, irises, pupils and sculpted highlights.
for sign, side in [(-1,'left'),(1,'right')]:
    x = sign*.435
    sphere(side+' eye rim', (x,-.857,2.12), (.286,.12,.338), roofmat)
    sphere(side+' eye white', (x,-.91,2.12), (.266,.13,.313), cream)
    sphere(side+' emerald iris', (x+sign*.012,-1.027,2.10), (.208,.057,.257), iris)
    sphere(side+' pupil', (x+sign*.012,-1.074,2.10), (.143,.027,.184), black)
    sphere(side+' catchlight', (x-.065,-1.101,2.235), (.064,.016,.068), white,24,12)
    sphere(side+' secondary glint', (x+.078,-1.097,2.015), (.025,.012,.027), white,16,10)
    tube(side+' eyebrow', [(x-.18,-.76,2.58),(x-.02,-.84,2.66),(x+.15,-.77,2.60)], .067, black)
    sphere(side+' rosy cheek', (sign*.665,-.837,1.72), (.215,.1,.135), cheek)

# Smile outline with a shallow concave top and round lower lip.
smile = [(-.28,1.80),(-.12,1.76),(0,1.755),(.12,1.77),(.29,1.83),(.27,1.62),(.16,1.46),(0,1.42),(-.17,1.49),(-.25,1.63)]
curve = bpy.data.curves.new('Open smile', 'CURVE')
curve.dimensions = '2D'
curve.resolution_u = 12
curve.fill_mode = 'BOTH'
curve.extrude = .018
curve.bevel_depth = .015
curve.bevel_resolution = 3
spline = curve.splines.new('BEZIER')
spline.bezier_points.add(len(smile)-1)
for point, (x,z) in zip(spline.bezier_points, smile):
    point.co = (x,z,0)
    point.handle_left_type = point.handle_right_type = 'AUTO'
spline.use_cyclic_u = True
obj = bpy.data.objects.new('Happy open smile', curve)
bpy.context.collection.objects.link(obj)
obj.rotation_euler = (math.pi/2,0,0)
obj.location.y = -.922
finish(obj,'Happy open smile',mouthmat,False)
sphere('Rounded tongue', (.02,-.961,1.535), (.16,.023,.085), tonguemat)

# Arms and soft cartoon gloves, posed as in the source image.
tube('Left green arm',[(-.90,0,1.7),(-1.16,-.03,1.61),(-1.30,-.14,1.83)],.145,green)
tube('Right green arm',[(.92,0,1.62),(1.20,-.025,1.58),(1.43,-.13,1.9)],.15,green)
for sign in [-1,1]:
    torus('Glove cuff', (sign*1.36,-.17,1.83),.15,.045,cream,rotation=(0,0,0))
sphere('Left glove palm',(-1.38,-.24,1.96),(.29,.20,.24),cream)
for i in range(3):
    sphere('Left curled finger '+str(i),(-1.57+i*.14,-.40,1.90-i*.025),(.085,.105,.16),cream,24,14)
sphere('Left glove thumb',(-1.18,-.39,2.00),(.12,.12,.16),cream)
sphere('Right glove palm',(1.44,-.24,1.99),(.26,.20,.28),cream)
tube('Raised thumb',[(1.30,-.24,2.03),(1.24,-.22,2.25),(1.29,-.20,2.42)],.12,cream)
for i in range(3):
    sphere('Right curled finger '+str(i),(1.49,-.40,2.12-i*.135),(.20,.105,.09),cream,24,14)

# Sneakers have separate soles, toe caps, piping, tongues, laces and branding.
for sign, side in [(-1,'left'),(1,'right')]:
    x = sign*.56
    sphere(side+' ankle',(x,0,.72),(.20,.21,.34),green)
    box(side+' sole',(x,-.18,.18),(.91,1.17,.17),sole,.075)
    box(side+' midsole',(x,-.18,.28),(.92,1.19,.18),cream,.085)
    sphere(side+' leather upper',(x,-.13,.45),(.415,.56,.29),green)
    sphere(side+' toe cap',(x,-.54,.39),(.41,.31,.19),cream)
    tube(side+' gold sole trim',[(x-.4,-.47,.27),(x-.42,-.7,.27),(x,-.805,.27),(x+.42,-.7,.27),(x+.4,-.47,.27)],.018,gold)
    box(side+' tongue',(x,-.33,.63),(.34,.17,.36),green,.075,rotation=(.32,0,0))
    box(side+' tongue label',(x,-.429,.695),(.25,.018,.115),cream,.008)
    badge_text('MELLON',(x,-.445,.698),.054,green,side+' tongue wordmark')
    for i in range(3):
        z = .45 + i*.065
        y = -.56 + i*.035
        tube(side+' lace '+str(i),[(x-.16,y,z+.025),(x,y-.05,z),(x+.16,y,z+.025)],.021,gold)
        for direction in [-1,1]:
            torus(side+' eyelet',(x+direction*.17,y+.005,z+.025),.025,.008,gold)
    badge_text('M',(x+sign*.265,-.49,.47),.23,cream,side+' sneaker M')

# Full roof structure: two sloped wooden panels and individually beveled tiles.
ridge_x=.12
ridge_z=3.17
for sign in [-1,1]:
    edge_x=sign*1.30
    edge_z=2.55
    dx=edge_x-ridge_x
    dz=edge_z-ridge_z
    angle=-math.atan2(dz,dx)
    if sign<0:
        angle-=math.pi
    length=math.hypot(dx,dz)
    center=((ridge_x+edge_x)/2,.02,(ridge_z+edge_z)/2)
    box('Roof structural panel',center,(length+.15,1.17,.13),roofmat,.035,(0,angle,0))
    # Rows run along the slope; columns wrap from the front to the back.
    for row in range(5):
        t=(row+.5)/5
        for col in range(6):
            y=-.48+col*.195
            x=ridge_x+dx*t
            z=ridge_z+dz*t+.095
            box('Individual roof tile',(x,y,z),(length/5-.012,.187,.085),[tilelight,roofmat,tiledark][(row+col*2)%3],.018,(0,angle,0))
    for y in [-.60,.62]:
        box('Golden gable trim',((ridge_x+edge_x)/2,y,(ridge_z+edge_z)/2), (length+.22,.15,.18),tilelight,.035,(0,angle,0))
box('Ridge cap',(.12,.02,3.22),(.19,1.30,.17),tilelight,.045)
mesh=bpy.data.meshes.new('Gable face')
mesh.from_pydata([(-1.25,-.54,2.57),(.12,-.54,3.16),(1.25,-.54,2.57)],[],[(0,1,2)])
mesh.update()
gable=bpy.data.objects.new('Roof gable backing',mesh)
bpy.context.collection.objects.link(gable)
finish(gable,gable.name,roofmat,False)
mod=gable.modifiers.new('Gable thickness','SOLIDIFY')
mod.thickness=.09

# Brick chimney with glowing gold window panes.
box('Chimney masonry',(-.66,.19,3.12),(.42,.40,.85),roofmat,.022)
for row in range(4):
    for col in range(2):
        box('Chimney face brick',(-.77+col*.22,-.022,2.84+row*.19),(.207,.035,.175),tiledark if (row+col)%2 else tilelight,.01)
box('Chimney crown',(-.66,.19,3.57),(.56,.52,.15),tilelight,.026)
for i in [-1,1]:
    for j in [-1,1]:
        box('Chimney window',(-.66+i*.07,-.045,3.30+j*.075),(.115,.025,.12),windowmat,.008)

# Curved leaf with real thickness, a midrib and fine branch veins.
verts=[]
faces=[]
leaf_rows=24
leaf_cols=12
for i in range(leaf_rows+1):
    t=i/leaf_rows
    width=.34*math.sin(math.pi*t)**.8
    for j in range(leaf_cols+1):
        s=2*j/leaf_cols-1
        verts.append((.1+.86*t+s*width, .20+.18*math.sin(t*math.pi)+.12*s*s, 3.22+.95*t-s*width*.35))
for i in range(leaf_rows):
    for j in range(leaf_cols):
        a=i*(leaf_cols+1)+j
        faces.append((a,a+1,a+leaf_cols+2,a+leaf_cols+1))
mesh=bpy.data.meshes.new('Leaf surface')
mesh.from_pydata(verts,[],faces)
mesh.update()
obj=bpy.data.objects.new('Signature watermelon leaf',mesh)
bpy.context.collection.objects.link(obj)
finish(obj,obj.name,leafmat)
mod=obj.modifiers.new('Leaf thickness','SOLIDIFY')
mod.thickness=.035
tube('Leaf midrib',[(.10,.18,3.22),(.38,.31,3.54),(.68,.32,3.88),(.96,.20,4.17)],.022,vein)
for t in [.25,.43,.62,.78]:
    width=.34*math.sin(math.pi*t)**.8
    for sign in [-1,1]:
        tube('Leaf branching vein',[(.1+.86*t,.18+.18*math.sin(t*math.pi),3.22+.95*t),(.1+.86*t+sign*width*.65,.20+.18*math.sin(t*math.pi),3.22+.95*t-sign*width*.20+.09)],.012,vein)

# Gold keyring and dimensional house-shaped tag, hanging from the left glove.
torus('Key ring',(-1.40,-.48,1.66),.18,.036,gold,scale=(1,1,1.12))
torus('Tag connector',(-1.25,-.49,1.48),.09,.025,gold)
outline=[(-.31,-.23),(.31,-.23),(.31,.19),(.39,.19),(0,.52),(-.39,.19),(-.31,.19)]
def house_tag():
    verts=[]
    for y in [-.52,-.61]:
        verts.extend([(-1.17+x,y,1.02+z) for x,z in outline])
    n=len(outline)
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new('House tag mesh')
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    obj=bpy.data.objects.new('Golden house key tag',mesh)
    bpy.context.collection.objects.link(obj)
    finish(obj,obj.name,gold,False)
    bevel=obj.modifiers.new('Rounded tag edges','BEVEL')
    bevel.width=.025
    bevel.segments=3
house_tag()
badge_text('M',(-1.17,-.635,1.10),.40,green,'House tag M')
torus('Tag eyelet',(-1.17,-.635,1.36),.035,.012,green)
for i in range(2):
    x=-1.62-i*.10
    torus('Key bow',(x,-.40,1.38-i*.1),.08,.026,gold)
    box('Key shank',(x,-.40,1.08-i*.1),(.055,.055,.48),gold,.012,rotation=(0,-.16,0))
    for j in range(2):
        box('Key teeth',(x+.04,-.40,.89+j*.08-i*.1),(.11,.06,.045),gold,.009)

# Freeze all evaluated surfaces to meshes. Keep objects separate in the editable source.
for obj in list(bpy.context.scene.objects):
    if obj.type in {'MESH','CURVE','FONT'}:
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.convert(target='MESH')
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        # Collapse the leaf's duplicated tip vertices and tiny curve tessellation slivers.
        import bmesh
        bm=bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000001)
        bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=.000001)
        bm.to_mesh(obj.data)
        bm.free()

scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=32
scene.cycles.use_denoising=True
scene.render.resolution_x=768
scene.render.resolution_y=896
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.film_transparent=True
scene.world.color=(.2,.2,.2)
scene.view_settings.view_transform='AgX'

def aim(obj,target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
for name,loc,energy,size in [('Key',(-3,-4,6),650,4),('Fill',(4,-2,4),450,3),('Rim',(0,3,5),850,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    lamp=bpy.context.object
    lamp.name=name
    lamp.data.energy=energy
    lamp.data.shape='DISK'
    lamp.data.size=size
    aim(lamp,(0,0,2))
bpy.ops.object.camera_add(location=(0,-9,4.0))
camera=bpy.context.object
camera.name='Review camera'
camera.data.type='ORTHO'
camera.data.ortho_scale=4.85
aim(camera,(0,0,2.08))
scene.camera=camera
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/blender/mellon.blend'))

# Export mesh-only. Joining by material reduces draw calls, while the source stays editable.
bpy.ops.object.select_all(action='DESELECT')
meshes=[o for o in scene.objects if o.type=='MESH']
for obj in meshes: obj.select_set(True)
bpy.context.view_layer.objects.active=meshes[0]
bpy.ops.object.join()
joined=bpy.context.object
joined.name='Mellon mascot'
joined.data.calc_loop_triangles()
triangles=len(joined.data.loop_triangles)
bpy.ops.export_scene.gltf(filepath=str(OUT),export_format='GLB',use_selection=True,
    export_yup=True,export_apply=True,export_cameras=False,export_lights=False,export_image_format='AUTO')

for label,loc in [('front',(0,-9,3.2)),('three-quarter',(2.8,-9,3.6))]:
    camera.location=loc
    aim(camera,(0,0,2.08))
    scene.render.filepath=str(PREVIEW/f'mellon-{label}.png')
    bpy.ops.render.render(write_still=True)

report={'triangles':triangles,'materials':len(joined.data.materials),
    'bytes':OUT.stat().st_size,'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),
    'source':'reference/Image_20261015_110502_865.png','method':'Hand-authored Blender geometry',
    'reference_sha256':hashlib.sha256((ROOT/'reference/Image_20261015_110502_865.png').read_bytes()).hexdigest()}
(PREVIEW/'model-report.json').write_text(json.dumps(report,indent=2))
print('MELLON_ASSET_REPORT',json.dumps(report))
