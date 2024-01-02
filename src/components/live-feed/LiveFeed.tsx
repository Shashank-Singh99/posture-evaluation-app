import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-webgpu";

import * as mpPose from "@mediapipe/pose";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import * as tf from "@tensorflow/tfjs-core";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

import * as posedetection from "@tensorflow-models/pose-detection";

import { Camera } from "./Camera";
import { RendererCanvas2d } from "./renderer_canvas2d";
import { setupDatGui } from "./option_panel";
import { STATE } from "./params";
import { setBackendAndEnvFlags } from "./utils";
import { useEffect, useRef } from "react";
import { Stack } from "@mantine/core";

let detector, camera;
let rafId;
let renderer = null;

async function createDetector() {
  const runtime = STATE.backend.split("-")[0];
  if (runtime === "mediapipe") {
    return posedetection.createDetector(STATE.model, {
      runtime,
      modelType: STATE.modelConfig.type,
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
    });
  } else if (runtime === "tfjs") {
    return posedetection.createDetector(STATE.model, {
      runtime,
      modelType: STATE.modelConfig.type,
    });
  }
}

async function checkGuiUpdate(webCamRef) {
  if (STATE.isTargetFPSChanged || STATE.isSizeOptionChanged) {
    camera = await Camera.setup(STATE.camera, webCamRef);
    STATE.isTargetFPSChanged = false;
    STATE.isSizeOptionChanged = false;
  }

  if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged) {
    STATE.isModelChanged = true;

    window.cancelAnimationFrame(rafId);

    if (detector != null) {
      detector.dispose();
    }

    if (STATE.isFlagChanged || STATE.isBackendChanged) {
      await setBackendAndEnvFlags(STATE.flags, STATE.backend);
    }

    try {
      detector = await createDetector();
    } catch (error) {
      detector = null;
      alert(error);
    }

    STATE.isFlagChanged = false;
    STATE.isBackendChanged = false;
    STATE.isModelChanged = false;
  }
}

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
  const rendererParams = [camera.video, poses, STATE.isModelChanged];
  renderer.draw(rendererParams);
}

async function renderPrediction(webCamRef) {
  await checkGuiUpdate(webCamRef);

  if (!STATE.isModelChanged) {
    await renderResult();
  }

  rafId = requestAnimationFrame(() => renderPrediction(webCamRef));
}

function LiveFeed() {
  const urlParams = new URLSearchParams(window.location.search);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webCamRef = useRef(null);

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
      const optionsPanel = document.getElementById("gui");
      if (!optionsPanel) {
        await setupDatGui(urlParams);
      }
      camera = await Camera.setup(STATE.camera, webCamRef.current);
      await setBackendAndEnvFlags(STATE.flags, STATE.backend);
      await tf.ready();
      detector = await createDetector();
      const canvas = canvasRef.current;
      canvas.width = camera.video.width;
      canvas.height = camera.video.height;
      renderer = new RendererCanvas2d(canvas);
      renderPrediction(webCamRef.current);
    }

    setup();

    return () => domCleanup();
  });

  return (
    <Stack align="center">
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
    </Stack>
  );
}

export default LiveFeed;
