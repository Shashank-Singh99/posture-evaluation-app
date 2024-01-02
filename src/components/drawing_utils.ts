import * as poseDetection from "@tensorflow-models/pose-detection";
import { Point } from "../types/types";

type RendererParams = {
  enableTracking: boolean;
  defaultLineWidth: number;
  defaultRadius: number;
  model: poseDetection.SupportedModels;
  scoreThreshold: number;
};

const params: RendererParams = {
  enableTracking: false,
  defaultLineWidth: 2,
  defaultRadius: 4,
  model: poseDetection.SupportedModels.BlazePose,
  scoreThreshold: 0.65,
};

const COLOR_PALETTE = [
  "#ffffff",
  "#800000",
  "#469990",
  "#e6194b",
  "#42d4f4",
  "#fabed4",
  "#aaffc3",
  "#9a6324",
  "#000075",
  "#f58231",
  "#4363d8",
  "#ffd8b1",
  "#dcbeff",
  "#808000",
  "#ffe119",
  "#911eb4",
  "#bfef45",
  "#f032e6",
  "#3cb44b",
  "#a9a9a9",
];

const drawSkeleton = (keypoints: poseDetection.Keypoint[], poseId, ctx) => {
  const color =
    params.enableTracking && poseId != null
      ? COLOR_PALETTE[poseId % 20]
      : "White";
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = params.defaultLineWidth;

  poseDetection.util.getAdjacentPairs(params.model).forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;
    const scoreThreshold = params.scoreThreshold || 0;

    if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.stroke();
    }
  });
};

const drawKeypoint = (keypoint: poseDetection.Keypoint, ctx) => {
  const score = keypoint.score != null ? keypoint.score : 1;
  const scoreThreshold = params.scoreThreshold || 0;

  if (score >= scoreThreshold) {
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, params.defaultRadius, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);
  }
};

const drawKeypoints = (keypoints: poseDetection.Keypoint[], ctx) => {
  const keypointInd = poseDetection.util.getKeypointIndexBySide(params.model);
  ctx.fillStyle = "Red";
  ctx.strokeStyle = "White";
  ctx.lineWidth = params.defaultLineWidth;

  for (const i of keypointInd.middle) {
    drawKeypoint(keypoints[i], ctx);
  }

  ctx.fillStyle = "Green";
  for (const i of keypointInd.left) {
    drawKeypoint(keypoints[i], ctx);
  }

  ctx.fillStyle = "Orange";
  for (const i of keypointInd.right) {
    drawKeypoint(keypoints[i], ctx);
  }
};

const drawResult = (pose: poseDetection.Pose, ctx) => {
  if (pose.keypoints != null) {
    drawKeypoints(pose.keypoints, ctx);
    // drawSkeleton(pose.keypoints, pose.id, ctx);
  }
};

export const drawLineBetweenPoints = (
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string
) => {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.closePath();
  ctx.stroke();
};

// const drawResults = (poses: poseDetection.Pose[], ctx) => {
//   for (const pose of poses) {
//     drawResult(pose, ctx);
//   }
// };

const drawResults = (poses: poseDetection.Pose[], ctx) => {
  const blackListPoints = [0, 1, 2, 3, 4, 5, 6, 9, 10, 17, 18, 19, 20, 21, 22];
  poses[0].keypoints.forEach((keypoint) => {
    const index = poses[0].keypoints.indexOf(keypoint);
    if (blackListPoints.includes(index)) {
      keypoint.score = 0;
    }
  });

  for (const pose of poses) {
    drawResult(pose, ctx);
  }
};

export { drawResults };
