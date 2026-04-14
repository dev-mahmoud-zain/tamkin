import { Injectable } from "@nestjs/common";
import { JsonFileService } from "../Json/json-file.service";

@Injectable()
export class TranslationService {
  constructor(private provider: JsonFileService) {}

  public translate(key: string, userLanguage: string): string {
    return this.provider.get(userLanguage, key);
  }
}
