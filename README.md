# Daniel Aguilar — VR Portfolio Project 1

CSCI 4830, University of Georgia, Fall 2026. Due October 8, 2026, 11:59 pm.

**Headshot:** add your own photo at `headshot.jpg` before submission.

**Bio:** Daniel Aguilar is a student taking Virtual Reality at the University of Georgia. This portfolio demonstrates graphics, simulation, manipulation, and locomotion through four focused interactive applications.

| Demo                                         | What it demonstrates                                                                        | Deployment                                     | Video                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| [Demo1_Ride](Demo1_Ride/README.md)           | Code-driven transform hierarchy, authored UVs, normal/emission maps, lighting, rider camera | Local web app; public HTTPS URL pending        | Your 3–6 minute YouTube recording pending        |
| [Demo2_Trainer](Demo2_Trainer/README.md)     | Unity physics, swept contact, spin, tracked velocity, 3D audio, practice feedback           | Local Quest APK; course GitHub Release pending | Your VR recording with live-action inset pending |
| [Demo3_Procedure](Demo3_Procedure/README.md) | Eight states, recoverable errors, two-handed manipulation, slider and hinge                 | Local WebXR app; public HTTPS URL pending      | Your VR recording with live-action inset pending |
| [Demo4_Hunt](Demo4_Hunt/README.md)           | Four regions, 5 targets / 20 distractors, teleport and smooth travel, comfort               | Local WebXR app; public HTTPS URL pending      | Your VR recording with live-action inset pending |

## Run locally

```sh
npm install
npm start
```

Open `http://localhost:8080`. Three.js is pinned to 0.180.0 and vendored locally, so the static web demos do not depend on a CDN. `npm test` checks procedure ordering/recovery, hunt scoring, and settings validation. `npm run check` checks JavaScript parsing and required entrypoints.

For Unity, open the `Demo2_Trainer` directory in Unity **6000.3.22f1**. The generated scene is `Assets/Scenes/Trainer.unity`. The Portfolio menu regenerates the scene/configuration, validates the physics, and builds the Quest APK. Android Build Support, SDK/NDK and OpenJDK are required.

Desktop controls provide inspection; headset/controller interaction and headset frame rate must be checked on a physical Quest before submission. The WebXR Enter VR button activates only on a supported browser. Quest requires **public HTTPS**, not the computer's HTTP LAN address.

## Submission status

The implementation is local. A successful local build does not establish the deployment/video gates. Complete [SUBMISSION.md](SUBMISSION.md) to add the course repo, public URLs, APK release, videos, your headshot, and on-device results. [RUBRIC.md](RUBRIC.md) maps each point-bearing criterion to its implementation and required evidence. [QUIZ_GUIDE.md](QUIZ_GUIDE.md) explains the actual code in lecture vocabulary.

## AI tooling

- Codex desktop coding agent for implementation and project/rubric discussion. Before submission, record the exact model/version displayed in the sessions you used; that personal inventory is still pending confirmation.
- Shell commands and Unity's batch-mode CLI for compilation and Android builds.
- Browser automation through the Codex computer-use integration for interaction and visual checks.
- No Unity MCP, generated third-party 3D models, or image-generation tools were used for these implementations.

The agent read the rubric, built the scenes and scripts, documented the mechanisms, and checked the state logic, browser behavior, Unity compilation, physics and an offscreen Unity render. Inspection found hidden-menu ray hits, poorly wrapped in-world instructions, inward cabin normals, and mirrored/overlapping Unity text; these were corrected. An explicit resource material prevents the runtime-created Unity shader from being stripped from the APK. A diagnostic toggle deliberately removes gondola counter-rotation to make hierarchy errors visible; this is an injected failure, not a claim about a spontaneous bug. I still need to independently run the demos on my Quest, inspect the measurements, and explain the code myself. Do not claim those personal checks are complete until they are performed.

## Assets and dependencies

All scene meshes, textures, signs and tones are authored procedurally in the source. Three.js is MIT licensed; its license is in `Shared/vendor/THREE-LICENSE.txt`. Unity packages are pinned by `Demo2_Trainer/Packages/manifest.json` and `packages-lock.json`. Physical and procedural sources are linked in the demo READMEs.
