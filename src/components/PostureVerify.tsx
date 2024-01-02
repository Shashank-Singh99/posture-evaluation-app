import * as poseDetection from "@tensorflow-models/pose-detection";
import { useContext, useEffect, useRef, useState } from "react";
import { drawLineBetweenPoints, drawResults } from "./drawing_utils";
import {
  ActionIcon,
  Loader,
  Stack,
  Image as MantineImage,
} from "@mantine/core";
import {
  DetectorContext,
  PosesContext,
  ScreenshotContext,
} from "../contexts/ContextProvider";
import { notifications } from "@mantine/notifications";
import { LANDMARKS as LM } from "../utils/constants";
import { WindowContext } from "../contexts/WindowContextProvider";
import { IconCheck, IconMap2 } from "@tabler/icons-react";
import { ControlPanel } from "./ControlPanel";

let dragPoint = -1;

function getPosition(event, canvas: HTMLCanvasElement) {
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return { x, y };
}

function getPointAt(x: number, y: number, points: poseDetection.Keypoint[]) {
  const pointSize = 4;
  for (var i = 0; i < points.length; i++) {
    if (
      Math.abs(points[i].x - x) < pointSize &&
      Math.abs(points[i].y - y) < pointSize &&
      points[i].score !== 0 // To filter the black listed keypoints from the poses list
    )
      return i;
  }
  return -1;
}

const detectorConfig = {
  runtime: "mediapipe",
  modelType: "heavy",
  solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose/",
  enableSmoothing: false,
};

const CONNECTIONS = [
  [LM.LEFT_EAR, LM.RIGHT_EAR],
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  [LM.LEFT_EAR, LM.RIGHT_EAR],
  [LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
  [LM.LEFT_ELBOW, LM.LEFT_WRIST],
  [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
  [LM.LEFT_SHOULDER, LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.LEFT_KNEE],
  [LM.RIGHT_HIP, LM.RIGHT_KNEE],
  [LM.LEFT_KNEE, LM.LEFT_ANKLE],
  [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
  [LM.LEFT_KNEE, LM.RIGHT_KNEE],
  [LM.LEFT_ANKLE, LM.RIGHT_ANKLE],
  [LM.RIGHT_HIP, LM.RIGHT_KNEE],
  [LM.LEFT_ANKLE, LM.LEFT_FOOT],
  [LM.LEFT_ANKLE, LM.LEFT_HEEL],
  [LM.RIGHT_ANKLE, LM.RIGHT_FOOT],
  [LM.RIGHT_ANKLE, LM.RIGHT_HEEL],
  [LM.LEFT_FOOT, LM.RIGHT_FOOT],
];

const images = ["posture-capture/pose2.png"];

function PostureVerify() {
  const stageRef = useRef(null);

  const [showInstructions, setShowIntructions] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(null);
  const [poses, setPoses] = useState<poseDetection.Pose[]>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>(null);

  const { screenshot, setScreenshot } = useContext(ScreenshotContext);
  const { setGlobalPoses } = useContext(PosesContext);
  const { globalDetector: detector, setGlobalDetector } =
    useContext(DetectorContext);
  const { clientHeight, clientWidth } = useContext(WindowContext);

  useEffect(() => {
    async function drawImageWithLandmarksOnCanvas() {
      const canvas = stageRef.current;
      const ctx = canvas.getContext("2d");
      setCanvas(canvas);
      setCtx(ctx);
      const poses = await detector.estimatePoses(screenshot);
      setPoses(poses);
      ctx.drawImage(screenshot, 0, 0, canvas.width, canvas.height);
      drawResults(poses, ctx);
    }

    drawImageWithLandmarksOnCanvas();
  }, [showInstructions]);

  const confirmPosture = async () => {
    setGlobalPoses(poses);

    drawSkeleton();

    notifications.show({
      color: "green",
      title: "Posture Verification Complete !!!",
      message: "Please proceed to Posture Analysis",
      autoClose: 4000,
    });

    setScreenshot(createNewPostureImage());
  };

  const drawSkeleton = () => {
    const keypoints = poses[0].keypoints;
    CONNECTIONS.forEach((element) => {
      const joint1 = keypoints[element[0]];
      const joint2 = keypoints[element[1]];

      if (joint1.score < 0.65 || joint2.score < 0.65) return;

      const p1 = { x: joint1.x, y: joint1.y };
      const p2 = { x: joint2.x, y: joint2.y };
      drawLineBetweenPoints(ctx, p1, p2, "white");
    });
  };

  const createNewPostureImage = (): HTMLImageElement => {
    const image = new Image();
    image.src = canvas.toDataURL();
    image.width = canvas.width;
    image.height = canvas.height;
    return image;
  };

  const handleMouseDown = (e) => {
    var pos = getPosition(e, stageRef.current);
    console.log(pos);
    const points = poses[0].keypoints;
    dragPoint = getPointAt(pos.x, pos.y, points);
    console.log(dragPoint);
    if (dragPoint == -1) {
      console.log("Not a valid point");
      return;
      // points.push(pos);
      // redraw();
    }
  };

  function redraw(poses) {
    if (poses.length > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(screenshot, 0, 0, canvas.width, canvas.height);
      return drawResults(poses, ctx);
    }
  }

  const handleMouseMove = (e) => {
    if (dragPoint != -1) {
      console.log("The drag point is : ", dragPoint);
      var pos = getPosition(e, canvas);
      poses[0].keypoints[dragPoint].x = pos.x;
      poses[0].keypoints[dragPoint].y = pos.y;
      redraw(poses);
    }
  };

  useEffect(() => {
    async function getDetector() {
      try {
        if (detector === null) {
          setLoading(true);
          const detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.BlazePose,
            detectorConfig
          );
          setGlobalDetector(detector);
          setLoading(false);
        }
        return;
      } catch (error) {
        console.error("Error has occured while initializing model");
        console.error(error);
        setError(error);
        setLoading(false);
      }
    }
    getDetector();
  }, []);

  if (loading) {
    return (
      <Stack h={480} align="center">
        <Loader type="dots" size={50} />
      </Stack>
    );
  }

  if (error) {
    return <>Error: {error}</>;
  }

  return (
    <Stack align="center" justify="space-around">
      <ControlPanel>
        <ActionIcon
          variant="gradient"
          size="sm"
          aria-label="Gradient action icon"
          gradient={{ from: "red", to: "pink", deg: 90 }}
          onClick={() => setShowIntructions(false)}
        >
          <IconMap2 />
        </ActionIcon>
        <ActionIcon
          variant="gradient"
          size="sm"
          aria-label="Gradient action icon"
          gradient={{ from: "grape", to: "indigo", deg: 90 }}
          onClick={confirmPosture}
        >
          <IconCheck />
        </ActionIcon>
      </ControlPanel>
      {showInstructions ? (
        <MantineImage
          src={images[0]}
          w={clientWidth}
          h={clientHeight}
        ></MantineImage>
      ) : (
        <div>
          <canvas
            id="stage"
            height={screenshot.height}
            width={screenshot.width}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => (dragPoint = -1)}
          ></canvas>
        </div>
      )}
    </Stack>
  );
}

export default PostureVerify;
