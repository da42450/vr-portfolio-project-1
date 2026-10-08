# Finish the submission

## Course repository

The required private course repository is [ugavrclass2026/portfolio-1-da42450](https://github.com/ugavrclass2026/portfolio-1-da42450), supplied by the student on October 8. The public [hosting repository](https://github.com/da42450/vr-portfolio-project-1) remains separate. The local `course` remote targets the private repo; `origin` targets public hosting. Preserve both development histories and keep the original course starter README in `COURSE_STARTER_README.md`. Every final evidence/docs change must reach the course repo before the deadline; pushing only origin does not submit it.

The local `main` branch follows public hosting. `codex/course-submission` contains the preserved course starter history plus the public development history. For future updates, commit/push public main, switch to `codex/course-submission`, merge main and push `HEAD:main` to the course remote, then return to main. Do not force-push one history over the other. Public Pages deployment is guarded to run only in `da42450/vr-portfolio-project-1`; it deliberately skips in the private grading repo.

## Web hosting

Public site: **https://da42450.github.io/vr-portfolio-project-1/**. GitHub Pages is configured to deploy through `.github/workflows/pages.yml` on every push to `main`. The workflow runs `npm test`, `npm run check` and `node tools/package-web.mjs`. The package copies **only** the three browser demos and their shared runtime/vendor files to `web-release/`, without Unity source, APK, temporary logs, personal photos or `.git`. Keep this public HTTPS site available through grading and the quiz.

The web package includes `index.html`, `Shared/`, `Demo1_Ride/`, `Demo3_Procedure/`, `Demo4_Hunt/`, plus the explanatory Demo 2 landing page with an APK link. Demos 3/4 are immersive WebXR; Demo 1 is desktop WebGL; Demo 2 is native Unity. Test the WebXR links in the Quest browser and select Enter VR. A desktop browser does not establish headset interaction or performance.

## APK release

The latest APK is `Demo2_Trainer/Builds/demo2-v1.0.4.apk` (ignored by Git), published in the [public demo2-v1.0.4 Release](https://github.com/da42450/vr-portfolio-project-1/releases/tag/demo2-v1.0.4) with the provided [release notes](Demo2_Trainer/RELEASE_NOTES.md). The required course copy belongs in its own [demo2-v1.0.4 Release](https://github.com/ugavrclass2026/portfolio-1-da42450/releases/tag/demo2-v1.0.4). v1.0.4 fixes the machine-feed arc; exact results are in [the dated feed record](Demo2_Trainer/Validation/feed.md). It preserves the v1.0.3 settings panel the student confirmed readable/working, the comfortable v1.0.2 grip and the verified v1.0.1 startup fix. Do not use v1.0, which froze on the school Quest 3. Remaining gameplay/controller/audio checks are still pending. Download the latest Release asset and complete those checks on your Quest. Rebuild/release after any Unity code change.

## On-device checks

| Demo | Check before recording                                                                                                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Desktop steady frame rate; maps/specular/shadows visible; rider switch; compensated world tilt                                                                                                                                          |
| 2    | Install/launch; headset + both controllers; fast contact and swing direction; all board buttons; bounce readout; audio; repetition/score; sustained headset frame rate                                                                  |
| 3    | Alarm slider; simulated call; held-tool/low-pressure/WATER checks and recovery; both grips/releases; pin; nozzle tether; tank-hand squeeze; three spray zones/obstruction; automatic completion/reset/hint; readable panels; frame rate |
| 4    | Complete hunt entirely with teleport, then smooth; doorways/collisions; both turning modes; stereo vignette/fade; speed/calibration/reset; persisted settings after browser restart; frame rate                                         |

Record observed frame rates and any adjustments in the relevant README. For Demos 3/4 the Exceeds delivery row specifically requires headset frame rate; don't substitute the in-app desktop counter.

## Videos and personal evidence

Record one **3–6 minute** video per demo, narrating the running application. For every VR demo, keep a live-action inset of yourself alongside the headset capture **for the whole video**. Use the READMEs' proof sequences and RUBRIC.md. Upload to YouTube public/unlisted, verify signed-out playback, and add all links. Your own recording and understanding cannot be generated or verified by a coding agent.

Add your genuine headshot, confirm/edit the bio (≤100 words), and correct the AI inventory to match your actual tools/models. The existing biography is a minimal draft, not a claim about interests or achievements.

Read QUIZ_GUIDE.md and practice answering without notes. Final personalized quiz questions will come from what you actually submit; don't include untested features or claims.

## Final repository check

Meaningful milestones are pushed to the public repository. Confirm the required course repository also receives them before **October 8, 2026, 11:59 pm America/New_York**. Confirm no Library, builds, APKs, logs or node_modules are tracked. Confirm all four folders have final video/deployment links, sources, controls and known issues. A single upload at the deadline is not a substitute for a clear development history.
