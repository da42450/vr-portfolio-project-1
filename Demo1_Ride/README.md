# Demo 1 — Level-gondola Ferris wheel

A web graphics demo with a full fairground: booths, a patterned ground, trees, sky colour, and a custom tapered cabin. Art quality is intentionally simple so the graded mechanisms stay visible.

## Run and controls

From the portfolio root, run `npm start`; open `http://localhost:8080/Demo1_Ride/`.

| Control         | Action                            |
| --------------- | --------------------------------- |
| V / Ride button | Switch ground/rider camera        |
| N               | Day/night                         |
| P               | Pause all code-driven motion      |
| B               | Inject/remove a leveling fault    |
| M               | Toggle cabin normal/emission maps |
| H               | Toggle shadows                    |
| Drag / wheel    | Look around / ground-view zoom    |

Deployment: [GitHub Pages](https://da42450.github.io/vr-portfolio-project-1/Demo1_Ride/). This is a desktop WebGL demo, not immersive WebXR. Video: [YouTube — narrated desktop demonstration](https://youtu.be/aYnfPb46d2c).

## How it works

`Turntable → Wheel → LevelingPivot → Cabin → RockingSeat → Camera`. The base yaws slightly, the wheel spins around its local Z axis, the pivot applies the wheel's negative angle, and each seat rocks around its local X axis. At least three moving levels are defined relative to their parent. All motion is computed in `main.js`; there are no animation clips.

The pivot's world roll is `wheel roll + pivot local roll = θ − θ = 0`. The base yaw rotates around vertical and does not introduce a roll. A live readout measures the cabin's world up-vector against world vertical. The B diagnostic sets local compensation to zero; the cabins then tip with the wheel. Restore it and the measured tilt returns to zero. The rider camera is physically reparented to `RockingSeat0`, so movement comes from the hierarchy rather than manually copying a position.

`cabinGeometry()` authors four tapered wall quads with explicit positions, normals, triangle indices, and UVs. Wall i occupies U from i/4 to (i+1)/4; V goes from bottom to top. This is a simple four-strip unwrap. Canvas-generated colour, corrugation normal, and strip emission textures use these UVs. Normal-map RGB is treated as linear vector data; colour and emission are sRGB. Additional floor and roof meshes close the cabin.

Standard PBR materials produce diffuse shading and specular metal highlights. The directional light models daylight; the point light fills the wheel at night; the spot light illuminates the loading area. Emission makes a strip bright but does not physically light nearby surfaces, which is why the point/spot lights are also needed.

Only one light casts shadows at a time: daylight directional at 1024², nighttime spotlight at 512². Point shadows are disabled because six faces would be more expensive. Repeated objects share geometry/materials; the HUD reports draw calls, triangles and frame rate. No per-frame textures are generated.

## Sources and known issues

- [Professor's assignment/rubric](https://vr26.vn.ugavel.com/PortfolioProject1/).
- [Three.js Object3D hierarchy](https://threejs.org/docs/#api/en/core/Object3D), [MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial), [shadows](https://threejs.org/manual/en/shadows.html).
- All geometry and textures are original procedural assets. Speeds, dimensions and light strengths are scene-design values, not measurements of a real Ferris wheel.
- Headset support is optional for this demo and is not implemented. This demo is intended for a desktop video.
- The initial authored cabin had inward-facing wall normals because the cross-product operands and triangle winding were reversed. Checking the normal's dot product with the face's outward position found it. Both were reversed; `tests/graphics.test.mjs` now checks outward normals, winding and UV bounds. This is a real implementation correction you can explain. The separate leveling fault toggle is an injected diagnostic.
- The linked personal recording was supplied October 8. The final upload uses the student's completed screen/narration edit; its quiet audio was amplified by 14 dB without changing video frames or timing. Actual desktop frame rate depends on the machine; the recording's frame rate is not the application's performance measurement.

## Video proof (about 4 minutes)

0:00 explain the ride; 0:30 point out nested motion and zero world tilt; 1:15 inject/repair the fault; 1:50 enter rider view and show inherited motion; 2:20 compare maps; 2:50 switch night and identify directional/point/spot plus specular highlights; 3:30 compare shadows and explain the extra render pass/map resolution. Use the live application throughout.
