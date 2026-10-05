# Settings panel update — October 5, 2026

Unity 6000.3.22f1, demo2-v1.0.3, Android version code 4. Package: `com.danielaguilar.portfolio.spintrainer`.

The panel now has direct speed/spin controls, visible feed/wind state, hover/press/hit feedback, left-controller haptics, and a compact bounce-check result. It uses the Touch aim pose for menu selection without altering the paddle's grip pose. The front-left position avoids overlap with the table/net. Physics coefficients and integration/contact methods are unchanged.

## Local verification

`MenuVerification.Validate` runs in the real generated Unity scene. Results are in `menu-results.json`:

- Ten actual button colliders select correctly from a ray aimed at their centers, with a matching ray endpoint and four-metre range limit.
- All button captions fit inside their hit areas; rounded surface normals face the player. The rendered `menu-preview.png` and `scene-preview.png` were visually inspected after correcting text scale and panel/table overlap.
- Speed reaches but never wraps beyond 3.5/6.5 m/s; endpoint controls disable.
- Spin choices set the actual trainer values and are mutually exclusive. The modeled lift points down for topspin and up for backspin on the incoming −Z feed.
- Feed/wind/reset callbacks operate the actual trainer state; bounce mode disables feed/restart and pauses automatic feeding.
- The scene bounce check still measures 23.054 cm against the approximately 23 cm reference. Separate numerical physics/grip checks remain part of the APK build.
- Web regression suite: 16 tests passed; JavaScript/entrypoint checks passed. These tests do not validate Unity controller interaction.

The lightweight unlit shader includes Unity's single-pass stereo macros; a Resources material explicitly retains the shader. This is source/build configuration evidence, not a physical two-eye rendering test.

## Build and headset results

The APK build succeeded with zero errors. The actual package reports version 1.0.3/code 4, ARM64 and UnityPlayerActivity; its signature verifies and matches the prior APK signing identity. The numerical bounce (23.004 cm), spin/sweep checks, and paddle-grip checks also passed in the build.

APK SHA-256: `4fbee92e82310339a57e6777881b0cc8bba374b7514c33e64ef4de968d54069c`.

The updated APK installed in place on the same school Quest 3 (`Success`); the installed package reports 1.0.3/code 4. The first launch request opened the Quest's controller-required dialog rather than the application. After the controllers were awake, the application reached focused VR and initialized (`TRAINER_READY`). `MENU_AIM_READY` confirmed that the left Touch controller's separate OpenXR pointing pose was tracked on the actual headset. Brief post-startup samples were around 72 FPS at 72 Hz, without an observed application exception; this is not a sustained gameplay benchmark.

Student confirmation of panel readability, button interactions and two-eye appearance is still pending. The previously confirmed paddle comfort and startup results are recorded separately for v1.0.2/v1.0.1; do not claim those validate the new menu.
