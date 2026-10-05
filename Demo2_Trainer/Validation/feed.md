# Feed/net correction — October 5, 2026

Unity 6000.3.22f1; demo2-v1.0.4; Android version code 5; package `com.danielaguilar.portfolio.spintrainer`.

## Cause and change

The student reported new/short feeds striking the net. The old launch chose vertical velocity using gravity alone for a low bounce at z=1.50, just past the net at z=1.70. Drag and Magnus were applied during play but not accounted for when selecting the launch. A force-model regression flagged 16 of 24 old speed/spin/wind combinations as invalid: insufficient net clearance or a first table-height crossing before reaching the player's half. This is a numerical baseline, not a filmed count of headset failures.

`FeedTrajectory` chooses only initial upward velocity. It predicts first table-height crossing using the same integration, drag/Magnus/wind and spin damping as play; finds a reachable arc and uses 16 binary-search steps to target z=0.85. Results are cached per preset. The live ball then follows normal physics. The speed setting is the forward −Z component, not the resulting 3D speed magnitude.

The table/net geometry and collision response, physics coefficients, menu and paddle grip are preserved. Short player returns can still strike the net and receive a brief coaching message; no auto-aim/ghost-net assist is introduced.

## Local verification

- 4 speeds × 3 spins × 2 wind states = 24 presets pass force-model predictions (`feed-numerical-results.json`). Minimum ball-bottom net clearance: 7.29 cm; predicted first bounce z≈0.85.
- All 24 also pass sphere casts against the real generated scene's table/net colliders: first contact is the player's half of the table, not the net (`feed-scene-results.json`).
- Existing menu ray/caption/settings guards pass; physics spin/sweep and paddle-grip checks pass. The editor bounce benchmark remains 23.054 cm; independent numerical rebound remains 23.004 cm.
- Runtime scene initialized and completed its bounce routine. Unity's known internal Search-index exception is separate from application script execution; no application-script exception occurred in this verification.

## Build and headset results

The Quest APK built successfully with zero errors. Package inspection confirms version 1.0.4/code 5, ARM64 and UnityPlayerActivity; the APK signature verifies and matches the prior v1.0.3 signing identity. The web regression suite also passes all 16 tests and entrypoint checks; these are not Unity gameplay tests.

APK SHA-256: `e55796f47b7227e9194eb6df7d06c66f6c07ffe958703c7751ea4e3b3ad2d9c7`.

The APK installed in place on the same ArborXR-managed Quest 3 (`Success`), and the installed package reports version 1.0.4/code 5. Android accepted a cold launch. OpenXR reached `XR_SESSION_STATE_FOCUSED` at 16:33:35 local time, followed by `TRAINER_READY` and tracked left-menu aim at 16:33:40. Brief initialization samples varied from 66 to 73 FPS at 72 Hz; this is not a sustained gameplay or first-feed performance measurement. No application exception was observed in the captured startup log.

Asked whether newly fed balls clear the net and bounce on the player's half at normal and lowest speed, the student explicitly confirmed: “Yes, feeds cross the net now.” The agent did not physically operate the controllers. This is student confirmation of the reported feed issue, not physical verification of all 24 presets, all returns or sustained performance.

The [published v1.0.4 APK](https://github.com/da42450/vr-portfolio-project-1/releases/tag/demo2-v1.0.4) is 21,972,183 bytes; the GitHub asset digest matches the local SHA-256 above. The web package also passes its local packaging check.

For wider gameplay checks, test automatic feeds and each spin preset. Net hits on deliberately low player returns are expected, not a regression. Disconnect USB before swinging.
