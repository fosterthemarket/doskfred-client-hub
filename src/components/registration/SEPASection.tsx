import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { FileSignature, CalendarDays, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { RegistrationFormData } from "@/types/registration";

interface Props {
  register: UseFormRegister<RegistrationFormData>;
  watch: UseFormWatch<RegistrationFormData>;
  setValue: UseFormSetValue<RegistrationFormData>;
}

export function SEPASection({ register, watch, setValue }: Props) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const paymentType = watch("sepa_payment_type");

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setValue("sepa_signature_date", today);
  }, [setValue]);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setValue("sepa_signature", "");
  };

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL("image/png");
      setValue("sepa_signature", dataUrl);
    }
  };

  return (
    <div className="form-section animate-fade-in" style={{ animationDelay: "0.35s" }}>
      <h2 className="form-section-title">
        <FileSignature className="h-5 w-5 text-primary" />
        Ordre de Domiciliació SEPA
      </h2>

      <div className="mb-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Dades del Creditor:</p>
        <p><strong>Nom:</strong> DOS SERVEIS (DOSKFRED)</p>
        <p><strong>Identificador Creditor:</strong> ES51000B17722059</p>
        <p><strong>Adreça:</strong> Ctra GI-522 Km. 3,9 (Nau 1-2), 17858 La Canya, GIRONA</p>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Mitjançant la signatura d'aquest formulari d'Ordre de Domiciliació, autoritzeu a DOS SERVEIS (DOSKFRED) 
        a enviar ordres a la vostra entitat financera per carregar al vostre compte els imports corresponents.
      </p>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="sepa_mandate_reference">Referència del Mandat</Label>
          <Input 
            id="sepa_mandate_reference" 
            {...register("sepa_mandate_reference")} 
            placeholder="Es generarà automàticament"
            className="bg-muted"
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            La referència del mandat es generarà automàticament quan s'enviï el formulari.
          </p>
        </div>

        <div className="space-y-3">
          <Label>Tipus de pagament *</Label>
          <RadioGroup
            value={paymentType || ""}
            onValueChange={(value) => setValue("sepa_payment_type", value as "periodic" | "single")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="periodic" id="periodic" />
              <Label htmlFor="periodic" className="font-normal cursor-pointer">
                Pagament periòdic
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="font-normal cursor-pointer">
                Pagament únic
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sepa_signature_date" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Data de signatura *
          </Label>
          <Input 
            id="sepa_signature_date" 
            type="date"
            {...register("sepa_signature_date")} 
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Signatura del deutor *
          </Label>
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-background p-2">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: "w-full h-40 bg-white rounded cursor-crosshair",
                style: { width: "100%", height: "160px" }
              }}
              onEnd={saveSignature}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
            >
              Esborrar signatura
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Signeu amb el ratolí o el dit (en dispositius tàctils) dins del requadre.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <p className="font-medium">⚠️ Important:</p>
        <p>
          Tots els camps han de ser complimentats obligatòriament. 
          Un cop signada aquesta ordre de domiciliació serà enviada al creditor per a la seva custòdia.
        </p>
      </div>
    </div>
  );
}
