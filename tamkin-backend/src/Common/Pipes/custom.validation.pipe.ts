import { Injectable, ValidationError, Inject, Scope } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ResponseService } from '../Services/Response/response.service';
import { TranslationService } from '../Services/Translation/translation.service';
import { REQUEST } from '@nestjs/core';
import type { ILanguageRequest } from '../Interfaces/Language/language-request.interface';

@Injectable({ scope: Scope.REQUEST })
export class CustomValidationPipe extends ValidationPipe {
  constructor(
    @Inject(REQUEST) private readonly request: ILanguageRequest,
    private readonly translationService: TranslationService,
    private readonly responseService: ResponseService,
  ) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
    this.exceptionFactory = (errors) => this.transformErrors(errors);
  }

  private transformErrors(errors: ValidationError[]) {
    const userLanguage = this.request.userLanguage;

    const formattedErrors = errors.map((error) => {
      const constraints = Object.values(error.constraints || {});

      const translatedMessages = constraints.map((key) => {
        if (key.includes(':') && key.includes('.')) {
          return this.translationService.translate(key, userLanguage);
        }
        return key;
      });

      return {
        path: error.property,
        info: translatedMessages.join(', '),
      };
    });

    return this.responseService.badRequest({
      message: 'Validation failed',
      issues: formattedErrors,
    });
  }
}
