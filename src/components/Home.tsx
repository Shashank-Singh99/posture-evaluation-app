import "@mantine/core/styles.css";

import { Stack, Stepper } from "@mantine/core";
import { useContext } from "react";
import PostureVerify from "./PostureVerify";
import {
  CanvasLayoutContextProvider,
  DetectorContextProvider,
  PosesContextProvider,
  ScreenshotContextProvider,
  StepperContext
} from "../contexts/ContextProvider";
import { Notifications } from "@mantine/notifications";
import PostureAnalysis from "./PostureAnalysis";
import { WindowContextProvider } from "../contexts/WindowContextProvider";
import StaticImageCrop from "./StaticImageCrop";
import PostureCaptureRebrand from "./posture-capture/PostureCaptureRebrand";

function Home() {
  const { stepNumber, changeStepNumber } = useContext(StepperContext);

  return (
    <>
      <WindowContextProvider>
        <PosesContextProvider>
          <ScreenshotContextProvider>
            <DetectorContextProvider>
              <CanvasLayoutContextProvider>
                <Notifications
                  position="top-center"
                  autoClose={4000}
                ></Notifications>
                <Stepper size="sm" active={stepNumber} onStepClick={changeStepNumber}>
                  <Stepper.Step
                    label="Capture Posture"
                    description="Capture body posture"
                  >
                    <PostureCaptureRebrand />
                  </Stepper.Step>
                  <Stepper.Step
                    label="Edit Image"
                    description="Edit image"
                  >
                    <StaticImageCrop />
                  </Stepper.Step>
                  <Stepper.Step
                    label="Confirm Posture"
                    description="Verify body posture"
                  >
                    <PostureVerify />
                  </Stepper.Step>
                  <Stepper.Step
                    label="Analyse Posture"
                    description="Analyse body posture"
                  >
                    <PostureAnalysis />
                  </Stepper.Step>
                  <Stepper.Completed>
                    Completed, click back button to get to previous step
                  </Stepper.Completed>
                </Stepper>
              </CanvasLayoutContextProvider>
            </DetectorContextProvider>
          </ScreenshotContextProvider>
        </PosesContextProvider>
      </WindowContextProvider>
      <Stack>
      {/* <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={nextStep}>Next step</Button>
      </Group> */}
      </Stack>
    </>
  );
}

export default Home;
