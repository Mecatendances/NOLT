import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSettings } from './email-settings.entity';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    @InjectRepository(EmailSettings)
    private readonly emailSettingsRepository: Repository<EmailSettings>,
  ) {}

  async getSettings(): Promise<EmailSettings> {
    // On suppose qu'il n'y a qu'une seule config active (sinon, adapter)
    const settings = await this.emailSettingsRepository.findOne({});
    if (!settings) throw new Error('Configuration email non trouvée');
    return settings;
  }

  async getMicrosoftAccessToken(settings: EmailSettings): Promise<string> {
    const url = `https://login.microsoftonline.com/${settings.officeTenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', settings.officeClientId!);
    params.append('scope', 'https://outlook.office365.com/.default');
    params.append('client_secret', settings.officeClientSecret!);
    params.append('grant_type', 'client_credentials');
    const response = await axios.post(url, params);
    return (response.data as any).access_token;
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const settings = await this.getSettings();
    if (settings.provider === 'office365') {
      const accessToken = await this.getMicrosoftAccessToken(settings);
      const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
          type: 'OAuth2',
          user: settings.officeSender,
          accessToken,
          clientId: settings.officeClientId,
          clientSecret: settings.officeClientSecret,
        },
        tls: { ciphers: 'SSLv3' },
      });
      await transporter.sendMail({
        from: settings.officeSender,
        to,
        subject: 'Réinitialisation de votre mot de passe',
        html: `<p>Bonjour,</p><p>Vous avez été invité sur la plateforme NOLT. Pour définir votre mot de passe, cliquez sur le lien ci-dessous :</p><p><a href="${resetLink}">${resetLink}</a></p><p>Ce lien expirera dans 1 heure.</p>`
      });
      this.logger.log(`Email de réinitialisation envoyé à ${to} via Office 365`);
    } else if (settings.provider === 'brevo') {
      // Envoi via Brevo (Sendinblue)
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { email: settings.brevoSender },
        to: [{ email: to }],
        subject: 'Réinitialisation de votre mot de passe',
        htmlContent: `<p>Bonjour,</p><p>Vous avez été invité sur la plateforme NOLT. Pour définir votre mot de passe, cliquez sur le lien ci-dessous :</p><p><a href="${resetLink}">${resetLink}</a></p><p>Ce lien expirera dans 1 heure.</p>`
      }, {
        headers: {
          'api-key': settings.brevoApiKey,
          'Content-Type': 'application/json',
        }
      });
      this.logger.log(`Email de réinitialisation envoyé à ${to} via Brevo`);
    } else {
      throw new Error('Provider email non supporté');
    }
  }
} 