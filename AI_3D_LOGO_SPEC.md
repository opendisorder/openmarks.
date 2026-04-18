# AI-Powered 3D Logo Extrusion System

## Vision
Feed any logo into an AI pipeline that:
1. **Understands** what the shape represents (leaf, hexagon, letter, animal)
2. **Extracts** a clean die-cut stencil from colored/gradient artwork
3. **Assigns** physical properties (thickness, bump maps, material) based on shape type
4. **Generates** a true 3D model with original colors preserved

---

## Pipeline Architecture

```
Input Logo (SVG/PNG)
    ↓
[Preprocessor] ──→ Remove gradients, flatten layers, extract silhouette
    ↓
[Shape Analyzer AI] ──→ Classify: organic | geometric | typographic | abstract
    ↓
[Stencil Generator] ──→ Clean vector paths, handle holes/cuts, normalize
    ↓
[Physical Mapper] ──→ Assign depth curve, bump map, edge bevel, material
    ↓
[3D Mesher] ──→ Extrude with variable thickness, apply displacement
    ↓
[Material Renderer] ──→ PBR material with original color as base texture
    ↓
Output: GLTF / USDZ / Interactive Three.js scene
```

---

## 1. Preprocessor

**Problem:** Logos have gradients, multiple colors, anti-aliasing, backgrounds.

**Solution:**
- Convert to high-res bitmap (1024×1024)
- Remove background via saliency detection or alpha channel
- Quantize to 2-4 colors (k-means clustering)
- Extract the dominant shape silhouette

**Python Libraries:**
- `Pillow` / `OpenCV` — image processing
- `sklearn` — k-means color quantization
- `rembg` — background removal

---

## 2. Shape Analyzer AI

**Goal:** Classify the logo into categories that determine 3D treatment.

**Categories:**
| Type | Visual Traits | 3D Treatment |
|------|--------------|--------------|
| **Organic** | Curves, asymmetry, nature-inspired | Thin edges, subsurface scattering, vein bump maps |
| **Geometric** | Straight lines, angles, symmetry | Glass/metal, sharp bevels, uniform thickness |
| **Typographic** | Letters, numbers, text | Plastic, moderate depth, soft edges |
| **Abstract** | Non-representational shapes | Chrome, holographic, variable depth |
| **Emblem** | Circular badges, shields | Heavy extrusion, rim lighting, gold trim |

**Implementation Options:**

### Option A: Rule-Based (Fast, No AI Needed)
Analyze contour properties:
- `curvature_variance` — high = organic, low = geometric
- `corner_count` — many = geometric, few = organic
- `aspect_ratio` — wide = text, square = emblem
- `symmetry_score` — high = geometric, low = organic

```python
from svgpathtools import parse_svg
import numpy as np

def analyze_shape(paths):
    points = extract_points(paths)
    corners = count_corners(points, angle_threshold=45)
    curvature = calculate_curvature_variance(points)
    
    if curvature > 0.7 and corners < 5:
        return "organic"
    elif corners > 8 and curvature < 0.3:
        return "geometric"
    elif is_text_like(points):
        return "typographic"
    else:
        return "abstract"
```

### Option B: CLIP-Based Classification (More Accurate)
Use OpenAI CLIP to classify the logo image:

```python
import clip
import torch
from PIL import Image

model, preprocess = clip.load("ViT-B/32", device="cpu")
labels = ["a leaf logo", "a geometric hexagon shape", "letter text typography", 
          "an abstract swirl", "a circular emblem badge"]
text_tokens = clip.tokenize(labels)

image = preprocess(Image.open("logo.png")).unsqueeze(0)
with torch.no_grad():
    logits_per_image, _ = model(image, text_tokens)
    probs = logits_per_image.softmax(dim=-1)
    
classification = labels[probs.argmax()]
```

### Option C: Fine-Tuned Vision Model (Best Accuracy)
Train a small CNN or use a pre-trained model like:
- **DINOv2** (Meta) — excellent for shape understanding
- **Segment Anything** (Meta) — for precise shape extraction

---

## 3. Stencil Generator

**Goal:** Create a clean, single-color die-cut version of the logo for 3D extrusion.

**Process:**
1. Convert raster to vector (potrace algorithm)
2. Simplify paths (Ramer-Douglas-Peucker)
3. Identify outer contour vs. inner holes
4. Normalize scale to unit square

**Libraries:**
- `potrace` (C library, Python bindings via `pypotrace`)
- `svgpathtools` — path manipulation
- `shapely` — geometric operations

```python
import potrace
from PIL import Image
import numpy as np

def create_stencil(image_path):
    # Load and threshold
    img = Image.open(image_path).convert('L')
    bitmap = potrace.Bitmap(np.array(img))
    
    # Trace to vector
    path = bitmap.trace()
    
    # Simplify
    svg_path = path.to_svg()
    return svg_path
```

---

## 4. Physical Property Mapper

**Goal:** Assign realistic 3D properties based on shape classification.

### Depth Profile
Not all logos should be extruded uniformly. A leaf should be thin at edges, thick at center.

