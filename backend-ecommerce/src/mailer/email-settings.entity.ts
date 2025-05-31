import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('email_settings')
export class EmailSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider: 'office365' | 'brevo';

  // Office 365
  @Column({ nullable: true })
  officeClientId: string;
  @Column({ nullable: true })
  officeClientSecret: string;
  @Column({ nullable: true })
  officeTenantId: string;
  @Column({ nullable: true })
  officeSender: string;

  // Brevo
  @Column({ nullable: true })
  brevoApiKey: string;
  @Column({ nullable: true })
  brevoSender: string;
} 