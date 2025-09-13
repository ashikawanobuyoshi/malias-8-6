// server/api/send-email.post.ts
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465, // 465ならtrue、587ならfalse
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  })

  await transporter.sendMail({
    from: config.smtpUser,
    to: body.to,
    subject: body.subject,
    html: body.html
  })

  return { success: true }
})

