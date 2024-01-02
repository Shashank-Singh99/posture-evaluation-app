import { useContext, useRef, useState } from "react";
import { ActionIcon, NumberInput, Stack, Switch } from "@mantine/core";
import { ScreenshotContext } from "../contexts/ContextProvider";
import { WindowContext } from "../contexts/WindowContextProvider";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import { useDebounceEffect } from "./crop-camera/useDebounceEffect";
import { canvasPreview } from "./crop-camera/canvasPreview";
import "react-image-crop/dist/ReactCrop.css";
import { IconCheck } from "@tabler/icons-react";
import { createNewPostureImage } from "../utils/utils";
import { ControlPanel } from "./ControlPanel";

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function StaticImageCrop() {
  const [scale, setScale] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropComplete, setIsCropComplete] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const { screenshot, setScreenshot } = useContext(ScreenshotContext);
  const { clientHeight, clientWidth } = useContext(WindowContext);
  const [rotate, setRotate] = useState(0);

  const confirmCroppedImage = () => {
    setScreenshot(createNewPostureImage(previewCanvasRef.current));
    setIsCropComplete(true);
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else {
      setAspect(16 / 9);

      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, 16 / 9);
        setCrop(newCrop);
        // Updates the preview
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  if (!screenshot) {
    return (
      <>
        <Stack align="center" justify="space-around">
          Error
        </Stack>
      </>
    );
  }


  return (
    <Stack align="center" justify="space-around">
      <ControlPanel>
        <NumberInput
          label="Scale"
          description=""
          placeholder=""
          value={scale}
          size="sm"
          disabled={!screenshot.src}
          onChange={(e) => setScale(Number(e))}
        />
        <NumberInput
          label="Rotate"
          description=""
          placeholder=""
          value={rotate}
          size="sm"
          disabled={!screenshot.src}
          onChange={(e) => setRotate(Math.min(180, Math.max(-180, Number(e))))}
        />

        <Switch size="sm" label="Aspect" onChange={handleToggleAspectClick} />

        <ActionIcon
          variant="gradient"
          size="sm"
          aria-label="Gradient action icon"
          gradient={{ from: "grape", to: "indigo", deg: 90 }}
          onClick={confirmCroppedImage}
        >
          <IconCheck />
        </ActionIcon>
      </ControlPanel>

      {!!screenshot.src && !isCropComplete && (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          // minWidth={400}
          minHeight={100}
          // circularCrop
        >
          <img
            ref={imgRef}
            alt="Crop me"
            height={clientHeight}
            width={clientWidth}
            src={screenshot.src}
            style={{ transform: `scale(${scale})` }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      )}
      {!!completedCrop && (
        <>
          <div>
            <canvas
              ref={previewCanvasRef}
              width={completedCrop.width}
              height={completedCrop.height}
              style={{
                // border: "1px solid black",
                objectFit: "contain",
                width: completedCrop.width,
                height: completedCrop.height,
              }}
            />
          </div>
        </>
      )}
    </Stack>
  );
}

export default StaticImageCrop;
