using System;
using System.Collections.Generic;
using UnityEngine;

namespace PortfolioTrainer
{
    // Only choose the launch velocity. The live ball still follows the normal force/contact solver.
    public static class FeedTrajectory
    {
        public static readonly Vector3 Origin = new Vector3(0, 1.13f, 2.85f);
        public const float BounceZ = .85f, TableTop = .76f, NetZ = 1.7f, NetTop = .9125f;
        static readonly Dictionary<(float, float, float), Vector3> cache = new Dictionary<(float, float, float), Vector3>();

        public static Vector3 Velocity(float speed, float spinRate, float windSpeed)
        {
            var key = (speed, spinRate, windSpeed);
            if (cache.TryGetValue(key, out Vector3 velocity)) return velocity;
            float low = -2f, high = low + 1f;
            // Find the first arc long enough to land on the player's half.
            while (Predict(speed, high, spinRate, windSpeed, out _).z > BounceZ && high < 10f) high += 1f;
            if (high >= 10f) throw new InvalidOperationException("No reachable training feed arc for this preset.");
            // Raise the arc when it lands short; lower it when it lands too far.
            for (int i = 0; i < 16; i++)
            {
                float middle = (low + high) * .5f;
                if (Predict(speed, middle, spinRate, windSpeed, out _).z > BounceZ) low = middle;
                else high = middle;
            }
            velocity = new Vector3(0, (low + high) * .5f, -speed);
            cache.Add(key, velocity); return velocity;
        }
        // Predict the first table-height crossing using the same integration and spin damping as play.
        public static Vector3 Predict(float speed, float vertical, float spinRate, float windSpeed, out float netClearance)
        {
            Vector3 position = Origin, velocity = new Vector3(0, vertical, -speed);
            Vector3 spin = Vector3.right * (spinRate * Mathf.PI * 2f), wind = Vector3.right * windSpeed;
            float height = TableTop + BallPhysics.Radius, dt = BallPhysics.Step / 4;
            netClearance = float.NegativeInfinity;
            for (int i = 0; i < 3600; i++)
            {
                Vector3 old = position;
                BallPhysics.Integrate(ref position, ref velocity, spin, wind, dt);
                spin *= Mathf.Exp(-.12f * dt);
                if (old.z > NetZ && position.z <= NetZ)
                {
                    float fraction = (old.z - NetZ) / (old.z - position.z);
                    netClearance = Vector3.Lerp(old, position, fraction).y - BallPhysics.Radius - NetTop;
                }
                if (position.y <= height && velocity.y < 0)
                {
                    float fraction = (old.y - height) / (old.y - position.y);
                    return Vector3.Lerp(old, position, fraction);
                }
            }
            throw new InvalidOperationException("Training-feed prediction did not reach table height.");
        }
    }
}
