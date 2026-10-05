# demo2-v1.0.4 — Feed clears the net

Correct the feeder's initial upward velocity using the existing force model instead of a gravity-only low arc. A cached 16-step binary search aims the first table bounce at z=0.85 m on the player's half; the speed preset still sets forward velocity. The live ball is not steered after launch. Keep all net geometry/collision, aerodynamic/contact coefficients, paddle grip, controller shortcuts and the improved settings panel. Add a short net-hit coaching message for low returns.

APK: `demo2-v1.0.4.apk`, Android version `1.0.4`/code `5`, same package/signing identity. Numerical and actual-scene tests pass for all 24 speed/spin/wind presets, with at least 7.29 cm ball-bottom clearance above the net and a player-side first bounce. The old force-model check flagged 16 of 24 presets as unsafe. Menu/grip/spin/sweep checks still pass, with editor rebound 23.054 cm and independent numerical rebound 23.004 cm. The APK built with zero errors, installed and initialized on the school Quest 3; the student confirmed feeds now cross the net when asked to check normal and lowest speed. See `Validation/feed.md` for exact results and remaining gameplay/performance checks.

## demo2-v1.0.3 — Clearer VR settings panel

Replace the old plain settings board with a front-facing dark panel, rounded setting cards, larger padded buttons, selected-state colors, hover/hit feedback, a short press animation and left-controller haptic feedback. Speed now has bounded −/+ controls; spin has direct None/Topspin/Backspin choices; feed/wind show their current state. Separate one-ball feed from auto feed. Bounce check shows its running/result state and prevents feeds or restart during measurement. Score, motion, FPS and physics CPU telemetry remain visible.

The left menu ray now reads the OpenXR Touch pointing pose rather than using the palm orientation. The paddle grip correction, UnityPlayerActivity startup fix and ball physics coefficients are preserved. Wind can affect an active practice ball; speed/spin affect the next launch. No external UI dependency is added.

APK: `demo2-v1.0.3.apk`, Android version `1.0.3`/code `4`, same package and signing identity. The build succeeded with zero errors; ARM64, expected launch activity and APK signature verified. Actual generated scene tests pass for all ten ray targets, caption fit, rounded-face normals, speed bounds, exclusive spin selection/lift signs, feed/wind/reset callbacks and bounce guards. The editor bounce remains 23.054 cm. See `Validation/menu.md` for on-device results; do not treat local rendering as proof of headset readability or sustained performance.

Quest results: in-place installation and scene initialization passed on the school Quest 3; the left Touch pointing pose is tracked. The student confirmed that the new panel looks better, is readable, and that speed/spin/wind/bounce-check buttons work with the left ray. Brief runtime samples were around 72 FPS. This is not full gameplay validation or a sustained benchmark.

## demo2-v1.0.2 — Palm-centered paddle grip

Center the virtual racket handle at the right controller's OpenXR grip pose, instead of offsetting the face and leaving the handle away from the palm. Rotate the model shaft and blade into a shakehand-style hold. A small shared `PaddleGrip` helper supplies both the render-frame visual transform and the fixed-step collision transform. Controller tracking runs before trainer Update; visuals no longer inherit Rigidbody interpolation delay. Controls and ball physics coefficients are unchanged.

APK: `demo2-v1.0.2.apk`. Version: `1.0.2`, Android version code `3`. The package/signing identity and standard `UnityPlayerActivity` startup fix are preserved for an in-place update.

Verification: Unity build succeeded with zero errors; ARM64 and the expected launch activity are verified in the APK, and its signature verifies. The handle anchor, shaft axis, blade normal and visual/physics transform agree for three rotations; six high-speed contacts cover both faces. Numerical rebound remains 23.004 cm with spin/sweep checks passing. Web regression tests: 16 passed; JavaScript/entrypoint checks passed. On the school Quest 3, in-place installation succeeded, OpenXR reached focused VR and the scene initialized. Brief post-startup samples were approximately 72 FPS. The student confirmed that the new grip feels normal without twisting the wrist. This is not full gameplay validation or a sustained performance benchmark. See `Validation/paddle-grip.md`.

## demo2-v1.0.1 — Quest startup compatibility fix

Switch the Android entry point from GameActivity to the standard `UnityPlayerActivity`, both in saved Player Settings and the repeatable Portfolio build script. The school Quest 3's October 5 ANR trace showed the main thread waiting in `GameActivity.onSurfaceDestroyedNative`. No physics, gameplay, controls or school management settings were changed.

APK: `demo2-v1.0.1.apk`. Version: `1.0.1`, Android version code `2`, same package/signing identity for an in-place update. Install with `adb install -r demo2-v1.0.1.apk` and launch `com.danielaguilar.portfolio.spintrainer/com.unity3d.player.UnityPlayerActivity`.

Verification: Unity build succeeded with zero errors; packaged manifest names only `UnityPlayerActivity`, retains the Quest VR category and supported Quest models; ARM64 OpenXR/IL2CPP libraries are present and `libgame.so` is absent. Numerical rebound remains 23.004 cm, spin-dependent bounce and high-speed sweep checks pass. On October 5, v1.0.1 installed, initialized the scene and entered focused VR on the same ArborXR-managed Quest 3. A Home-menu return/reopen also rendered successfully without another observed ANR. The student confirmed the table is visible, the right-controller paddle moves, and the right trigger feeds a ball. Brief post-startup samples were approximately 72 FPS at 72 Hz. This verifies startup and those basic interactions, not sustained gameplay, paddle contact or audio; those checks remain pending. See `Validation/quest-startup.md`.

## demo2-v1.0 — Initial release

Initial release implements a stationary tracked-controller trainer: repeated feeds, SI ball/table dimensions, gravity/drag/Magnus, relative swept paddle contact, spin-dependent surface bounce, wind, material/intensity-sensitive 3D audio, target zones and session feedback.

Build: Unity 6000.3.22f1, Android ARM64, IL2CPP, OpenXR Meta Quest Support and Oculus Touch interaction profile. APK: `demo2-v1.0.apk`. Package: `com.danielaguilar.portfolio.spintrainer`.

Install through Meta Quest Developer Hub/SideQuest or `adb install -r demo2-v1.0.apk`. Launch from Unknown Sources. Left trigger selects board settings; the right controller is the paddle, right trigger feeds a ball, A toggles automatic feed and B resets score.

Local verification: compilation and APK build succeeded; numerical spin/sweep checks passed; the real generated scene's 30 cm drop rebounded 23.054 cm versus the ITTF's approximately 23 cm reference. Add the exact Quest model, sustained observed frame rate, and on-device interaction test date **after** testing. Do not publish a claim of on-device validation before doing it.

Limitations: constant approximate aerodynamic coefficients, rigid racket, simplified material friction and rolling; not equipment-specific calibration. Video URL: add your compliant YouTube recording.
