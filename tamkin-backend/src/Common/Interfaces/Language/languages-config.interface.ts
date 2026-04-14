import languagesConfig from '../../../Config/Language/language.json';

type ElementType = (typeof languagesConfig)[number];

export type LanguageCode = keyof ElementType;
