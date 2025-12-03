import { Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { RegistrationFormData } from "@/types/registration";

interface Props {
  register: UseFormRegister<RegistrationFormData>;
  watch: UseFormWatch<RegistrationFormData>;
  setValue: UseFormSetValue<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
}

export function GDPRSection({ register, watch, setValue, errors }: Props) {
  const gdprConsent = watch("gdpr_consent");

  return (
    <div className="form-section animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <h2 className="form-section-title">
        <Shield className="h-5 w-5 text-primary" />
        Protección de Datos (RGPD)
      </h2>
      
      <div className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="mb-2">
            De conformidad con lo establecido en el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, 
            de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento 
            de datos personales y a la libre circulación de estos datos, le informamos que sus datos serán tratados 
            por DOSKFRED S.L. con la finalidad de gestionar la relación comercial.
          </p>
          <p>
            Sus datos no serán cedidos a terceros salvo obligación legal. Puede ejercer sus derechos de acceso, 
            rectificación, supresión, portabilidad, limitación y oposición enviando un correo electrónico a 
            oficina@dosserveis.com
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="gdpr_consent"
            checked={gdprConsent}
            onCheckedChange={(checked) => setValue("gdpr_consent", checked)}
          />
          <Label htmlFor="gdpr_consent" className="cursor-pointer">
            Acepto el tratamiento de mis datos personales *
          </Label>
        </div>
        {errors.gdpr_consent && (
          <p className="text-sm text-destructive">{errors.gdpr_consent.message}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Observaciones</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Añada cualquier información adicional relevante..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
