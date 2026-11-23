import z from "zod";

export const COMMON_LANGUAGES = [
  { value: "sq", label: "Albanian" },
  { value: "am", label: "Amharic" },
  { value: "ar", label: "Arabic" },
  { value: "hy", label: "Armenian" },
  { value: "az", label: "Azerbaijani" },
  { value: "eu", label: "Basque" },
  { value: "be", label: "Belarusian" },
  { value: "bn", label: "Bengali" },
  { value: "bg", label: "Bulgarian" },
  { value: "ca", label: "Catalan" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "zh-TW", label: "Chinese (Traditional)" },
  { value: "hr", label: "Croatian" },
  { value: "cs", label: "Czech" },
  { value: "da", label: "Danish" },
  { value: "nl", label: "Dutch" },
  { value: "en", label: "English" },
  { value: "et", label: "Estonian" },
  { value: "fi", label: "Finnish" },
  { value: "fr", label: "French" },
  { value: "ka", label: "Georgian" },
  { value: "de", label: "German" },
  { value: "el", label: "Greek" },
  { value: "gu", label: "Gujarati" },
  { value: "he", label: "Hebrew" },
  { value: "hi", label: "Hindi" },
  { value: "hu", label: "Hungarian" },
  { value: "is", label: "Icelandic" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "kn", label: "Kannada" },
  { value: "ko", label: "Korean" },
  { value: "ku", label: "Kurdish" },
  { value: "lo", label: "Lao" },
  { value: "lv", label: "Latvian" },
  { value: "lt", label: "Lithuanian" },
  { value: "ms", label: "Malay" },
  { value: "ml", label: "Malayalam" },
  { value: "mr", label: "Marathi" },
  { value: "no", label: "Norwegian" },
  { value: "or", label: "Oriya" },
  { value: "fa", label: "Persian" },
  { value: "pl", label: "Polish" },
  { value: "pt", label: "Portuguese" },
  { value: "pa", label: "Punjabi" },
  { value: "ro", label: "Romanian" },
  { value: "ru", label: "Russian" },
  { value: "sr", label: "Serbian" },
  { value: "sk", label: "Slovak" },
  { value: "sl", label: "Slovene" },
  { value: "es", label: "Spanish" },
  { value: "sv", label: "Swedish" },
  { value: "tl", label: "Tagalog" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "th", label: "Thai" },
  { value: "tr", label: "Turkish" },
  { value: "uk", label: "Ukrainian" },
  { value: "ur", label: "Urdu" },
  { value: "vi", label: "Vietnamese" },
  { value: "yo", label: "Yoruba" },
];

const COMMON_LANGUAGES_MAP = Object.fromEntries(
  COMMON_LANGUAGES.map((l) => [l.value, l.label]),
);

export function langToLabel(lang: string) {
  return COMMON_LANGUAGES_MAP[lang] || "";
}

export const TranslateMaxLength = 1000;

export const TranslateRequestSchema = z
  .object({
    nativeLang: z.enum(COMMON_LANGUAGES.map((l) => l.value)),
    learnLang: z.enum(COMMON_LANGUAGES.map((l) => l.value)),
    text: z
      .string()
      .trim()
      .min(1)
      .max(TranslateMaxLength)
      .refine((t) => {
        return !/[\n\r\t]/.test(t) && !/\s{2,}/.test(t);
      }),
    textIsNativeLang: z.boolean(),
  })
  .refine((data) => data.nativeLang !== data.learnLang);

export type TranslateRequestSchema = z.infer<typeof TranslateRequestSchema>;

export function toTranslateUrl(req: TranslateRequestSchema) {
  const searchParams = new URLSearchParams({
    text: req.text,
    nativeLang: req.nativeLang,
    learnLang: req.learnLang,
    textIsNativeLang: String(req.textIsNativeLang),
  });
  return `/?${searchParams.toString()}`;
}
