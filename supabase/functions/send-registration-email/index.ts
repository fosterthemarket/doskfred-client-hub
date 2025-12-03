import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationData {
  company_name: string;
  commercial_name: string | null;
  cif: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  country: string;
  phone: string;
  mobile: string | null;
  email: string;
  website: string | null;
  contact_person: string;
  contact_position: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  delivery_same_as_main: boolean;
  delivery_address: string | null;
  delivery_postal_code: string | null;
  delivery_city: string | null;
  delivery_province: string | null;
  delivery_country: string | null;
  delivery_contact_person: string | null;
  delivery_phone: string | null;
  bank_name: string | null;
  iban: string | null;
  swift_bic: string | null;
  account_holder: string | null;
  gdpr_consent: boolean;
  notes: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: RegistrationData = await req.json();
    console.log("Received registration data for:", data.company_name);

    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error("Missing SMTP configuration");
      throw new Error("SMTP configuration missing");
    }

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: 587,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .section { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
          .section-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
          .field { margin: 8px 0; }
          .label { font-weight: 600; color: #64748b; }
          .value { color: #1e293b; }
          .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nueva Ficha de Cliente</h1>
            <p>DOSKFRED S.L.</p>
          </div>
          
          <div class="section">
            <div class="section-title">Datos de la Empresa</div>
            <div class="field"><span class="label">Razón Social:</span> <span class="value">${data.company_name}</span></div>
            <div class="field"><span class="label">Nombre Comercial:</span> <span class="value">${data.commercial_name || "-"}</span></div>
            <div class="field"><span class="label">CIF:</span> <span class="value">${data.cif}</span></div>
            <div class="field"><span class="label">Dirección:</span> <span class="value">${data.address}</span></div>
            <div class="field"><span class="label">C.P.:</span> <span class="value">${data.postal_code}</span></div>
            <div class="field"><span class="label">Población:</span> <span class="value">${data.city}</span></div>
            <div class="field"><span class="label">Provincia:</span> <span class="value">${data.province}</span></div>
            <div class="field"><span class="label">País:</span> <span class="value">${data.country}</span></div>
            <div class="field"><span class="label">Teléfono:</span> <span class="value">${data.phone}</span></div>
            <div class="field"><span class="label">Móvil:</span> <span class="value">${data.mobile || "-"}</span></div>
            <div class="field"><span class="label">Email:</span> <span class="value">${data.email}</span></div>
            <div class="field"><span class="label">Web:</span> <span class="value">${data.website || "-"}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Persona de Contacto</div>
            <div class="field"><span class="label">Nombre:</span> <span class="value">${data.contact_person}</span></div>
            <div class="field"><span class="label">Cargo:</span> <span class="value">${data.contact_position || "-"}</span></div>
            <div class="field"><span class="label">Email:</span> <span class="value">${data.contact_email || "-"}</span></div>
            <div class="field"><span class="label">Teléfono:</span> <span class="value">${data.contact_phone || "-"}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Dirección de Entrega</div>
            ${data.delivery_same_as_main ? 
              '<div class="field"><span class="value">Igual que dirección principal</span></div>' :
              `<div class="field"><span class="label">Dirección:</span> <span class="value">${data.delivery_address || "-"}</span></div>
              <div class="field"><span class="label">C.P.:</span> <span class="value">${data.delivery_postal_code || "-"}</span></div>
              <div class="field"><span class="label">Población:</span> <span class="value">${data.delivery_city || "-"}</span></div>
              <div class="field"><span class="label">Provincia:</span> <span class="value">${data.delivery_province || "-"}</span></div>
              <div class="field"><span class="label">País:</span> <span class="value">${data.delivery_country || "-"}</span></div>
              <div class="field"><span class="label">Persona de contacto:</span> <span class="value">${data.delivery_contact_person || "-"}</span></div>
              <div class="field"><span class="label">Teléfono:</span> <span class="value">${data.delivery_phone || "-"}</span></div>`
            }
          </div>

          <div class="section">
            <div class="section-title">Datos Bancarios</div>
            <div class="field"><span class="label">Banco:</span> <span class="value">${data.bank_name || "-"}</span></div>
            <div class="field"><span class="label">IBAN:</span> <span class="value">${data.iban || "-"}</span></div>
            <div class="field"><span class="label">SWIFT/BIC:</span> <span class="value">${data.swift_bic || "-"}</span></div>
            <div class="field"><span class="label">Titular:</span> <span class="value">${data.account_holder || "-"}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Consentimiento RGPD</div>
            <div class="field"><span class="label">Consentimiento:</span> <span class="value">${data.gdpr_consent ? "✅ Sí" : "❌ No"}</span></div>
          </div>

          ${data.notes ? `
          <div class="section">
            <div class="section-title">Observaciones</div>
            <div class="field"><span class="value">${data.notes}</span></div>
          </div>
          ` : ""}

          <div class="footer">
            <p>Este email ha sido generado automáticamente por el sistema de registro de clientes.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await client.send({
      from: smtpUser,
      to: "oficina@dosserveis.com",
      subject: `Nueva Ficha Cliente: ${data.company_name}`,
      content: "auto",
      html: emailHtml,
    });

    await client.close();
    console.log("Email sent successfully to oficina@dosserveis.com");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
