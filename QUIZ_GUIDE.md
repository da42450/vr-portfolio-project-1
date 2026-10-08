# Learn the code you are submitting

The personalized quiz is 30% of the assignment. Practice answering aloud **without this file**. Give the actual method, number, event and tradeoff, not a generic definition. If you cannot explain a feature, inspect/run it before recording a claim.

## Demo 1: hierarchy, UVs, lights

**How do the gondolas remain level?** The wheel adds θ around local Z; the leveling pivot, its child, adds −θ. Parent and child rotations compose to zero roll. The platform only yaws about vertical. The cabin still inherits the wheel's orbital position. The seat has its own small rocking X rotation. The HUD checks the cabin's world up-vector against world vertical.

**Why use a hierarchy instead of assigning world positions?** Child coordinates are defined in their parent's frame. Changing a parent automatically carries the whole attached subtree. In rider view, the camera is actually parented to the rocking seat; it inherits all ancestor movement. `getWorldQuaternion` queries the composed rotation, while `.rotation` changes a local rotation.

**What breaks when compensation is removed?** The pivot's local roll becomes zero, so its world roll is the wheel's angle. Cabins tip. B intentionally injects this failure; it is not a discovered real-world hardware bug.

**How is your own model unwrapped?** `cabin.js` authors four tapered wall quads. Each wall's four UV corners occupy a quarter of the texture's U axis, with V from bottom to top. Adjacent geometric walls have separate vertices so they can have separate normal/UV values. Each quad is two indexed triangles. Floor/roof are separate meshes.

**What does a normal map change?** It changes the normal used in lighting, not the silhouette or geometry. RGB stores tangent-space directions and is interpreted as linear data. The corrugation texture changes visible highlights. An emission map marks a strip as bright; it does not illuminate surrounding geometry in this renderer.

**Which light is which?** Directional: roughly parallel sunlight. Point: light radiating around the wheel, with distance attenuation. Spot: light in a cone toward the loading area. Hemisphere is the ambient fill. Diffuse responds to the surface/light angle; specular depends on view direction and roughness/metalness.

**What do shadows cost?** A shadow-casting light renders another view of shadow-casting geometry to a depth map before the main view. Directional uses one 1024² map by day; spotlight uses one 512² map at night. The point light does not cast shadows because its cube map would need six faces. H allows a live comparison; the HUD reports actual draw calls.

**What real error was fixed?** The authored wall normals/winding initially pointed inward because the cross-product order was reversed. A face-normal dot outward-position test exposed it. Reversing the operands and triangle indices fixed it. Tests now check normal direction, winding and UV ranges. Double-sided rendering can conceal this sort of mistake, so an explicit check matters.

## Demo 2: fixed-step simulation and tracking

**What are the systems?** Machine launch, flight under gravity/drag/Magnus, tracked paddle contact, table/floor bounce and rolling, and wind through air-relative velocity. Spin makes flight and contact interact: it affects lift during flight and tangential slip at a bounce.

**Why does a machine feed clear the net?** The speed preset sets forward velocity. `FeedTrajectory` predicts the first table-height crossing using the same forces and timestep as play. If it lands too short, increase initial upward velocity; if too far, decrease it. Sixteen binary-search steps aim for z=0.85 on the player's half, and the result is cached per preset. Tests cover all 24 speed/spin/wind combinations against actual table/net colliders. No forces or net collision are disabled, and there is no steering after launch. A weak, low player return can still hit the net normally.

**What values are sourced?** ITTF: 40 mm diameter, 2.7 g ball; table 2.74×1.525 m with top at 0.76 m; 30 cm drop produces approximately 23 cm rebound. Gravity is 9.80665 m/s²; density is approximately 1.225 kg/m³. Other coefficients are identified as approximations or calibrated design values in PARAMETERS.md. Never call an assumed friction coefficient a measured manufacturer number.

**Where and how do forces run?** `Trainer.FixedUpdate` runs at 180 Hz. `BallPhysics.Integrate` uses semi-implicit Euler: add acceleration×dt to velocity, then updated velocity×dt to position. Contact is checked four times per physics step. Update handles sampled tracking/buttons and HUD, not force integration.

**Explain drag and Magnus.** Drag opposes the ball's velocity relative to wind and scales with its speed squared, frontal area, density and Cd. Magnus lift points along ω×v and depends on spin ratio. Here the lift coefficient is capped at 0.6, a stated approximation. Positive/negative spin reverses lift direction. Real ball aerodynamics can be more complicated than this model.

**How does swing speed enter the response?** `TrackedPose.Update` calculates `(current position − previous position)/deltaTime` and angular change/deltaTime. The paddle is kinematic. Its contact-point velocity adds angular velocity cross the offset from controller to contact. The impulse is computed using ball velocity relative to that moving surface. Swing direction and racket orientation change the outgoing direction.

