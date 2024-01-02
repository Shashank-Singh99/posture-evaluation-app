import { ActionIcon, Group } from "@mantine/core";
import { useContext } from "react";
import { StepperContext } from "../contexts/ContextProvider";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";


export const ControlPanel = ({ children }) => {
  const { changeStepNumber, stepNumber } = useContext(StepperContext);

  const goToPreviousStep = () => {
    const value = stepNumber > 0 ? stepNumber - 1 : stepNumber;
    changeStepNumber(value);
  };

  const goToNextStep = () => {
    const value = stepNumber < 3 ? stepNumber + 1 : stepNumber;
    changeStepNumber(value);
  };

  return (
    <Group justify="space-between" mt="xl" gap="xl">
      <ActionIcon
        variant="filled"
        size="sm"
        aria-label="Gradient action icon"
        onClick={goToPreviousStep}
      >
        <IconArrowNarrowLeft />
      </ActionIcon>
      {children}

      <ActionIcon
        variant="filled"
        size="sm"
        aria-label="Gradient action icon"
        onClick={goToNextStep}
      >
        <IconArrowNarrowRight />
      </ActionIcon>
    </Group>
  );
};
