import {
  ActionIcon,
  Alert,
  Badge,
  Blockquote,
  Box,
  Button,
  Group,
  List,
  Loader,
  Select,
  Switch,
  Table,
  Tabs,
  Text,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowBackUp,
  IconArrowBackUpDouble,
  IconArrowLeft,
  IconArrowRight,
  IconArrowsRight,
  IconEdit,
  IconFile,
  IconFileUnknown,
  IconSearch,
  IconThumbDown,
  IconThumbUp,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diffWords } from "diff";
import { eld } from "eld/large";
import React, { useState } from "react";
import Markdown from "react-markdown";
import { navigate } from "vike/client/router";
import {
  COMMON_LANGUAGES,
  toTranslateUrl,
  TranslateMaxLength,
  TranslateRequestSchema,
} from "../../src/common";
import { onStreamMessages } from "./TranslateInterface.telefunc";

type RespMap = Record<string, string>;

function getLangScores(text: string) {
  return Object.entries(eld.detect(text).getScores()).sort(
    (a, b) => b[1] - a[1],
  );
}

export function TranslateInterface({
  initialReq,
  initialResps,
  initialErrors,
}: {
  initialReq: TranslateRequestSchema | null;
  initialResps: RespMap;
  initialErrors: string[];
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState(initialReq?.text ?? "");
  const [nativeLang, setNativeLang] = useState(initialReq?.nativeLang ?? "en");
  const [learnLang, setLearnLang] = useState(initialReq?.learnLang ?? "");
  const [lastSelectedLearnLang, setLastSelectedLearnLang] = useState(
    initialReq?.learnLang ?? "",
  );
  const [showDiff, setShowDiff] = useState(true);
  const [textIsNativeLang, setTextIsNativeLang] = useState(
    initialReq?.textIsNativeLang ?? false,
  );
  const [resps, setResps] = useState<RespMap>(initialResps);
  const [errors, setErrors] = useState<string[]>(initialErrors);
  const [req, setReq] = useState<TranslateRequestSchema | null>(initialReq);

  const langScores = getLangScores(text);

  function handleTextChange(rawValue: string) {
    const nextText = rawValue
      .replaceAll(/\s+/g, " ")
      .substring(0, TranslateMaxLength);
    setText(nextText);
    const scores = getLangScores(nextText);
    const topLang = scores[0]?.[0];
    if (!topLang) return;
    if (topLang === nativeLang.substring(0, 2)) {
      setTextIsNativeLang(true);
      if (lastSelectedLearnLang) setLearnLang(lastSelectedLearnLang);
    } else if (topLang === learnLang.substring(0, 2)) {
      setTextIsNativeLang(false);
    } else {
      const matched = COMMON_LANGUAGES.find(
        (l) => l.value.substring(0, 2) === topLang,
      );
      if (matched) setLearnLang(matched.value);
    }
  }

  function swapArrow() {
    setTextIsNativeLang((p) => !p);
  }

  const translateMutation = useMutation({
    mutationFn: async ({
      req,
      performReq,
    }: {
      req: TranslateRequestSchema;
      performReq: boolean;
    }) => {
      const streamState: RespMap = {};
      const streamErrors: string[] = [];
      setResps({});
      setErrors([]);
      const stream = await onStreamMessages({
        req,
        performReq,
        updateHistory: true,
      });
      for await (const message of stream) {
        if (message.type === "error") {
          streamErrors.push(message.text);
          setErrors([...streamErrors]);
        } else {
          streamState[message.type] =
            (streamState[message.type] || "") + message.text;
          setResps({ ...streamState });
        }
      }
      return { req, streamState, streamErrors, performReq };
    },
    onSuccess: async ({ req, streamState, streamErrors, performReq }) => {
      if (streamErrors.length > 0) return;
      if (!performReq && !streamState["all_done"]) {
        translateMutation.mutate({ req, performReq: true });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["translateHistory"] });
      await navigate(toTranslateUrl(req), {
        keepScrollPosition: true,
      });
    },
    onError: (err) => {
      setErrors((prev) => [...prev, err.message]);
    },
  });

  function doTranslate() {
    const currentReq = { text, nativeLang, learnLang, textIsNativeLang };
    setReq(currentReq);
    translateMutation.mutate({ req: currentReq, performReq: false });
  }

  const isLoading = translateMutation.isPending;

  const isValidInput = TranslateRequestSchema.safeParse({
    text,
    nativeLang,
    learnLang,
    textIsNativeLang,
  }).success;

  return (
    <>
      <Group mb="md">
        <Select
          label="Your native language (used for explanations)"
          placeholder="Pick language"
          data={COMMON_LANGUAGES}
          searchable
          value={nativeLang}
          disabled={isLoading}
          onChange={(v) => v && setNativeLang(v)}
          style={{ flex: 1 }}
        />
        <ActionIcon variant="default" onClick={swapArrow} mt="24px">
          {textIsNativeLang ? <IconArrowRight /> : <IconArrowLeft />}
        </ActionIcon>
        <Select
          label="Language you are learning"
          placeholder="Pick language"
          data={COMMON_LANGUAGES}
          searchable
          value={learnLang || null}
          disabled={isLoading}
          onChange={(v) => {
            if (v) {
              setLearnLang(v);
              setLastSelectedLearnLang(v);
            }
          }}
          style={{ flex: 1 }}
        />
      </Group>
      <Textarea
        label="Text (either native or learning language, autodetected)"
        placeholder="Enter text to translate..."
        autosize
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        disabled={isLoading}
      />
      <Group mt="md">
        <Button onClick={doTranslate} disabled={isLoading || !isValidInput}>
          Translate
        </Button>
        <Switch
          label="Diff"
          checked={showDiff}
          onChange={(e) => setShowDiff(e.currentTarget.checked)}
        />
        <Text size="xs">Autodetected:</Text>
        {langScores
          .filter(
            ([code]) =>
              code === nativeLang.substring(0, 2) ||
              code === learnLang.substring(0, 2),
          )
          .slice(0, 2)
          .map(([code, score]) => (
            <Badge key={code} size="sm" variant="light" color="blue">
              {code}: {(score * 100).toFixed(0)}%
            </Badge>
          ))}
        {isLoading && <Loader size="sm" />}
      </Group>
      {errors.length > 0 && (
        <Alert mt="md" title="Error" color="red">
          <List size="sm">
            {errors.map((err, i) => (
              <List.Item key={i}>{err}</List.Item>
            ))}
          </List>
        </Alert>
      )}
      {req && Object.keys(resps).length > 0 && (
        <Box mt="md">
          <TranslateResult req={req} resps={resps} showDiff={showDiff} />
        </Box>
      )}
    </>
  );
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; usesDiff?: boolean; usesMarkdown?: boolean }
> = {
  direct_translation: {
    icon: <IconArrowRight size={18} color="var(--mantine-color-blue-6)" />,
  },
  idiomatic_translation: {
    icon: <IconArrowsRight size={18} color="var(--mantine-color-orange-6)" />,
  },
  improvement: {
    icon: <IconEdit size={18} color="var(--mantine-color-green-6)" />,
    usesDiff: true,
  },
  direct_back_translation: {
    icon: <IconArrowBackUp size={18} color="var(--mantine-color-grape-6)" />,
    usesDiff: true,
  },
  idiomatic_back_translation: {
    icon: (
      <IconArrowBackUpDouble size={18} color="var(--mantine-color-red-6)" />
    ),
    usesDiff: true,
  },
  explanation: {
    icon: <IconSearch size={18} color="var(--mantine-color-cyan-6)" />,
    usesMarkdown: true,
  },
};

