using System;
using System.Collections.Generic;
using UnityEngine;
using PortfolioTrainer;

public static class FeedVerification
{
    [Serializable] public sealed class Result
    {
        public float speed, spin, wind, vertical_speed, net_clearance_cm, bounce_z;
    }
    [Serializable] public sealed class Report
    {
        public string test;
        public int tested_presets, legacy_invalid_feeds;
        public float minimum_net_clearance_cm;
        public Result[] cases;
    }
    public static void ValidateNumerical() => Validate(false);
    public static void ValidateScene() => Validate(true);
    static void Validate(bool scene)
    {
        var results = new List<Result>(); int legacyFailures = 0; float minimum = float.PositiveInfinity;
        if (scene) Physics.SyncTransforms();
        foreach (float speed in new[] { 3.5f, 4.5f, 5.5f, 6.5f })
        foreach (float spin in new[] { 0f, -40f, 40f })
        foreach (float wind in new[] { 0f, 1.5f })
        {
            float oldTime = 1.35f / speed;
            float oldVertical = (-.35f + .5f * BallPhysics.Gravity * oldTime * oldTime) / oldTime;
            Vector3 oldLanding = FeedTrajectory.Predict(speed, oldVertical, spin, wind, out float oldClearance);
            if (oldClearance <= 0 || oldLanding.z >= FeedTrajectory.NetZ) legacyFailures++;
            Vector3 velocity = FeedTrajectory.Velocity(speed, spin, wind);
            Vector3 landing = FeedTrajectory.Predict(speed, velocity.y, spin, wind, out float clearance);
            if (clearance < .06f || Mathf.Abs(landing.z - FeedTrajectory.BounceZ) > .005f || Mathf.Abs(landing.x) > .70f)
                throw new Exception($"Unsafe feed: speed {speed}, spin {spin}, wind {wind}, clearance {clearance}, landing {landing}");
            if (scene) landing = FirstSceneContact(velocity, spin, wind);
            minimum = Mathf.Min(minimum, clearance);
            results.Add(new Result { speed = speed, spin = spin, wind = wind, vertical_speed = velocity.y, net_clearance_cm = clearance * 100, bounce_z = landing.z });
        }
        var report = new Report { test = scene ? "actual table/net colliders" : "force-model prediction", tested_presets = results.Count,
            legacy_invalid_feeds = legacyFailures, minimum_net_clearance_cm = minimum * 100, cases = results.ToArray() };
        System.IO.Directory.CreateDirectory("Validation");
        System.IO.File.WriteAllText(scene ? "Validation/feed-scene-results.json" : "Validation/feed-numerical-results.json", JsonUtility.ToJson(report, true));
        Debug.Log($"FEED_VALIDATED: {(scene ? "scene" : "numerical")} {results.Count} presets; minimum net clearance {minimum * 100:F2} cm; legacy invalid feeds {legacyFailures}.");
    }
    static Vector3 FirstSceneContact(Vector3 velocity, float spinRate, float windSpeed)
    {
        Vector3 position = FeedTrajectory.Origin, spin = Vector3.right * (spinRate * Mathf.PI * 2), wind = Vector3.right * windSpeed;
        var hits = new RaycastHit[16]; float dt = BallPhysics.Step / 4;
        for (int i = 0; i < 3600; i++)
        {
            Vector3 old = position; BallPhysics.Integrate(ref position, ref velocity, spin, wind, dt); spin *= Mathf.Exp(-.12f * dt);
            Vector3 delta = position - old; float distance = delta.magnitude;
            int count = Physics.SphereCastNonAlloc(old, BallPhysics.Radius, delta.normalized, hits, distance, ~(1 << TrainerMenu.ButtonLayer), QueryTriggerInteraction.Ignore);
            float nearest = float.PositiveInfinity; int index = -1;
            for (int j = 0; j < count; j++) if (hits[j].distance < nearest) { nearest = hits[j].distance; index = j; }
            if (index < 0) continue;
            var hit = hits[index]; Vector3 center = old + delta.normalized * hit.distance;
            if (hit.collider.name != "Table" || hit.normal.y < .99f || Mathf.Abs(center.z - FeedTrajectory.BounceZ) > .03f)
                throw new Exception("Feed hit " + hit.collider.name + " instead of the player-side table bounce: " + center);
            return center;
        }
        throw new Exception("Feed never contacted the actual table.");
    }
}
