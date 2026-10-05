using UnityEditor;
using UnityEngine;
using PortfolioTrainer;

[InitializeOnLoad]
public static class RuntimeVerification
{
    static double started;
    static bool requested;
    static RuntimeVerification()
    {
        if (SessionState.GetBool("portfolio.runtime-test", false)) EditorApplication.update += Poll;
    }
    public static void Run()
    {
        PortfolioBuild.Prepare();
        SessionState.SetBool("portfolio.runtime-test", true);
        EditorApplication.update += Poll;
        EditorApplication.isPlaying = true;
    }
    static void Poll()
    {
        if (!EditorApplication.isPlaying || EditorApplication.isCompiling) return;
        if (started == 0) started = EditorApplication.timeSinceStartup;
        var trainer = Object.FindFirstObjectByType<Trainer>();
        if (!requested && trainer && EditorApplication.timeSinceStartup - started > 1)
        {
            try { MenuVerification.Validate(trainer); }
            catch (System.Exception error) { Debug.LogException(error); EditorApplication.Exit(1); return; }
            trainer.BeginValidation(); requested = true;
        }
        if (EditorApplication.timeSinceStartup - started > 5)
        {
            if (SystemInfo.graphicsDeviceType != UnityEngine.Rendering.GraphicsDeviceType.Null)
            {
                var camera = Object.FindFirstObjectByType<Camera>();
                camera.transform.position = new Vector3(.3f, 2f, -1.3f);
                camera.transform.LookAt(new Vector3(-.35f, 1.15f, 2));
                var target = new RenderTexture(1280, 720, 24); camera.targetTexture = target; camera.Render();
                RenderTexture.active = target;
                var image = new Texture2D(1280, 720, TextureFormat.RGB24, false);
                image.ReadPixels(new Rect(0, 0, 1280, 720), 0, 0); image.Apply();
                System.IO.Directory.CreateDirectory("Validation");
                System.IO.File.WriteAllBytes("Validation/scene-preview.png", image.EncodeToPNG());
                var menu = Object.FindFirstObjectByType<TrainerMenu>();
                camera.transform.position = menu.transform.position - menu.transform.forward * 1.85f;
                camera.transform.rotation = menu.transform.rotation;
                camera.Render(); image.ReadPixels(new Rect(0, 0, 1280, 720), 0, 0); image.Apply();
                System.IO.File.WriteAllBytes("Validation/menu-preview.png", image.EncodeToPNG());
                RenderTexture.active = null; camera.targetTexture = null; Object.Destroy(target); Object.Destroy(image);
                Debug.Log("RUNTIME_PREVIEW_SAVED: Validation/scene-preview.png");
            }
            SessionState.SetBool("portfolio.runtime-test", false);
            Debug.Log("RUNTIME_SCENE_VERIFIED: scene initialized and bounce routine exercised.");
            EditorApplication.Exit(0);
        }
    }
}
