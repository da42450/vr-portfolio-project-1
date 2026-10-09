# Spoken action-cue scripts — Portfolio Project 1

Prepared October 8, 2026 for the current implementations.

Read every blockquote aloud, including the **bold action cues**. Bold means “perform this action now,” not “skip this sentence.” Bracketed pause notes and setup instructions are NOT spoken. When recording your voice first, actually leave the stated silence so you can hear the cue, do the action and see the result before the next explanation.

The pauses are starting points: rehearse once and extend any that are too short. Aim for 3–6 minutes per finished video. Operate during the cue when possible; use the following silence to finish and hold the result in view. Do not rush a swing, chair movement or controller action to match the track. Pause the cue playback if necessary.

These scripts cover the highest-level demo rubric evidence, but cannot guarantee a grade. A spoken claim does not replace showing the behavior. If a feature fails, stop and fix/retest rather than narrating that it worked.

## Before recording — not spoken

- Four separate narrated YouTube videos, public or unlisted, each 3–6 minutes.
- Demo 1 is desktop footage. Demos 2–4 require the Quest view AND a synchronized live-action inset of you throughout, including reloads and cuts.
- Your separate narration must match your actual actions. Keep Demo 2's game audio audible; use only one voice track to avoid echo.
- Wear wrist straps, clear the area and unplug USB before swinging. Prepare a stable chair for Demo 4 before the take.
- Collect the real measurements before recording the voice track. Replace bracketed values; never say a placeholder aloud. Demo 1's HUD gives FPS/draw calls. Demo 2's native panel gives FPS/physics-step time and the bounce result.
- Demos 3/4 need actual immersive Quest frame-rate evidence and headset refresh rate. Their desktop HUD and recording-file FPS do not establish that. Do not claim full-rate performance without measuring it. Keep the measurement sentences only after obtaining real values.
- Confirm the latest Demo 3 interactions and Demo 4 Reset View/height behavior in the headset before narrating a successful result.
- If a rehearsal exceeds six minutes, trim extra speech or idle loading and re-record. Do not drop required behavior or remove the live-action inset.

