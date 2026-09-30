using UnityEngine;
using UnityEngine.XR;

namespace PortfolioTrainer
{
    public sealed class TrackedPose : MonoBehaviour
    {
        public XRNode node;
        public Vector3 PoseVelocity { get; private set; }
        public Vector3 AngularVelocity { get; private set; }
        public bool Trigger { get; private set; }
        public bool Grip { get; private set; }
        public bool Primary { get; private set; }
        public bool Secondary { get; private set; }
        public bool Tracked { get; private set; }
        Vector3 previousPosition;
        Quaternion previousRotation;
        bool havePrevious;
        void Update()
        {
            InputDevice device = InputDevices.GetDeviceAtXRNode(node);
            Vector3 position = Vector3.zero; Quaternion rotation = Quaternion.identity;
            bool valid = device.TryGetFeatureValue(CommonUsages.devicePosition, out position)
                && device.TryGetFeatureValue(CommonUsages.deviceRotation, out rotation);
            Tracked = valid;
            if (valid)
            {
                transform.localPosition = position;
                transform.localRotation = rotation;
                if (havePrevious && Time.deltaTime > 0.0001f)
                {
                    PoseVelocity = Vector3.ClampMagnitude((transform.position - previousPosition) / Time.deltaTime, 25f);
                    Quaternion delta = transform.rotation * Quaternion.Inverse(previousRotation);
                    delta.ToAngleAxis(out float angle, out Vector3 axis);
                    if (angle > 180) angle -= 360;
                    AngularVelocity = axis.sqrMagnitude > 0.01f ? axis * (angle * Mathf.Deg2Rad / Time.deltaTime) : Vector3.zero;
                }
                previousPosition = transform.position; previousRotation = transform.rotation; havePrevious = true;
            }
            else { PoseVelocity = AngularVelocity = Vector3.zero; havePrevious = false; }
            device.TryGetFeatureValue(CommonUsages.triggerButton, out bool trigger); Trigger = trigger;
            device.TryGetFeatureValue(CommonUsages.gripButton, out bool grip); Grip = grip;
            device.TryGetFeatureValue(CommonUsages.primaryButton, out bool primary); Primary = primary;
            device.TryGetFeatureValue(CommonUsages.secondaryButton, out bool secondary); Secondary = secondary;
        }
        public void Haptic(float strength)
        {
            InputDevices.GetDeviceAtXRNode(node).SendHapticImpulse(0, Mathf.Clamp01(strength), .05f);
        }
    }
}
