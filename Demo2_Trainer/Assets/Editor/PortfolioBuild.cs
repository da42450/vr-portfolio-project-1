using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEditor.XR.Management;
using UnityEditor.XR.Management.Metadata;
using UnityEditor.XR.OpenXR.Features;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.XR.Management;
using UnityEngine.XR.OpenXR;
using PortfolioTrainer;

public static class PortfolioBuild
{
    [MenuItem("Portfolio/Prepare Trainer")]
    public static void Prepare()
    {
        Directory.CreateDirectory("Assets/Scenes"); Directory.CreateDirectory("Assets/XR"); Directory.CreateDirectory("Assets/Resources");
        AssetDatabase.Refresh();
        // Resource reference prevents a runtime-only Shader.Find("Standard") from being stripped.
        if (!AssetDatabase.LoadAssetAtPath<Material>("Assets/Resources/SurfaceTemplate.mat"))
        {
            var template = new Material(Shader.Find("Standard")); template.SetFloat("_Glossiness", .15f);
            AssetDatabase.CreateAsset(template, "Assets/Resources/SurfaceTemplate.mat");
        }
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        new GameObject("Spin trainer — runtime scene builder").AddComponent<Trainer>();
        EditorSceneManager.SaveScene(scene, "Assets/Scenes/Trainer.unity");
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene("Assets/Scenes/Trainer.unity", true) };
        PlayerSettings.companyName = "Daniel Aguilar"; PlayerSettings.productName = "Table Tennis Spin Trainer";
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, "com.danielaguilar.portfolio.spintrainer");
        PlayerSettings.bundleVersion = "1.0.2"; PlayerSettings.Android.bundleVersionCode = 3;
        // Avoid the GameActivity surface-destruction freeze observed on the school Quest 3.
        PlayerSettings.Android.applicationEntry = AndroidApplicationEntry.Activity;
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel29;
        PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevelAuto;
        PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.Android, false);
        PlayerSettings.SetGraphicsAPIs(BuildTarget.Android, new[] { GraphicsDeviceType.OpenGLES3 });
        PlayerSettings.colorSpace = ColorSpace.Linear;
        PlayerSettings.stripEngineCode = false;
        PlayerSettings.SetManagedStrippingLevel(NamedBuildTarget.Android, ManagedStrippingLevel.Minimal);
        QualitySettings.antiAliasing = 2; QualitySettings.shadows = ShadowQuality.Disable;
        QualitySettings.pixelLightCount = 1; QualitySettings.vSyncCount = 0;
        // OpenXR uses the new input backend. Native XR poses/buttons remain accessible via InputDevices.
        var settingsObject = new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/ProjectSettings.asset")[0]);
        settingsObject.FindProperty("activeInputHandler").intValue = 1; settingsObject.ApplyModifiedPropertiesWithoutUndo();
        EditorBuildSettings.TryGetConfigObject(XRGeneralSettings.k_SettingsKey, out XRGeneralSettingsPerBuildTarget all);
        if (!all)
        {
            all = ScriptableObject.CreateInstance<XRGeneralSettingsPerBuildTarget>();
            AssetDatabase.CreateAsset(all, "Assets/XR/XRGeneralSettingsPerBuildTarget.asset");
            EditorBuildSettings.AddConfigObject(XRGeneralSettings.k_SettingsKey, all, true);
        }
        if (!all.HasSettingsForBuildTarget(BuildTargetGroup.Android)) all.CreateDefaultSettingsForBuildTarget(BuildTargetGroup.Android);
        if (!all.HasManagerSettingsForBuildTarget(BuildTargetGroup.Android)) all.CreateDefaultManagerSettingsForBuildTarget(BuildTargetGroup.Android);
        var general = all.SettingsForBuildTarget(BuildTargetGroup.Android); general.InitManagerOnStart = true;
        if (!XRPackageMetadataStore.AssignLoader(general.Manager, "UnityEngine.XR.OpenXR.OpenXRLoader", BuildTargetGroup.Android)) throw new Exception("OpenXR loader assignment failed.");
        FeatureHelpers.RefreshFeatures(BuildTargetGroup.Android);
        var meta = FeatureHelpers.GetFeatureWithIdForBuildTarget(BuildTargetGroup.Android, "com.unity.openxr.feature.metaquest");
        var touch = FeatureHelpers.GetFeatureWithIdForBuildTarget(BuildTargetGroup.Android, "com.unity.openxr.feature.input.oculustouch");
        if (!meta || !touch) throw new Exception("Meta Quest or Oculus Touch OpenXR feature unavailable.");
        meta.enabled = true; touch.enabled = true; EditorUtility.SetDirty(meta); EditorUtility.SetDirty(touch);
        OpenXRSettings.GetSettingsForBuildTargetGroup(BuildTargetGroup.Android).renderMode = OpenXRSettings.RenderMode.SinglePassInstanced;
        EditorUtility.SetDirty(all); EditorUtility.SetDirty(general); EditorUtility.SetDirty(general.Manager);
        AssetDatabase.SaveAssets();
        Debug.Log("PORTFOLIO_PREPARED: ARM64 / IL2CPP / OpenXR / Meta Quest / Oculus Touch / UnityPlayerActivity");
        ValidatePhysics();
        ValidatePaddleGrip();
    }
    [MenuItem("Portfolio/Build Quest APK")]
    public static void BuildQuest()
    {
        Prepare();
        if (!EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.Android, BuildTarget.Android)) throw new Exception("Cannot activate Android target.");
        Directory.CreateDirectory("Builds");
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions { scenes = new[] { "Assets/Scenes/Trainer.unity" }, target = BuildTarget.Android, locationPathName = "Builds/demo2-v1.0.2.apk", options = BuildOptions.None });
        Debug.Log($"APK_BUILD_RESULT: {report.summary.result}, {report.summary.totalErrors} errors, {report.summary.totalSize} bytes");
        if (report.summary.result != BuildResult.Succeeded) throw new Exception("APK build failed.");
    }
    [MenuItem("Portfolio/Validate Physics")]
    public static void ValidatePhysics()
    {
        Vector3 pos = new Vector3(0, .3f, 0), velocity = Vector3.zero, spin = Vector3.zero;
        bool bounced = false; float peak = 0; float dt = BallPhysics.Step / 4f;
        for (int i = 0; i < 3000; i++)
        {
            Vector3 old = pos; BallPhysics.Integrate(ref pos, ref velocity, spin, Vector3.zero, dt);
            if (!bounced && pos.y <= 0)
            {
                float fraction = old.y / (old.y - pos.y); pos = Vector3.Lerp(old, pos, fraction);
                BallPhysics.Contact(ref velocity, ref spin, Vector3.up, Vector3.zero, BallPhysics.TableRestitution, BallPhysics.TableFriction);
                pos += velocity * dt * (1f - fraction); bounced = true;
            }
            if (bounced) { peak = Mathf.Max(peak, pos.y); if (velocity.y <= 0) break; }
        }
        if (Mathf.Abs(peak - .23f) > .012f) throw new Exception("Bounce check outside 1.2 cm tolerance: " + peak);
        Vector3 noSpin = new Vector3(0, -2, 1), withSpin = noSpin, zero = Vector3.zero, rotation = Vector3.right * 250;
        BallPhysics.Contact(ref noSpin, ref zero, Vector3.up, Vector3.zero, BallPhysics.TableRestitution, BallPhysics.TableFriction);
        BallPhysics.Contact(ref withSpin, ref rotation, Vector3.up, Vector3.zero, BallPhysics.TableRestitution, BallPhysics.TableFriction);
        if ((noSpin - withSpin).magnitude < .05f) throw new Exception("Spin did not affect bounce.");
        bool swept = BallPhysics.SweptPaddle(new Vector3(0, 0, .3f), new Vector3(0, 0, -.3f), Vector3.zero, Vector3.zero, Quaternion.identity, Quaternion.identity, out _, out _);
        if (!swept) throw new Exception("High-speed sweep missed the racket.");
        Directory.CreateDirectory("Validation");
        File.WriteAllText("Validation/physics-results.json", "{\"reference_rebound_cm\":23,\"simulated_rebound_cm\":" + (peak * 100).ToString("F4", System.Globalization.CultureInfo.InvariantCulture) + ",\"spin_changes_bounce\":true,\"high_speed_sweep\":true,\"physics_hz\":180,\"substeps\":4}");
        Debug.Log($"PHYSICS_VALIDATED: ITTF rebound {peak * 100:F3} cm; spin bounce and full-speed sweep passed.");
    }
    [MenuItem("Portfolio/Validate Paddle Grip")]
    public static void ValidatePaddleGrip()
    {
        Vector3 gripPosition = new Vector3(.3f, 1.2f, -.2f);
        Quaternion[] poses = { Quaternion.identity, Quaternion.Euler(23, 61, -37), Quaternion.Euler(-90, 0, 0) };
        foreach (Quaternion gripRotation in poses)
        {
            PaddleGrip.GetFacePose(gripPosition, gripRotation, out Vector3 facePosition, out Quaternion faceRotation);
            Vector3 handleCenter = facePosition + faceRotation * PaddleGrip.HandleCenter;
            if (Vector3.Distance(handleCenter, gripPosition) > .00001f) throw new Exception("Paddle handle does not coincide with palm grip.");
            if (Vector3.Distance(faceRotation * Vector3.up, gripRotation * Vector3.forward) > .00001f) throw new Exception("Paddle shaft does not follow the grip axis.");
            Vector3 normal = faceRotation * Vector3.forward;
            if (Vector3.Distance(normal, gripRotation * Vector3.right) > .00001f) throw new Exception("Paddle face does not align with the palm plane.");
            foreach (float side in new[] { -1f, 1f })
            {
                Vector3 start = facePosition + normal * (.3f * side), end = facePosition - normal * (.3f * side);
                if (!BallPhysics.SweptPaddle(start, end, facePosition, facePosition, faceRotation, faceRotation, out Vector3 contactNormal, out float fraction)
                    || Vector3.Dot(contactNormal, normal * side) < .999f || fraction <= 0 || fraction >= 1)
                    throw new Exception("Grip-aligned paddle missed a high-speed contact on one face.");
            }
            // The render-frame parent/local transform must match the fixed-step world pose.
            PaddleGrip.GetFacePose(Vector3.zero, Quaternion.identity, out Vector3 localPosition, out Quaternion localRotation);
            if (Vector3.Distance(gripPosition + gripRotation * localPosition, facePosition) > .00001f
                || Quaternion.Angle(gripRotation * localRotation, faceRotation) > .01f)
                throw new Exception("Paddle visual and physics grip transforms disagree.");
        }
        Directory.CreateDirectory("Validation");
        File.WriteAllText("Validation/paddle-grip-results.json", "{\"handle_at_grip\":true,\"shaft_along_grip\":true,\"face_aligned_with_palm\":true,\"visual_physics_pose_matches\":true,\"tested_grip_rotations\":3,\"two_sided_high_speed_sweeps\":6}");
        Debug.Log("PADDLE_GRIP_VALIDATED: palm anchor, shaft/face axes, render/physics poses and six two-sided sweeps passed.");
    }
}
