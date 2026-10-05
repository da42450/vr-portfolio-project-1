# Quest startup smoke test — October 5, 2026

Device: school-managed Meta Quest 3 with ArborXR. USB debugging was approved by the user. No management, security or headset configuration was removed or bypassed.

## Failure in v1.0

Android reported an input-dispatch ANR after waiting 5002 ms for a focus event. The application's main-thread trace was waiting in `GameActivity.onSurfaceDestroyedNative`, through `libgame.so`. The user closed the unresponsive app. This shows the freeze location; it does not establish that the managed environment can never contribute to a lifecycle issue.

## Change in v1.0.1

`PortfolioBuild.Prepare` now explicitly sets `PlayerSettings.Android.applicationEntry = AndroidApplicationEntry.Activity`, matching the saved Player Settings. The generated APK launches `UnityPlayerActivity`; `libgame.so` is absent. Version code increased to 2, and the same package/signing identity allowed `adb install -r` without deleting application data. The game simulation and controls were not changed. A single `TRAINER_READY` log records completion of scene initialization.

APK SHA-256: `06c068a3ca892d95449afd7a4dbd55895b45084a9b5d6daa811a80936c2f7284`.

## Observed results

- Unity 6000.3.22f1 build: succeeded, zero errors. ARM64, IL2CPP and OpenXR libraries verified in the actual APK.
- Numerical physics: 23.004 cm rebound; spin-dependent bounce and high-speed paddle sweep checks passed.
- In-place installation: `Success`; installed version `1.0.1`, version code `2`.
- First cold launch: Android returned `Status: ok`. OpenXR reached `XR_SESSION_STATE_FOCUSED`, followed by `TRAINER_READY: table, paddle, controls and audio initialized.`
- Brief post-startup rendering: approximately 72 FPS at a 72 Hz target. Startup/transition samples varied; this is not a long-duration gameplay benchmark.
- Home-menu return/reopen: the prior process stopped, a new process launched, and focused VR rendering resumed. No second ANR was observed in these checks. This verifies reopening, not preservation of an in-memory practice session.
- Student confirmation after the update: the table is visible, the paddle follows the right controller, and the right trigger feeds a ball. These three interactions were explicitly confirmed in the chat; the agent did not physically operate the headset/controllers.
- Web regression suite: 16 tests passed; all JavaScript/entrypoint checks passed. Those tests are not Unity controller tests.

## Still required before submission

The student must still verify tracking quality during movement, fast paddle swings and contacts, the left trigger/board ray, A/B buttons, all board settings, in-headset bounce measurement, spatial audio, and sustained gameplay frame rate. Record the required video/live-action inset and document the actual measurements. Do not describe the startup/basic-input smoke test as full gameplay validation or guaranteed rubric marks.
