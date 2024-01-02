import { Fragment, useContext, useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  FileButton,
  Image,
  Stack,
} from "@mantine/core";
import { ScreenshotContext } from "../../contexts/ContextProvider";
import { WindowContext } from "../../contexts/WindowContextProvider";
import { IconCamera, IconCompass } from "@tabler/icons-react";
import { Camera } from "./Camera";
import { createDetector, renderResult } from "./utils";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { CanvasRenderer } from "./CanvasRenderer";
import { ControlPanel } from "../ControlPanel";

let detector: poseDetection.PoseDetector, camera: Camera;
let rafId: number;
let renderer: CanvasRenderer = null;

async function renderPrediction(videoElement: HTMLVideoElement) {
  await renderResult(videoElement, detector, renderer);
  rafId = requestAnimationFrame(() => renderPrediction(videoElement));
}

function PostureCaptureRebrand() {
  const screenshotRef = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imgSrc, setImgSrc] = useState(null);
  const [showInstructions, setShowIntructions] = useState(true);

  const { setScreenshot } = useContext(ScreenshotContext);
  const { clientHeight, clientWidth } = useContext(WindowContext);

  const domCleanup = () => {
    if (camera) {
      // https://stackoverflow.com/questions/11642926/stop-close-webcam-stream-which-is-opened-by-navigator-mediadevices-getusermedia
      const mediaStream = camera.video.srcObject as MediaStream;
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    window.cancelAnimationFrame(rafId);
  };

  useEffect(() => {
    async function setup() {
      if (videoRef.current === null) return;

      camera = await Camera.setup(videoRef.current, clientWidth, clientHeight);
      detector = await createDetector();
      const canvas = canvasRef.current;
      canvas.width = camera.video.width;
      canvas.height = camera.video.height;
      renderer = new CanvasRenderer(canvas);
      renderPrediction(videoRef.current);
    }

    setup();

    return () => domCleanup();
  });

  useEffect(() => setScreenshot(screenshotRef.current), [imgSrc]);

  const retake = () => setImgSrc(null);

  const uploadFile = (e) => setImgSrc(URL.createObjectURL(e));

  function takePicture() {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = canvasRef.current.width;
    canvas.height = canvasRef.current.height;
    const context = canvas.getContext("2d");
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/png");
    setImgSrc(data);
  }

  return (
    <Stack align="center" justify="space-around">
      <ControlPanel>
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
              onClick={() => (imgSrc ? retake() : takePicture())}
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
      </ControlPanel>

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
            <div className="canvas-wrapper">
              <canvas id="output" ref={canvasRef}></canvas>
              <video
                id="video"
                ref={videoRef}
                playsInline
                style={{
                  visibility: "hidden",
                  width: "auto",
                  height: "auto",
                  transform: "scaleX(-1)",
                  WebkitTransform: "scaleX(-1)",
                }}
              ></video>
            </div>
          )}
        </Fragment>
      )}
    </Stack>
  );
}

export default PostureCaptureRebrand;
