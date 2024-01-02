import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Webcam from "react-webcam";
import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  Image,
  Stack,
} from "@mantine/core";
import { IconCamera, IconCompass } from "@tabler/icons-react";
import { ScreenshotContext } from "../../contexts/ContextProvider";
import { WindowContext } from "../../contexts/WindowContextProvider";
import { renderResult } from "../posture-capture/utils";
import * as mpPose from "@mediapipe/pose";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { CanvasRenderer } from "../posture-capture/CanvasRenderer";

// https://stackoverflow.com/questions/62253056/how-to-only-show-video-canvas-using-react-webcam

let rafId;

async function renderPrediction(
  video: HTMLVideoElement,
  detector: poseDetection.PoseDetector,
  renderer: CanvasRenderer
) {
  await renderResult(video, detector, renderer);
  rafId = requestAnimationFrame(() =>
    renderPrediction(video, detector, renderer)
  );
}

const detectorConfig = {
  runtime: "mediapipe",
  modelType: "full",
  solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
};

const createDetector = async () => {
  return await poseDetection.createDetector(
    poseDetection.SupportedModels.BlazePose,
    detectorConfig
  );
};

function PostureCapture() {
  const screenshotRef = useRef(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const reactWebCamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [showInstructions, setShowIntructions] = useState(true);
  const [poseDectector, setPoseDetector] = useState<poseDetection.PoseDetector>(null);
  const [canvasRenderer, setCanvasRenderer] = useState<CanvasRenderer>();

  const { setScreenshot } = useContext(ScreenshotContext);
  const { clientHeight, clientWidth } = useContext(WindowContext);

  useEffect(() => {
    async function setup() {
      if (reactWebCamRef.current === null) return;

      const video = reactWebCamRef.current.video;
      
      const detector = poseDectector ? poseDectector : await createDetector();
      setPoseDetector(detector);
    
      const canvas = previewCanvasRef.current;
      const renderer = canvasRenderer ? canvasRenderer : new CanvasRenderer(canvas);
      setCanvasRenderer(renderer)
      renderPrediction(video, detector, renderer);
    }

    if (imgSrc) return;
    
    setup();

    return () => domCleanup();
  });

  const domCleanup = () => {
    window.cancelAnimationFrame(rafId);
  };

  useEffect(() => setScreenshot(screenshotRef.current), [imgSrc]);

  const capture = useCallback(() => {
    const imageSrc = reactWebCamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [reactWebCamRef]);

  const retake = () => setImgSrc(null);

  const uploadFile = (e) => setImgSrc(URL.createObjectURL(e));

  return (
    <Stack align="center" justify="space-around">
      <Group justify="center" mt="xl" gap="xl">
        {showInstructions ? (
          <ActionIcon
            variant="gradient"
            size="sm"
            aria-label="Gradient action icon"
            gradient={{ from: "red", to: "pink", deg: 90 }}
            onClick={() => setShowIntructions(false)}
          >
            <IconCompass />
          </ActionIcon>
        ) : (
          <>
            <ActionIcon
              variant="gradient"
              size="sm"
              aria-label="Gradient action icon"
              gradient={
                imgSrc
                  ? { from: "grape", to: "indigo", deg: 90 }
                  : { from: "red", to: "pink", deg: 90 }
              }
              onClick={() => (imgSrc ? retake() : capture())}
            >
              <IconCamera />
            </ActionIcon>

            {!imgSrc ? (
              <FileButton onChange={uploadFile} accept="image/png,image/jpeg">
                {(props) => <Button {...props}>Upload image</Button>}
              </FileButton>
            ) : null}
          </>
        )}
      </Group>

      {showInstructions ? (
        <Image
          src="posture-capture/pose1.png"
          w={clientWidth}
          h={clientHeight}
        ></Image>
      ) : (
        <Fragment>
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt="webcam"
              id="screenshot"
              h={clientHeight}
              w={clientWidth}
              ref={screenshotRef}
            />
          ) : (
            <Fragment>
                <Stack align="center" justify="center-around">
              <Webcam
                ref={reactWebCamRef}
                mirrored={true}
                style={{
                    width: "auto",
                    height: "auto",
                    position: "absolute"
                  }}
                videoConstraints={{
                  facingMode: "environment",
                  width: { max: clientWidth, min: clientWidth },
                  height: { max: clientHeight, min: clientHeight },
                  frameRate: { ideal: 60 },
                }}
              />
              <canvas
                ref={previewCanvasRef}
                width={clientWidth}
                height={clientHeight}
                style={{
                    position: "absolute"
                }}
              />
              </Stack>
            </Fragment>
          )}
        </Fragment>
      )}
    </Stack>
  );
}

export default PostureCapture;
