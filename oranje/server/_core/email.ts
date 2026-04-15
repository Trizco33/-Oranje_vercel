/**
 * Email service with support for Resend (prod) and console logging (dev)
 */

interface SendEmailParams {
  to: string;
  url: string;
}

export interface ClaimNotificationParams {
  placeId: number;
  placeName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  contactRole?: string | null;
  businessName?: string | null;
  instagram?: string | null;
  website?: string | null;
  message?: string | null;
  description?: string | null;
}

export async function sendClaimNotificationEmail(params: ClaimNotificationParams): Promise<boolean> {
  const adminEmail = "edipo.ramone@gmail.com";
  const resendApiKey = process.env.RESEND_API_KEY;
  const mailFrom = process.env.MAIL_FROM ?? "Oranje <onboarding@resend.dev>";

  const {
    placeId, placeName, contactName, contactEmail,
    contactPhone, contactRole, businessName, instagram, website, message, description,
  } = params;

  const adminLink = `https://oranjeapp.com.br/admin`;

  const htmlBody = `
    <div style="font-family: Montserrat, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f7f4; padding: 0; border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: #00251A; padding: 28px 32px;">
        <p style="color: #E65100; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 6px;">Oranje · Nova Solicitação</p>
        <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; line-height: 1.3;">Nova Reivindicação de Perfil</h1>
        <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 6px 0 0;">${placeName} · Lugar #${placeId}</p>
      </div>
      <!-- Body -->
      <div style="padding: 28px 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08); width: 35%;">
              <span style="font-size: 11px; font-weight: 700; color: rgba(0,37,26,0.4); text-transform: uppercase; letter-spacing: 0.06em;">Nome</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);">
              <span style="font-size: 13px; color: #00251A; font-weight: 600;">${contactName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);">
              <span style="font-size: 11px; font-weight: 700; color: rgba(0,37,26,0.4); text-transform: uppercase; letter-spacing: 0.06em;">E-mail</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);">
              <a href="mailto:${contactEmail}" style="font-size: 13px; color: #E65100; text-decoration: none;">${contactEmail}</a>
            </td>
          </tr>
          ${contactPhone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><span style="font-size: 11px; font-weight: 700; color: rgba(0,37,26,0.4); text-transform: uppercase; letter-spacing: 0.06em;">Telefone</span></td><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><span style="font-size: 13px; color: #00251A;">${contactPhone}</span></td></tr>` : ""}
          ${contactRole ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><span style="font-size: 11px; font-weight: 700; color: rgba(0,37,26,0.4); text-transform: uppercase; letter-spacing: 0.06em;">Cargo</span></td><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><span style="font-size: 13px; color: #00251A;">${contactRole}</span></td></tr>` : ""}
          ${businessName ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><span style="font-size: 11px; font-weight: 700; color: rgba(0,37,26,0.4); text-transform: uppercase; letter-spacing: 0.06em;">Negócio</span></td><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><span style="font-size: 13px; color: #00251A;">${businessName}</span></td></tr>` : ""}
          ${instagram ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><span style="font-size: 11px; font-weight: 700; color: rgba(0,37,26,0.4); text-transform: uppercase; letter-spacing: 0.06em;">Instagram</span></td><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><span style="font-size: 13px; color: #00251A;">${instagram}</span></td></tr>` : ""}
          ${website ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><span style="font-size: 11px; font-weight: 700; color: rgba(0,37,26,0.4); text-transform: uppercase; letter-spacing: 0.06em;">Site</span></td><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,37,26,0.08);"><a href="${website}" style="font-size: 13px; color: #E65100;">${website}</a></td></tr>` : ""}
        </table>
        ${description ? `<div style="margin-top: 20px; background: rgba(0,37,26,0.04); border-radius: 10px; padding: 14px 16px;"><p style="font-size: 11px; font-weight: 700; color: rgba(0,37,26,0.4); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px;">Descrição</p><p style="font-size: 13px; color: #00251A; line-height: 1.65; margin: 0;">${description}</p></div>` : ""}
        ${message ? `<div style="margin-top: 12px; background: rgba(230,81,0,0.05); border-radius: 10px; padding: 14px 16px; border-left: 3px solid rgba(230,81,0,0.3);"><p style="font-size: 11px; font-weight: 700; color: rgba(0,37,26,0.4); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px;">Mensagem livre</p><p style="font-size: 13px; color: #00251A; line-height: 1.65; margin: 0; font-style: italic;">"${message}"</p></div>` : ""}
        <div style="margin-top: 28px;">
          <a href="${adminLink}" style="display: inline-block; padding: 13px 28px; background: #E65100; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px; letter-spacing: 0.02em;">
            Ver no Painel Admin →
          </a>
        </div>
      </div>
      <!-- Footer -->
      <div style="padding: 16px 32px; border-top: 1px solid rgba(0,37,26,0.08);">
        <p style="font-size: 11px; color: rgba(0,37,26,0.35); margin: 0;">Oranje · oranjeapp.com.br · Esta é uma notificação automática do sistema de reivindicações.</p>
      </div>
    </div>
  `;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: mailFrom,
          to: adminEmail,
          subject: `🔔 Nova reivindicação: ${placeName} (${contactName})`,
          html: htmlBody,
        }),
      });
      if (!response.ok) {
        console.error("[Email] Claim notification error:", await response.text());
        return false;
      }
      console.log(`[Email] Claim notification sent to ${adminEmail} — ${placeName}`);
      return true;
    } catch (error) {
      console.error("[Email] Error sending claim notification:", error);
      return false;
    }
  }

  // DEV: print to console with all details
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              🔔 NOVA REIVINDICAÇÃO (DEV MODE)                  ║
╚════════════════════════════════════════════════════════════════╝
Lugar:    ${placeName} (id=${placeId})
Nome:     ${contactName}
E-mail:   ${contactEmail}
Telefone: ${contactPhone ?? "—"}
Cargo:    ${contactRole ?? "—"}
Negócio:  ${businessName ?? "—"}
Instagram:${instagram ?? "—"}
Site:     ${website ?? "—"}
Mensagem: ${message ?? "—"}
Admin:    ${adminLink}
[Configure RESEND_API_KEY + MAIL_FROM para receber por email em produção]
════════════════════════════════════════════════════════════════`);
  return true;
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
