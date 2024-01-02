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
  Switch,
} from "@mantine/core";
import { ScreenshotContext } from "../contexts/ContextProvider";
import LiveFeed from "./live-feed/LiveFeed";
import { WindowContext } from "../contexts/WindowContextProvider";
import { IconCamera, IconCompass } from "@tabler/icons-react";

const images = [
  "posture-capture/pose1.png",
  // "posture-capture/pose2.png",
  // "posture-capture/pose3.png",
];

function PostureCapture() {
  const screenshotRef = useRef(null);

  const reactWebCamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [showInstructions, setShowIntructions] = useState(true);

  const { setScreenshot } = useContext(ScreenshotContext);
  const { clientHeight, clientWidth } = useContext(WindowContext);

  const handlePreiewToggle = () => setIsPreview(!isPreview);

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

            <Switch
              size="sm"
              label="Preview"
              onChange={() => (imgSrc ? {} : handlePreiewToggle())}
            />
          </>
        )}
      </Group>

      {showInstructions ? (
        <Image src={images[0]} w={clientWidth} h={clientHeight}></Image>
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
              {isPreview ? (
                <LiveFeed />
              ) : (
                <Webcam
                  ref={reactWebCamRef}
                  mirrored={true}
                  style={{
                    width: "auto",
                    height: "auto",
                  }}
                  videoConstraints={{
                    facingMode: "environment",
                    width: { max: clientWidth, min: clientWidth },
                    height: { max: clientHeight, min: clientHeight },
                  }}
                />
              )}
            </Fragment>
          )}
        </Fragment>
      )}
    </Stack>
  );
}

export default PostureCapture;
