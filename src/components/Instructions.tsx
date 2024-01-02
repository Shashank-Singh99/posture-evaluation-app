import { Image } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useContext } from "react";
import { WindowContext } from "../contexts/WindowContextProvider";

type Props = {
  images: string[];
};

export const Instructions = (props: Props) => {
  const { clientWidth, clientHeight } = useContext(WindowContext);

  return (

    <Carousel
      height={clientHeight}
    >
      {props.images.map((image, index) => {
        return (
          <Carousel.Slide key={index}>
            <Image src={image} w={clientWidth} h={clientHeight}></Image>
          </Carousel.Slide>
        );
      })}
    </Carousel>
  );
};
