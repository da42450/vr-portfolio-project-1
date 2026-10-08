# Demo 3 — PASS extinguisher procedure

An arm's-reach, guided WebXR fire-response trainer with **seven substantive outcomes**: activate the alarm, simulate notifying help, validate a suitable extinguisher, then Pull, Aim, Squeeze and Sweep. It uses controllers, not hand tracking. Picking up a tool, looking around and clicking a final acknowledgment are **not** counted as extra steps. This revision follows the professor's October 7 clarification supplied by the student.

## Run and controls

`npm start` from the portfolio root; open `http://localhost:8080/Demo3_Procedure/`. Quest: open the public HTTPS deployment below in the Quest browser and select Enter VR.

**Quest controls:** hold **side GRIP** near the cream-colored alarm bar and pull it down to its stop. Release GRIP. Point a free controller at the raised **CALL HELP** control and press index trigger; it is clearly marked **SIMULATED CALL** and never calls a real emergency service. Then hold an extinguisher at its handle with GRIP and use the free hand's trigger to select its raised **CHECK** button. The left red ABC has green pressure; the right red ABC is undercharged; the blue WATER is unsuitable for the energized electrical equipment shown. Wrong choices give feedback without erasing progress.

Suggested PASS hand assignment: **left tank, right pin/nozzle**. While holding the accepted tank, pull its pin sideways with the other hand and release it into the snap tray. Grip the nozzle and aim low. **Hold the index trigger on the TANK hand to squeeze** while the other hand aims; the nozzle hand cannot operate the tank's valve. Sweep all three sections. Fire-out completes automatically—there is no Finish button. Release trigger and grips. A green hand marker indicates a valid pickup; successful grabs give haptic feedback where supported.

The held nozzle is positioned at the grip but aims along that controller's pointing pose, which is not necessarily the same rotation as the grip pose. Its blue aiming line turns green over a fire-base region and hides during spray. White powder particles come from the nozzle's outlet while squeezing. This deliberate alignment favors predictable controller aiming over a model-specific hand pose.

**Guided only:** one short direction, seven progress dots, an active-part highlight, and a toggled on-demand Hint card. Pressure CHECK controls appear only during readiness validation. The alarm latches down with an active lamp; the call station shows help notified; the two pressure needles differ. Wrong order, WATER and low pressure are recoverable errors that preserve progress. Reset clears progress, errors, alarm/call outcomes, removed parts and spray, then restores the whole station.

The bench automatically centers in front of your head at VR entry and adjusts its working height to your current head height. **Left X** or the in-world RECENTER BENCH button places it in front of you again, releasing held tools safely while retaining procedure progress. Face the desired workspace direction before recentering. It is a workspace adjustment, not a locomotion system.

Hint and Reset also exist in the world. Desktop buttons appear only for the current step and simulate the same checked events; these HTML controls are not visible in immersive VR. Space toggles spray; J steps through sweep sections; arrows adjust the nozzle continuously. H requests a hint; R resets. Shift-drag chooses the left simulated hand. Desktop completion is **not** evidence of real VR manipulation.

