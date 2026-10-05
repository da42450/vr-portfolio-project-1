using System;
using System.Linq;
using System.Reflection;
using UnityEngine;
using PortfolioTrainer;

// Editor-only checks exercise actual generated button colliders and trainer callbacks.
public static class MenuVerification
{
    static T Read<T>(Trainer trainer, string field) => (T)typeof(Trainer).GetField(field, BindingFlags.Instance | BindingFlags.NonPublic).GetValue(trainer);
    static void Require(bool condition, string message) { if (!condition) throw new Exception("Menu check: " + message); }
    public static void Validate(Trainer trainer)
    {
        var menu = UnityEngine.Object.FindFirstObjectByType<TrainerMenu>();
        var buttons = menu.GetComponentsInChildren<TrainerButton>();
        Require(buttons.Length == 10, "expected ten controls");
        Physics.SyncTransforms();
        foreach (var button in buttons)
        {
            Vector3 origin = button.transform.position - menu.transform.forward * 1.2f;
            Require(TrainerMenu.FindButton(origin, menu.transform.forward, out Vector3 end) == button, "ray missed " + button.name);
            Require(Vector3.Distance(end, button.transform.position) < .02f, "ray end differs from visible hit");
            Require(TrainerMenu.FindButton(origin - menu.transform.forward * 4f, menu.transform.forward, out _) == null, "ray exceeded four-metre limit");
            var label = button.GetComponentInChildren<TextMesh>().GetComponent<MeshRenderer>();
            Vector3 size = button.GetComponent<BoxCollider>().size;
            Require(label.localBounds.size.x < size.x - .02f && label.localBounds.size.y < size.y - .01f, "caption overflows " + button.name);
        }
        foreach (var filter in menu.GetComponentsInChildren<MeshFilter>())
        {
            Require(filter.sharedMesh.normals.All(n => n.z < -.99f), "rounded surface faces away");
        }
        TrainerButton Button(string caption) => buttons.First(b => b.name == "Menu button: " + caption);
        void Refresh() => menu.RefreshControls(Read<bool>(trainer, "feeding"), Read<float>(trainer, "launchSpeed"),
            Read<float>(trainer, "spinRate"), Read<float>(trainer, "windSpeed"), Read<bool>(trainer, "validation"));
        for (int i = 0; i < 5; i++) { Button("+").Activate(); Refresh(); }
        Require(Read<float>(trainer, "launchSpeed") == 6.5f && !Button("+").Enabled, "upper speed bound");
        for (int i = 0; i < 5; i++) { Button("−").Activate(); Refresh(); }
        Require(Read<float>(trainer, "launchSpeed") == 3.5f && !Button("−").Enabled, "lower speed bound");
        Button("+").Activate(); Refresh();
        foreach (var preset in new[] { ("Topspin −40", -40f), ("Backspin +40", 40f), ("None 0", 0f) })
        {
            Button(preset.Item1).Activate(); Refresh();
            Require(Read<float>(trainer, "spinRate") == preset.Item2 && Button(preset.Item1).Selected, "spin preset selection");
            Require(buttons.Count(b => b.Selected && (b.name.StartsWith("Menu button: Topspin") || b.name.StartsWith("Menu button: Backspin") || b.name == "Menu button: None 0")) == 1, "spin selection is not exclusive");
        }
        Vector3 flight = new Vector3(0, 0, -4.5f);
        float baseline = BallPhysics.Acceleration(flight, Vector3.zero, Vector3.zero).y;
        Require(BallPhysics.Acceleration(flight, Vector3.right * (-40 * Mathf.PI * 2), Vector3.zero).y < baseline, "topspin label must produce downward lift");
        Require(BallPhysics.Acceleration(flight, Vector3.right * (40 * Mathf.PI * 2), Vector3.zero).y > baseline, "backspin label must produce upward lift");
        Button("OFF · calm").Activate(); Refresh();
        Require(Read<float>(trainer, "windSpeed") == 1.5f && Button("OFF · calm").Selected, "wind on state");
        Button("OFF · calm").Activate(); Refresh();
        Button("Start auto feed").Activate(); Refresh();
        Require(Read<bool>(trainer, "feeding") && Button("Start auto feed").Selected, "auto-feed on state");
        Button("Start auto feed").Activate(); Refresh();
        Button("Feed one ball").Activate(); Refresh();
        Require(Read<int>(trainer, "serves") == 1, "one-ball feed callback");
        Button("Reset score").Activate(); Refresh();
        Require(Read<int>(trainer, "serves") == 0 && Read<int>(trainer, "score") == 0, "reset callback");
        Button("Run bounce check").Activate(); Refresh();
        Require(Read<bool>(trainer, "validation") && !Read<bool>(trainer, "feeding"), "bounce mode must pause feed");
        Require(!Button("Feed one ball").Enabled && !Button("Start auto feed").Enabled && !Button("Run bounce check").Enabled, "measurement must block feed/restart");
        Button("Feed one ball").Activate();
        Require(Read<int>(trainer, "serves") == 0, "disabled feed control activated");
        System.IO.Directory.CreateDirectory("Validation");
        System.IO.File.WriteAllText("Validation/menu-results.json", "{\"generated_buttons\":10,\"all_ray_targets_pass\":true,\"button_captions_fit\":true,\"ray_length_m\":4,\"rounded_normals_face_player\":true,\"speed_bounds_pass\":true,\"spin_presets_exclusive\":true,\"spin_labels_match_lift\":true,\"feed_wind_reset_pass\":true,\"bounce_blocks_feed\":true}");
        Debug.Log("MENU_VALIDATED: ten ray targets, caption bounds, geometry, speed bounds, exclusive spin/lift labels, feed/wind/reset and bounce guards passed.");
    }
}
