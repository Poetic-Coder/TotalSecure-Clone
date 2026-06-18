import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from 'nestjs-mailgun';
import { MailgunMessageData } from 'nestjs-mailgun';
import { MailerService } from '@nestjs-modules/mailer';
import {
  SendEmailArgs,
  SendOtpContext,
  IEmailService,
  TransactionReceiptContext,
  BankStatementContext,
  ElectrictyReceiptContext,
  CustomEmailContext,
  BulkPaymentNotificationContext,
  SendTokenContext,
} from './email.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as hbs from 'hbs';

@Injectable()
export class MailGunService implements IEmailService {
  constructor(
    private readonly mailService: MailgunService,
    private readonly configService: ConfigService,
   
  ) {}

  public async send(args: SendEmailArgs) {
    const from = `"${this.configService.get<string>(
      'APP_NAME',
    )}" <${this.configService.get<string>('MAILGUN_FROM')}>`;
    const domain = this.configService.get<string>('MAILGUN_DOMAIN');
    const data: MailgunMessageData = {
      from,
      to: args.to,
      subject: args.subject,
      attachment: args.attachments,
      html: args.htmlTemplateGenerateFn(),
    };
    await this.mailService.createEmail(domain, data);
  }
}

@Injectable()
export class NodeMailerService implements IEmailService {
  constructor(private readonly nodeMailer: MailerService) {}

  public async send(args: SendEmailArgs) {
    await this.nodeMailer.sendMail({
      to: args.to,
      subject: args.subject,
      html: args.htmlTemplateGenerateFn(),
      attachments: args.attachments,
    });
  }
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(
    private readonly mailService: MailGunService,
    private readonly nodeMailer: NodeMailerService,
    private readonly configService: ConfigService,
    
  ) {}

  private get emailService(): IEmailService {
    const emailService = this.configService.get<string>('EMAIL_SERVICE');
    switch (emailService) {
      case 'mailgun':
        return this.mailService;
      case 'smtp':
        return this.nodeMailer;
      default:
        return this.mailService;
    }
  }

  private getEmailTemplate(templateName: string, context: any) {
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '..',
      'templates',
      `${templateName}.hbs`,
    );
    const template = fs.readFileSync(templatePath, 'utf-8');
    return hbs.handlebars.compile(template)(context);
  }

  public async sendOtp(email: string, context: SendOtpContext) {
    await this.emailService.send({
      to: email,
      subject: 'Verify your email',
      htmlTemplateGenerateFn: () => this.getEmailTemplate('otp', context),
    });
  }

  public async sentToken(email: string, context: SendTokenContext) {
    try {
      const a = await this.emailService.send({
        to: email,
        subject: 'Authorization Token',
        htmlTemplateGenerateFn: () => this.getEmailTemplate('token', context),
      });
    } catch (error) {
      this.logger.error(error)
    }
   
  }

  public async sendTransactionReceipt(
    email: string,
    context: TransactionReceiptContext,
  ) {
    await this.emailService.send({
      to: email,
      subject: 'Transaction Receipt',
      htmlTemplateGenerateFn: () =>
        this.getEmailTemplate('transaction-receipt', context),
    });
  }

  public async sendBulkPaymentApprovalNotfi(email: string, context: BulkPaymentNotificationContext) {
    try {
      await this.emailService.send({
        to: email,
        subject: "Bulk Payment Approval",
        htmlTemplateGenerateFn: () => this.getEmailTemplate("bulk-approval-notification", context)
      })
    } catch (error) {
      this.logger.error('bulkPaymentApprovalNotify', error, EmailService.name);
    }
    
  }

  public async sendElectricityReceipt(
    email: string,
    context: ElectrictyReceiptContext,
  ) {
    await this.emailService.send({
      to: email,
      subject: 'Transaction Receipt',
      htmlTemplateGenerateFn: () =>
        this.getEmailTemplate('electricity-receipt', context),
    });
  }

  public async sendBankStatement(
    email: string,
    context: BankStatementContext,
    attachments: any[],
  ) {
    await this.emailService.send({
      to: email,
      subject: 'Bank Statement',
      attachments,
      htmlTemplateGenerateFn: () =>
        this.getEmailTemplate('bank-statement', context),
    });
  }

  public async sendCustomEmail(
    email: string,
    context: CustomEmailContext,
    attachments: any[],
  ) {
    try {
      const t = await this.emailService.send({
        to: email,
        subject: context.subject,
        attachments,
        htmlTemplateGenerateFn: () =>
          this.getEmailTemplate('custom-email', context),
      });
      console.debug(t);
    } catch (error) {
      console.error("Email send failed:", error);
    }
  }

  public async sendBroadcastEmail(
    email: any,
    context: CustomEmailContext,
    attachments: any[],
  ) {
    try {
      const t = await this.emailService.send({
        to: email,
        subject: context.subject,
        attachments,
        htmlTemplateGenerateFn: () =>
          this.getEmailTemplate('custom-email', context),
      });
      console.debug(t);
    } catch (error) {
      console.error("Email send failed:", error);
    }
  }
  
  public async sendGroupBookingToSaudia(
    context: { booking: any; agent: any },
    attachmentPath: string,
  ) {
    try {
      const saudiaEmail = this.configService.get<string>('SAUDIA_GROUP_BOOKING_EMAIL');
      if (!saudiaEmail) {
        this.logger.error('SAUDIA_GROUP_BOOKING_EMAIL is not configured. Cannot send email.');
        return; 
      }
      
      const subject = `Group Booking Application - Ref: ${context.booking.groupRef}`;

      await this.emailService.send({
        to: saudiaEmail,
        subject: subject,
        attachments: [
          {
            filename: `Application_Letter_${context.booking.groupRef}.pdf`,
            path: attachmentPath, 
          },
        ],
        htmlTemplateGenerateFn: () =>
          this.getEmailTemplate('group-booking-saudia', context), 
      });

      this.logger.log(`Successfully sent group booking request ${context.booking.groupRef} to Saudia.`);

    } catch (error) {
      this.logger.error(`Failed to send group booking email for ${context.booking.groupRef}`, error);
      throw error;
    }
  }

}
