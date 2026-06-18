export interface SendEmailArgs {
  /** email of the recipient */
  to: string;
  /** subject of the mail */
  subject: string;
  /** attachments to the email such as image, pdf and video files if any */
  attachments?: any[];
  /** Function that would be used to generate the html template.
   * Allows you to use any template rendering engine
   * @example
   * import * as Mustache from 'mustache';
   * import * as fs from 'fs';
   * import * as path from 'path';
   *
   * export class CommunicationService {
   *            constructor(private readonly emailService: EmailService) {}
   *
   *            public async sendEmail(templatePath: string, data: { [name]: string }) {
   *
   *               await this.emailService.send({
   *                        htmlGenFn() {
   *                            const template = fs.readFileSync(templatePath, 'utf-8');
   *
   *                            const body = Mustache.render(templateString, payload.body.data);
   *
   *                            return body;
   *                            }
   *                        })
   *        }
   *    }
   */
  htmlTemplateGenerateFn: () => string;
}

export interface SendOtpContext {
  name: string;
  otp: string;
}

export interface SendTokenContext {
  name: string;
  token: string;
}

export interface TransactionReceiptContext {
  name: string;
  account: string,
  availableBalance: any,
  date: string;
  amount: number;
  type: string;
  reference: string;
}


export interface BulkPaymentNotificationContext {
  name: string;
  transferCount: number;
  date: string;
  amount: string;
  initiatedBy: string;
}

export interface ElectrictyReceiptContext {
  name: string;
  transactionId: string;
  date: string;
  amount: number;
  type: string;
  reference: string;
  tokenCode: string;
  amountOfPower: string;
  customerName: string;
  customerAddress: string;
}

export interface BankStatementContext {
  name: string;
  startDate: string;
  endDate: string;
}

export interface IEmailService {
  send: (args: SendEmailArgs) => Promise<void>;
}

export interface CustomEmailContext {
  subject: string;
  content: string;
  full_name : string;
  title: string;
}
