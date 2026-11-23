import {
  ActionIcon,
  Box,
  Burger,
  Group,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery, useSplitter } from "@mantine/hooks";
import { IconBrandGithubFilled } from "@tabler/icons-react";
import { useEffect } from "react";
import { useData } from "vike-react/useData";
import { usePageContext } from "vike-react/usePageContext";
import type { Data } from "./+data";
import { TranslateHistory } from "./TranslateHistory";
import { TranslateInterface } from "./TranslateInterface";

export default function Page() {
  const { initialReq, initialResps, initialErrors } = useData<Data>();
  const pageContext = usePageContext();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  useEffect(() => {
    closeMobile();
  }, [isDesktop]);

  const splitter = useSplitter({
    panels: [
      { defaultSize: 50, min: 20 },
      { defaultSize: 50, min: 20 },
    ],
  });

  let historyDisplay = "flex";
  let historyWidth = splitter.sizes[0];
  let handleDisplay = "";
  let interfaceDisplay = "flex";
  let interfaceWidth = splitter.sizes[1];
  if (!isDesktop && mobileOpened) {
    historyDisplay = "flex";
    historyWidth = 100;
    handleDisplay = "none";
    interfaceDisplay = "none";
    interfaceWidth = 0;
  } else if (!isDesktop && !mobileOpened) {
    historyDisplay = "none";
    historyWidth = 0;
    handleDisplay = "none";
    interfaceDisplay = "flex";
    interfaceWidth = 100;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
      }}
    >
      <Group
        bg="var(--mantine-primary-color-6)"
        c="var(--mantine-color-white)"
        px="xs"
        py="3px"
      >
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          hiddenFrom="md"
          size="sm"
          color="var(--mantine-color-white)"
        />
        <Text size="md" fw="bold">
          Translator for language learners
        </Text>
        <ActionIcon
          component="a"
          target="_blank"
          href="http://github.com/looi/translate"
          size="lg"
          ml="auto"
        >
          <IconBrandGithubFilled />
        </ActionIcon>
      </Group>
      <div
        ref={splitter.ref}
        style={{
          display: "flex",
          flex: 1,
        }}
      >
        <div
          style={{
            width: `${historyWidth}%`,
            display: historyDisplay,
            flexDirection: "column",
          }}
        >
          <Box p="md">
            <TranslateHistory closeMobile={closeMobile} />
          </Box>
        </div>
        <div
          {...splitter.getHandleProps({ index: 0 })}
          style={{
            width: 6,
            flexShrink: 0,
            cursor: "col-resize",
            touchAction: "none",
            backgroundColor: "var(--mantine-color-gray-6)",
            position: "relative",
            display: handleDisplay,
          }}
        ></div>
        <div
          style={{
            width: `${interfaceWidth}%`,
            display: interfaceDisplay,
            flexDirection: "column",
          }}
        >
          <Box p="md">
            <TranslateInterface
              key={pageContext.urlParsed.searchOriginal}
              initialReq={initialReq}
              initialResps={initialResps}
              initialErrors={initialErrors}
            />
          </Box>
        </div>
      </div>
    </div>
  );
}
