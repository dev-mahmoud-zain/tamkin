import { CampaignStatusEnum } from '../../Modules/Campaign/Enums/campaign-status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CampaignDto } from 'src/Modules/Campaign/Dtos/campaign.dto';

@Entity('Campaigns')
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb', unique: true })
  title: CampaignDto['title'];

  @Column({ type: 'jsonb' })
  description: CampaignDto['description'];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  target_amount: number;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: CampaignStatusEnum,
    default: CampaignStatusEnum.DRAFT,
  })
  status: CampaignDto['status'];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
