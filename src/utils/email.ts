import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.warn(
      "SMTP is not fully configured. Emails will be logged to the console instead of sent."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  return transporter;
};

interface ContactNotificationInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactNotification = async (input: ContactNotificationInput): Promise<void> => {
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.EMAIL_FROM || "no-reply@portfolio.local";
  const t = getTransporter();

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>New portfolio contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(input.message).replace(/\n/g, "<br/>")}</p>
    </div>
  `;

  if (!t || !to) {
    console.log("--- Contact notification (SMTP not configured) ---");
    console.log({ to, ...input });
    return;
  }

  await t.sendMail({
    from,
    to,
    replyTo: input.email,
    subject: `Portfolio contact: ${input.subject}`,
    html,
  });
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
