import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { Campaign } from 'src/DataBase/Campaign/campaign.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/Common/Services/Response/response.service';
import { TranslationService } from 'src/Common/Services/Translation/translation.service';
import { JsonFileService } from 'src/Common/Services/Json/json-file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign])],
  controllers: [CampaignController],
  providers: [CampaignService, ResponseService, TranslationService, JsonFileService],
})
export class CampaignModule {}
