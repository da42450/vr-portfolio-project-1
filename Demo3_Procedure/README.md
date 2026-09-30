# Demo 3 — PASS extinguisher procedure

An arm's-reach WebXR trainer with eight explicit states. It uses controllers, not hand tracking. The procedure follows USFA's PASS guidance, expanded with safety checks, correct extinguisher selection, pressure inspection and completion verification.

## Run and controls

`npm start` from the portfolio root; open `http://localhost:8080/Demo3_Procedure/`. Quest: open the public HTTPS deployment below in the Quest browser and select Enter VR.

**Quest controls:** bring a controller to the carrying handle or tank and **hold the side GRIP button**, not the index trigger. A green hand marker indicates a valid pickup; a successful grab gives a short haptic pulse where supported. Release GRIP to place the object. The index trigger on a free hand selects the signs or gauge (the larger CHECK PRESSURE sign is an alternative after inspecting the needle). With the tank and nozzle in different hands, the index trigger sprays. Pull the pin outward along the tank's local X axis; aim the nozzle down at the base and sweep all three regions. Release the nozzle to free a hand for verification.

The held nozzle is positioned at the grip but aims along that controller's pointing pose, which is not necessarily the same rotation as the grip pose. Its blue aiming line turns green over a fire-base region and white during spray. This deliberate alignment favors predictable controller aiming over a model-specific hand pose.

The bench automatically centers in front of your head at VR entry and adjusts its working height to your current head height. **Left X** or the in-world RECENTER BENCH button places it in front of you again, releasing held tools safely while retaining procedure progress. Face the desired workspace direction before recentering. It is a workspace adjustment, not a locomotion system.

The H / Hint button and R / Reset button also exist in the world. Desktop buttons simulate the same events for inspection: confirm safety, hold body, check pressure, pull pin, hold nozzle, aim base, toggle spray, and move to the next sweep section. Space toggles spray; J steps through sweep sections; arrows adjust the nozzle continuously. Shift-drag chooses the left simulated hand. Desktop completion is **not** evidence of real VR manipulation.

Deployment: [GitHub Pages / WebXR](https://da42450.github.io/vr-portfolio-project-1/Demo3_Procedure/). Video: **pending your YouTube link**.

## States and detection

1. Confirm alarm/contained fire/clear exit.
2. Grab the ABC extinguisher.
3. Inspect the pressure dial and select it when its needle is in green.
4. Pull the pin until its constrained slide exceeds 0.15 m.
5. Remove the nozzle and align its forward ray with a base region.
6. Squeeze while separate hands hold the body and nozzle.
7. Sweep: each of three base regions requires 1.2 seconds of aimed spray.
8. Release and verify completion; reset starts another attempt.

`procedure.js` owns state and prerequisites. `main.js` generates events from proximity grab volumes, trigger rays, release events and constrained motion. Wrong order or the WATER extinguisher produces feedback and an error count; it preserves progress, so a user recovers without restarting. The ray-to-base test is a scripted trigger volume, not fire-fluid simulation.

Pickup uses authored object-local grip spheres rather than distance to the model's origin: handle radius 0.18 m, tank 0.17 m, pin 0.085 m and nozzle 0.12 m. These generous teaching tolerances are design values, not physical specifications. An inactive pin/nozzle cannot intercept a tank pickup. The handle's local position is compensated during attachment, so it stays at the controller's grip pose when the tank rotates. The in-world status identifies what each hand can grab or is holding.

The pin is constrained in the body frame, independent of the body's world movement. The lever is a scripted hinge limited to 0–0.3 radians. The nozzle is constrained to a 0.9 m tether from the tank's valve. Grabs attach objects to the controller grip frame, making them kinematic in the hand. Each frame starts from the original attachment offset before applying the pin/tether constraint; otherwise corrections accumulate and the tool drifts away from the hand. A release reparents the object and snaps it into its tray/holster as appropriate. Both hands can pick up the body, pin and nozzle; the body/nozzle operation specifically requires different hands. Exiting VR releases held tools.

Instructions, active-part highlights, a pressure dial, coverage feedback and a hint remain visible in the world. Simple scripted constraints were chosen to keep the manipulation predictable and explainable; the cost is simplified mechanics and less physically authentic hose motion. There is no collision solver or simulated smoke. Meshes are small and no dynamic shadow maps are used. The actual Quest refresh-rate check is still required.

## Sources and known issues

- [USFA: choosing and using extinguishers](https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/fire-extinguishers/): safety prerequisites, pressure checks, PASS.
- [OSHA: extinguisher use](https://www.osha.gov/etools/evacuation-plans-procedures/emergency-standards/portable-extinguishers/use): aim at the base, squeeze, sweep, evacuation.
- [Professor's rubric](https://vr26.vn.ugavel.com/PortfolioProject1/).
- [WebXR input poses](https://www.w3.org/TR/webxr/#xrinputsource-interface): grip-space attachment and target-ray pointing are distinct coordinate frames.
- Geometry and textures are original. Pin travel, tether length, coverage time and fire size are clearly stated training-design settings, not manufacturer specifications.
- A classroom interaction exercise, not certification or a substitute for workplace instruction. USFA advises evacuation if safety prerequisites are uncertain.
- The pressure/inspection event assumes the supplied ABC tank is serviceable; the WATER tank tests wrong-part detection. No actual fire chemistry is simulated.
- Headset manipulation/performance checks and the personal video are pending. Controller pointing conventions must be verified on a Quest.
- A reported Quest pickup bug was traced to checking the tank's bottom origin instead of its handle, and allowing inactive nested parts to steal the grab. Regression tests cover the real grab/attach/release methods, both hands, part availability, rotated/recentered workspaces and pointer target resolution. Browser completion is tested separately; neither substitutes for a physical Quest retest.

## Video proof (about 5 minutes)

Show the headset view and a live-action inset throughout. Demonstrate a wrong part or early action, recover, and complete all eight states. Show an actual pin pull, both controller grabs/releases, the nozzle constraint, lever hinge, snap tray, hint and reset. Explain which event each interaction sends, why state survives an error, and why scripted constraints were chosen.