Deployment: [GitHub Pages / WebXR](https://da42450.github.io/vr-portfolio-project-1/Demo3_Procedure/). Video: **pending your YouTube link**.

## States and detection

1. **Alarm active:** grip/pull the station-local downward slider. Travel is constrained to 0–0.11 m; activation requires at least 0.09 m. A pickup alone does not activate it.
2. **Help notified (simulation):** index-trigger the call station after alarm activation; its button depresses briefly and status changes. An early call is rejected without advancing.
3. **Suitable tool validated:** hold a tank and select CHECK. Type must be ABC and pressure must be green. The actual low-pressure candidate fails; pickup alone never advances the state.
4. **Extinguisher unlocked:** hold the accepted tank and pull its constrained pin more than 0.15 m outward.
5. **Nozzle aimed:** hold the nozzle and align its forward ray with a base region within the authored 1.5 m spray range, unobstructed by the bench/equipment.
6. **Discharge started:** squeeze the tank-hand trigger with tank/nozzle in different hands and live aim at the base.
7. **Fire extinguished:** sustained sweep supplies 1.2 seconds of coverage to each of three regions, then completes automatically. The regions are one sweep outcome, not three padded steps.

`procedure.js` owns state, explicit outcome flags, prerequisites, errors and coverage. `main.js` generates measured events from grip volumes, trigger rays, release events and constrained motion. `mechanics.js` handles alarm travel and finite-range ray/base tests; ray/mesh intersections with the bench and equipment block covered targets. Errors preserve prior outcomes. Dropping either tool stops spray; a stalled frame grants at most 0.05 seconds of coverage. Completion freezes further events until Reset. The ray/base test is a scripted trigger-volume model, not fire-fluid simulation.

Pickup uses authored object-local grip spheres rather than distance to the model's origin: handle radius 0.18 m, tank 0.17 m, pin 0.085 m and nozzle 0.12 m. These generous teaching tolerances are design values, not physical specifications. An inactive pin/nozzle cannot intercept a tank pickup. The handle's local position is compensated during attachment, so it stays at the controller's grip pose when the tank rotates. Colored hand markers provide pickup/holding feedback without a permanent text panel.

The alarm moves only down its station's local Y axis and stays latched at its stop after activation. The pin moves in the tank's local X axis even when the tank rotates. The squeeze lever is a scripted hinge from −0.3 radians (raised/open) to 0 (closed down toward the fixed carrying handle). The nozzle is bounded to a 0.9 m tether from the tank's valve. Grabs attach objects kinematically to the grip transform. Every constrained held frame starts from the original grip offset before projecting/clamping; otherwise previous corrections would accumulate as drift. Release snaps tanks to their stands, pin to its tray and nozzle to its holster. Both hands can grab/release; tank/nozzle must use different hands. Exiting VR releases tools.

`cards.js` draws original, high-contrast text textures and raised button faces. `visuals.js` provides the curved hose, ribbed nozzle, coupling and 192 pooled white powder sprites emitted at its mouth. Each hose reuses an 18-segment, eight-sided geometry buffer. Sprites are visual feedback, not colliders; finite-range, obstruction-checked coverage extinguishes the fire. Scripted constraints keep interactions stable and explainable, at the cost of no elastic hose, general rigidbody collisions, smoke or fire chemistry. Tanks are authored pressure conditions, not pressurized fluid simulations. Meshes are small and no dynamic shadow maps are used. Actual Quest interaction and refresh-rate checks remain required.

## Sources and known issues

- [USFA: choosing and using extinguishers](https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/fire-extinguishers/): safety prerequisites, pressure checks, PASS.
- [OSHA: extinguisher use](https://www.osha.gov/etools/evacuation-plans-procedures/emergency-standards/portable-extinguishers/use): alarm, notifying help, appropriate extinguisher, PASS and post-fire caution.
- [Professor's rubric](https://vr26.vn.ugavel.com/PortfolioProject1/).
- [WebXR input poses](https://www.w3.org/TR/webxr/#xrinputsource-interface): grip-space attachment and target-ray pointing are distinct coordinate frames.
- Geometry and textures are original. Pin travel, tether length, coverage time and fire size are clearly stated training-design settings, not manufacturer specifications.
- A classroom interaction exercise, not certification or a substitute for workplace instruction. USFA advises evacuation if safety prerequisites are uncertain.
- This scenario assumes a small contained fire, safe air, a clear escape route and a trained user. These conditions are disclosed, not claimed to have been assessed merely by looking around. There is no actual phone network, alarm network or energized electrical system. No arbitrary electrical disconnection step is added.
- Release/observe/back-away guidance appears at completion but is not counted as another task. There is no modeled re-ignition or emergency certification.
- Headset manipulation/performance checks and the personal video are pending. Controller pointing conventions must be verified on a Quest.
- A reported Quest pickup bug was traced to checking the tank's bottom origin instead of its handle, and allowing inactive nested parts to steal the grab. Regression tests cover the real grab/attach/release methods, both hands, part availability, rotated/recentered workspaces and pointer target resolution. Browser completion is tested separately; neither substitutes for a physical Quest retest.

## Video proof (about 5 minutes)

Show the headset view and live-action inset throughout. Demonstrate alarm pull, simulated call, a wrong part/low-pressure rejection and recovery without Reset, then complete all seven outcomes. Show both hands, actual pin pull, tether, tank-hand squeeze/lever, white spray, all three coverage sections, automatic completion, Hint and Reset. Explain why pickup/gaze/Finish are not counted, the measured events, recovery and scripted-versus-physical tradeoff. Follow the updated [recording script](../RECORDING_GUIDE.md).
