import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AES-256-GCM encryption utilities
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get("ENCRYPTION_KEY");
  if (!keyString) {
    throw new Error("ENCRYPTION_KEY not configured");
  }
  
  // Decode base64 key to raw bytes
  const keyBytes = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  
  // Import as AES-GCM key
  return await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  
  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encode plaintext to bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  
  // Combine IV + encrypted data and encode as base64
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv, 0);
  combined.set(encryptedBytes, iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(ciphertext: string): Promise<string> {
  const key = await getEncryptionKey();
  
  // Decode base64
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  
  // Extract IV (first 12 bytes) and encrypted data
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  // Decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedData
  );
  
  // Decode to string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

interface EncryptRequest {
  action: "encrypt" | "decrypt";
  iban?: string;
  swift_bic?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, iban, swift_bic }: EncryptRequest = await req.json();
    console.log(`Processing ${action} request`);

    if (action === "encrypt") {
      const result: { iban?: string; swift_bic?: string } = {};
      
      if (iban) {
        result.iban = await encrypt(iban);
        console.log("IBAN encrypted successfully");
      }
      
      if (swift_bic) {
        result.swift_bic = await encrypt(swift_bic);
        console.log("SWIFT/BIC encrypted successfully");
      }
      
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else if (action === "decrypt") {
      // For decrypt, verify the user is an admin
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } },
      });

      // Check if user is admin
      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
      if (adminError || !isAdmin) {
        console.warn("Unauthorized decrypt attempt");
        return new Response(
          JSON.stringify({ error: "Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const result: { iban?: string; swift_bic?: string } = {};
      
      if (iban) {
        try {
          result.iban = await decrypt(iban);
          console.log("IBAN decrypted successfully");
        } catch (e) {
          console.error("IBAN decryption failed:", e);
          result.iban = "[Error de desencriptación]";
        }
      }
      
      if (swift_bic) {
        try {
          result.swift_bic = await decrypt(swift_bic);
          console.log("SWIFT/BIC decrypted successfully");
        } catch (e) {
          console.error("SWIFT/BIC decryption failed:", e);
          result.swift_bic = "[Error de desencriptación]";
        }
      }
      
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'encrypt' or 'decrypt'" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Encryption service error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
