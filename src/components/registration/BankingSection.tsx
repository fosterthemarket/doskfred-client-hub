import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { RegistrationFormData } from "@/types/registration";
import { useState } from "react";

interface Props {
  register: UseFormRegister<RegistrationFormData>;
  errors?: FieldErrors<RegistrationFormData>;
}

// Validate Spanish IBAN format and checksum
function validateSpanishIBAN(iban: string): { valid: boolean; error?: string } {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, "").toUpperCase();
  
  // Check basic format: ES + 22 characters = 24 total
  if (cleanIban.length === 0) {
    return { valid: false, error: "El IBAN es obligatorio" };
  }
  
  if (!cleanIban.startsWith("ES")) {
    return { valid: false, error: "El IBAN debe empezar por ES (España)" };
  }
  
  if (cleanIban.length !== 24) {
    return { valid: false, error: `El IBAN español debe tener 24 caracteres (tiene ${cleanIban.length})` };
  }
  
  // Check that after ES there are only digits
  const afterCountry = cleanIban.substring(2);
  if (!/^\d{22}$/.test(afterCountry)) {
    return { valid: false, error: "El IBAN debe contener solo números después de ES" };
  }
  
  // Validate IBAN checksum using ISO 7064 Mod 97-10
  // Move first 4 chars to end, convert letters to numbers (A=10, B=11, etc.)
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
  const numericIban = rearranged.replace(/[A-Z]/g, (char) => 
    (char.charCodeAt(0) - 55).toString()
  );
  
  // Calculate mod 97 (handle big numbers by processing in chunks)
  let remainder = 0;
  for (let i = 0; i < numericIban.length; i++) {
    remainder = (remainder * 10 + parseInt(numericIban[i], 10)) % 97;
  }
  
  if (remainder !== 1) {
    return { valid: false, error: "El IBAN no es válido (dígitos de control incorrectos)" };
  }
  
  return { valid: true };
}

// Format IBAN with spaces for readability
function formatIBAN(value: string): string {
  const clean = value.replace(/\s/g, "").toUpperCase();
  const groups = clean.match(/.{1,4}/g);
  return groups ? groups.join(" ") : clean;
}

export function BankingSection({ register, errors }: Props) {
  const [ibanError, setIbanError] = useState<string | null>(null);
  const [ibanValue, setIbanValue] = useState("");

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIBAN(e.target.value);
    setIbanValue(formatted);
    
    // Only validate if user has entered something
    if (formatted.replace(/\s/g, "").length > 0) {
      const validation = validateSpanishIBAN(formatted);
      setIbanError(validation.valid ? null : validation.error || null);
    } else {
      setIbanError(null);
    }
  };

  const handleIbanBlur = () => {
    if (ibanValue.replace(/\s/g, "").length > 0) {
      const validation = validateSpanishIBAN(ibanValue);
      setIbanError(validation.valid ? null : validation.error || null);
    }
  };

  return (
    <div className="form-section animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <h2 className="form-section-title">
        <CreditCard className="h-5 w-5 text-primary" />
        Datos Bancarios del Deudor
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bank_name">Nombre del Banco</Label>
          <Input 
            id="bank_name" 
            {...register("bank_name")} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_holder">Titular de la Cuenta</Label>
          <Input 
            id="account_holder" 
            {...register("account_holder")} 
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="iban">IBAN</Label>
          <Input 
            id="iban" 
            {...register("iban", { 
              validate: (value) => {
                if (!value || value.replace(/\s/g, "").length === 0) return true;
                const validation = validateSpanishIBAN(value);
                return validation.valid || validation.error;
              }
            })} 
            value={ibanValue}
            onChange={(e) => {
              handleIbanChange(e);
              register("iban").onChange(e);
            }}
            onBlur={handleIbanBlur}
            placeholder="ES00 0000 0000 0000 0000 0000" 
            className={errors?.iban || ibanError ? "border-destructive" : ibanValue && !ibanError ? "border-green-500" : ""}
            maxLength={29} // 24 chars + 5 spaces
          />
          {ibanError && (
            <p className="text-sm text-destructive">{ibanError}</p>
          )}
          {ibanValue && !ibanError && ibanValue.replace(/\s/g, "").length === 24 && (
            <p className="text-sm text-green-600">✓ IBAN válido</p>
          )}
          <p className="text-xs text-muted-foreground">
            Formato: ES + 22 dígitos (ej: ES91 2100 0418 4502 0005 1332)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="swift_bic">SWIFT / BIC (8-11 posiciones)</Label>
          <Input 
            id="swift_bic" 
            {...register("swift_bic", { 
              pattern: {
                value: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i,
                message: "Formato SWIFT/BIC inválido"
              }
            })} 
            className={errors?.swift_bic ? "border-destructive" : ""}
            placeholder="XXXXESXX o XXXXESXXXXX"
            maxLength={11}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              register("swift_bic").onChange(e);
            }}
          />
          {errors?.swift_bic && (
            <p className="text-sm text-destructive">
              {typeof errors.swift_bic.message === 'string' ? errors.swift_bic.message : 'Formato SWIFT/BIC inválido'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
