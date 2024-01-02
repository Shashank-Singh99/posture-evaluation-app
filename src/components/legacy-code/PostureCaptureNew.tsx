import Webcam from "react-webcam";
import { useContext, useEffect, useRef } from 'react';
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import { RendererCanvas2d } from "../live-feed/renderer_canvas2d";
import { WindowContext } from "../../contexts/WindowContextProvider";

const detectorConfig = {
  runtime: "mediapipe",
  modelType: "full",
  solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose/",
  enableSmoothing: false,
};

const createDetector = async() => {
  return await poseDetection.createDetector(
    poseDetection.SupportedModels.BlazePose,
    detectorConfig
  );
}

let renderer, detector, camera, rafId;

async function renderResult() {
  if (camera.video.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(camera.video);
      };
    });
  }

  let poses = null;

  console.log(camera.video);

  if (detector != null) {
    try {
      poses = await detector.estimatePoses(camera.video, {
        maxPoses: 1,
        flipHorizontal: false,
      });
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
  }
  console.log(poses);
  const rendererParams = [camera.video, poses, false];
  renderer.draw(rendererParams);
}

async function renderPrediction() {
  await renderResult();

  rafId = requestAnimationFrame(renderPrediction);
}

export const Apple = (props) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const { clientHeight, clientWidth } = useContext(WindowContext);

    useEffect(() => {
      async function setup() {
        await tf.ready();
        detector = await createDetector();
        // setGlobalDetector(detector);
        console.log("detector is created : ", detector);
        camera = webcamRef.current;
        const canvas = canvasRef.current;
        // canvas.width = camera.video.width;
        // canvas.height = camera.video.height;
        console.log("The canvas is : ", canvas);
        renderer = new RendererCanvas2d(canvas);
        renderPrediction();
      }

      setup();
    });

    return (
        <>
            <Webcam
                ref={webcamRef}
                mirrored
                width={clientWidth}
                height={clientHeight}
                videoConstraints={{
                  facingMode: 'environment',
                  width: { max: clientWidth, min: clientWidth },
                  height: { max: clientHeight, min: clientHeight },
                  frameRate: { ideal: 60 }
                }}
            />
            <canvas ref={canvasRef}
              width={clientWidth}
              height={clientHeight}/>
        </>
    )
}