export const createNewPostureImage = (canvas: HTMLCanvasElement): HTMLImageElement => {
    const image = new Image();
    image.src = canvas.toDataURL();
    image.width = canvas.width;
    image.height = canvas.height;
    return image;
  }