using System.Collections.Generic;
using System.Diagnostics;
using UnityEngine;
using UnityEngine.XR;
using Debug = UnityEngine.Debug;

namespace PortfolioTrainer
{
    public sealed class Trainer : MonoBehaviour
    {
        Transform ball, paddle, rig;
        Rigidbody paddleBody;
        TrackedPose head, left, right;
        TextMesh readout, validationText;
        SpatialAudio audioSystem;
        readonly RaycastHit[] hits = new RaycastHit[16];
        readonly List<XRInputSubsystem> inputSubsystems = new List<XRInputSubsystem>();
        Vector3 position, velocity, spin, previousPaddle;
        Quaternion previousPaddleRotation;
        readonly Vector3 paddleOffset = new Vector3(0, .06f, .07f);
        bool active, feeding, lastTrigger, lastSecondary, validation, bounced, hitPaddle;
        float nextFeed, launchSpeed = 4.5f, spinRate, windSpeed, ballAge, contactCooldown;
        float reboundHeight, validationStart, lastHUD, frameAverage = 1f / 72f, physicsMilliseconds;
        int serves, returns, score, targetIndex;
        readonly Vector3[] targets = { new Vector3(-.48f, .78f, 2.3f), new Vector3(0, .78f, 2.65f), new Vector3(.48f, .78f, 2.3f) };
        Material[] targetMaterials;
        readonly Stopwatch physicsTimer = new Stopwatch();

