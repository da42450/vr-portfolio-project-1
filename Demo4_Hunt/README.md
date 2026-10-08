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

`hunt.js` tracks a set of found IDs, elapsed time, mistakes and score. Duplicate items do not count twice. The score starts at 1000 and subtracts 2 per second and 25 per wrong selection. Time starts on first movement/selection; time, score and selections freeze at completion until New Hunt. An October 8 regression caught and corrected wrong selections reducing the score after completion. A dispatch board, left-controller checklist and desktop HUD show progress. The two mechanisms work throughout the warehouse: joystick integrates heading-relative velocity; teleport samples a ballistic controller ray, finds an unobstructed floor point, and relocates the rig during a black fade. Both reject points inside expanded wall/shelf bounds.

Smooth travel projects the headset forward vector onto the floor. Movement checks X and Z independently so the player can slide along a wall rather than get stuck. Teleport preserves the headset's physical offset within the rig so the selected point is where the user's head ends up. Rotation occurs around the tracked head position rather than swinging the user around the rig origin.

The in-world menu has travel mode, snap/smooth turning, speed, seated mode, vignette, height calibration and view reset. Preferences are validated and saved to `localStorage` under `warehouse-comfort-v1`, surviving a page/browser restart. Height calibration is recalculated for the current tracking origin; we persist the seated preference rather than a stale physical pose.

**Seated ON / OFF:** sit before selecting ON; stand before selecting OFF. Each switch takes one fresh headset measurement and sets a comfortable **1.6 m virtual eye height** for that posture. Calibrate Height repeats the measurement if the chair/posture changes. The small settings readout reports the current mode and virtual eye height. The fixed offset is then retained, so normal head motion, leaning and crouching remain tracked—not locked at 1.6 m. The open menu is repositioned after calibration so it stays within reach. Switching posture does not move you horizontally, change direction, or reset hunt progress.

On October 8 the student reported a normal seated view but an excessively tall standing view with Seated OFF. The old OFF action discarded the height correction; entry calibration could also run before a tracked pose existed. The correction in `height.js` waits for a valid `XRFrame.getViewerPose` measurement and computes `offset = 1.6 − nativeHeadY` once, including when switching OFF. It uses native reference-space Y, not already-adjusted world-camera Y, so offsets do not compound. Tests model both normal and biased floor origins; the headset's actual floor offset has not been measured, so those tests are not a claim of the physical root cause. This deliberately replaces the old OFF/native-height policy: both modes use an authored normal eye height at calibration rather than preserving individual physical stature. Calibrated offsets are session-local and discarded on VR exit/re-entry. **Physical Quest confirmation of the corrected posture switching remains pending.**

**Reset View** faces the warehouse's starting-aisle direction (world −Z) at the current position and closes the menu. It preserves eye height, seated calibration, physical tracking poses and hunt progress; it does not teleport to the start. **Calibrate Height** remains a separate action. At the starting position, reset should bring the overhead **A RECEIVING ← → B TOOLS** sign back in front of you after a virtual turn.

The earlier reset re-requested `local-floor` and calibrated height without undoing artificial yaw. On October 8 the student reproduced this on Quest: the view lowered slightly and did not face the sign. The correction in `view.js` obtains the current world forward vector, applies yaw `atan2(forward.x, −forward.z)`, and compensates rig X/Z by the head's before/after position. This pivots around the tracked head rather than swinging a room-scale offset around the rig origin. It leaves Y and the tracking reference space unchanged. Regression tests cover three right snap turns, physical yaw, seated/standing height, repeated resets, unchanged hunt state and both button bindings; the actual desktop button restores the aisle sign. **Physical Quest confirmation of the corrected version is still pending.**

| Feature                  | Why it helps                                                              |
| ------------------------ | ------------------------------------------------------------------------- |
| Motion vignette          | Reduces peripheral optic flow while translating/turning                   |
| 30° snap turning         | Avoids continuous artificial rotational flow                              |
| Optional smooth turn     | Allows gradual pointing for users who prefer it                           |
| Teleport fade            | Hides the discontinuous jump; does not remove all discomfort              |
| 0.5–3 m/s speed          | Lets the user reduce artificial movement                                  |
| Seated/calibrated height | Makes reach and view height usable from the current posture               |
| View reset               | Faces the starting aisle without relocating or changing calibrated height |

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
