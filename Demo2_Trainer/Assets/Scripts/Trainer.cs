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
        TrainerMenu menu;
        SpatialAudio audioSystem;
        readonly RaycastHit[] hits = new RaycastHit[16];
        readonly List<XRInputSubsystem> inputSubsystems = new List<XRInputSubsystem>();
        Vector3 position, velocity, spin, previousPaddle;
        Quaternion previousPaddleRotation;
        bool active, feeding, lastSecondary, validation, bounced, hitPaddle;
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
            Debug.Log("TRAINER_READY: table, paddle, controls and audio initialized.");
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
            PaddleGrip.GetFacePose(right.transform.position, right.transform.rotation, out Vector3 initialPosition, out Quaternion initialRotation);
            paddle.SetPositionAndRotation(initialPosition, initialRotation);
            // Visuals follow the current grip every render frame, without Rigidbody interpolation lag.
            var visual = new GameObject("Paddle visuals — shakehand grip").transform;
            visual.SetParent(right.transform, false);
            PaddleGrip.GetFacePose(Vector3.zero, Quaternion.identity, out Vector3 localPosition, out Quaternion localRotation);
            visual.SetLocalPositionAndRotation(localPosition, localRotation);
            var disk = GameObject.CreatePrimitive(PrimitiveType.Cylinder); disk.name = "Paddle rubber face"; Destroy(disk.GetComponent<Collider>());
            disk.transform.SetParent(visual, false); disk.transform.localRotation = Quaternion.Euler(90, 0, 0); disk.transform.localScale = new Vector3(.17f, .006f, .18f); disk.GetComponent<Renderer>().sharedMaterial = Mat(new Color(.73f, .15f, .2f));
            var handle = Cube("Paddle handle", new Vector3(.027f, .105f, .023f), Vector3.zero, Mat(new Color(.63f, .45f, .24f)), false); handle.transform.SetParent(visual, false); handle.transform.localPosition = PaddleGrip.HandleCenter;
            paddleBody = paddle.gameObject.AddComponent<Rigidbody>(); paddleBody.isKinematic = true; paddleBody.useGravity = false; paddleBody.interpolation = RigidbodyInterpolation.None; paddleBody.collisionDetectionMode = CollisionDetectionMode.ContinuousSpeculative;
            var shape = paddle.gameObject.AddComponent<BoxCollider>(); shape.size = new Vector3(.17f, .18f, .012f); shape.isTrigger = true;
            // Collider documents the kinematic shape. The relative swept disk performs contact explicitly.
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
            menu = new GameObject("Training settings panel").AddComponent<TrainerMenu>();
            menu.Initialize(ToggleFeed, () => { if (!validation) Launch(); },
                delta => { launchSpeed = Mathf.Clamp(launchSpeed + delta, 3.5f, 6.5f); menu.ShowNotice($"Speed set to {launchSpeed:F1} m/s"); },
                value => { spinRate = value; menu.ShowNotice(value == 0 ? "No spin selected" : value < 0 ? "Topspin · −40 rev/s" : "Backspin · +40 rev/s"); },
                () => { windSpeed = windSpeed == 0 ? 1.5f : 0; menu.ShowNotice(windSpeed == 0 ? "Crosswind off" : "Crosswind · 1.5 m/s"); },
                BeginValidation, ResetScore);
            menu.RefreshControls(feeding, launchSpeed, spinRate, windSpeed, validation);
            Text("LEFT TRIGGER: menu ray\nRIGHT TRIGGER: feed one ball\nRIGHT A: toggle feed / B: reset score", new Vector3(0, 1.55f, 3.42f), .03f);
        }
        void ToggleFeed() { if (validation) return; feeding = !feeding; nextFeed = Time.time + .5f; menu.ShowNotice(feeding ? "Automatic feed on" : "Automatic feed paused"); }
        void ResetScore() { score = serves = returns = 0; menu.ShowNotice("Session score reset"); }
        bool lastRightTrigger, lastPrimary;
        void Update()
        {
            frameAverage = Mathf.Lerp(frameAverage, Time.unscaledDeltaTime, .03f);
            menu.UpdatePointer(left);
            if (right.Trigger && !lastRightTrigger && !validation) Launch(); lastRightTrigger = right.Trigger;
            if (right.Primary && !lastPrimary) ToggleFeed(); lastPrimary = right.Primary;
            if (right.Secondary && !lastSecondary) ResetScore(); lastSecondary = right.Secondary;
            if (feeding && !validation && Time.time >= nextFeed && !active) Launch();
            menu.RefreshControls(feeding, launchSpeed, spinRate, windSpeed, validation);
            audioSystem.UpdateFlight(velocity.magnitude, active);
            if (Time.time - lastHUD > .2f)
            {
                lastHUD = Time.time;
                menu.RefreshStats(score, returns, serves, targetIndex + 1, velocity.magnitude, right.PoseVelocity.magnitude, 1f / frameAverage, physicsMilliseconds, right.Tracked);
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
            menu.ShowNotice("Ball fed · aim for the yellow target");
        }
        public void BeginValidation()
        {
            feeding = false; validation = active = true; bounced = false; ballAge = reboundHeight = 0;
            position = new Vector3(.35f, .76f + BallPhysics.Radius + .30f, 2.2f); velocity = spin = Vector3.zero;
            validationStart = position.y; menu.SetBounceMessage("30 cm drop → about 23 cm · measuring…");
        }
        void FixedUpdate()
        {
            if (!paddle) return;
            physicsTimer.Restart();
            PaddleGrip.GetFacePose(right.transform.position, right.transform.rotation, out Vector3 current, out Quaternion rotation);
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
                        menu.SetBounceMessage($"Rebound {reboundHeight * 100:F2} cm / ≈23 cm · error {error:F2}%");
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
}
