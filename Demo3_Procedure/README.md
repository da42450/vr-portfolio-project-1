# Demo 3 — PASS extinguisher procedure

An arm's-reach WebXR trainer with eight explicit states. It uses controllers, not hand tracking. The procedure follows USFA's PASS guidance, expanded with safety checks, correct extinguisher selection, pressure inspection and completion verification.

## Run and controls

`npm start` from the portfolio root; open `http://localhost:8080/Demo3_Procedure/`. Quest: open the eventual public HTTPS URL and select Enter VR.

Grip close to an object to hold it; release grip to release it. Trigger on a free hand selects the in-world signs/gauge. Once the body/nozzle are held, trigger squeezes the lever. Hold the extinguisher in one hand and the nozzle in the other. Pull the pin along its X axis. Aim low and sweep the nozzle across all three base regions. Release the nozzle before using the free hand to confirm completion.

The H / Hint button and R / Reset button also exist in the world. Desktop buttons simulate the same events for inspection: confirm safety, hold body, check pressure, pull pin, hold nozzle, aim base, toggle spray, and move to the next sweep section. Space toggles spray; J steps through sweep sections; arrows adjust the nozzle continuously. Shift-drag chooses the left simulated hand. Desktop completion is **not** evidence of real VR manipulation.

Deployment: **pending public HTTPS URL**. Video: **pending your YouTube link**.

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

The pin is constrained in the body frame, independent of the body's world movement. The lever is a scripted hinge limited to 0–0.3 radians. The nozzle is constrained to a 0.9 m tether from the tank's valve. Grabs attach objects to the controller grip frame, making them kinematic in the hand. A release reparents the object to the world and snaps it into its tray/holster as appropriate. Both hands can pick up the body, pin and nozzle; the body/nozzle operation specifically requires different hands.

Instructions, active-part highlights, a pressure dial, coverage feedback and a hint remain visible in the world. Simple scripted constraints were chosen to keep the manipulation predictable and explainable; the cost is simplified mechanics and less physically authentic hose motion. There is no collision solver or simulated smoke. Meshes are small and no dynamic shadow maps are used. The actual Quest refresh-rate check is still required.

## Sources and known issues

- [USFA: choosing and using extinguishers](https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/fire-extinguishers/): safety prerequisites, pressure checks, PASS.
- [OSHA: extinguisher use](https://www.osha.gov/etools/evacuation-plans-procedures/emergency-standards/portable-extinguishers/use): aim at the base, squeeze, sweep, evacuation.
- [Professor's rubric](https://vr26.vn.ugavel.com/PortfolioProject1/).
- Geometry and textures are original. Pin travel, tether length, coverage time and fire size are clearly stated training-design settings, not manufacturer specifications.
- A classroom interaction exercise, not certification or a substitute for workplace instruction. USFA advises evacuation if safety prerequisites are uncertain.
- The pressure/inspection event assumes the supplied ABC tank is serviceable; the WATER tank tests wrong-part detection. No actual fire chemistry is simulated.
- Public URL, headset manipulation/performance check, and personal video are pending. Controller pointing conventions must be verified on a Quest.

## Video proof (about 5 minutes)

Show the headset view and a live-action inset throughout. Demonstrate a wrong part or early action, recover, and complete all eight states. Show an actual pin pull, both controller grabs/releases, the nozzle constraint, lever hinge, snap tray, hint and reset. Explain which event each interaction sends, why state survives an error, and why scripted constraints were chosen.
