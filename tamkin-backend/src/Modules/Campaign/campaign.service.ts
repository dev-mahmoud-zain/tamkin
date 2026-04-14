import { Injectable } from '@nestjs/common';
import { CreateCampaignDto } from './Dtos/create-campaign.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../../DataBase/Campaign/campaign.model';
import { ResponseService } from 'src/Common/Services/Response/response.service';
import { CampaignDto } from './Dtos/campaign.dto';
import { TranslationService } from 'src/Common/Services/Translation/translation.service';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    private readonly responseService: ResponseService,
    private readonly translationService: TranslationService,
  ) {}

  private async findByTitle(
    campaignTitle: CampaignDto['title'],
  ) {
    const campaign = await this.campaignRepository.findOne({
      where: { title: campaignTitle },
    });
    return campaign;
  }
  private async findBySlug(campaignSlug: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { slug: campaignSlug },
    });
    return campaign;
  }

  async create(createCampaignDto: CreateCampaignDto) {
    const isCampaignExist = await this.findByTitle(createCampaignDto.title);

    if (isCampaignExist)
      throw this.responseService.conflict({
        message: await this.translationService.translate(
          'ar',
          'campaign:error.campaignAlreadyExist',
        ),
      });

    return await this.campaignRepository.create(createCampaignDto);
  }
}
