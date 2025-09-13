import nodemailer from "nodemailer"

export async function sendEmail({
  to,
  subject,
  html,
  attachments
}: {
  to: string | string[]
  subject: string
  html: string
  attachments?: any[]
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // 465ならtrue、587ならfalse
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
    attachments,
  })
}