        void Start()
        {
            Time.fixedDeltaTime = BallPhysics.Step; Time.maximumDeltaTime = .1f;
            Application.targetFrameRate = 72; QualitySettings.vSyncCount = 0;
            Physics.queriesHitTriggers = false; Physics.autoSyncTransforms = false;
            RenderSettings.ambientLight = new Color(.65f, .7f, .72f);
            var sun = new GameObject("Directional light").AddComponent<Light>(); sun.type = LightType.Directional; sun.intensity = 1.1f; sun.transform.rotation = Quaternion.Euler(50, -30, 0);
            BuildRoom(); BuildTracking(); BuildBall(); BuildMenu();
            previousPaddle = paddle.position; previousPaddleRotation = paddle.rotation;
            SubsystemManager.GetSubsystems(inputSubsystems);
            foreach (var input in inputSubsystems) input.TrySetTrackingOriginMode(TrackingOriginModeFlags.Floor);
            Physics.SyncTransforms();
        }
        static Material Mat(Color color)
        {
            var template = Resources.Load<Material>("SurfaceTemplate");
            var m = template ? new Material(template) : new Material(Shader.Find("Standard"));
            m.color = color; m.SetFloat("_Glossiness", .15f); return m;
        }
        static GameObject Cube(string name, Vector3 size, Vector3 pos, Material mat, bool solid = true)
        {
            var g = GameObject.CreatePrimitive(PrimitiveType.Cube); g.name = name; g.transform.position = pos; g.transform.localScale = size; g.GetComponent<Renderer>().sharedMaterial = mat;
            if (!solid) Destroy(g.GetComponent<Collider>()); return g;
        }
        static TextMesh Text(string text, Vector3 pos, float size = .045f)
        {
            var g = new GameObject("Text: " + text); g.transform.position = pos;
            var t = g.AddComponent<TextMesh>(); t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            g.GetComponent<MeshRenderer>().sharedMaterial = t.font.material;
            t.text = text; t.fontSize = 48; t.characterSize = size; t.anchor = TextAnchor.MiddleCenter; t.alignment = TextAlignment.Center; t.color = new Color(.1f, .22f, .26f); return t;
        }
        void BuildRoom()
        {
            var gray = Mat(new Color(.62f, .7f, .7f)); var tableMat = Mat(new Color(.08f, .35f, .4f)); var white = Mat(Color.white);
            Cube("Floor", new Vector3(10, .1f, 12), new Vector3(0, -.05f, 2), gray);
            Cube("Table", new Vector3(1.525f, .06f, 2.74f), new Vector3(0, .73f, 1.7f), tableMat);
            foreach (float x in new[] { -.65f, .65f }) foreach (float z in new[] { .5f, 2.85f }) Cube("Table leg", new Vector3(.07f, .7f, .07f), new Vector3(x, .35f, z), gray);
            foreach (float x in new[] { -.7525f, .7525f }) Cube("White side line", new Vector3(.02f, .002f, 2.74f), new Vector3(x, .762f, 1.7f), white, false);
            foreach (float z in new[] { .34f, 3.06f }) Cube("White end line", new Vector3(1.525f, .002f, .02f), new Vector3(0, .762f, z), white, false);
            Cube("Net", new Vector3(1.83f, .1525f, .008f), new Vector3(0, .83625f, 1.7f), gray);
            targetMaterials = new Material[3];
            for (int i = 0; i < 3; i++)
            {
                targetMaterials[i] = Mat(i == 0 ? new Color(.95f, .73f, .23f) : new Color(.62f, .81f, .72f));
                Cube("Target " + (i + 1), new Vector3(.32f, .006f, .34f), targets[i], targetMaterials[i], false);
                Text((i + 1).ToString(), targets[i] + Vector3.up * .16f, .028f);
            }
            Cube("Ball machine", new Vector3(.3f, .4f, .35f), new Vector3(0, 1.13f, 3.3f), gray, false);
            Text("SPIN TRAINER", new Vector3(0, 2.25f, 3.4f), .07f);
        }
        void BuildTracking()
        {
            rig = new GameObject("Tracking space — no locomotion").transform;
            head = Pose("Head", XRNode.Head); head.transform.localPosition = new Vector3(0, 1.6f, 0);
            var camera = head.gameObject.AddComponent<Camera>(); camera.nearClipPlane = .05f; camera.farClipPlane = 30;
            camera.clearFlags = CameraClearFlags.SolidColor; camera.backgroundColor = new Color(.75f, .83f, .86f); head.gameObject.AddComponent<AudioListener>();
            left = Pose("Left controller — menu ray", XRNode.LeftHand); right = Pose("Right controller — paddle", XRNode.RightHand);
            left.transform.localPosition = new Vector3(-.3f, 1.1f, .2f); right.transform.localPosition = new Vector3(.25f, 1.05f, .3f);
            paddle = new GameObject("Kinematic tracked paddle").transform;
            var disk = GameObject.CreatePrimitive(PrimitiveType.Cylinder); disk.name = "Paddle rubber face"; Destroy(disk.GetComponent<Collider>());
            disk.transform.SetParent(paddle, false); disk.transform.localRotation = Quaternion.Euler(90, 0, 0); disk.transform.localScale = new Vector3(.17f, .006f, .18f); disk.GetComponent<Renderer>().sharedMaterial = Mat(new Color(.73f, .15f, .2f));
            var handle = Cube("Paddle handle", new Vector3(.027f, .105f, .023f), Vector3.zero, Mat(new Color(.63f, .45f, .24f)), false); handle.transform.SetParent(paddle, false); handle.transform.localPosition = new Vector3(0, -.11f, 0);
            paddleBody = paddle.gameObject.AddComponent<Rigidbody>(); paddleBody.isKinematic = true; paddleBody.useGravity = false; paddleBody.interpolation = RigidbodyInterpolation.Interpolate; paddleBody.collisionDetectionMode = CollisionDetectionMode.ContinuousSpeculative;
            var shape = paddle.gameObject.AddComponent<BoxCollider>(); shape.size = new Vector3(.17f, .18f, .012f); shape.isTrigger = true;
            // Collider documents the kinematic shape. The relative swept disk performs contact explicitly.
            var ray = left.gameObject.AddComponent<LineRenderer>(); ray.positionCount = 2; ray.useWorldSpace = false; ray.SetPosition(0, Vector3.zero); ray.SetPosition(1, Vector3.forward * 3.5f); ray.startWidth = ray.endWidth = .003f; ray.material = new Material(Shader.Find("Sprites/Default")); ray.startColor = ray.endColor = new Color(.1f, .65f, .7f);
        }
        TrackedPose Pose(string name, XRNode node)
        {
            var g = new GameObject(name); g.transform.SetParent(rig, false); var pose = g.AddComponent<TrackedPose>(); pose.node = node; return pose;
        }
        void BuildBall()
        {
            var g = GameObject.CreatePrimitive(PrimitiveType.Sphere); g.name = "40 mm / 2.7 g ball"; Destroy(g.GetComponent<Collider>());
            g.transform.localScale = Vector3.one * .04f; g.GetComponent<Renderer>().sharedMaterial = Mat(new Color(1, .78f, .26f)); ball = g.transform; ball.position = new Vector3(0, 1.1f, 3.1f); position = ball.position;
            audioSystem = new GameObject("Spatial room audio").AddComponent<SpatialAudio>(); audioSystem.transform.position = new Vector3(2, 1, 3); audioSystem.Initialize(ball);
        }
        void BuildMenu()
        {
            var backing = Mat(new Color(.92f, .97f, .96f));
            Cube("Readout board", new Vector3(2.4f, 1.7f, .06f), new Vector3(-2.05f, 1.65f, 2.15f), backing, false);
            readout = Text("Ready", new Vector3(-2.05f, 2.19f, 2.1f), .017f);
            validationText = Text("Bounce check: not run", new Vector3(-2.05f, 1.73f, 2.1f), .013f);
            Button("Feed on / off", new Vector3(-2.65f, 1.49f, 2.1f), ToggleFeed);
            Button("Speed", new Vector3(-1.48f, 1.49f, 2.1f), () => launchSpeed = launchSpeed < 6.5f ? launchSpeed + 1f : 3.5f);
            Button("Spin", new Vector3(-2.65f, 1.24f, 2.1f), () => spinRate = spinRate == 0 ? 40 : spinRate > 0 ? -40 : 0);
            Button("Wind", new Vector3(-1.48f, 1.24f, 2.1f), () => windSpeed = windSpeed == 0 ? 1.5f : 0);
            Button("Bounce check", new Vector3(-2.65f, .99f, 2.1f), BeginValidation);
            Button("Reset score", new Vector3(-1.48f, .99f, 2.1f), ResetScore);
            Text("LEFT TRIGGER: menu ray\nRIGHT TRIGGER: feed one ball\nRIGHT A: toggle feed / B: reset score", new Vector3(0, 1.55f, 3.42f), .03f);
        }
        void Button(string caption, Vector3 pos, System.Action action)
        {
            var b = Cube(caption, new Vector3(1.02f, .18f, .06f), pos, Mat(new Color(.13f, .4f, .43f)));
            var label = Text(caption, pos + Vector3.back * .035f, .025f); label.color = Color.white;
            var button = b.AddComponent<TrainerButton>(); button.Click = action;
        }
        void ToggleFeed() { feeding = !feeding; nextFeed = Time.time + .5f; }
        void ResetScore() { score = serves = returns = 0; }
        bool lastRightTrigger, lastPrimary;
        void Update()
        {
            frameAverage = Mathf.Lerp(frameAverage, Time.unscaledDeltaTime, .03f);
            if (left.Trigger && !lastTrigger && Physics.Raycast(left.transform.position, left.transform.forward, out var hit, 8)) hit.collider.GetComponent<TrainerButton>()?.Click?.Invoke();
            lastTrigger = left.Trigger;
            if (right.Trigger && !lastRightTrigger && !validation) Launch(); lastRightTrigger = right.Trigger;
            if (right.Primary && !lastPrimary) ToggleFeed(); lastPrimary = right.Primary;
            if (right.Secondary && !lastSecondary) ResetScore(); lastSecondary = right.Secondary;
            if (feeding && !validation && Time.time >= nextFeed && !active) Launch();
            audioSystem.UpdateFlight(velocity.magnitude, active);
            if (Time.time - lastHUD > .2f)
            {
                lastHUD = Time.time;
                readout.text = $"Serves {serves}  Returns {returns}  Score {score}\nLaunch {launchSpeed:F1} m/s  Spin {spinRate:F0} rev/s\nBall {velocity.magnitude:F1} m/s  Swing {right.PoseVelocity.magnitude:F1} m/s\nWind {windSpeed:F1} m/s   Target {targetIndex + 1}\nFixed 180 Hz / 4 sweeps   FPS {1f / frameAverage:F0}\nPhysics CPU {physicsMilliseconds:F3} ms / 13.89 ms frame\nFeed {(feeding ? "ON" : "OFF")} · right hand {(right.Tracked ? "tracked" : "not tracked")}";
            }
        }
        void Launch()
        {
            validation = false; active = true; ballAge = 0; hitPaddle = false; serves++;
            position = new Vector3(0, 1.13f, 2.85f);
            float time = 1.35f / launchSpeed;
            float vertical = (-.35f + .5f * BallPhysics.Gravity * time * time) / time;
            velocity = new Vector3(0, vertical, -launchSpeed); spin = Vector3.right * (spinRate * Mathf.PI * 2f);
            contactCooldown = 0; nextFeed = Time.time + 2.5f;
        }
        public void BeginValidation()
        {
            feeding = false; validation = active = true; bounced = false; ballAge = reboundHeight = 0;
            position = new Vector3(.35f, .76f + BallPhysics.Radius + .30f, 2.2f); velocity = spin = Vector3.zero;
            validationStart = position.y; validationText.text = "REFERENCE: 30 cm drop → about 23 cm rebound\nMeasuring simulated drop with drag enabled…";
        }
        void FixedUpdate()
        {
            if (!paddle) return;
            physicsTimer.Restart();
            Vector3 current = right.transform.TransformPoint(paddleOffset); Quaternion rotation = right.transform.rotation;
            paddleBody.MovePosition(current); paddleBody.MoveRotation(rotation);
            // Subdivide contact queries to account for rotation as well as relative translation.
            const int substeps = 4; float dt = Time.fixedDeltaTime / substeps;
            for (int sub = 0; sub < substeps; sub++)
            {
                if (!active) break;
                float a = (float)sub / substeps, b = (float)(sub + 1) / substeps;
                Vector3 oldPosition = position;
                BallPhysics.Integrate(ref position, ref velocity, spin, validation ? Vector3.zero : Vector3.right * windSpeed, dt);
                Vector3 c0 = Vector3.Lerp(previousPaddle, current, a), c1 = Vector3.Lerp(previousPaddle, current, b);
                Quaternion r0 = Quaternion.Slerp(previousPaddleRotation, rotation, a), r1 = Quaternion.Slerp(previousPaddleRotation, rotation, b);
                contactCooldown -= dt;
                if (!validation && right.Tracked && contactCooldown <= 0 && BallPhysics.SweptPaddle(oldPosition, position, c0, c1, r0, r1, out Vector3 normal, out float fraction))
                {
                    Vector3 contact = Vector3.Lerp(oldPosition, position, fraction);
                    Vector3 faceVelocity = right.PoseVelocity + Vector3.Cross(right.AngularVelocity, contact - right.transform.position);
                    float speed = Mathf.Abs(Vector3.Dot(velocity - faceVelocity, normal));
                    BallPhysics.Contact(ref velocity, ref spin, normal, faceVelocity, BallPhysics.PaddleRestitutionAtSpeed(speed), BallPhysics.PaddleFriction);
                    position = contact + normal * .002f + velocity * dt * (1f - fraction);
                    audioSystem.Impact(contact, speed, "Paddle"); right.Haptic(speed / 18f); contactCooldown = .025f;
                    if (!hitPaddle) { hitPaddle = true; returns++; score += 10; }
                }
                SweepWorld(oldPosition, dt);
                spin *= Mathf.Exp(-.12f * dt); // explicit weak aerodynamic spin damping, a stated approximation
                ballAge += dt;
                if (validation && bounced)
                {
                    reboundHeight = Mathf.Max(reboundHeight, position.y - .76f - BallPhysics.Radius);
                    if (velocity.y <= 0)
                    {
                        float error = Mathf.Abs(reboundHeight - .23f) / .23f * 100;
                        validationText.text = $"ITTF reference: 30 cm → about 23 cm\nSimulated rebound {reboundHeight * 100:F2} cm\nDifference {error:F2}% · 180 Hz · gravity + drag";
                        Debug.Log("BOUNCE_VALIDATION_CM=" + (reboundHeight * 100).ToString("F3")); active = validation = false;
                    }
                }
                if (ballAge > 5 || position.y < -.2f || Mathf.Abs(position.x) > 5 || position.z < -2 || position.z > 7) active = false;
            }
            previousPaddle = current; previousPaddleRotation = rotation;
            if (ball) ball.position = position;
            physicsTimer.Stop(); physicsMilliseconds = (float)physicsTimer.Elapsed.TotalMilliseconds;
        }
        void SweepWorld(Vector3 start, float dt)
        {
            Vector3 delta = position - start; float distance = delta.magnitude;
            if (distance < .000001f) return;
            int count = Physics.SphereCastNonAlloc(start, BallPhysics.Radius, delta / distance, hits, distance, ~0, QueryTriggerInteraction.Ignore);
            float nearest = float.PositiveInfinity; int index = -1;
            for (int i = 0; i < count; i++)
            {
                if (hits[i].collider.GetComponent<TrainerButton>() != null) continue;
                if (hits[i].distance < nearest && Vector3.Dot(velocity, hits[i].normal) < 0) { nearest = hits[i].distance; index = i; }
            }
            if (index < 0) return;
            var hit = hits[index]; bool table = hit.collider.name == "Table";
            Vector3 contact = start + delta.normalized * hit.distance;
            float incomingSpeed = velocity.magnitude;
            BallPhysics.Contact(ref velocity, ref spin, hit.normal, Vector3.zero, table ? BallPhysics.TableRestitution : BallPhysics.FloorRestitution, table ? BallPhysics.TableFriction : .3f);
            position = contact + hit.normal * .0005f + velocity * dt * Mathf.Clamp01(1f - hit.distance / distance);
            audioSystem.Impact(hit.point, incomingSpeed, table ? "Table" : "Floor");
            if (validation && table && !bounced) { bounced = true; reboundHeight = 0; }
            if (table && hitPaddle && Vector3.Distance(new Vector3(hit.point.x, .78f, hit.point.z), targets[targetIndex]) < .24f)
            {
                score += 100; targetMaterials[targetIndex].color = new Color(.62f, .81f, .72f); targetIndex = (targetIndex + 1) % 3; targetMaterials[targetIndex].color = new Color(.95f, .73f, .23f); hitPaddle = false;
            }
            // At low normal speed switch to rolling instead of repeatedly generating tiny bounces.
            if (!validation && hit.normal.y > .9f && Mathf.Abs(velocity.y) < .12f)
            {
                velocity.y = 0; velocity = Vector3.MoveTowards(velocity, Vector3.zero, .12f * BallPhysics.Gravity * dt);
                position.y = hit.point.y + BallPhysics.Radius + .0005f;
            }
        }
    }
    public sealed class TrainerButton : MonoBehaviour { public System.Action Click; }
}