const TYPE_ORDER = [
  "direct_translation",
  "idiomatic_translation",
  "improvement",
  "direct_back_translation",
  "idiomatic_back_translation",
  "explanation",
];

function parseExplanationRating(text: string) {
  const regex =
    /(?:\*\*)?Needs Major Improvement:(?:\*\*)?\s*(?:\*\*)?(Yes|No)[.*]*$/m;
  const match = text.match(regex);
  let rating = "";
  if (match) {
    text = text.slice(0, match.index).trimEnd();
    rating = match[1];
  }
  return { text, rating };
}

function snakeToLabel(snake: string) {
  return snake.charAt(0).toUpperCase() + snake.slice(1).replace(/_/g, " ");
}

function TranslateResult({
  req,
  resps,
  showDiff,
}: {
  req: TranslateRequestSchema;
  resps: RespMap;
  showDiff: boolean;
}) {
  const { text: explanationText, rating } = parseExplanationRating(
    resps["explanation"] || "",
  );
  const summaryResps = rating
    ? { ...resps, explanation: explanationText }
    : resps;

  let tabBg = "gray";
  let icon = <IconFileUnknown color="var(--mantine-color-gray-9)" />;
  let message = "Original text was not rated.";
  if (req.textIsNativeLang) {
    icon = <IconFile color="var(--mantine-color-gray-9)" />;
    message = "Original text is in the native language.";
  } else if (rating === "Yes") {
    tabBg = "red";
    icon = <IconThumbDown color="var(--mantine-color-red-9)" />;
    message = "Original text is wrong or unnatural to a native speaker.";
  } else if (rating === "No") {
    tabBg = "green";
    icon = <IconThumbUp color="var(--mantine-color-green-9)" />;
    message = "Original text is correct and natural to a native speaker.";
  }

  return (
    <Box
      mb="md"
      style={{
        border: "1px solid var(--mantine-color-gray-3)",
        borderRadius: "var(--mantine-radius-sm)",
      }}
    >
      <Tabs defaultValue="summary">
        <Tabs.List bg={`${tabBg}.1`}>
          <Tooltip
            label={message}
            events={{ hover: true, focus: true, touch: true }}
          >
            <Text p="5px" pb="0">
              {icon}
            </Text>
          </Tooltip>
          <Tabs.Tab value="summary">Summary</Tabs.Tab>
          <Tabs.Tab value="raw">Raw</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="summary">
          <TranslateSummary
            text={req.text}
            resps={summaryResps}
            showDiff={showDiff}
          />
        </Tabs.Panel>
        <Tabs.Panel value="raw">
          <TranslateRaw resps={resps} />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}

function TranslateSummary({
  text,
  resps,
  showDiff,
}: {
  text: string;
  resps: RespMap;
  showDiff: boolean;
}) {
  return (
    <Table>
      <Table.Tbody>
        {TYPE_ORDER.map((type) => {
          const value = resps[type] || "";
          if (!value) return null;
          return (
            <TranslateSummaryRow
              key={type}
              type={type}
              text={value}
              text2={text}
              showDiff={showDiff}
            />
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

function TranslateSummaryRow({
  type,
  text,
  text2,
  showDiff,
}: {
  type: string;
  text: string;
  text2?: string;
  showDiff?: boolean;
}) {
  const entry = TYPE_CONFIG[type];
  if (!entry) return null;

  const renderContent = () => {
    if (entry.usesMarkdown) {
      return (
        <Markdown
          components={{
            h1: (props) => <Title order={1} py="sm" {...props} />,
            h2: (props) => <Title order={2} py="sm" {...props} />,
            h3: (props) => <Title order={3} py="sm" {...props} />,
            h4: (props) => <Title order={4} py="sm" {...props} />,
            h5: (props) => <Title order={5} py="sm" {...props} />,
            h6: (props) => <Title order={6} py="sm" {...props} />,
            p: (props) => <Text mb="md" {...props} />,
            a: () => <>[link]</>,
            ul: ({ children }) => <List>{children}</List>,
            ol: ({ children }) => <List type="ordered">{children}</List>,
            li: ({ children }) => <List.Item>{children}</List.Item>,
            img: () => <>[image]</>,
            blockquote: (props) => <Blockquote {...props} />,
          }}
        >
          {text.replace(/\n+/g, "\n")}
        </Markdown>
      );
    }
    if (entry.usesDiff && showDiff && text2 && text !== text2) {
      return <TextDiff text1={text2} text2={text} />;
    }
    return <>{text}</>;
  };

  return (
    <Table.Tr>
      <Tooltip
        label={snakeToLabel(type)}
        events={{ hover: true, focus: true, touch: true }}
        position="left"
      >
        <Table.Td bg="var(--mantine-color-gray-1)" pt="0" pb="0" w="0">
          {entry.icon}
        </Table.Td>
      </Tooltip>
      <Table.Td>{renderContent()}</Table.Td>
    </Table.Tr>
  );
}

function TextDiff({ text1, text2 }: { text1: string; text2: string }) {
  const diff = diffWords(text1, text2);

  return (
    <>
      {diff.map((part, index) => {
        const color = part.added
          ? "green.1"
          : part.removed
            ? "red.1"
            : "transparent";
        const textDecoration = part.removed ? "line-through" : "none";

        return (
          <Text key={index} component="span" bg={color} td={textDecoration}>
            {part.value}
          </Text>
        );
      })}
    </>
  );
}

function TranslateRaw({ resps }: { resps: RespMap }) {
  return (
    <>
      {TYPE_ORDER.filter((t) => resps[t]).map((type) => {
        const entry = TYPE_CONFIG[type];
        return (
          <React.Fragment key={type}>
            <Group gap="xs" p="xs">
              {entry?.icon}
              <Text fw="bold">{snakeToLabel(type)}</Text>
            </Group>
            <Text
              component="pre"
              size="sm"
              p="xs"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {resps[type]}
            </Text>
          </React.Fragment>
        );
      })}
    </>
  );
}
