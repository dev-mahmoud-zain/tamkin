import { Injectable, OnModuleInit } from '@nestjs/common';
import { ITranslationService } from '../../Interfaces/Language/translation.interface';
import * as fs from 'fs';
import * as fsPromise from 'fs/promises';
import * as path from 'path';
import { LanguageCode } from 'src/Common/Interfaces/Language/languages-config.interface';
import languagesConfig from '../../../Config/Language/language.json';

@Injectable()
export class JsonFileService implements ITranslationService, OnModuleInit {
  private readonly cache: Record<string, any> = {};
  private readonly baseDir = path.join(
    __dirname,
    '../../../../assets/translations',
  );

  getDefaultLanguageCode(): LanguageCode {
    const data = this.getRawLanguageData();
    return this.validateAndExtractDefault(data);
  }

  private getRawLanguageData(): typeof languagesConfig {
    const filePath = path.join(
      process.cwd(),
      'src/Config/Language/language.json',
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`Configuration file not found at: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as typeof languagesConfig;
  }
  private validateAndExtractDefault(
    data: typeof languagesConfig,
  ): LanguageCode {
    const defaultEntries = data.filter((item) => {
      const code = Object.keys(item)[0];
      const config = (item as any)[code];
      return config?.isDefault === true;
    });

    if (defaultEntries.length === 0) {
      throw new Error(
        'Invalid language.json: No language is marked as "isDefault": true.',
      );
    }

    if (defaultEntries.length > 1) {
      const foundCodes = defaultEntries.map((entry) => Object.keys(entry)[0]);
      throw new Error(
        `Invalid language.json: Multiple default languages found (${foundCodes.join(', ')}). Only one is allowed.`,
      );
    }

    return Object.keys(defaultEntries[0])[0] as LanguageCode;
  }

  onModuleInit() {
    console.log('--- Loading All Translations Into Memory ---');

    const languages = fs.readdirSync(this.baseDir);

    for (const lang of languages) {
      const langPath = path.join(this.baseDir, lang);

      if (!fs.statSync(langPath).isDirectory()) continue;

      this.cache[lang] = {};

      const modules = fs.readdirSync(langPath);

      for (const moduleFolder of modules) {
        const modulePath = path.join(langPath, moduleFolder);

        if (!fs.statSync(modulePath).isDirectory()) continue;

        this.cache[lang][moduleFolder] = {};

        const files = fs.readdirSync(modulePath);

        for (const file of files) {
          if (!file.endsWith('.json')) continue;

          const filePath = path.join(modulePath, file);
          const fileName = file.replace('.json', '');

          const fileContent = fs.readFileSync(filePath, 'utf8');
          this.cache[lang][moduleFolder][fileName] = JSON.parse(fileContent);
        }
      }
    }

    console.log('✓ All translations loaded successfully');
  }

  public get(lang: string, pathKey: string): string {
    try {
      if (!pathKey.includes(':')) return pathKey;

      const [moduleFolder, rest] = pathKey.split(':');

      if (!moduleFolder || !rest) return pathKey;

      const parts = rest.split('.');
      const fileName = parts.shift();

      if (!fileName || parts.length === 0) return pathKey;

      const translation = this.cache[lang]?.[moduleFolder]?.[fileName];

      if (!translation) return pathKey;

      const result = parts.reduce(
        (obj: any, key: string) =>
          obj && obj[key] !== undefined ? obj[key] : undefined,
        translation,
      );

      return typeof result === 'string' ? result : pathKey;
    } catch {
      return pathKey;
    }
  }
}
