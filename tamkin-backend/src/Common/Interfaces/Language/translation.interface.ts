export interface ITranslationService {
  get(lang: string, pathKey: string): string;
}
