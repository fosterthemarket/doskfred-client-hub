import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { FileSignature, CalendarDays } from "lucide-react";
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
        Orden de Domiciliación SEPA
      </h2>

      <div className="mb-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Datos del Acreedor:</p>
        <p><strong>Nombre:</strong> DOSKFRED, S.L. (DOS SERVEIS)</p>
        <p><strong>Identificador Acreedor:</strong> ES51000B17722059</p>
        <p><strong>Dirección:</strong> Ctra GI-522 Km. 3,9 (Nau 1-2), 17858 La Canya, GIRONA</p>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Mediante la firma de este formulario de Orden de Domiciliación, autoriza a DOSKFRED, S.L. (DOS SERVEIS) 
        a enviar órdenes a su entidad financiera para cargar en su cuenta los importes correspondientes.
      </p>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="sepa_mandate_reference">Referencia del Mandato</Label>
          <Input 
            id="sepa_mandate_reference" 
            {...register("sepa_mandate_reference")} 
            placeholder="Se generará automáticamente"
            className="bg-muted"
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            La referencia del mandato se generará automáticamente al enviar el formulario.
          </p>
        </div>

        <div className="space-y-3">
          <Label>Tipo de pago *</Label>
          <RadioGroup
            value={paymentType || ""}
            onValueChange={(value) => setValue("sepa_payment_type", value as "periodic" | "single")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="periodic" id="periodic" />
              <Label htmlFor="periodic" className="font-normal cursor-pointer">
                Pago periódico
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="font-normal cursor-pointer">
                Pago único
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sepa_signature_date" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Fecha de firma *
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
            Firma del deudor *
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
              Borrar firma
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Firme con el ratón o el dedo (en dispositivos táctiles) dentro del recuadro.
          </p>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Mitjançant la signatura d'aquest formulari d'Ordre de Domiciliació, autoritzeu a DOSKFRED SL (DOS SERVEIS) a enviar ordres a la vostra entitat financera per carregar al vostre compte i a la vostra entitat financera per carregar els imports corresponents al vostre compte d'acord amb les ordres de DOSKFRED, S.L. (DOS SERVEIS)
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <p className="font-medium">⚠️ Importante:</p>
        <p>
          Todos los campos deben ser cumplimentados obligatoriamente. 
          Una vez firmada esta orden de domiciliación será enviada al acreedor para su custodia.
        </p>
      </div>
    </div>
  );
}
