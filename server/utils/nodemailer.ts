import nodemailer, { Transporter } from "nodemailer";

export function createTransporter(): Transporter {
  const port = Number(process.env.ONAMAE_SMTP_PORT) || 465;
  const secure = port === 465; // 465ならSSLを使う

  return nodemailer.createTransport({
    host: process.env.ONAMAE_SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.ONAMAE_SMTP_USER,
      pass: process.env.ONAMAE_SMTP_PASS,
    },
    tls: {
      // 本番環境ではtrueにして自己署名証明書警告を無視
      rejectUnauthorized: process.env.NODE_ENV === 'production' ? false : true,
    },
  });
}

