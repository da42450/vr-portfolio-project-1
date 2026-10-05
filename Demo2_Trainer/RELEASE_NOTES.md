# demo2-v1.0.1 — Quest startup compatibility fix

Switch the Android entry point from GameActivity to the standard `UnityPlayerActivity`, both in saved Player Settings and the repeatable Portfolio build script. The school Quest 3's October 5 ANR trace showed the main thread waiting in `GameActivity.onSurfaceDestroyedNative`. No physics, gameplay, controls or school management settings were changed.

APK: `demo2-v1.0.1.apk`. Version: `1.0.1`, Android version code `2`, same package/signing identity for an in-place update. Install with `adb install -r demo2-v1.0.1.apk` and launch `com.danielaguilar.portfolio.spintrainer/com.unity3d.player.UnityPlayerActivity`.

Verification: Unity build succeeded with zero errors; packaged manifest names only `UnityPlayerActivity`, retains the Quest VR category and supported Quest models; ARM64 OpenXR/IL2CPP libraries are present and `libgame.so` is absent. Numerical rebound remains 23.004 cm, spin-dependent bounce and high-speed sweep checks pass. On October 5, v1.0.1 installed, initialized the scene and entered focused VR on the same ArborXR-managed Quest 3. A Home-menu return/reopen also rendered successfully without another observed ANR. Brief post-startup samples were approximately 72 FPS at 72 Hz. This verifies startup, not sustained gameplay, controller contact or audio; those checks remain pending. See `Validation/quest-startup.md`.

## demo2-v1.0 — Initial release

Initial release implements a stationary tracked-controller trainer: repeated feeds, SI ball/table dimensions, gravity/drag/Magnus, relative swept paddle contact, spin-dependent surface bounce, wind, material/intensity-sensitive 3D audio, target zones and session feedback.

Build: Unity 6000.3.22f1, Android ARM64, IL2CPP, OpenXR Meta Quest Support and Oculus Touch interaction profile. APK: `demo2-v1.0.apk`. Package: `com.danielaguilar.portfolio.spintrainer`.

Install through Meta Quest Developer Hub/SideQuest or `adb install -r demo2-v1.0.apk`. Launch from Unknown Sources. Left trigger selects board settings; the right controller is the paddle, right trigger feeds a ball, A toggles automatic feed and B resets score.

Local verification: compilation and APK build succeeded; numerical spin/sweep checks passed; the real generated scene's 30 cm drop rebounded 23.054 cm versus the ITTF's approximately 23 cm reference. Add the exact Quest model, sustained observed frame rate, and on-device interaction test date **after** testing. Do not publish a claim of on-device validation before doing it.

Limitations: constant approximate aerodynamic coefficients, rigid racket, simplified material friction and rolling; not equipment-specific calibration. Video URL: add your compliant YouTube recording.
