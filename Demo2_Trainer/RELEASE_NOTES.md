# demo2-v1.0 — Table-tennis spin trainer

Initial release implements a stationary tracked-controller trainer: repeated feeds, SI ball/table dimensions, gravity/drag/Magnus, relative swept paddle contact, spin-dependent surface bounce, wind, material/intensity-sensitive 3D audio, target zones and session feedback.

Build: Unity 6000.3.22f1, Android ARM64, IL2CPP, OpenXR Meta Quest Support and Oculus Touch interaction profile. APK: `demo2-v1.0.apk`. Package: `com.danielaguilar.portfolio.spintrainer`.

Install through Meta Quest Developer Hub/SideQuest or `adb install -r demo2-v1.0.apk`. Launch from Unknown Sources. Left trigger selects board settings; the right controller is the paddle, right trigger feeds a ball, A toggles automatic feed and B resets score.

Local verification: compilation and APK build succeeded; numerical spin/sweep checks passed; the real generated scene's 30 cm drop rebounded 23.054 cm versus the ITTF's approximately 23 cm reference. Add the exact Quest model, sustained observed frame rate, and on-device interaction test date **after** testing. Do not publish a claim of on-device validation before doing it.

Limitations: constant approximate aerodynamic coefficients, rigid racket, simplified material friction and rolling; not equipment-specific calibration. Video URL: add your compliant YouTube recording.