**Why is the paddle aligned with my hand?** Tracking uses the grip/palm pose, not the pointing ray. `PaddleGrip` rotates the model shaft toward grip +Z and its face normal toward grip +X. It places the face so the handle center is exactly at the palm: face position = grip position − rotated handle offset. Visuals follow the controller each render frame; physics uses that same transform rule in FixedUpdate. This separates a natural holding pose from a UI aiming pose without changing the collision rules.

**How do the settings buttons work?** The left controller's Touch aim pose supplies a four-metre ray. `TrainerMenu` finds a button collider, highlights it, and calls its callback only on the trigger's rising edge; holding trigger does not repeat clicks. `Trainer` owns the actual settings. Speed clamps within 3.5–6.5; spin buttons set 0/−40/+40 directly and highlight only the selected preset. The button animates/haptics on activation without moving its collider. Update handles this interaction; FixedUpdate continues the same ball solver. Bounce measurement temporarily blocks feed/restart, so a click cannot interrupt the benchmark. A Resources material retains the lightweight stereo-compatible unlit panel shader.

**How is tunneling prevented?** The ball moves as an explicitly simulated state. A sphere cast examines the complete old→new segment against world colliders. A relative sweep examines ball/paddle poses against the moving elliptical face; four substeps account for its changing orientation. Endpoint-only overlap would miss a ball that crosses a thin surface in one step. The kinematic Rigidbody's flag is not the entire contact method.

**Restitution versus friction?** Restitution controls reversed normal speed. The racket uses the published fit `0.878−0.020×normal impact speed`, bounded to 0.2–0.95; its normal rebound weakens at higher speed. Table restitution 0.918 is calibrated to the drop benchmark, and table sliding friction is the sourced 0.25. Tangential friction acts on contact slip, including spin, changing both translation and rotation. The shell inertia assumption is I=2/3 mr². That coupling is why opposite spin gives different table bounce behavior.

**What did you validate?** The independent numerical check gave 23.004 cm rebound; the actual Unity editor scene gave 23.054 cm, against the ITTF's approximately 23 cm benchmark. It also checked spin changes bounce and a high-speed segment cannot skip the racket. These are limited checks, not proof every trajectory matches real equipment. Run the same in-app measurement on Quest and report the result you actually see.

**How does timestep affect accuracy and cost?** The configured 1/180 s step with four contact substeps is 720 sweep queries per simulated second for one ball. Larger steps make force integration less accurate and can miss rapid rotation; smaller steps cost CPU. The fixed-size cast buffer, one-ball loop and pooled impact voices bound work. At 72 Hz a complete frame has 13.89 ms; the displayed physics CPU time is only part of that frame, not total GPU/CPU time.

**Why does the audio count as 3D?** Approach follows the ball; an impact source is placed at the world contact; ambience is positioned in the room. Mono clips use spatialBlend=1 with attenuation/panning/Doppler. Table, floor and paddle tones differ; speed varies volume/pitch. No additional HRTF plugin is used. Turn your head during an approach to demonstrate direction.

## Demo 3: state, events and constrained manipulation

**What stores progress?** `Procedure.step`, the error count, completion flag and three spray-coverage timers. Eight explicit states have an expected event. The model rejects an event that does not match the current step or its prerequisites. The state logic is separate from the scene input that generates those events.

**How does guidance work?** There is only one guided walkthrough, with the current step, its highlight, and an optional hint. Controls appear only when relevant: safety at the start, a pressure CHECK button during inspection, Finish after sweeping. Mistakes preserve progress for recovery; Reset starts a fresh walkthrough.

**How do the hose and powder work?** The rubber hose is a small tube along a sagging curve between the valve and the nozzle's rear. It is visual geometry, not rope physics. White powder starts at the nozzle mouth and moves along the aiming direction. A fixed 192-particle pool reuses memory and makes one points draw call. The aimed-ray/coverage timers, not particle collisions, decide when each fire section goes out. This separates cheap visual feedback from the simple procedure rules.

**What happens on a wrong part?** A WATER grab generates `wrong-part`. It increments errors and displays corrective feedback but does not advance or erase the step. Choose ABC and continue; record this recoverable mistake for the rubric.

**What detects grabbing/placing?** A side-grip press searches eligible object-local grip spheres: handle 0.18 m, tank 0.17 m, pin 0.085 m, nozzle 0.12 m. The sphere centers are transformed to world coordinates and compared with the controller grip position. An inactive pin/nozzle is skipped instead of blocking tank pickup. The object becomes a child of the grip transform; the tank's handle offset is compensated so the handle stays in the hand. Release generates an event and snaps the object to its designated bench/tray/holster. Index-trigger rays select signs/gauge, or operate a held tool. These are scripted proximity/event volumes; there is no general rigidbody collision solver in the web trainer.

