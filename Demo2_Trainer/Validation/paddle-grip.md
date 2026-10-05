# Paddle grip update — October 5, 2026

Build: Unity 6000.3.22f1, demo2-v1.0.2, Android version code 3. Package: `com.danielaguilar.portfolio.spintrainer`.

## Problem and change

The student reported needing an awkward hand/controller rotation. Previously the face copied the controller rotation without mapping model axes, and the handle center was approximately 8.6 cm away from the grip origin. The new `PaddleGrip` helper rotates model shaft +Y to Unity grip +Z and blade normal +Z to grip +X. It anchors the handle center at the palm. This is an authored shakehand-style default using standard grip-pose axes, not a measured manufacturer calibration or a guarantee of personal comfort.

Visuals are parented to the tracked controller so they follow the render-frame pose without Rigidbody interpolation delay. The fixed-step contact solver computes its face pose with the same helper. The standard UnityPlayerActivity entry point from the verified startup fix is retained. No school management/security settings are changed.

## Verified locally

- APK build succeeded, zero errors; version 1.0.2/code 3, ARM64 and UnityPlayerActivity verified in the package. APK signature verification passed.
- Three grip orientations: handle center coincides with palm; shaft and blade align with the intended grip axes; visual parent/local transform equals the physics world transform.
- Six high-speed sweeps: both racket faces detect contact in all three orientations. Results: `paddle-grip-results.json`.
- Numerical bounce remains 23.004 cm; existing spin-dependent bounce and high-speed sweep checks pass.
- Web regression suite: 16 tests pass; JavaScript/entrypoint checks pass. These are not Unity controller tests.

APK SHA-256: `274235bf838a070ad6a8e6b84f6d07fa146630093e2556a375279ac4f4d033a7`.

## Headset check

The updated APK installed in place on the same ArborXR-managed Quest 3 (`Success`), and the package reports version 1.0.2/code 3. Android accepted a cold launch. OpenXR reached `XR_SESSION_STATE_FOCUSED`, followed by `TRAINER_READY` at 15:49:30 local time. Brief post-initialization samples were approximately 72 FPS at 72 Hz. No new application exception or ANR was observed in this startup check; this is not a sustained gameplay benchmark.

The student explicitly confirmed in chat that the updated grip feels normal when holding the right controller without twisting the wrist. The agent did not physically operate the controller. This confirms subjective comfort for this student, not universal ergonomics or all gameplay features.

Fast forehand/backhand contacts, other board controls, audio and sustained gameplay still require separate checks. Disconnect the USB cable before swinging.
