using UnityEngine;

namespace PortfolioTrainer
{
    // The controller pose is the palm/grip pose, not a pointing ray.
    public static class PaddleGrip
    {
        public static readonly Vector3 HandleCenter = new Vector3(0, -.11f, 0);
        // In Unity grip space, +Z runs from the little finger toward the thumb;
        // +X is the palm normal. Align the shaft and blade with those axes.
        public static readonly Quaternion ModelToGrip = Quaternion.LookRotation(Vector3.right, Vector3.forward);

        public static void GetFacePose(Vector3 gripPosition, Quaternion gripRotation, out Vector3 position, out Quaternion rotation)
        {
            rotation = gripRotation * ModelToGrip;
            position = gripPosition - rotation * HandleCenter;
        }
    }
}
