import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-webgpu";

import * as mpPose from "@mediapipe/pose";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

import * as posedetection from "@tensorflow-models/pose-detection";

import { Camera } from "../posture-capture/Camera";
import { setupDatGui } from "../live-feed/option_panel";
import { STATE } from "../live-feed/params";
import { useContext, useEffect, useRef, useState } from "react";
import { Stack, Image, Button } from "@mantine/core";
import { WindowContext } from "../../contexts/WindowContextProvider";
import { CanvasRenderer } from "../posture-capture/CanvasRenderer";

let detector, camera;
let rafId;
let renderer: CanvasRenderer = null;

const detectorConfig = {
    runtime: "mediapipe",
    modelType: "full",
    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
  };

async function createDetector() {
  const runtime = "mediapipe";
  if (runtime === "mediapipe") {
    return posedetection.createDetector(posedetection.SupportedModels.BlazePose, detectorConfig);
  } else if (runtime === "tfjs") {
    return posedetection.createDetector(STATE.model, {
      runtime,
      modelType: STATE.modelConfig.type,
    });
  }
}

// async function checkGuiUpdate(webCamRef) {
//   if (STATE.isTargetFPSChanged || STATE.isSizeOptionChanged) {
//     camera = await Camera.setup(webCamRef, 640, 480);
//     STATE.isTargetFPSChanged = false;
//     STATE.isSizeOptionChanged = false;
//   }

//   if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged) {
//     STATE.isModelChanged = true;

//     window.cancelAnimationFrame(rafId);

//     if (detector != null) {
//       detector.dispose();
//     }

//     if (STATE.isFlagChanged || STATE.isBackendChanged) {
//       await setBackendAndEnvFlags(STATE.flags, STATE.backend);
//     }

//     try {
//       detector = await createDetector();
//     } catch (error) {
//       detector = null;
//       alert(error);
//     }

//     STATE.isFlagChanged = false;
//     STATE.isBackendChanged = false;
//     STATE.isModelChanged = false;
//   }
// }

async function renderResult() {
  if (camera.video.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(camera.video);
      };
    });
  }

  let poses = null;

  if (detector != null) {
    try {
      poses = await detector.estimatePoses(camera.video, {
        maxPoses: STATE.modelConfig.maxPoses,
        flipHorizontal: false,
      });
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
  }
//   const rendererParams = [camera.video, poses, STATE.isModelChanged];
  renderer.draw(camera.video, poses);
}

async function renderPrediction(webCamRef) {
//   await checkGuiUpdate(webCamRef);
    await renderResult();

  rafId = requestAnimationFrame(() => renderPrediction(webCamRef));
}

function LiveFeed() {
  const urlParams = new URLSearchParams(window.location.search);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webCamRef = useRef<HTMLVideoElement>(null);
  
  const { clientHeight, clientWidth } = useContext(WindowContext);
  const [imgSrc, setImgSrc] = useState<string>(null);

  const domCleanup = () => {
    const optionsPanel = document.getElementById("gui");
    if (optionsPanel) optionsPanel.remove();

    if (camera) {
      // https://stackoverflow.com/questions/11642926/stop-close-webcam-stream-which-is-opened-by-navigator-mediadevices-getusermedia
      camera.video.srcObject.getTracks().forEach((track) => track.stop());
    }

    window.cancelAnimationFrame(rafId);
  };

  useEffect(() => {
    async function setup() {
      // const optionsPanel = document.getElementById("gui");
      // if (!optionsPanel) {
      //   await setupDatGui(urlParams);
      // }
      camera = await Camera.setup(webCamRef.current, clientWidth, clientHeight);
    //   await setBackendAndEnvFlags(STATE.flags, STATE.backend);
    //   await tf.ready();
      detector = await createDetector();
      const canvas = canvasRef.current;
      canvas.width = camera.video.width;
      canvas.height = camera.video.height;
      renderer = new CanvasRenderer(canvas);
      renderPrediction(webCamRef.current);
    }

    setup();

    return () => domCleanup();
  });

  function takePicture() {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = canvasRef.current.width;
    canvas.height = canvasRef.current.height;
    const context = canvas.getContext("2d");
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(webCamRef.current, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/png");
    setImgSrc(data);
  }

  return (
    <Stack align="center">
       <Image
              src={imgSrc}
              alt="webcam"
              id="screenshot"
              h={clientHeight}
              w={clientWidth}
              // ref={screenshotRef}
            />
      <div className="canvas-wrapper">
        <canvas id="output" ref={canvasRef}></canvas>
        <video
          id="video"
          ref={webCamRef}
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
      <Button onClick={takePicture}>Screenshot</Button>
    </Stack>
  );
}

export default LiveFeed;
