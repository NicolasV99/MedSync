import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
  };
}

export async function sendResetEmail(to: string, resetUrl: string) {
  const config = getSmtpConfig();

  if (!config) {
    // In development we log the reset URL so the flow can still be tested.
    console.warn("SMTP is not configured. Password reset email was not sent.");
    console.info("Password reset URL:", resetUrl);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  try {
    await transporter.verify();
  } catch (error) {
    console.error("SMTP verification failed", error);
    throw new Error("SMTP credentials rejected by the mail server.");
  }

  try {
    await transporter.sendMail({
      from: config.from,
      to,
      subject: "MedSync password reset",
      text: `Use this link to reset your MedSync password: ${resetUrl}`,
      html: `
        <p>Use this link to reset your MedSync password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send reset email", error);
    throw new Error("Failed to send reset email.");
  }
}
