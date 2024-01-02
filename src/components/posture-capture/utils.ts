import * as poseDetection from "@tensorflow-models/pose-detection";
import { CanvasRenderer } from "./CanvasRenderer";
import * as mpPose from "@mediapipe/pose";

const detectorConfig = {
  runtime: "mediapipe",
  modelType: "full",
  solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
};

export async function createDetector() {
  return poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, detectorConfig);
}

export async function renderResult(
  video: HTMLVideoElement,
  detector: poseDetection.PoseDetector,
  renderer: CanvasRenderer
) {
  if (video.readyState < 2) {
    await new Promise((resolve) => {
      video.onloadeddata = () => {
        resolve(video);
      };
    });
  }

  let poses = null;

  if (detector != null) {
    try {
      poses = await detector.estimatePoses(video, {
        maxPoses: 1,
        flipHorizontal: false,
      });
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
  }
  renderer.draw(video, poses);
}
