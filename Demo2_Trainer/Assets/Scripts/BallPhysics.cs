using UnityEngine;

namespace PortfolioTrainer
{
    // SI units. Sources and explicit modeling assumptions are in PARAMETERS.md.
    public static class BallPhysics
    {
        public const float Mass = 0.0027f, Radius = 0.02f, Gravity = 9.80665f;
        public const float AirDensity = 1.225f, DragCoefficient = 0.47f;
        public const float TableRestitution = 0.896f, FloorRestitution = 0.55f;
        public const float PaddleRestitution = 0.82f, TableFriction = 0.16f, PaddleFriction = 0.35f;
        public const float Step = 1f / 180f;
        public static Vector3 Acceleration(Vector3 velocity, Vector3 spin, Vector3 wind, bool forces = true)
        {
            Vector3 result = Vector3.down * Gravity;
            if (!forces) return result;
            Vector3 relative = velocity - wind;
            float speed = relative.magnitude;
            if (speed < 0.0001f) return result;
            float area = Mathf.PI * Radius * Radius;
            result -= 0.5f * AirDensity * DragCoefficient * area / Mass * speed * relative;
            // Lift coefficient varies with spin ratio. Bound it to keep this simple model stable.
            float ratio = spin.magnitude * Radius / speed;
            float liftCoefficient = Mathf.Min(0.6f, 0.6f * ratio);
            Vector3 liftDirection = Vector3.Cross(spin, relative).normalized;
            result += 0.5f * AirDensity * area / Mass * liftCoefficient * speed * speed * liftDirection;
            return result;
        }
        public static void Integrate(ref Vector3 position, ref Vector3 velocity, Vector3 spin, Vector3 wind, float dt, bool forces = true)
        {
            velocity += Acceleration(velocity, spin, wind, forces) * dt;
            position += velocity * dt; // semi-implicit Euler: velocity first, then position
        }
        public static void Contact(ref Vector3 velocity, ref Vector3 spin, Vector3 normal, Vector3 surfaceVelocity, float restitution, float friction)
        {
            Vector3 relative = velocity - surfaceVelocity;
            float normalSpeed = Vector3.Dot(relative, normal);
            if (normalSpeed >= 0f) return;
            float normalImpulse = -(1f + restitution) * normalSpeed;
            // Slip at the contact point includes rotation, so spin changes the outgoing bounce.
            Vector3 slip = Vector3.ProjectOnPlane(relative + Vector3.Cross(spin, -normal * Radius), normal);
            // A thin spherical shell has I = 2/3 mr²; its effective tangential inverse mass is 2.5/m.
            Vector3 tangentialImpulse = -Vector3.ClampMagnitude(slip / 2.5f, friction * normalImpulse);
            velocity += normalImpulse * normal + tangentialImpulse;
            spin += Vector3.Cross(-normal, tangentialImpulse) * (1.5f / Radius);
        }
        public static bool SweptPaddle(Vector3 oldBall, Vector3 newBall, Vector3 oldCenter, Vector3 newCenter, Quaternion oldRotation, Quaternion newRotation, out Vector3 normal, out float fraction)
        {
            Vector3 oldNormal = oldRotation * Vector3.forward, newNormal = newRotation * Vector3.forward;
            float oldDistance = Vector3.Dot(oldBall - oldCenter, oldNormal);
            float newDistance = Vector3.Dot(newBall - newCenter, newNormal);
            float sign = oldDistance >= 0f ? 1f : -1f;
            float shell = Radius + 0.006f;
            float start = Mathf.Abs(oldDistance) - shell, end = newDistance * sign - shell;
            normal = newNormal * sign; fraction = 0;
            if (start < -0.001f || end > 0f) return false;
            fraction = Mathf.Clamp01(start / Mathf.Max(0.00001f, start - end));
            Vector3 center = Vector3.Lerp(oldCenter, newCenter, fraction);
            Quaternion rotation = Quaternion.Slerp(oldRotation, newRotation, fraction);
            Vector3 local = Quaternion.Inverse(rotation) * (Vector3.Lerp(oldBall, newBall, fraction) - center);
            // A 17 cm wide / 18 cm high elliptical racket with a sphere-radius margin.
            float ellipse = local.x * local.x / (.105f * .105f) + local.y * local.y / (.11f * .11f);
            normal = rotation * Vector3.forward * sign;
            return ellipse <= 1f;
        }
    }
}
