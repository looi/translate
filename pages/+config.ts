import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

const config: Config = {
  extends: [vikeReact],
  ssr: false,
  title: "Translator for language learners",
};

export default config;
