# Final submission — October 8, 2026

Submission is the latest pushed commit on `main` in [ugavrclass2026/portfolio-1-da42450](https://github.com/ugavrclass2026/portfolio-1-da42450). The professor's [submission instructions](https://vr26.vn.ugavel.com/PortfolioProject1/#submission) explicitly say there is no additional submission form: the repository is snapshotted after **October 8, 2026, 11:59 pm America/New_York**. The public repository supplies hosting, not the grading snapshot.

## Final delivery check

| Item | Result |
| --- | --- |
| Undergraduate structure | Four correctly named top-level demo folders; no graduate study required for CSCI 4830 |
| Root README | Name, student-provided headshot, 26-word bio, four-demo deployment/video table, student-declared GPT-6.1 Sol tooling inventory |
| Per-demo READMEs | Description, mechanisms, controls, YouTube link, deployment/release, sources and known limits |
| Browser deployment | Public HTTPS landing page and Demos 1/3/4 return HTTP 200; package excludes recordings, Unity source and APKs |
| Quest release | `demo2-v1.0.4.apk` attached to tagged course and public Releases, with install instructions and dated change/validation notes |
| Automated checks | All 38 web tests pass; 14 JavaScript modules parse; four entrypoints/READMEs present; static packaging succeeds |
| Video exports | Four narrated files within 3–6 minutes; Demos 2–4 include uncropped Quest footage and the student's live-action inset throughout; decoding checks pass |
| YouTube access | All four uploaded as unlisted; each plays with the Sign in link visible in the separate signed-out browser, with advancing playback and no media error |
| Git hygiene | Local recordings and generated exports ignored; no APK, Unity Library/build/cache folder or node_modules tracked |
| History | Milestone history retained; course starter commit and `COURSE_STARTER_README.md` preserved on the course-submission branch |

| Demo | Video | Approximate local runtime |
| --- | --- | --- |
| 1 — Ride | [YouTube](https://youtu.be/aYnfPb46d2c) | 4:26 |
| 2 — Trainer | [YouTube](https://youtu.be/c6n03vLm3SU) | 5:12 |
| 3 — Procedure | [YouTube](https://youtu.be/vSC8ISrWH2g) | 4:02 |
| 4 — Hunt | [YouTube](https://youtu.be/hUUlV8C-KY8) | 5:43 |

Demo 1's supplied completed edit already contained narration; its quiet audio was raised by 14 dB without changing its video or timing. The silent `demo1video.mov` is not the uploaded version. Demos 2–4 use the student's explicitly requested start-to-start alignment and stop at the shortest source; timing is approximate, not precision synchronization. Quest game audio remains under the narration, and webcam microphone audio is excluded to avoid echo. Originals remain unchanged. The WhatsApp Quest copies are 848×478; a 1920×1080 export cannot restore the original detail.

The student reported the demos working before recording and supplied the personal evidence. The final delivery check is not a full-frame-by-frame rubric assessment or an independent sustained headset performance benchmark. Some original webcam frames crop the top of the user's head; the final export retains the original camera frame. Demo 4's ending includes Quest passthrough. Features earn points only if shown/explained in the actual video, and a coding agent cannot guarantee a grade. Earlier pending-evidence statements in [AUDIT.md](AUDIT.md) describe the historical pre-recording audit; the current links are above.

Keep the videos, public site and APK releases available through grading and the quiz. The separate **30-point portfolio quiz** remains the student's next responsibility: practice [QUIZ_GUIDE.md](QUIZ_GUIDE.md) without notes.

## Maintenance and deployment details

## Course repository

The required private course repository is [ugavrclass2026/portfolio-1-da42450](https://github.com/ugavrclass2026/portfolio-1-da42450), supplied by the student on October 8. The public [hosting repository](https://github.com/da42450/vr-portfolio-project-1) remains separate. The local `course` remote targets the private repo; `origin` targets public hosting. Preserve both development histories and keep the original course starter README in `COURSE_STARTER_README.md`. Every final evidence/docs change must reach the course repo before the deadline; pushing only origin does not submit it.

The local `main` branch follows public hosting. `codex/course-submission` contains the preserved course starter history plus the public development history. For future updates, commit/push public main, switch to `codex/course-submission`, merge main and push `HEAD:main` to the course remote, then return to main. Do not force-push one history over the other. Public Pages deployment is guarded to run only in `da42450/vr-portfolio-project-1`; it deliberately skips in the private grading repo.

## Web hosting

Public site: **https://da42450.github.io/vr-portfolio-project-1/**. GitHub Pages is configured to deploy through `.github/workflows/pages.yml` on every push to `main`. The workflow runs `npm test`, `npm run check` and `node tools/package-web.mjs`. The package copies **only** the three browser demos and their shared runtime/vendor files to `web-release/`, without Unity source, APK, temporary logs, personal photos or `.git`. Keep this public HTTPS site available through grading and the quiz.

The web package includes `index.html`, `Shared/`, `Demo1_Ride/`, `Demo3_Procedure/`, `Demo4_Hunt/`, plus the explanatory Demo 2 landing page with an APK link. Demos 3/4 are immersive WebXR; Demo 1 is desktop WebGL; Demo 2 is native Unity. Test the WebXR links in the Quest browser and select Enter VR. A desktop browser does not establish headset interaction or performance.

## APK release

The latest APK is `Demo2_Trainer/Builds/demo2-v1.0.4.apk` (ignored by Git), published in the [public demo2-v1.0.4 Release](https://github.com/da42450/vr-portfolio-project-1/releases/tag/demo2-v1.0.4) and the required [course demo2-v1.0.4 Release](https://github.com/ugavrclass2026/portfolio-1-da42450/releases/tag/demo2-v1.0.4), with [release notes](Demo2_Trainer/RELEASE_NOTES.md). Both are normal, non-draft Releases designated Latest. The APK is 21,972,183 bytes; both assets have SHA-256 `e55796f47b7227e9194eb6df7d06c66f6c07ffe958703c7751ea4e3b3ad2d9c7`. v1.0.4 fixes the machine-feed arc; exact results are in [the dated feed record](Demo2_Trainer/Validation/feed.md). It preserves the v1.0.3 settings panel, v1.0.2 comfortable grip and v1.0.1 startup fix. Do not use v1.0, which froze on the school Quest 3. Rebuild and publish a new Release after any future Unity code change.

## Optional repeat-test checklist

| Demo | Check before recording                                                                                                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Desktop steady frame rate; maps/specular/shadows visible; rider switch; compensated world tilt                                                                                                                                          |
| 2    | Install/launch; headset + both controllers; fast contact and swing direction; all board buttons; bounce readout; audio; repetition/score; sustained headset frame rate                                                                  |
| 3    | Alarm slider; simulated call; held-tool/low-pressure/WATER checks and recovery; both grips/releases; pin; nozzle tether; tank-hand squeeze; three spray zones/obstruction; automatic completion/reset/hint; readable panels; frame rate |
| 4    | Complete hunt entirely with teleport, then smooth; doorways/collisions; both turning modes; stereo vignette/fade; speed/calibration/reset; persisted settings after browser restart; frame rate                                         |

For any future retest, record observed frame rates and adjustments honestly. For Demos 3/4 the Exceeds delivery row specifically requires headset frame rate; don't substitute the desktop counter. The final videos and the explicit evidence limitations above take precedence over this reusable checklist.

## Recording requirements for future replacements

Record one **3–6 minute** video per demo, narrating the running application. For every VR demo, keep a live-action inset of yourself alongside the headset capture **for the whole video**. Use the READMEs' proof sequences and RUBRIC.md. Upload to YouTube public/unlisted, verify signed-out playback, and add all links. Your own recording and understanding cannot be generated or verified by a coding agent.

The submitted root README includes the student's genuine headshot, a short factual bio and the student-confirmed GPT-6.1 Sol inventory. Update the inventory if tools/models change; don't invent an exact model build identifier.

Read QUIZ_GUIDE.md and practice answering without notes. Final personalized quiz questions will come from what you actually submit; don't include untested features or claims.

## Final repository check

Meaningful milestones are pushed to the public repository. Confirm the required course repository also receives them before **October 8, 2026, 11:59 pm America/New_York**. Confirm no Library, builds, APKs, logs or node_modules are tracked. Confirm all four folders have final video/deployment links, sources, controls and known issues. A single upload at the deadline is not a substitute for a clear development history.
