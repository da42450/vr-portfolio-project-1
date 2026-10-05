using System;
using System.Collections.Generic;
using UnityEngine;

namespace PortfolioTrainer
{
    // A small world-space panel: every visible control has one explicit action.
    public sealed class TrainerMenu : MonoBehaviour
    {
        public const int ButtonLayer = 8;
        public const float RayLength = 4f;
        static readonly Color Background = new Color(.035f, .055f, .09f);
        static readonly Color Card = new Color(.065f, .095f, .14f);
        public static readonly Color Idle = new Color(.105f, .15f, .21f);
        public static readonly Color Accent = new Color(.18f, .86f, .73f);
        public static readonly Color Ink = new Color(.9f, .95f, .98f);
        public static readonly Color Muted = new Color(.52f, .66f, .75f);
        readonly List<TrainerButton> buttons = new List<TrainerButton>();
        TrainerButton feed, slower, faster, noSpin, topSpin, backSpin, wind, serve, bounce;
        TextMesh speedValue, scoreValue, motionValue, performanceValue, bounceValue, notice;
        LineRenderer ray;
        Transform cursor;
        TrainerButton hovered;
        bool lastTrigger;
        float noticeUntil;
        float displayedSpeed = float.NaN;

        public void Initialize(Action toggleFeed, Action serveBall, Action<float> changeSpeed,
            Action<float> chooseSpin, Action toggleWind, Action checkBounce, Action resetScore)
        {
            // Keep the whole panel in front-left of the table/net, with its face toward the player.
            transform.position = new Vector3(-1.45f, 1.55f, .8f);
            transform.rotation = Quaternion.LookRotation(new Vector3(-1.45f, 0, .8f));
            Surface("Panel edge", transform, new Vector2(1.78f, 1.98f), Vector3.zero, .09f, new Color(.15f, .25f, .32f));
            Surface("Panel", transform, new Vector2(1.76f, 1.96f), new Vector3(0, 0, -.003f), .08f, Background);
            Label("TRAINING", new Vector2(-.73f, .81f), .045f, Ink, TextAnchor.MiddleLeft);
            Label("LEFT RAY + TRIGGER", new Vector2(.75f, .82f), .015f, Accent, TextAnchor.MiddleRight);
            scoreValue = Label("Score 0     Returns 0     Target 1", new Vector2(0, .66f), .025f, Ink);
            feed = Button("Start auto feed", new Vector2(-.40f, .46f), new Vector2(.73f, .17f), toggleFeed);
            serve = Button("Feed one ball", new Vector2(.40f, .46f), new Vector2(.73f, .17f), serveBall);

            PanelCard("Speed card", .20f, .25f);
            Label("SPEED", new Vector2(-.69f, .22f), .019f, Muted, TextAnchor.MiddleLeft);
            slower = Button("−", new Vector2(-.08f, .20f), new Vector2(.22f, .17f), () => changeSpeed(-1));
            speedValue = Label("4.5 m/s", new Vector2(.29f, .20f), .033f, Ink);
            faster = Button("+", new Vector2(.66f, .20f), new Vector2(.22f, .17f), () => changeSpeed(1));

            PanelCard("Spin card", -.10f, .27f);
            Label("SPIN", new Vector2(-.69f, -.065f), .019f, Muted, TextAnchor.MiddleLeft);
            Label("rev/s", new Vector2(-.69f, -.12f), .015f, Muted, TextAnchor.MiddleLeft);
            noSpin = Button("None\n0", new Vector2(-.08f, -.10f), new Vector2(.30f, .19f), () => chooseSpin(0));
            topSpin = Button("Topspin\n−40", new Vector2(.28f, -.10f), new Vector2(.30f, .19f), () => chooseSpin(-40));
            backSpin = Button("Backspin\n+40", new Vector2(.64f, -.10f), new Vector2(.30f, .19f), () => chooseSpin(40));

            PanelCard("Wind card", -.37f, .20f);
            Label("CROSSWIND", new Vector2(-.69f, -.37f), .019f, Muted, TextAnchor.MiddleLeft);
            wind = Button("OFF · calm", new Vector2(.37f, -.37f), new Vector2(.79f, .15f), toggleWind);
            bounce = Button("Run bounce check", new Vector2(-.40f, -.59f), new Vector2(.73f, .16f), checkBounce);
            Button("Reset score", new Vector2(.40f, -.59f), new Vector2(.73f, .16f), resetScore);
            bounceValue = Label("30 cm drop → about 23 cm rebound", new Vector2(0, -.72f), .018f, Muted);
            notice = Label("Settings apply to the next ball", new Vector2(0, -.84f), .019f, Accent);
            motionValue = Label("Ball 0.0 m/s    Swing 0.0 m/s", new Vector2(0, -.90f), .017f, Muted);
            performanceValue = Label("180 Hz · 4 sweeps · 72 FPS", new Vector2(0, -.95f), .017f, Muted);

            ray = new GameObject("Menu aim ray").AddComponent<LineRenderer>();
            ray.positionCount = 2; ray.useWorldSpace = true; ray.startWidth = .002f; ray.endWidth = .004f;
            ray.sharedMaterial = MenuMaterial(Accent); ray.numCapVertices = 3;
            cursor = new GameObject("Menu hit dot").transform;
            Surface("Dot", cursor, new Vector2(.016f, .016f), Vector3.zero, .008f, Accent);
            cursor.gameObject.SetActive(false);
        }
        void PanelCard(string name, float y, float height) => Surface(name, transform,
            new Vector2(1.59f, height), new Vector3(0, y, -.009f), .025f, Card);

