// composables/useSendEmail.ts
export function useSendEmail() {
  const sendEmail = async ({ to, subject, html, attachments }: {
    to: string,
    subject: string,
    html: string,
    attachments?: any[]
  }) => {
    return await $fetch("/api/send-email", {
      method: "POST",
      body: { to, subject, html, attachments },
    });
  };

  return { sendEmail };
}
