# Finish the submission

## Course repository (human setup required)

In the class Discord, run `/accept portfolio-project-1 github:<your GitHub username>` and accept the GitHub invitation. The professor's bot creates the private repository; an unrelated personal repo cannot replace it. Give the resulting repository URL to your coding agent, or add it yourself as the local Git remote and push all milestone commits.

## Web hosting

Run `npm run check`, `npm test`, then `node tools/package-web.mjs`. It copies **only** the three web demos and their shared runtime/vendor files to `web-release/`, without Unity source, APK, temporary logs, personal photos or `.git`. Publish that static directory through Cloudflare Pages or a public GitHub Pages repo. The professor accepts public HTTPS with no login. Keep it available through grading and the quiz; a temporary tunnel is not durable hosting.

The web package includes `index.html`, `Shared/`, `Demo1_Ride/`, `Demo3_Procedure/`, `Demo4_Hunt/`, plus the explanatory Demo 2 landing page. After publishing, test each link in a signed-out desktop browser and the Quest browser. Replace all Deployment pending entries in the root/demo READMEs with the actual URLs. GitHub Actions Pages configuration is provided in `tools/github-pages.yml` if you choose a public mirror; put it in `.github/workflows/pages.yml` in that public repo only.

## APK release

The built APK is `Demo2_Trainer/Builds/demo2-v1.0.apk` (ignored by Git). Install it and test on your Quest. Create the course repo's `demo2-v1.0` Release with the APK as an asset and the provided [release notes](Demo2_Trainer/RELEASE_NOTES.md). Confirm it installs from the downloaded Release asset. Replace the pending Release link in both READMEs. Rebuild/release after any code change.

## On-device checks

| Demo | Check before recording                                                                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Desktop steady frame rate; maps/specular/shadows visible; rider switch; compensated world tilt                                                                                                  |
| 2    | Install/launch; headset + both controllers; fast contact and swing direction; all board buttons; bounce readout; audio; repetition/score; sustained headset frame rate                          |
| 3    | Both hand grips/releases; wrong part/order recovery; pin travel; pressure selection; nozzle tether; two-handed squeeze; all three spray zones; verify/reset/hint; readable panels; frame rate   |
| 4    | Complete hunt entirely with teleport, then smooth; doorways/collisions; both turning modes; stereo vignette/fade; speed/calibration/reset; persisted settings after browser restart; frame rate |

Record observed frame rates and any adjustments in the relevant README. For Demos 3/4 the Exceeds delivery row specifically requires headset frame rate; don't substitute the in-app desktop counter.

## Videos and personal evidence

Record one **3–6 minute** video per demo, narrating the running application. For every VR demo, keep a live-action inset of yourself alongside the headset capture **for the whole video**. Use the READMEs' proof sequences and RUBRIC.md. Upload to YouTube public/unlisted, verify signed-out playback, and add all links. Your own recording and understanding cannot be generated or verified by a coding agent.

Add your genuine headshot, confirm/edit the bio (≤100 words), and correct the AI inventory to match your actual tools/models. The existing biography is a minimal draft, not a claim about interests or achievements.

Read QUIZ_GUIDE.md and practice answering without notes. Final personalized quiz questions will come from what you actually submit; don't include untested features or claims.

## Final repository check

Meaningful local milestones already exist. Push them to the course repo before **October 8, 2026, 11:59 pm America/New_York**. Confirm no Library, builds, APKs, logs or node_modules are tracked. Confirm all four folders have final video/deployment links, sources, controls and known issues. A single upload at the deadline is not a substitute for a clear development history.
