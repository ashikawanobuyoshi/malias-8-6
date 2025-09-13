import { defineEventHandler, readBody } from "h3";
import { createTransporter } from "../utils/nodemailer";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: process.env.ONAMAE_SMTP_USER,
      to: body.to || process.env.ONAMAE_SMTP_USER,
      subject: body.subject || "テストメール",
      text: body.message || "これはテストメールです。",
    });

    // デバッグ情報を返す
    return { success: true, messageId: info.messageId, info };
  } catch (error: any) {
    console.error("メール送信エラー:", error);
    return { success: false, error: error.message, stack: error.stack };
  }
});