Source: [professor's requirements and grading rubric](https://vr26.vn.ugavel.com/PortfolioProject1/).

## Demo 1 — Ferris wheel

### Setup — not spoken

Open [Demo 1](https://da42450.github.io/vr-portfolio-project-1/Demo1_Ride/) on your Mac and reload. Start in ground view, day, running, maps ON, shadows ON and leveling fault OFF. Keep the HUD visible. Click empty canvas before keyboard shortcuts if a button has focus. Scroll zooms in ground view; drag the background to look around.

### Script

> “This is my Ferris-wheel graphics demo. The scene includes a custom textured cabin, different lights and switchable camera views. All ride motion is calculated in code.”

> **“Okay, I’m going to show the wheel and its cabins moving together.”**

[Pause 4 seconds — frame the complete ride and readable tilt/angle HUD.]

> “The hierarchy is turntable, wheel, leveling pivot, cabin, rocking seat and rider camera. The base turns, the wheel rotates and the seat rocks in their parent frames. The pivot counter-rotates by the wheel’s angle, keeping cabins upright. World tilt stays near zero.”

> **“Now I’m going to press B to turn the leveling compensation off.”**

[Pause 5 seconds — let the cabins visibly tip.]

> “The cabins now inherit the wheel’s roll and tip.”

> **“I’ll press B again to restore leveling, then P to pause.”**

[Pause 3 seconds — show upright cabins and stopped motion.]

> “They are level again, and Pause freezes the code-driven motion. That fault switch is a deliberate test.”

> **“Okay, I’ll press P to resume, then V for the rider view.”**

[Pause 7 seconds — show the moving rider view.]

> “This camera is a child of the rocking seat. It inherits the ride’s movement automatically, unlike the independent ground camera.”

> **“I’ll press V to return, press P to pause, and scroll closer to a cabin.”**

[Pause 6 seconds — frame a cabin wall and its lower strip.]

> “The cabin is my custom model. Its UV coordinates put the four walls in four texture strips, with bottom-to-top mapping.”

> **“Now I’ll press M to remove the extra maps.”**

[Pause 3 seconds.]

> “The color pattern remains.”

> **“I’ll press M again to restore the maps.”**

[Pause 3 seconds.]

> “The normal map changes the lighting response without changing the cabin’s shape.”

> **“I’ll press N for night.”**

[Pause 3 seconds — keep the cabin’s lower strip visible.]

> **“Now I’ll press M to remove the maps again.”**

[Pause 3 seconds.]

> **“I’ll press M to bring them back.”**

[Pause 3 seconds — finish with maps ON.]

> “The emission map makes the lower strip glow. It does not illuminate nearby objects.”

> **“Okay, I’ll press P to resume, zoom out, and press N to return to day.”**

[Pause 5 seconds — show lit cabin faces, metal supports and ground.]

> “Day uses a directional light. Diffuse shading depends on surface angle; the metal’s specular highlight also depends on viewing angle and roughness.”

> **“I’ll press H to remove shadows.”**

[Pause 3 seconds — keep the ground beneath the ride in frame.]

> **“Now I’ll press H again to restore them.”**

[Pause 3 seconds — show the shadow returning.]

> “Shadows add a depth render. Day uses one 1024-square shadow map.”

> **“Now I’ll press N to show the night lighting.”**

[Pause 4 seconds — frame the illuminated wheel and loading area.]

> “A point light fills the wheel, and a spotlight lights the loading area. Only the spotlight casts shadows at night, using one 512-square map. Point shadows are disabled to avoid six shadow-map faces.”

> **“Finally, I’ll keep the performance readout visible.”**

[Pause 3 seconds — leave the app running and the HUD readable.]

> “The current readout shows [actual FPS] frames per second and [actual draw calls] draw calls. Sharing geometry and materials saves resources, but does not automatically batch draw calls.”

> “One real bug was inward-facing cabin normals and reversed triangle winding. An automated test compared the normals with the outward direction. Reversing their calculation and triangle order fixed it. A next improvement would be instancing repeated objects to reduce draw calls.”

Evidence covered: hierarchy-dependent leveling, custom UV model, visible normal/emission maps, directional/point/spot lighting, diffuse/specular, purposeful shadows and their cost, child rider camera, actual bug and how it was found.

## Demo 2 — Unity table-tennis trainer

### Setup — not spoken

Run the installed native Unity Table Tennis Spin Trainer, v1.0.4, on Quest. Do not record the web landing page. Start Speed 4.5 m/s, spin None, wind OFF, auto feed OFF.

Right index trigger feeds a ball; right A toggles auto feed; right B resets score. The paddle is attached to the right controller: no grip press is needed. Point the LEFT ray at settings and press the LEFT index trigger to select them. Keep approach, impact and room sounds in the final video.

For the spin/wind comparisons, keep the paddle away and watch the same area of the table. If a ball is still active, let it finish before feeding the next comparison.

### Script

> “This is my Unity Quest table-tennis trainer. The goal is repeated returns toward the yellow target, with feedback and a score. There is no virtual locomotion.”

> **“Okay, I’ll press the right trigger to feed a ball and make a gentle return.”**

[Pause 6 seconds — keep the return and score feedback visible.]

> **“Now I’ll feed again and make a faster, controlled return.”**

[Pause 6 seconds.]

> **“I’ll feed one more and change the paddle angle.”**

[Pause 6 seconds.]

> “The tracked paddle is kinematic. Its linear and angular velocity come from controller tracking. Contact uses relative velocity, so swing speed and direction change the return. Returns earn ten points; a target landing adds one hundred.”

> **“I’ll press right A to turn automatic feed on and practise a few returns.”**

[Pause 10 seconds — attempt the highlighted target; show repetition and feedback.]

> **“Now I’ll press right A again to stop future feeds.”**

[Pause 3 seconds.]

> “Only one ball is active at a time.”

> **“Using the left ray and trigger, I’ll select Speed plus, then feed with the right trigger.”**

[Pause 6 seconds — Speed changes from 4.5 to 5.5 m/s; watch the untouched feed.]

> “Launch speed is in meters per second.”

> **“I’ll select Speed minus to restore 4.5, choose Topspin, then feed again.”**

[Pause 6 seconds — observe flight and the table bounce.]

> **“Now I’ll choose Backspin and feed another ball.”**

[Pause 6 seconds.]

> “Launch, flight, paddle contact and surface response interact. Gravity pulls down; drag resists air-relative motion. The Magnus force changes flight with spin, and friction makes spin change the bounce.”

> **“I’ll select None and feed with wind off.”**

[Pause 6 seconds.]

> **“Now I’ll turn wind on and feed again, without changing speed or spin.”**

[Pause 6 seconds — let the ball bounce, fall and roll.]

> “Wind is the fifth system. It changes air-relative velocity rather than steering the live ball.”

> **“I’ll turn wind off, select Run bounce check, and keep the paddle away.”**

[Pause 8 seconds — wait for the completed result and hold it in view.]

> “The ITTF reference is about twenty-three centimeters of rebound from a thirty-centimeter drop. This run measured [actual rebound] centimeters. The ball is forty millimeters across and 2.7 grams. Table restitution is 0.918, calibrated with drag included. Restitution controls how much normal velocity a bounce retains. Sources are documented; this checks one benchmark, not every trajectory.”

> **“I’ll press the right trigger and let the ball fall without hitting it. Listen to the approach and impacts.”**

[Pause 6 seconds — keep game audio audible.]

> **“Now I’ll feed again and make a soft hit.”**

[Pause 6 seconds — keep game audio audible.]

> **“I’ll feed once more and make a harder hit.”**

[Pause 6 seconds — keep game audio audible.]

> “Approach sound follows the ball; impacts play at contact points; ambience has a world position. These 3D sounds vary by material and impact strength.”

> **“Finally, I’ll show the performance panel.”**

[Pause 3 seconds — hold the native FPS and physics-time readouts readable.]

> “Physics uses a fixed one-hundred-eighty-hertz timestep. Velocity updates before position. Larger timesteps are cheaper but less accurate. Four contact substeps and continuous sweeps check between positions to prevent fast balls passing through surfaces.”

> “One ball, reused collision buffers and pooled audio limit cost. The render target is seventy-two FPS, giving a 13.89-millisecond frame budget. This readout shows [actual FPS] FPS and [actual physics milliseconds] milliseconds per physics step, not total frame time. Simplified drag and friction remain limitations; more measured trajectories would improve validation.”

> **“After the ball finishes, I’ll press right B to reset the score.”**

[Pause 3 seconds — show cleared counters and retained settings.]

> “The session counters reset while the settings remain.”

Parameter source: [ITTF laws, §§2.1.3 and 2.3](https://documents.ittf.sport/sites/default/files/public/2023-09/2023_ITTF_Statutes_tracked_changes_version2_2023-09-01_0.pdf#page=38). Do not substitute a previous editor measurement for this Quest run.

Evidence covered: five interacting physics systems, spin/bounce and wind comparisons, sourced units/restitution, measured real-reference bounce, fixed timestep/continuous detection, tracked swing speed/direction, audible spatial and varied impacts, repeated practice/targets/score, cost and accuracy explanation.

## Demo 3 — Fire response and PASS

### Setup — not spoken

Open [Demo 3](https://da42450.github.io/vr-portfolio-project-1/Demo3_Procedure/?v=response-3.0) in Quest Browser and enter VR. Face the bench; LEFT X recenters it if needed.

Use LEFT hand for the extinguisher tank and RIGHT hand for the pin/nozzle. Side GRIP holds objects. A free hand's INDEX TRIGGER selects buttons. The TANK hand's index trigger squeezes, so this script uses the LEFT trigger for spray.

Locations: cream alarm bar on LEFT station; CALL HELP on RIGHT station. Tanks: LEFT red ABC has good pressure, MIDDLE blue WATER is wrong for the scenario, RIGHT red ABC has low pressure. The raised CHECK button below each gauge appears during the readiness step.

### Script

> “This guided fire-response trainer follows OSHA and USFA sources. It assumes a small contained fire, safe air, a clear exit and a trained user. Otherwise, evacuate. This is a classroom simulation, not certification.”

> **“Okay, I’ll use the right ray and trigger to press CALL HELP before activating the alarm.”**

[Pause 4 seconds — show the rejection and unchanged progress.]

> “The state machine rejects actions in the wrong order.”

> **“I’ll select HINT on the guide board.”**

[Pause 4 seconds — show the extra help.]

> “Directions and highlights follow the current step; Hint provides extra guidance.”

> **“Now I’ll select HINT again to hide it.”**

[Pause 2 seconds.]

> **“Now I’ll grip the cream alarm bar with my right hand, pull down to its stop, and release.”**

[Pause 6 seconds — show the latched bar and active lamp.]

> “This constrained slider activates the alarm.”

> **“I’ll point right and press CALL HELP with the right trigger.”**

[Pause 4 seconds — show CALL SENT.]

> “Help is now recorded as notified. It is a simulated call, not a real emergency call.”

> **“With my left grip, I’ll pick up the middle blue WATER extinguisher, then release it.”**

[Pause 5 seconds — show the wrong-tool feedback.]

> “Water is unsuitable for this electrical-fire scenario.”

> **“I’ll hold the right red ABC with my left grip and press its CHECK button with my right trigger.”**

[Pause 6 seconds — show the low-pressure rejection.]

> “Its pressure is too low.”

> **“I’ll release it, hold the left red ABC, and press CHECK beneath its green gauge.”**

[Pause 6 seconds — keep LEFT grip held after validation.]

> “The charged ABC passes. I recovered without restarting; alarm and call progress remain. Pickup alone is not a separate procedural step.”

> **“Keeping my left grip held, I’ll grip the pin ring with my right hand, pull sideways along its shaft, and release.”**

[Pause 7 seconds — pull over 15 cm; show the pin snapping to its tray.]

> “Grips detect nearby object-local grab volumes and attach tools to the controller. Release events snap them into place. The pin follows a constrained axis relative to the tank.”

> **“I’ll grip the nozzle with my right hand, gently show the hose limit, and aim at the bottom of the flames.”**

[Pause 7 seconds — keep above the bench edge; aim line should turn green.]

> “The tether limits reach. A range-limited ray detects the fire base, and equipment can block it.”

> **“Holding both grips, I’ll hold the LEFT index trigger to squeeze and slowly sweep left, center, then right.”**

[Pause 10 seconds — show closing lever, white spray and at least 1.2 seconds on each base section, until FIRE OUT.]

> “The tank hand operates the hinged valve while the other hand aims. Powder comes from the nozzle. Covering all three sections extinguishes the fire automatically; it is one sweep outcome.”

> **“I’ll release the left trigger, then both grips, to put the tools back.”**

[Pause 4 seconds — show snapping home.]

> “The seven outcomes are alarm, call, readiness, pin removal, aim, discharge and fire extinguished. Measured actions generate events; the current state and prerequisites decide whether to advance. Errors preserve completed outcomes.”

> **“Now I’ll select RESET with my right ray and trigger.”**

[Pause 4 seconds — show restored alarm, call, pin, flames and progress.]

> “Reset restores the entire station.”

> “Scripted sliders, a hinge and a tether make manipulation stable and inexpensive, but do not model elastic hose behavior or general rigidbody collisions. Reused hose geometry and 192 pooled particles control cost. Ray coverage extinguishes the fire; the particles are visual feedback, not fluid or fire chemistry.”

> “Using [actual immersive measurement method], I measured [actual FPS range] FPS at a headset refresh rate of [actual refresh rate] hertz.”

The last sentence is read ONLY after an actual immersive measurement. Show the matching evidence; do not invent values or substitute desktop FPS.

Procedure sources: [USFA extinguisher guidance](https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/fire-extinguishers/) and [OSHA extinguisher use](https://www.osha.gov/etools/evacuation-plans-procedures/emergency-standards/portable-extinguishers/use).

Evidence covered: seven substantive outcomes, state/order/prerequisites, wrong tools and recoverable mistakes, completion/full reset, both-hand grabs/releases, snapping/tool/two-handed use, constrained slider/hinge, in-world changing guidance/Hint, cited procedure, actual Quest delivery, manipulation choice and cost.

## Demo 4 — Warehouse hunt

### Setup — not spoken

Open [Demo 4](https://da42450.github.io/vr-portfolio-project-1/Demo4_Hunt/?v=height-3) in Quest Browser and enter VR. Stand. LEFT X opens settings; RIGHT ray and RIGHT trigger select menu buttons. Set Teleport, Snap, speed 1.00 m/s, Seated OFF, Vignette ON, then select NEW HUNT.

LEFT trigger commits a valid teleport; LEFT stick moves in Smooth mode; RIGHT stick turns; RIGHT trigger selects nearby stock. Select CLOSE after changing settings: movement is disabled while the menu is open.

Rehearse the whole hunt once with Teleport and once with Smooth to confirm both work throughout. The video switches modes within one hunt; it does not need two complete hunts. Use open passages; do not try to teleport through walls. “Farther row” below means the northern of the region's two shelf rows, viewed from its front/label side.

- A Receiving, left near spawn: farther row, LEFT box AX-104; nearby AX-140 is the wrong look-alike.
- B Tools, right near spawn: farther row, CENTER box BX-208.
- C Parts, farther north/left: farther row, RIGHT box CX-306.
- D Shipping, farther north/right: farther row, RIGHT box DX-412; nearer four-box row, THIRD from the left EX-510.
- Stay within 2 m of a box to select it.
- Starting landmark: overhead “A RECEIVING ← → B TOOLS.” North sign points toward C Parts / D Shipping.
- The full progress/time/SCORE board is LEFT of the yellow Dispatch box near spawn. The wrist checklist shows count/time/remaining codes, NOT score. Return to Dispatch before refreshing.

Prepare a stable chair before filming. Smooth travel is slower than teleport: speak the relevant explanation while moving once the cue is complete. Avoid unnecessary detours. If the full hunt/settings/reload rehearsal exceeds six minutes, shorten idle time or extra speech, not the required evidence.

### Script

> “This warehouse has four signed regions, five target codes and twenty similar distractors. Signs and colored floors help navigation.”

> **“Okay, I’ll show the starting A Receiving and B Tools sign, the board left of Dispatch, and my wrist checklist.”**

[Pause 4 seconds — make each readable.]

> “The board shows progress, time and score; the checklist shows remaining codes.”

> **“I’ll flick the right stick right three times, then press left X to open the menu and select RESET VIEW with my right trigger.”**

[Pause 6 seconds — center the stick between flicks; keep physical heading unchanged.]

> “Snap turns are thirty degrees. Reset View restores the sign ahead without changing position or height.”

> **“I’ll point my left controller at open floor and press the left trigger to teleport into Receiving.”**

[Pause 6 seconds — travel through the open aisle entrance; show teleport fade.]

> “Teleport uses an unobstructed floor target and moves during a fade.”

> **“With my right trigger, I’ll select the wrong code AX-140.”**

[Pause 2 seconds — show the box uncollected and found count unchanged.]

> “Wrong codes cost twenty-five points.”

> **“Now I’ll select AX-104, then try that same box again.”**

[Pause 4 seconds — show one collected target, not two.]

> “Targets count once. Score also loses two points per second.”

> **“I’ll teleport through the open passage to Tools and select BX-208 with my right trigger.”**

[Pause 8 seconds — farther row, center box; show 2/5.]

> **“Now I’ll press left X, select MOVEMENT to change to Smooth, and select CLOSE.”**

[Pause 4 seconds.]

> **“I’ll use the left stick through the signed passage toward Parts, then select CX-306 with my right trigger.”**

[Pause 8 seconds — begin the route; continue moving during the next explanation if needed.]

> “Smooth travel follows my headset’s horizontal direction, with walls blocking artificial movement. Both modes reach the whole hunt. I prefer teleport for quick aisle travel without continuous visual motion; smooth is useful for fine positioning.”

> **“I’ll open the menu, change SPEED to 2.00, turn VIGNETTE off, and select CLOSE.”**

[Pause 4 seconds.]

> **“I’ll move briefly with the left stick to show those settings.”**

[Pause 3 seconds.]

> **“Now I’ll reopen the menu, restore SPEED 1.00 and VIGNETTE on, choose TURN Smooth, then CLOSE.”**

[Pause 5 seconds.]

> **“I’ll move and stop, then briefly hold the right stick to turn.”**

[Pause 4 seconds — show vignette narrowing/clearing and continuous turning.]

> “Discomfort comes from seeing movement without feeling matching motion. Vignette reduces peripheral visual flow. Lower speed reduces artificial motion; snap turning avoids continuous rotation; teleport fade hides the jump.”

> **“I’ll stop, sit safely, open the menu, restore TURN Snap, and select SEATED on.”**

[Pause 7 seconds — sit before ON; show normal eye height.]

> **“Now I’ll stand, select SEATED off, then CALIBRATE HEIGHT and CLOSE.”**

[Pause 7 seconds — stand before OFF; show normal height again.]

> “Each switch samples headset height once for a 1.6-meter eye height, keeping the world usable seated or standing. Natural head movement remains tracked. Calibration repeats the measurement.”

> **“I’ll continue through the passage into Shipping and select DX-412, then EX-510, with my right trigger.”**

[Pause 10 seconds — DX farther row/right; EX nearer row/third from left; show 5/5.]

> “All five are found. Time and score freeze at completion.”

> **“I’ll open the menu, choose MOVEMENT Teleport and CLOSE, then teleport back through the passages to Dispatch.”**

[Pause 10 seconds — do NOT select New Hunt; frame the full score board.]

> “Here is the final time and score.”

[Pause 3 seconds — keep the board readable.]

> **“Now I’ll open settings, show the saved choices, exit VR, refresh this page, re-enter VR and press left X again.”**

[Pause 15 seconds — show Teleport/Snap/1.00/Seated OFF/Vignette ON before AND after reload. Keep the live-action inset; trim only idle loading if needed.]

> “Preferences survive in localStorage. Height is recalibrated; hunt progress restarts.”

> “Simple geometry and no dynamic shadows limit cost. Virtual collisions do not restrain my real body, so the headset boundary still matters.”

> “Using [actual immersive measurement method], I measured [actual FPS range] FPS at a headset refresh rate of [actual refresh rate] hertz.”

The last sentence is read ONLY after an actual immersive measurement. Show the matching evidence; do not invent values or substitute desktop FPS.

Evidence covered: navigated/signposted world, five targets/twenty distractors, discrimination/progress/timed score, two distinct locomotion systems and comfort/speed suitability, vignette/snap/smooth-turn/fade/speed/view reset, seated/calibration, restart persistence, sensory-mismatch explanation, actual Quest delivery.

## Final check — not spoken

Watch the complete exports: each 3–6 minutes, correct narration/action timing, readable evidence, Demo 2 audio audible, and the live-action inset throughout Demos 2–4. Upload four public/unlisted YouTube videos and test their links signed out.

Add the video links to the root and each demo README. Videos do not replace the remaining submission items: headshot/bio, exact AI-tooling inventory, working deployment/Release links, course repository push before the deadline, and the later personalized quiz.
