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
  sepa_mandate_reference: string | null;
  sepa_payment_type: string | null;
  sepa_signature: string | null;
  sepa_signature_date: string | null;
  gdpr_consent: boolean;
  notes: string | null;
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "-";
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

function formatPaymentType(type: string | null): string {
  if (type === "periodic") return "Pago periódico";
  if (type === "single") return "Pago único";
  return "-";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("cf-connecting-ip") || 
                   "unknown";
  
  if (!checkRateLimit(clientIp)) {
    console.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const data: RegistrationData = await req.json();
    console.log("Received registration data for:", escapeHtml(data.company_name));

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
        port: 465,
        tls: true,
        auth: { username: smtpUser, password: smtpPass },
      },
    });

    const safe = {
      company_name: escapeHtml(data.company_name),
      commercial_name: escapeHtml(data.commercial_name),
      cif: escapeHtml(data.cif),
      address: escapeHtml(data.address),
      postal_code: escapeHtml(data.postal_code),
      city: escapeHtml(data.city),
      province: escapeHtml(data.province),
      country: escapeHtml(data.country),
      phone: escapeHtml(data.phone),
      mobile: escapeHtml(data.mobile),
      email: escapeHtml(data.email),
      website: escapeHtml(data.website),
      contact_person: escapeHtml(data.contact_person),
      contact_position: escapeHtml(data.contact_position),
      contact_email: escapeHtml(data.contact_email),
      contact_phone: escapeHtml(data.contact_phone),
      delivery_address: escapeHtml(data.delivery_address),
      delivery_postal_code: escapeHtml(data.delivery_postal_code),
      delivery_city: escapeHtml(data.delivery_city),
      delivery_province: escapeHtml(data.delivery_province),
      delivery_country: escapeHtml(data.delivery_country),
      delivery_contact_person: escapeHtml(data.delivery_contact_person),
      delivery_phone: escapeHtml(data.delivery_phone),
      bank_name: escapeHtml(data.bank_name),
      iban: escapeHtml(data.iban),
      swift_bic: escapeHtml(data.swift_bic),
      account_holder: escapeHtml(data.account_holder),
      sepa_mandate_reference: escapeHtml(data.sepa_mandate_reference),
      sepa_payment_type: formatPaymentType(data.sepa_payment_type),
      sepa_signature_date: escapeHtml(data.sepa_signature_date),
      notes: escapeHtml(data.notes),
    };

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
          .sepa-box { border: 2px solid #1e40af; padding: 20px; margin: 20px 0; }
          .signature-box { border: 1px solid #ccc; padding: 10px; background: white; text-align: center; margin-top: 10px; }
          .signature-img { max-width: 300px; max-height: 100px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nueva Ficha de Cliente + Orden SEPA</h1>
            <p>DOSKFRED S.L.</p>
          </div>
          
          <div class="section">
            <div class="section-title">Datos de la Empresa</div>
            <div class="field"><span class="label">Razón Social:</span> <span class="value">${safe.company_name}</span></div>
            <div class="field"><span class="label">Nombre Comercial:</span> <span class="value">${safe.commercial_name}</span></div>
            <div class="field"><span class="label">CIF:</span> <span class="value">${safe.cif}</span></div>
            <div class="field"><span class="label">Dirección:</span> <span class="value">${safe.address}</span></div>
            <div class="field"><span class="label">C.P.:</span> <span class="value">${safe.postal_code}</span></div>
            <div class="field"><span class="label">Población:</span> <span class="value">${safe.city}</span></div>
            <div class="field"><span class="label">Provincia:</span> <span class="value">${safe.province}</span></div>
            <div class="field"><span class="label">País:</span> <span class="value">${safe.country}</span></div>
            <div class="field"><span class="label">Teléfono:</span> <span class="value">${safe.phone}</span></div>
            <div class="field"><span class="label">Móvil:</span> <span class="value">${safe.mobile}</span></div>
            <div class="field"><span class="label">Email:</span> <span class="value">${safe.email}</span></div>
            <div class="field"><span class="label">Web:</span> <span class="value">${safe.website}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Persona de Contacto</div>
            <div class="field"><span class="label">Nombre:</span> <span class="value">${safe.contact_person}</span></div>
            <div class="field"><span class="label">Cargo:</span> <span class="value">${safe.contact_position}</span></div>
            <div class="field"><span class="label">Email:</span> <span class="value">${safe.contact_email}</span></div>
            <div class="field"><span class="label">Teléfono:</span> <span class="value">${safe.contact_phone}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Dirección de Entrega</div>
            ${data.delivery_same_as_main ? 
              '<div class="field"><span class="value">Igual que dirección principal</span></div>' :
              `<div class="field"><span class="label">Dirección:</span> <span class="value">${safe.delivery_address}</span></div>
              <div class="field"><span class="label">C.P.:</span> <span class="value">${safe.delivery_postal_code}</span></div>
              <div class="field"><span class="label">Población:</span> <span class="value">${safe.delivery_city}</span></div>
              <div class="field"><span class="label">Provincia:</span> <span class="value">${safe.delivery_province}</span></div>
              <div class="field"><span class="label">País:</span> <span class="value">${safe.delivery_country}</span></div>
              <div class="field"><span class="label">Persona de contacto:</span> <span class="value">${safe.delivery_contact_person}</span></div>
              <div class="field"><span class="label">Teléfono:</span> <span class="value">${safe.delivery_phone}</span></div>`
            }
          </div>

          <div class="sepa-box">
            <h2 style="text-align: center; color: #1e40af; margin-top: 0;">ORDEN DE DOMICILIACIÓN SEPA CORE</h2>
            
            <div class="section" style="background: #e0e7ff;">
              <div class="section-title">Datos del Acreedor</div>
              <div class="field"><span class="label">Nombre:</span> <span class="value">DOS SERVEIS (DOSKFRED)</span></div>
              <div class="field"><span class="label">Identificador Acreedor:</span> <span class="value">ES51000B17722059</span></div>
              <div class="field"><span class="label">Dirección:</span> <span class="value">Ctra GI-522 Km. 3,9 (Nau 1-2), 17858 La Canya, GIRONA</span></div>
            </div>

            <div class="section">
              <div class="section-title">Datos del Deudor</div>
              <div class="field"><span class="label">Nombre del Deudor:</span> <span class="value">${safe.company_name}</span></div>
              <div class="field"><span class="label">CIF/NIF:</span> <span class="value">${safe.cif}</span></div>
              <div class="field"><span class="label">Dirección:</span> <span class="value">${safe.address}, ${safe.postal_code} ${safe.city}, ${safe.province}</span></div>
              <div class="field"><span class="label">IBAN:</span> <span class="value">${safe.iban}</span></div>
              <div class="field"><span class="label">SWIFT/BIC:</span> <span class="value">${safe.swift_bic}</span></div>
              <div class="field"><span class="label">Nombre del Banco:</span> <span class="value">${safe.bank_name}</span></div>
              <div class="field"><span class="label">Titular de la Cuenta:</span> <span class="value">${safe.account_holder}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Datos del Mandato</div>
              <div class="field"><span class="label">Referencia del Mandato:</span> <span class="value">${safe.sepa_mandate_reference}</span></div>
              <div class="field"><span class="label">Tipo de Pago:</span> <span class="value">${safe.sepa_payment_type}</span></div>
              <div class="field"><span class="label">Fecha:</span> <span class="value">${safe.sepa_signature_date}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Firma del Deudor</div>
              <div class="signature-box">
                ${data.sepa_signature ? `<img src="${data.sepa_signature}" alt="Firma" class="signature-img" />` : '<p>No se ha proporcionado firma</p>'}
              </div>
            </div>

            <p style="font-size: 11px; color: #666; margin-top: 15px;">
              Mediante la firma de este formulario de Orden de Domiciliación, el deudor autoriza a DOS SERVEIS (DOSKFRED) 
              a enviar órdenes a su entidad financiera para cargar en su cuenta los importes correspondientes.
            </p>
          </div>

          <div class="section">
            <div class="section-title">Consentimiento RGPD</div>
            <div class="field"><span class="label">Consentimiento:</span> <span class="value">${data.gdpr_consent ? "✅ Sí" : "❌ No"}</span></div>
          </div>

          ${data.notes ? `
          <div class="section">
            <div class="section-title">Observaciones</div>
            <div class="field"><span class="value">${safe.notes}</span></div>
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
      to: "info@dosserveis.com",
      subject: `Nueva Ficha Cliente + SEPA: ${safe.company_name}`,
      content: "auto",
      html: emailHtml,
    });

    await client.close();
    console.log("Email sent successfully to info@dosserveis.com");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
