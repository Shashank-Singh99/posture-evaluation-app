import { createContext, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";

export const ScreenshotContext = createContext<ScreenShotContextType>(null);

type ScreenShotContextType = {
  screenshot: HTMLImageElement;
  setScreenshot: React.Dispatch<React.SetStateAction<HTMLImageElement>>;
}

export const ScreenshotContextProvider = ({ children }) => {
  const [screenshot, setScreenshot] = useState<HTMLImageElement>(null);

  return (
    <ScreenshotContext.Provider value={{ screenshot, setScreenshot }}>
      {children}
    </ScreenshotContext.Provider>
  );
};

export const PosesContext = createContext(null);

export const PosesContextProvider = ({ children }) => {
  const [globalPoses, setGlobalPoses] = useState<poseDetection.Pose[]>(null);

  return (
    <PosesContext.Provider value={{ globalPoses, setGlobalPoses }}>
      {children}
    </PosesContext.Provider>
  );
};

export const DetectorContext = createContext(null);

export const DetectorContextProvider = ({ children }) => {
  const [globalDetector, setGlobalDetector] = useState(null);

  return (
    <DetectorContext.Provider value={{ globalDetector, setGlobalDetector }}>
      {children}
    </DetectorContext.Provider>
  );
};

export const CanvasLayoutContext = createContext(null);

export type CanvasLayout = {
  height: number;
  width: number;
};

export const CanvasLayoutContextProvider = ({ children }) => {
  const [canvasLayout, setCanvasLayout] = useState<CanvasLayout>({
    height: 480,
    width: 640,
  });

  return (
    <CanvasLayoutContext.Provider value={{ canvasLayout, setCanvasLayout }}>
      {children}
    </CanvasLayoutContext.Provider>
  );
};


export const StepperContext = createContext<StepperContextType>(null);

export type StepperContextType = {
  stepNumber: number;
  changeStepNumber: (val: number) => void
};

export const StepperContextProvider = ({ children }) => {
  const [stepNumber, setStepNumber] = useState<number>(0);

  const changeStepNumber = (val: number) => setStepNumber(val);

  return (
    <StepperContext.Provider value={{ stepNumber, changeStepNumber }}>
      {children}
    </StepperContext.Provider>
  );
};
