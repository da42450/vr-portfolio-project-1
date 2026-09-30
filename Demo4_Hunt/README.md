# Demo 4 — Warehouse inventory hunt

A 26.6 m wide, four-region warehouse with Receiving, Tools, Parts, and Shipping zones, a central aisle, cross-passages, dispatch landmark, signs and colour-coded floors. Find **AX-104, BX-208, CX-306, DX-412, EX-510** among **20 distractors**, all presented as similar boxes with look-alike stock codes.

## Run and controls

`npm start`; open `http://localhost:8080/Demo4_Hunt/`. On Quest open the public HTTPS deployment below in the Quest browser and select Enter VR.

- Left stick: smooth travel when selected.
- Left trigger: commit the visible teleport arc when teleport is selected.
- Right stick: snap or smooth turn.
- Right trigger: select stock within 2 m, or operate the settings menu.
- Left X: open the in-world settings menu. The dispatch landmark also opens it.
- Desktop: WASD in smooth mode; floor click in teleport mode; drag empty background to look; Q/E turn; click stock to collect. M opens settings, L switches travel, R resets the hunt.

Deployment: [GitHub Pages / WebXR](https://da42450.github.io/vr-portfolio-project-1/Demo4_Hunt/). Video: **pending your YouTube link**.

## Implementation and comfort

`hunt.js` tracks a set of found IDs, elapsed time, mistakes and score. Duplicate items do not count twice. The score starts at 1000 and subtracts 2 per second and 25 per wrong selection. Time starts on first movement/selection and freezes at completion. A dispatch board, left-controller checklist and desktop HUD show progress. The two mechanisms work throughout the warehouse: joystick integrates heading-relative velocity; teleport samples a ballistic controller ray, finds an unobstructed floor point, and relocates the rig during a black fade. Both reject points inside expanded wall/shelf bounds.

Smooth travel projects the headset forward vector onto the floor. Movement checks X and Z independently so the player can slide along a wall rather than get stuck. Teleport preserves the headset's physical offset within the rig so the selected point is where the user's head ends up. Rotation occurs around the tracked head position rather than swinging the user around the rig origin.

The in-world menu has travel mode, snap/smooth turning, speed, seated mode, vignette, height calibration and view reset. Preferences are validated and saved to `localStorage` under `warehouse-comfort-v1`, surviving a page/browser restart. Height calibration is recalculated for the current tracking origin; we persist the seated preference rather than a stale physical pose.

| Feature                  | Why it helps                                                              |
| ------------------------ | ------------------------------------------------------------------------- |
| Motion vignette          | Reduces peripheral optic flow while translating/turning                   |
| 30° snap turning         | Avoids continuous artificial rotational flow                              |
| Optional smooth turn     | Allows gradual pointing for users who prefer it                           |
| Teleport fade            | Hides the discontinuous jump; does not remove all discomfort              |
| 0.5–3 m/s speed          | Lets the user reduce artificial movement                                  |
| Seated/calibrated height | Makes reach and view height usable from the current posture               |
| View reset               | Resets the reference space/orientation when it drifts or starts awkwardly |

The sensory conflict is that the eyes report virtual acceleration while the vestibular system does not. Teleport is useful for comfortable aisle traversal; smooth motion supports gradual exploration and reading nearby labels but may be less comfortable. Which is faster depends on route and user preference; measure it instead of assuming.

Shared shelf geometry/materials, no dynamic shadows, a bounded world and a small number of interactive items keep rendering simple. The browser HUD reports actual frame rate and draw calls. Quest frame rate is not verified yet.

## Sources and known issues

- [Professor's locomotion brief/rubric](https://vr26.vn.ugavel.com/PortfolioProject1/) and lecture 5.
- [WebXR reference spaces](https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace), [Three.js WebXRManager](https://threejs.org/docs/#api/en/renderers/webxr/WebXRManager).
- All world assets are original procedural geometry. IDs, map size, speed presets, score and timer rules are authored design values.
- Physical room-scale walking can enter a virtual wall; the collision bounds constrain artificial movement, not the user's real body. Quest's boundary still applies.
- Desktop teleport is an inspection control; the Quest uses the curved controller ray and floor marker. The floor is flat.
- On-device controller bindings, stereo vignette, teleport fade, height reset, and sustained headset frame rate must be checked before recording. The personal video remains pending.

## Video proof (about 5 minutes)

Show headset and live-action inset throughout. Demonstrate close code inspection, target/distractor discrimination, all four signed regions and progress/time/score. Switch travel methods mid-hunt and use both through doorways. Show every comfort setting, calibrate height, reset view, and reload to prove settings persistence. Explain peripheral optic flow and visual/vestibular mismatch while using the corresponding settings.
