CREATE TABLE `chat_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`fromLang` text NOT NULL,
	`toLang` text NOT NULL,
	`rawBytes` blob NOT NULL,
	CONSTRAINT `chat_cache_type_text_fromLang_toLang_unique` UNIQUE(`type`,`text`,`fromLang`,`toLang`)
);
--> statement-breakpoint
CREATE TABLE `translate_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`text` text NOT NULL,
	`nativeLang` text NOT NULL,
	`learnLang` text NOT NULL,
	`textIsNativeLang` integer NOT NULL,
	`createdAt` integer NOT NULL,
	CONSTRAINT `translate_history_text_nativeLang_learnLang_textIsNativeLang_unique` UNIQUE(`text`,`nativeLang`,`learnLang`,`textIsNativeLang`)
);
