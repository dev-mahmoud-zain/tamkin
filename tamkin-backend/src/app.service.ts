import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ResponseService } from './Common/Services/Response/response.service';

@Injectable()
export class AppService {

  constructor(private readonly responseService: ResponseService) { }
  main(req: Request) {

    return this.responseService.success({
      message: req.t("main:message"),
      data: req.t('main:data', { returnObjects: true })
    });

  }
}