import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendMail = async ({ to, subject, html, text }: MailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"Chat App" <${env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
  logger.info({ to, subject }, '📧 Email sent');
};
