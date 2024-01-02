import * as poseDetection from "@tensorflow-models/pose-detection";

// #ffffff - White
// #800000 - Maroon
// #469990 - Malachite
// #e6194b - Crimson
// #42d4f4 - Picton Blue
// #fabed4 - Cupid
// #aaffc3 - Mint Green
// #9a6324 - Kumera
// #000075 - Navy Blue
// #f58231 - Jaffa
// #4363d8 - Royal Blue
// #ffd8b1 - Caramel
// #dcbeff - Mauve
// #808000 - Olive
// #ffe119 - Candlelight
// #911eb4 - Seance
// #bfef45 - Inchworm
// #f032e6 - Razzle Dazzle Rose
// #3cb44b - Chateau Green
// #a9a9a9 - Silver Chalice
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

const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_RADIUS = 4;
const DEFAULT_THRESHOLD = 0.65;

export class CanvasRenderer {
  ctx: CanvasRenderingContext2D;
  videoWidth: number;
  videoHeight: number;
  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
    this.videoWidth = canvas.width;
    this.videoHeight = canvas.height;
    this.flip(this.videoWidth);
  }

  flip(videoWidth: number) {
    this.ctx.translate(videoWidth, 0);
    this.ctx.scale(-1, 1);
  }

  draw(video: HTMLVideoElement, poses: poseDetection.Pose[]) {
    this.drawCtx(video);

    if (poses && poses.length > 0) {
      this.drawResults(poses);
    }
  }

  drawCtx(video: HTMLVideoElement) {
    this.ctx.drawImage(video, 0, 0, this.videoWidth, this.videoHeight);
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);
  }

  drawResults(poses: poseDetection.Pose[]) {
    for (const pose of poses) {
      this.drawResult(pose);
    }
  }

  drawResult(pose: poseDetection.Pose) {
    if (pose.keypoints != null) {
      this.drawKeypoints(pose.keypoints);
      this.drawSkeleton(pose.keypoints);
    }
  }

  drawKeypoints(keypoints) {
    const keypointInd = poseDetection.util.getKeypointIndexBySide(
      poseDetection.SupportedModels.BlazePose
    );
    this.ctx.fillStyle = "Red";
    this.ctx.strokeStyle = "White";
    this.ctx.lineWidth = 2;

    for (const i of keypointInd.middle) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = "Green";
    for (const i of keypointInd.left) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = "Orange";
    for (const i of keypointInd.right) {
      this.drawKeypoint(keypoints[i]);
    }
  }

  drawKeypoint(keypoint: poseDetection.Keypoint) {
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = DEFAULT_THRESHOLD;

    if (score >= scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, DEFAULT_RADIUS, 0, 2 * Math.PI);
      this.ctx.fill(circle);
      this.ctx.stroke(circle);
    }
  }

  drawSkeleton(keypoints: poseDetection.Keypoint[]) {
    const color = "White";
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = DEFAULT_LINE_WIDTH;

    poseDetection.util
      .getAdjacentPairs(poseDetection.SupportedModels.BlazePose)
      .forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = DEFAULT_THRESHOLD;

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
          this.ctx.beginPath();
          this.ctx.moveTo(kp1.x, kp1.y);
          this.ctx.lineTo(kp2.x, kp2.y);
          this.ctx.stroke();
        }
      });
  }
}
