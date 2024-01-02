const DEFAULT_TARGET_FPS = 60;

export class Camera {
  video: HTMLVideoElement;
  stream: MediaStream;
  constructor(webCam: HTMLVideoElement) {
    this.video = webCam;
  }

  static async setup(webCam: HTMLVideoElement, camWidth: number, camHeight: number) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
          'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const videoConfig = {
      'audio': false,
      'video': {
        facingMode: 'user',
        width: camWidth,
        height: camHeight,
        frameRate: {
          ideal: DEFAULT_TARGET_FPS,
        }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    const camera = new Camera(webCam);
    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(camera.video);
      };
    });

    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show._
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    const canvasContainer = document.querySelector('.canvas-wrapper') as HTMLElement;
    canvasContainer.setAttribute('style', `width: ${videoWidth}px; height: ${videoHeight}px`);

    return camera;
  }
}