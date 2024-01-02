import { createContext, useCallback, useEffect, useState } from "react";

// https://medium.com/@christian_maehler/handle-window-resizing-with-a-react-context-4392b47285e4
//  https://blog.logrocket.com/css-breakpoints-responsive-design/

export type WindowContextProps = {
  clientHeight: number;
  clientWidth: number;
};

export const WindowContext = createContext<WindowContextProps>({
  clientHeight: 0,
  clientWidth: 0,
});

const VIDEO_DIMENSIONS = {
  lg: { width: 640, height: 480 },
//   lg: { width: 800, height: 480 },
  md: { width: 640, height: 360 },
  sm: { width: 360, height: 270 },
  // sm: { width: 360, height: 500 },
};

const getDeviceDimensions = (currentWidth: number) => {
  if (currentWidth <= 768) {
    console.log("This is mobile");
    return VIDEO_DIMENSIONS["sm"];
  } else if (currentWidth <= 1024) {
    console.log("This is ipad");
    return VIDEO_DIMENSIONS["md"];
  } else if (currentWidth > 1024) {
    console.log("This is laptop");
    return VIDEO_DIMENSIONS["lg"];
  } else {
    return VIDEO_DIMENSIONS["lg"];
  }
};

export const WindowContextProvider = ({ children }) => {
  const getVh = useCallback(() => {
    // const currentHeight = Math.max(
    //     document.documentElement.clientHeight || 0,
    //     window.innerHeight || 0
    //   );
    const currentWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );

    return getDeviceDimensions(currentWidth).height;
  }, []);

  const getVw = useCallback(() => {
    const currentWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    return getDeviceDimensions(currentWidth).width;
  }, []);

  const [clientHeight, setVh] = useState<number>(getVh());
  const [clientWidth, setVw] = useState<number>(getVw());

  useEffect(() => {
    const handleResize = () => {
      setVh(getVh());
      setVw(getVw());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [getVh, getVw]);

  return (
    <WindowContext.Provider value={{ clientHeight, clientWidth }}>
      {children}
    </WindowContext.Provider>
  );
};