```python
def get_depth_profile(shape_type):
    profiles = {
        "organic": {
            "base_depth": 0.3,
            "edge_taper": 0.1,      # Thinner at edges
            "center_bulge": 0.5,    # Thicker in middle
            "bevel": 0.2,
        },
        "geometric": {
            "base_depth": 0.8,
            "edge_taper": 0.0,      # Sharp edges
            "center_bulge": 0.0,
            "bevel": 0.05,
        },
        "typographic": {
            "base_depth": 0.5,
            "edge_taper": 0.0,
            "center_bulge": 0.0,
            "bevel": 0.15,
        },
    }
    return profiles.get(shape_type, profiles["geometric"])
```

### Bump Maps
Generate procedural bump maps based on shape:
- **Leaf** → Vein texture generated from skeletonization
- **Geometric** → Subtle brushed metal grain
- **Text** → Smooth with slight edge wear

```python
# Generate leaf vein bump map
from skimage.morphology import skeletonize
import numpy as np

def generate_leaf_bump(silhouette):
    skeleton = skeletonize(silhouette)
    veins = skeleton.astype(float) * 255
    # Blur for subtle relief
    return gaussian_filter(veins, sigma=2)
```

### Material Assignment
| Shape | Material | Properties |
|-------|----------|------------|
| Organic | Subsurface plastic | Translucency: 0.3, Roughness: 0.6 |
| Geometric | Glass | IOR: 1.5, Roughness: 0.1, Metalness: 0 |
| Hexagon | Chrome | Metalness: 1.0, Roughness: 0.05 |
| Text | Matte plastic | Roughness: 0.4, Metalness: 0 |
| Emblem | Gold | Metalness: 1.0, Color: #FFD700 |

---

## 5. 3D Mesher

**Goal:** Convert 2D stencil into a 3D mesh with variable thickness.

### Approach A: Simple Extrusion (Current)
Use `3dsvg` library or Three.js `ExtrudeGeometry`.

### Approach B: Variable Thickness Extrusion (Better)
Use Blender Python API (`bpy`) for full control:

```python
import bpy

def create_3d_logo(svg_path, depth_profile, material):
    # Import SVG
    bpy.ops.import_curve.svg(filepath=svg_path)
    
    # Convert to mesh
    obj = bpy.context.active_object
    obj.data.extrude = depth_profile["base_depth"]
    obj.data.bevel_depth = depth_profile["bevel"]
    
    # Apply displacement modifier for bump map
    disp = obj.modifiers.new(name="Displacement", type='DISPLACE')
    disp.strength = 0.05
    
    # Apply material
    mat = bpy.data.materials.new(name="LogoMaterial")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = material["color"]
    bsdf.inputs["Metallic"].default_value = material["metalness"]
    bsdf.inputs["Roughness"].default_value = material["roughness"]
    
    obj.data.materials.append(mat)
    
    # Export as GLTF
    bpy.ops.export_scene.gltf(filepath="logo_3d.glb")
```

### Approach C: Browser-Based (For Studio)
Use Three.js with custom vertex shaders:

```javascript
// Vertex shader for variable thickness
const vertexShader = `
  uniform float uDepth;
  uniform float uEdgeTaper;
  varying vec2 vUv;
  
  void main() {
    vec3 pos = position;
    float distFromCenter = length(uv - 0.5) * 2.0;
    float taper = 1.0 - (distFromCenter * uEdgeTaper);
    pos.z *= taper;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
```

---

## 6. Color Preservation

**Goal:** Match the original logo colors in 3D.

**Method:**
1. Extract dominant colors from original logo (k-means)
2. Create a UV-mapped texture with the original artwork
3. Apply as base color map on the 3D material
4. For monochrome extrusions, use the dominant color as the material tint

---

## Implementation Roadmap

### Phase 1: Rule-Based (2 weeks)
- Shape analysis via contour properties
- Simple extrusion with material presets
- Works for 80% of logos

### Phase 2: CLIP Integration (2 weeks)
- Add CLIP for better shape classification
- Generate procedural bump maps
- Custom depth curves per shape type

### Phase 3: Production Pipeline (1 month)
- Blender Python automation
- GLTF/USDZ export
- Batch processing thousands of logos
- Integration into LogoLibrary Studio

---

## Python Stack

```bash
pip install svgpathtools shapely trimesh opencv-python Pillow scikit-image
pip install transformers torch  # For CLIP
pip install bpy  # If using Blender
```

## Browser Stack

```bash
npm install three @react-three/fiber @react-three/drei
npm install 3dsvg  # Current engine
```

---

## Example Output

| Input Logo | Detected Shape | 3D Treatment |
|-----------|---------------|--------------|
| 🍃 Leaf | Organic | Thin edges, vein bump map, subsurface scattering |
| ⬡ Hexagon | Geometric | Glass material, sharp bevel, reflections |
| 🔤 Text | Typographic | Plastic, moderate depth, soft edges |
| 🛡️ Shield | Emblem | Heavy gold extrusion, rim light, engraved details |

---

*This system would make LogoLibrary the first open-source platform with AI-driven 3D logo generation.*
