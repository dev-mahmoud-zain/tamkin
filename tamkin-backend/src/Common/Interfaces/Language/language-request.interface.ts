import { Request } from 'express';
import { LanguageCode } from './languages-config.interface';

export interface ILanguageRequest extends Request {
  userLanguage: LanguageCode;
}
