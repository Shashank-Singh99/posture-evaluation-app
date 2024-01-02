import {
  AppShell,
  Burger,
  Group,
  MantineProvider,
  Image,
  NavLink,
} from "@mantine/core";
import "./App.css";
import Home from "./components/Home";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronRight, IconGauge } from "@tabler/icons-react";
import { StepperContextProvider } from "./contexts/ContextProvider";

function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const navbarItems = [
    "Anterior Posture",
    "Lateral Posture",
    "Posterior Posture",
    "Full Posture Scan",
  ];

  return (
    <MantineProvider defaultColorScheme="dark">
      <StepperContextProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding="md"
        transitionDuration={500}
        transitionTimingFunction="ease"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
            <Image src="logo.png" h={42}></Image>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          Guide
          {navbarItems.map((item, index) => (
            <NavLink
              key={index}
              href="#physiotrack"
              label={item}
              leftSection={<IconGauge size="1rem" stroke={1.5} />}
              rightSection={
                <IconChevronRight
                  size="0.8rem"
                  stroke={1.5}
                  className="mantine-rotate-rtl"
                />
              }
              variant="subtle"
              active={index === 0}
            />
          ))}
        </AppShell.Navbar>

        <AppShell.Main>
          <Home />
        </AppShell.Main>

        <AppShell.Footer>Footer</AppShell.Footer>
      </AppShell>
      </StepperContextProvider>
    </MantineProvider>
  );
}

export default App;
