import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CampaignStatusEnum } from '../Enums/campaign-status.enum';
import { SUPPORTED_LANGUAGES } from 'src/Config/languages.config';

export class CampaignDto {
  @IsObject({ message: 'campaign:validation.title_required' })
  @ValidateNested()
  title: Record<(typeof SUPPORTED_LANGUAGES)[number], string>;

  @IsObject()
  @ValidateNested()
  description: Record<(typeof SUPPORTED_LANGUAGES)[number], string>;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  target_amount: number;

  @IsString()
  @IsOptional()
  image: string;

  @IsEnum(CampaignStatusEnum)
  @IsOptional()
  status: CampaignStatusEnum;
}
