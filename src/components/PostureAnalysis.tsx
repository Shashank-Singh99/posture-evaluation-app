import { useContext, useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import {
  PosesContext,
  ScreenshotContext,
} from "../contexts/ContextProvider";
import { ActionIcon, Stack, Image } from "@mantine/core";
import { Point, ReportStats } from "../types/types";
import { LANDMARKS } from "../utils/constants";
import { drawLineBetweenPoints } from "./drawing_utils";
import { PDFViewer } from "@react-pdf/renderer";
import PdfDocument from "./pdf-document/PdfDocument";
import { WindowContext } from "../contexts/WindowContextProvider";
import { IconAnalyze, IconDownload } from "@tabler/icons-react";
import { ControlPanel } from "./ControlPanel";

const HEAD_TILT = "Head Tilt";
const SHOULDER_TILT = "Shoulder Alignment";
const PELVIC_TILT = "Pelvic Tilt";
const KNEE_TILT = "Knee Tilt";

/*
 * Calculates the angle ABC (in radians)
 *
 * A first point, ex: {x: 0, y: 0}
 * C second point
 * B center point
 */
function findAngle(A, B, C) {
  var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
}

const getMidPoint = (p1: Point, p2: Point): Point => {
  const midPointX = (p1.x + p2.x) / 2;
  const midPointY = (p1.y + p2.y) / 2;
  const midPoint = { x: midPointX, y: midPointY };
  return midPoint;
};

const ANGLES = [
  {
    left: LANDMARKS.LEFT_EAR,
    right: LANDMARKS.RIGHT_EAR,
    inference: HEAD_TILT,
  },
  {
    left: LANDMARKS.LEFT_SHOULDER,
    right: LANDMARKS.RIGHT_SHOULDER,
    inference: SHOULDER_TILT,
  },
  {
    left: LANDMARKS.LEFT_HIP,
    right: LANDMARKS.RIGHT_HIP,
    inference: PELVIC_TILT,
  },
  {
    left: LANDMARKS.LEFT_KNEE,
    right: LANDMARKS.RIGHT_KNEE,
    inference: KNEE_TILT,
  },
];

const images = [
  "posture-capture/pose3.png",
];

function PostureAnalysis() {
  const [reportStats, setReportStats] = useState<ReportStats[]>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>(null);
  const [showInstructions, setShowIntructions] = useState(true);
  const { globalPoses } = useContext(PosesContext);
  const { screenshot } = useContext(ScreenshotContext);
  const reportRef = useRef(null);
  const { clientHeight, clientWidth } = useContext(WindowContext);

  const [isReportViewed, setIsReportViewed] = useState(false);
  const [mainImgSrc, setMainImgSrc] = useState<string>(null);

  const analysePosture = () => {
    setShowIntructions(false);
    setIsReportViewed(false);
  };

  useEffect(() => {
    if (reportRef.current === null) {
      return;
    }
    const canvas = reportRef.current;
    const ctx = canvas.getContext("2d");
    setCtx(ctx);
    ctx.drawImage(screenshot, 0, 0, canvas.width, canvas.height);
    drawLineOfGravity(ctx);
    drawLineFromShoulderMidPoint(ctx);

    const stats = ANGLES.map((a) =>
      calculateMetrics(a.left, a.right, a.inference)
    );
    setMainImgSrc(reportRef.current.toDataURL());
    setReportStats(stats);
  }, [showInstructions]);

  const drawLineOfGravity = (ctx) => {
    const noseKeypoint = globalPoses[0].keypoints[LANDMARKS.NOSE];
    const rightHipKeyPoint = globalPoses[0].keypoints[LANDMARKS.RIGHT_HIP];
    const leftHipKeyPoint = globalPoses[0].keypoints[LANDMARKS.LEFT_HIP];
    const rightFootKeyPoint = globalPoses[0].keypoints[31];

    const midPoint = getMidPoint(
      { x: rightHipKeyPoint.x, y: rightHipKeyPoint.y },
      { x: leftHipKeyPoint.x, y: leftHipKeyPoint.y }
    );

    ctx.beginPath();
    ctx.setLineDash([5, 3]);
    ctx.moveTo(midPoint.x, noseKeypoint.y - 100);
    ctx.lineTo(midPoint.x, rightFootKeyPoint.y);
    ctx.strokeStyle = "#4aa02c";
    ctx.lineWidth = 2;
    ctx.closePath();
    ctx.stroke();
  };

  const drawLineFromShoulderMidPoint = (ctx) => {
    const keypoints = globalPoses[0].keypoints;
    const noseKeypoint = keypoints[LANDMARKS.NOSE];
    const rightShoulderKeyPoint = keypoints[LANDMARKS.RIGHT_SHOULDER];
    const leftShoulderKeyPoint = keypoints[LANDMARKS.LEFT_SHOULDER];
    const rightFootKeyPoint = globalPoses[0].keypoints[31];
    const midPoint = getMidPoint(rightShoulderKeyPoint, leftShoulderKeyPoint);

    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(midPoint.x, noseKeypoint.y - 100);
    ctx.lineTo(midPoint.x, rightFootKeyPoint.y);
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2;
    ctx.closePath();
    ctx.stroke();
  };

  const calculateMetrics = (
    leftNumber: number,
    rightNumber: number,
    inference: string
  ): ReportStats => {
    const points = globalPoses[0].keypoints;
    const right = points[rightNumber] as poseDetection.Keypoint;
    const left = points[leftNumber] as poseDetection.Keypoint;
    const p1: Point = { x: right.x, y: right.y };
    const p2: Point = { x: left.x, y: left.y };

    const midPoint = getMidPoint(p2, p1);
    const offSet = (midPoint.x - p2.x) / 2;
    const p3: Point = { x: midPoint.x + offSet, y: left.y };

    const angleInRadians = findAngle(p1, p2, p3);
    drawAngles(p1, p2, p3, angleInRadians);

    const angleInDegrees = angleInRadians * (180 / Math.PI);
    return {
      inference,
      angle: +angleInDegrees.toFixed(2),
    };
  };

  function drawAngles(p1: Point, p2: Point, p3: Point, angle: number) {
    const ctx = reportRef.current.getContext("2d") as CanvasRenderingContext2D;
    drawLineBetweenPoints(ctx, p2, p1, "#2AAA8A");
    drawLineBetweenPoints(ctx, p2, p3, "#FFA500");
    try {
      const radius = p3.x - p2.x;
      const isCounterClockwise = p3.y > p1.y;
      const endAngle = p3.y > p1.y ? -angle : angle;
      ctx.beginPath();
      ctx.strokeStyle = "#FFA500";
      ctx.lineWidth = 2;
      ctx.arc(p2.x, p2.y, radius, 0, endAngle, isCounterClockwise);
      ctx.closePath();
      ctx.stroke();
    } catch (e) {
      console.error(e);
    }
  }

  function previewReport() {
    setMainImgSrc(reportRef.current.toDataURL());
    setIsReportViewed(true);
  }

  return (
    <Stack align="center" justify="space-around">
      <ControlPanel>
        <ActionIcon
          variant="gradient"
          size="sm"
          aria-label="Gradient action icon"
          gradient={{ from: "red", to: "pink", deg: 90 }}
          onClick={analysePosture}
        >
          <IconAnalyze />
        </ActionIcon>
        <ActionIcon
          variant="gradient"
          size="sm"
          aria-label="Gradient action icon"
          gradient={{ from: "grape", to: "indigo", deg: 90 }}
          onClick={previewReport}
        >
          <IconDownload />
        </ActionIcon>
      </ControlPanel>
      {showInstructions ? (
        <Image src={images[0]} w={clientWidth} h={clientHeight}></Image>
      ) : (
        <>
          {isReportViewed ? (
            isReportViewed && (
              <PDFViewer width="800" height="600">
                <PdfDocument mainImgSrc={mainImgSrc} data={reportStats} />
              </PDFViewer>
            )
          ) : (
            <canvas
              id="report"
              height={screenshot.height}
              width={screenshot.width}
              ref={reportRef}
            ></canvas>
          )}
        </>
      )}
    </Stack>
  );
}

export default PostureAnalysis;