**What caused the reported pickup bug?** The old 0.23 m check measured from the tank's bottom origin, 0.52 m below its handle. A hand on the handle could miss the tank or select the adjacent, unavailable pin. Authored grip centers and read-only availability filtering fixed those mechanisms. Tests reproduce the old miss and verify actual attach/release logic; physical Quest retesting is still needed.

**Why recenter the bench?** The tracked floor origin can be far from where the user is standing. On entry, the workspace is translated to the tracked head's horizontal position, rotated toward its heading and shifted vertically by head height minus the 1.6 m design height. The tools remain within reach. Left X repeats this, releases tools safely and preserves the procedure state.

**How does the pin constraint work when the tank moves?** It converts the pin's current world position to the tank's local frame, keeps its local Y/Z fixed and clamps local X travel to 0–0.2 m. Beyond 0.15 m generates the pin event. Converting back to world position preserves that constraint even while another hand moves the body.

**Why two hands?** The squeeze event verifies that body and nozzle holders are distinct controllers. The body carries the lever, and the other hand aims the nozzle. The nozzle is bounded to a 0.9 m tether. The lever has a 0–0.3 rad scripted hinge. These are real manipulated objects, not only next-step buttons in VR.

**Why distinguish grip and pointing poses?** WebXR grip space positions a held object, while target-ray space defines ergonomic pointing. The nozzle stays attached at the grip but its local quaternion is `inverse(parent world rotation) × controller ray world rotation`. Its world forward therefore matches the pointing ray even when the two tracking poses differ. The aiming line and the white spray follow the actual nozzle ray.

**What counts as sweeping?** The nozzle's forward ray must come near a fire-base region. Each of three regions needs 1.2 seconds of spray. A single stationary aim does not finish all regions. Coverage reduces the visible fire, then verification completes the procedure.

**What tradeoff did you choose?** Scripted constraints keep the interactions stable, inexpensive and explainable, but do not simulate an elastic hose, tool deformation or fire chemistry. In-world highlighting and hints improve discoverability. Controller testing is necessary to confirm the thresholds work in practice.

## Demo 4: locomotion, coordinate spaces and comfort

**What is the search task?** Four signed warehouse regions contain 25 similar bins. Five exact codes are targets; twenty are distractors. A Set prevents duplicates. Score is `max(0,1000−2×seconds−25×wrong selections)`. Timer starts on movement/selection and freezes at completion. Inventory selection requires proximity within 2 m, so travel is necessary.

**Why are there two distinct systems?** Smooth travel integrates a continuous velocity from the joystick. Teleport relocates the user to a sampled ray destination during a fade. Fade/no-fade variants alone would still be one system. Both work through the whole flat-floor warehouse and can be switched in the world.

**Head-relative versus world-relative?** Smooth movement projects the headset's forward direction onto the ground; the right direction is perpendicular to it. The rig moves along those vectors. Local tracking poses still report the user's real movement inside the physical space. Teleport adjusts rig position by destination minus current world head position, preserving room-scale offset correctly. Turning pivots about the user's head.

**Why does vignette help?** It darkens peripheral vision during continuous translation/rotation, reducing peripheral optic flow. It doesn't make the inner ear detect virtual acceleration. It is one comfort option, not a guarantee against sickness.

**Why snap, fade, speed and calibration?** Snap avoids prolonged rotational flow. Fade masks the jump. Lower speed reduces artificial visual motion. Seated calibration gives a usable eye height for the current posture. View reset faces the starting aisle at the current position without changing height or hunt progress. All are configurable in the world.

**How was Reset View fixed?** Requesting another `local-floor` reference space did not cancel the artificial turn; the student observed a small height change instead of a heading reset. The corrected action reads the current world forward vector and adds yaw `atan2(forward.x, −forward.z)` to face world −Z. It rotates around the head, compensating rig X/Z with the head's before/after position so a real tracking offset does not orbit into another location. It does not change Y, recalibrate height, replace the tracking reference space or reset the hunt. Height calibration is a separate button. Test it at the start with three right snap turns: the **A RECEIVING ← → B TOOLS** sign should return in front, with eye height unchanged.

**What persists?** Validated travel, turn, speed, seated and vignette preferences are saved as JSON in localStorage. A page restart reloads them. Eye-height offset is recalculated from the current tracked head, rather than reusing a potentially stale room pose. Test persistence by changing settings and restarting the browser.

**Which method suits the warehouse?** Teleport is comfortable for long aisle jumps and pauses for code inspection; smooth motion offers fine movement and continuous exploration. Explain the comfort/speed tradeoff with your actual test rather than claiming everyone prefers one method.

## One rehearsal

Close this guide and answer eight questions: gondola compensation; authored UVs and normal-map data; the real mesh bug; timestep/CCD; the bounce measurement and its limits; wrong-part recovery/two-handed constraints; two travel systems; and why vignette/snap/fade/calibration work. Reopen the actual code for any answer that is vague. Add the personal measurements and issues from your Quest test to the READMEs before recording.
