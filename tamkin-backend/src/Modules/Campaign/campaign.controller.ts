import { Body, Controller, Get, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { CreateCampaignDto } from './Dtos/create-campaign.dto';
import { CampaignService } from './campaign.service';
import { I18nService } from 'nestjs-i18n';
import { ResponseService } from 'src/Common/Services/Response/response.service';
import { TranslationService } from 'src/Common/Services/Translation/translation.service';

@Controller('campaign')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly responseService: ResponseService,
    private readonly translationService: TranslationService,
  ) {}
  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    const campaign = await this.campaignService.create(createCampaignDto);
    console.log(campaign);
    return this.responseService.success({
      statusCode: HttpStatus.CREATED,
      message: await this.translationService.translate('ar',
        'campaign:success.campaignCreatedSuccessfully',
      ),
      data: campaign,
    });
  }
  @Get(':slug')
  async getCampaign(@Param('slug') campaignSlug: string) {
    const campaign = await this.campaignService;
  }
}
