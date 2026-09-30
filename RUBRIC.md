# Full-mark evidence map

Source: [professor's project/rubric](https://vr26.vn.ugavel.com/PortfolioProject1/). **No local implementation guarantees a grade.** The video is primary evidence; a missing compliant video means zero for that demo. A non-running deployment caps every criterion at Does Not Meet. This file separates implemented mechanisms from evidence you still must record.

| Demo / criterion | Points | Implementation                                                                           | Required evidence                                                                                |
| ---------------- | ------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1 hierarchy      | 5      | Turntable→wheel→leveling pivot→cabin→rocking seat; parent compensation                   | Show three moving levels and zero world tilt; inject/restore fault                               |
| 1 graphics       | 3      | Custom BufferGeometry UV strips; colour, normal and emission maps; fairground            | Explain your UVs and show visible map effects                                                    |
| 1 lighting       | 3      | Directional, point, spot; diffuse/specular; night; one shadow map                        | Identify lights/highlights; compare shadows and explain extra pass/map cost                      |
| 1 views          | 2      | Ground/rider; rider camera parent is seat                                                | Switch and explain inherited movement                                                            |
| 1 explanation    | 2      | Cabin normal/winding correction with dot-product test; hierarchy diagnostic              | Explain the inward-normal bug and how its test found it; distinguish the injected leveling fault |
| 2 physics        | 4      | Launch, gravity/drag/Magnus, paddle impulse, spin bounce/roll, wind                      | Show spin changing bounce and wind changing flight                                               |
| 2 accuracy       | 4      | SI quantities; parameter provenance; 180 Hz; continuous sweeps; ITTF bounce check        | Run measurement on Quest and show result/reference; verify fast swings                           |
| 2 tracking       | 2      | Kinematic controller racket with pose-derived contact velocity                           | Slow/fast and directional swings must visibly change ball outcome                                |
| 2 audio          | 2      | 3D approach/impacts/ambience; material + intensity variation                             | Make spatial audio audible and compare soft/hard, table/paddle impacts                           |
| 2 practice       | 1      | Repetition, speed/spin readouts, targets, returns and score                              | Use the loop repeatedly and show feedback                                                        |
| 2 explanation    | 2      | Explicit systems/timestep/sweeps and CPU budget readout                                  | Explain accuracy check and expensive work versus 13.89 ms at 72 Hz                               |
| 3 procedure      | 4      | Eight states; prerequisites; wrong-part/order errors; recovery; completion/reset         | Make a mistake, recover without reset, then finish and reset                                     |
| 3 manipulation   | 4      | Both hands, grip parenting, snap tray/holster, two-handed nozzle, pin slider/lever hinge | Actual hands/controllers grab/release; show constrained motions                                  |
| 3 guidance       | 3      | In-world current step/highlight/hint; USFA/OSHA sources                                  | Use hint; explain the real procedure source                                                      |
| 3 delivery       | 2      | Quest WebXR path implemented                                                             | Actual public HTTPS run at headset refresh rate; no setup surprises                              |
| 3 explanation    | 2      | State machine + trigger volumes/events; scripted constraint tradeoff                     | Name detection mechanism and explain predictability versus physical fidelity                     |
| 4 world          | 4      | Four signed regions, landmark, 25 similar bins, 5 targets, progress/time/score           | Navigate regions and distinguish codes up close                                                  |
| 4 locomotion     | 4      | Teleport arc/fade + head-relative smooth motion; bounds/doorways                         | Use both throughout; explain comfort/speed suitability                                           |
| 4 comfort        | 3      | Vignette, snap/smooth turn, fade, speed, seated/calibration/reset, persisted preferences | Show every setting and reload to prove persistence                                               |
| 4 delivery       | 2      | Quest WebXR path implemented                                                             | Actual public HTTPS run at headset refresh rate                                                  |
| 4 explanation    | 2      | Documented visual/vestibular conflict and effects                                        | Explain why each feature helps while using it                                                    |
| deployment       | 5      | Local static sites/APK/build notes                                                       | Durable public HTTPS URLs; tagged APK Release/install notes/change notes                         |
| repo/docs        | 5      | Exact folders, sources, READMEs, AI inventory, local milestone commits, ignore rules     | Course repo push, your headshot/bio, final links, clear commit history                           |
| quiz             | 30     | QUIZ_GUIDE.md tied to actual code                                                        | You independently explain the specific choices without notes                                     |

Before calling any criterion finished, prove it in the live application and then include that proof in the 3–6 minute video. Check on-device controller details and stereo comfort effects; desktop simulation does not establish VR delivery or manipulation points.
