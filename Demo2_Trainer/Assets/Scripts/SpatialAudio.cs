using UnityEngine;

namespace PortfolioTrainer
{
    public sealed class SpatialAudio : MonoBehaviour
    {
        AudioSource approach, ambience;
        AudioSource[] impacts;
        AudioClip tableClip, paddleClip, floorClip;
        int voice;
        public void Initialize(Transform ball)
        {
            tableClip = Tone("Table wood", 850, .08f, true);
            paddleClip = Tone("Paddle rubber", 440, .045f, true);
            floorClip = Tone("Floor", 170, .14f, true);
            approach = Source(ball.gameObject, true);
            approach.clip = Tone("Ball approach", 240, .35f, false); approach.volume = .03f; approach.Play();
            ambience = Source(gameObject, true); ambience.clip = Tone("Room ventilation", 70, .8f, false); ambience.volume = .025f; ambience.Play();
            impacts = new AudioSource[6];
            for (int i = 0; i < impacts.Length; i++) impacts[i] = Source(new GameObject("Spatial impact " + i), false);
        }
        static AudioSource Source(GameObject obj, bool loop)
        {
            var source = obj.AddComponent<AudioSource>(); source.spatialBlend = 1f;
            source.rolloffMode = AudioRolloffMode.Logarithmic; source.minDistance = .3f; source.maxDistance = 12f;
            source.dopplerLevel = .5f; source.loop = loop; source.playOnAwake = false; return source;
        }
        static AudioClip Tone(string name, float frequency, float duration, bool decay)
        {
            int samples = Mathf.RoundToInt(22050 * duration); float[] data = new float[samples];
            for (int i = 0; i < samples; i++)
            {
                float t = (float)i / 22050;
                float envelope = decay ? Mathf.Exp(-45f * t) : .7f + .3f * Mathf.Sin(2 * Mathf.PI * t / duration);
                // Integer harmonics and a periodic envelope keep looping clips continuous.
                data[i] = .3f * Mathf.Sin(2 * Mathf.PI * frequency * t) * envelope;
            }
            var clip = AudioClip.Create(name, samples, 1, 22050, false); clip.SetData(data, 0); return clip;
        }
        public void Impact(Vector3 point, float speed, string surface)
        {
            var source = impacts[voice++ % impacts.Length]; source.transform.position = point;
            source.clip = surface == "Paddle" ? paddleClip : surface == "Table" ? tableClip : floorClip;
            source.volume = Mathf.Clamp(speed / 10f, .08f, .85f); source.pitch = Mathf.Lerp(.8f, 1.4f, Mathf.Clamp01(speed / 15f)); source.Play();
        }
        public void UpdateFlight(float speed, bool active)
        {
            approach.volume = active ? Mathf.Clamp(speed * .004f, .01f, .07f) : 0;
            approach.pitch = Mathf.Clamp(.75f + speed / 20f, .7f, 1.5f);
        }
    }
}
