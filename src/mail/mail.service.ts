/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, InternalServerErrorException } from "@nestjs/common";
import ejs from "ejs";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import { envVars } from "../config/env.config";

export interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envVars.EMAIL_SENDER_SMTP_HOST,
      port: Number(envVars.EMAIL_SENDER_SMTP_PORT),
      secure: true,
      auth: {
        user: envVars.EMAIL_SENDER_SMTP_USER,
        pass: envVars.EMAIL_SENDER_SMTP_PASS,
      },
    });
  }

  async sendEmail({
    to,
    subject,
    templateName,
    templateData,
    attachments,
  }: SendEmailOptions): Promise<void> {
    try {
      // Find template path (checks both src/mail/templates and src/app/templates)
      let templatePath = path.resolve(process.cwd(), `src/mail/templates/${templateName}.ejs`);
      
      const html = await ejs.renderFile(templatePath, templateData);

      const info = await this.transporter.sendMail({
        from: envVars.EMAIL_SENDER_SMTP_FROM,
        to,
        subject,
        html,
        attachments: attachments?.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        })),
      });

      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`Email Sending Error for ${to}: ${error.message}`);
      throw new InternalServerErrorException("Failed to send email");
    }
  }
}
