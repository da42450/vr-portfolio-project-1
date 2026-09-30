# Daniel Aguilar — VR Portfolio Project 1

CSCI 4830, University of Georgia, Fall 2026. Due October 8, 2026, 11:59 pm.

**Headshot:** add your own photo at `headshot.jpg` before submission.

**Bio:** Daniel Aguilar is a student taking Virtual Reality at the University of Georgia. This portfolio demonstrates graphics, simulation, manipulation, and locomotion through four focused interactive applications.

| Demo                                         | What it demonstrates                                                                        | Deployment                                                                                           | Video                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [Demo1_Ride](Demo1_Ride/README.md)           | Code-driven transform hierarchy, authored UVs, normal/emission maps, lighting, rider camera | [Desktop WebGL](https://da42450.github.io/vr-portfolio-project-1/Demo1_Ride/)                        | Your 3–6 minute YouTube recording pending        |
| [Demo2_Trainer](Demo2_Trainer/README.md)     | Unity physics, swept contact, spin, tracked velocity, 3D audio, practice feedback           | [Unity Quest APK Release](https://github.com/da42450/vr-portfolio-project-1/releases/tag/demo2-v1.0) | Your VR recording with live-action inset pending |
| [Demo3_Procedure](Demo3_Procedure/README.md) | Eight states, recoverable errors, two-handed manipulation, slider and hinge                 | [WebXR](https://da42450.github.io/vr-portfolio-project-1/Demo3_Procedure/)                           | Your VR recording with live-action inset pending |
| [Demo4_Hunt](Demo4_Hunt/README.md)           | Four regions, 5 targets / 20 distractors, teleport and smooth travel, comfort               | [WebXR](https://da42450.github.io/vr-portfolio-project-1/Demo4_Hunt/)                                | Your VR recording with live-action inset pending |

Public portfolio: **[GitHub Pages](https://da42450.github.io/vr-portfolio-project-1/)**. Demos 3/4 have immersive WebXR; Demo 1 is desktop WebGL; Demo 2 is a native Unity application, not a browser demo.

## Run locally

```sh
npm install
npm start
```

Open `http://localhost:8080`. Three.js is pinned to 0.180.0 and vendored locally, so the static web demos do not depend on a CDN. `npm test` checks grab targeting/attachment/release, graphics, procedure ordering/recovery, hunt scoring, and settings validation. `npm run check` checks JavaScript parsing and required entrypoints.

For Unity, open the `Demo2_Trainer` directory in Unity **6000.3.22f1**. The generated scene is `Assets/Scenes/Trainer.unity`. The Portfolio menu regenerates the scene/configuration, validates the physics, and builds the Quest APK. Android Build Support, SDK/NDK and OpenJDK are required.

Desktop controls provide inspection; headset/controller interaction and headset frame rate must be checked on a physical Quest before submission. For Demos 3/4, open their GitHub Pages links in the Quest browser and select **Enter VR**. The button activates only on a supported browser. Quest requires **public HTTPS**, not the computer's HTTP LAN address. Demo 1 deliberately disables immersive XR; its desktop demonstration covers the assigned graphics criteria.

## Submission status

Source is pushed to this public repository, with automatic GitHub Pages deployment and a downloadable APK Release. That does not establish headset performance or the video gates. Complete [SUBMISSION.md](SUBMISSION.md) to confirm the professor's course-repository requirement, add your videos/headshot, and report on-device results. [RUBRIC.md](RUBRIC.md) maps each point-bearing criterion to its implementation and required evidence. [QUIZ_GUIDE.md](QUIZ_GUIDE.md) explains the actual code in lecture vocabulary.

Every push to `main` runs `.github/workflows/pages.yml`: install pinned dependencies, run tests/checks, package static files, then deploy to Pages. Unity source and build caches are excluded from the published website; the APK is a separate GitHub Release asset.

## AI tooling

- Codex desktop coding agent for implementation and project/rubric discussion. Before submission, record the exact model/version displayed in the sessions you used; that personal inventory is still pending confirmation.
- Shell commands and Unity's batch-mode CLI for compilation and Android builds.
- Browser automation through the Codex computer-use integration for interaction and visual checks.
- No Unity MCP, generated third-party 3D models, or image-generation tools were used for these implementations.

The agent read the rubric, built the scenes and scripts, documented the mechanisms, and checked the state logic, browser behavior, Unity compilation, physics and an offscreen Unity render. Inspection found hidden-menu ray hits, poorly wrapped in-world instructions, inward cabin normals, and mirrored/overlapping Unity text; these were corrected. An explicit resource material prevents the runtime-created Unity shader from being stripped from the APK. A diagnostic toggle deliberately removes gondola counter-rotation to make hierarchy errors visible; this is an injected failure, not a claim about a spontaneous bug. I still need to independently run the demos on my Quest, inspect the measurements, and explain the code myself. Do not claim those personal checks are complete until they are performed.

## Assets and dependencies

All scene meshes, textures, signs and tones are authored procedurally in the source. Three.js is MIT licensed; its license is in `Shared/vendor/THREE-LICENSE.txt`. Unity packages are pinned by `Demo2_Trainer/Packages/manifest.json` and `packages-lock.json`. Physical and procedural sources are linked in the demo READMEs.
