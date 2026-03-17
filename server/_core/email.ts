/**
 * Email service with support for Resend (prod) and console logging (dev)
 */

interface SendEmailParams {
  to: string;
  url: string;
}

export async function sendMagicLinkEmail({ to, url }: SendEmailParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const mailFrom = process.env.MAIL_FROM;

  // Mode: PROD - Use Resend
  if (resendApiKey && mailFrom) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: mailFrom,
          to,
          subject: "Seu link de acesso - ORANJE",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Bem-vindo à ORANJE</h2>
              <p>Clique no link abaixo para acessar sua conta:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #E8A537; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Acessar ORANJE
              </a>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Este link expira em 15 minutos.
              </p>
              <p style="color: #999; font-size: 11px;">
                Se você não solicitou este email, ignore-o.
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        console.error("[Email] Resend error:", await response.text());
        return false;
      }

      console.log(`[Email] Magic link sent to ${to}`);
      return true;
    } catch (error) {
      console.error("[Email] Error sending with Resend:", error);
      return false;
    }
  }

  // Mode: DEV - Console logging
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    MAGIC LINK (DEV MODE)                   ║
╚════════════════════════════════════════════════════════════╝
To: ${to}
URL: ${url}
Expires: 15 minutes
╔════════════════════════════════════════════════════════════╝
  `);

  return true;
}