        public static Material MenuMaterial(Color color)
        {
            var template = Resources.Load<Material>("MenuSurface");
            var material = template ? new Material(template) : new Material(Shader.Find("Portfolio/MenuSurface"));
            material.color = color; return material;
        }
        // A clockwise triangle fan faces the player (-Z). Rounded corners use only 24 edge vertices.
        public static Mesh RoundedMesh(Vector2 size, float radius)
        {
            radius = Mathf.Min(radius, Mathf.Min(size.x, size.y) * .5f);
            const int perCorner = 6, count = 4 * perCorner;
            var vertices = new Vector3[count + 1]; var triangles = new int[count * 3];
            for (int corner = 0; corner < 4; corner++)
            {
                Vector2 center = new Vector2((corner == 0 || corner == 3 ? 1 : -1) * (size.x * .5f - radius),
                    (corner < 2 ? 1 : -1) * (size.y * .5f - radius));
                for (int j = 0; j < perCorner; j++)
                {
                    int index = corner * perCorner + j;
                    float angle = (corner * 90f + j * 90f / (perCorner - 1)) * Mathf.Deg2Rad;
                    vertices[index + 1] = center + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * radius;
                    triangles[index * 3] = 0; triangles[index * 3 + 1] = (index + 1) % count + 1; triangles[index * 3 + 2] = index + 1;
                }
            }
            var mesh = new Mesh { name = "Rounded panel", vertices = vertices, triangles = triangles };
            mesh.RecalculateNormals(); mesh.RecalculateBounds(); return mesh;
        }
        static Renderer Surface(string name, Transform parent, Vector2 size, Vector3 position, float radius, Color color)
        {
            var g = new GameObject(name); g.transform.SetParent(parent, false); g.transform.localPosition = position;
            g.AddComponent<MeshFilter>().sharedMesh = RoundedMesh(size, radius);
            var renderer = g.AddComponent<MeshRenderer>(); renderer.sharedMaterial = MenuMaterial(color);
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = false;
            return renderer;
        }
        TextMesh Label(string text, Vector2 position, float size, Color color, TextAnchor anchor = TextAnchor.MiddleCenter, Transform parent = null)
        {
            var g = new GameObject("Label: " + text); g.transform.SetParent(parent ? parent : transform, false);
            g.transform.localPosition = new Vector3(position.x, position.y, -.033f);
            var label = g.AddComponent<TextMesh>(); label.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            g.GetComponent<MeshRenderer>().sharedMaterial = label.font.material;
            // TextMesh's characterSize scales the 64-pixel glyphs; keep world text inside its control.
            label.text = text; label.fontSize = 64; label.characterSize = size * .35f; label.anchor = anchor;
            label.alignment = TextAlignment.Center; label.color = color; return label;
        }
        TrainerButton Button(string text, Vector2 position, Vector2 size, Action action)
        {
            var g = new GameObject("Menu button: " + text.Replace('\n', ' ')); g.layer = ButtonLayer;
            g.transform.SetParent(transform, false); g.transform.localPosition = new Vector3(position.x, position.y, -.015f);
            var collider = g.AddComponent<BoxCollider>(); collider.size = new Vector3(size.x, size.y, .02f);
            var visuals = new GameObject("Feedback visuals").transform; visuals.SetParent(g.transform, false);
            var edge = Surface("Outline", visuals, size, new Vector3(0, 0, -.012f), .025f, Muted);
            var fill = Surface("Fill", visuals, size - Vector2.one * .006f, new Vector3(0, 0, -.014f), .023f, Idle);
            var label = Label(text, Vector2.zero, text.Contains("\n") ? .025f : .030f, Ink, parent: visuals);
            var button = g.AddComponent<TrainerButton>();
            button.Initialize(visuals, fill.sharedMaterial, edge.sharedMaterial, label, action);
            buttons.Add(button); return button;
        }
        public void RefreshControls(bool feeding, float speed, float spin, float windSpeed, bool measuring)
        {
            if (displayedSpeed != speed) { speedValue.text = $"{speed:F1} m/s"; displayedSpeed = speed; }
            feed.SetState(feeding, !measuring, feeding ? "Pause auto feed" : "Start auto feed");
            slower.SetState(false, speed > 3.5f); faster.SetState(false, speed < 6.5f);
            noSpin.SetState(spin == 0); topSpin.SetState(spin < 0); backSpin.SetState(spin > 0);
            wind.SetState(windSpeed > 0, true, windSpeed > 0 ? "ON · 1.5 m/s" : "OFF · calm");
            serve.SetState(false, !measuring); bounce.SetState(measuring, !measuring, measuring ? "Measuring…" : "Run bounce check");
            string idleNotice = measuring ? "Bounce check pauses automatic feed" : "Settings apply to the next ball";
            if (Time.time > noticeUntil && notice.text != idleNotice) notice.text = idleNotice;
        }
        public void RefreshStats(int score, int returns, int serves, int target, float ballSpeed, float swingSpeed, float fps, float cpu, bool tracked)
        {
            scoreValue.text = $"Score {score}     Returns {returns}     Target {target}";
            motionValue.text = tracked ? $"Serves {serves} · ball {ballSpeed:F1} m/s · swing {swingSpeed:F1} m/s" : "Right controller not tracked";
            performanceValue.text = $"{fps:F0} FPS · physics {cpu:F3} / 13.89 ms · 180 Hz / 4";
        }
        public void SetBounceMessage(string text) => bounceValue.text = text;
        public void ShowNotice(string text) { notice.text = text; noticeUntil = Time.time + 2; }
        public static TrainerButton FindButton(Vector3 origin, Vector3 direction, out Vector3 end)
        {
            end = origin + direction.normalized * RayLength;
            if (!Physics.Raycast(origin, direction, out var hit, RayLength, 1 << ButtonLayer, QueryTriggerInteraction.Ignore)) return null;
            end = hit.point; return hit.collider.GetComponent<TrainerButton>();
        }
        public void UpdatePointer(TrackedPose hand)
        {
            bool tracked = hand.TryGetAimPose(out Vector3 origin, out Quaternion rotation);
            ray.enabled = tracked;
            Vector3 end = origin;
            TrainerButton target = tracked ? FindButton(origin, rotation * Vector3.forward, out end) : null;
            if (hovered != target) { if (hovered) hovered.Hovered = false; hovered = target; if (hovered) hovered.Hovered = true; }
            cursor.gameObject.SetActive(target != null);
            if (tracked)
            {
                ray.SetPosition(0, origin); ray.SetPosition(1, end);
                if (target) { cursor.position = end - rotation * Vector3.forward * .008f; cursor.rotation = transform.rotation; }
            }
            if (target && hand.Trigger && !lastTrigger && target.Enabled) { target.Activate(); hand.Haptic(.18f); }
            lastTrigger = hand.Trigger;
        }
    }
    public sealed class TrainerButton : MonoBehaviour
    {
        public bool Hovered;
        public bool Selected { get; private set; }
        public bool Enabled { get; private set; } = true;
        public Action Click;
        Transform visuals;
        Material fill, edge;
        TextMesh label;
        float pressedUntil;
        public void Initialize(Transform visualRoot, Material fillMaterial, Material edgeMaterial, TextMesh caption, Action action)
        { visuals = visualRoot; fill = fillMaterial; edge = edgeMaterial; label = caption; Click = action; }
        public void SetState(bool selected, bool enabled = true, string caption = null)
        { Selected = selected; Enabled = enabled; if (caption != null && label.text != caption) label.text = caption; }
        public void Activate() { if (!Enabled) return; pressedUntil = Time.time + .12f; Click?.Invoke(); }
        void Update()
        {
            if (!visuals) return;
            Color color = !Enabled ? TrainerMenu.Idle * .55f : Selected ? TrainerMenu.Accent * .65f : Hovered ? new Color(.17f, .29f, .37f) : TrainerMenu.Idle;
            fill.color = Color.Lerp(fill.color, color, Time.unscaledDeltaTime * 18f);
            edge.color = Hovered && Enabled ? TrainerMenu.Ink : Selected ? TrainerMenu.Accent : TrainerMenu.Muted * .55f;
            label.color = Enabled ? TrainerMenu.Ink : TrainerMenu.Muted;
            visuals.localPosition = Vector3.Lerp(visuals.localPosition, Vector3.forward * (Time.time < pressedUntil ? .004f : 0), Time.unscaledDeltaTime * 24f);
        }
    }
}
