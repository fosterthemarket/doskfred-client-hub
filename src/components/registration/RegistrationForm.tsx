import { useState } from "react";
import { useForm } from "react-hook-form";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyDataSection } from "./CompanyDataSection";
import { ContactSection } from "./ContactSection";
import { DeliverySection } from "./DeliverySection";
import { BankingSection } from "./BankingSection";
import { SEPASection } from "./SEPASection";
import { GDPRSection } from "./GDPRSection";
import { RegistrationFormData } from "@/types/registration";
import { Loader2, Send, CheckCircle, ShieldCheck } from "lucide-react";

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    defaultValues: {
      country: "España",
      delivery_same_as_main: true,
      gdpr_consent: false,
      sepa_payment_type: "",
      sepa_signature: "",
      sepa_signature_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    if (!data.gdpr_consent) {
      toast({
        title: "Error",
        description: "Debe aceptar el tratamiento de datos personales",
        variant: "destructive",
      });
      return;
    }

    if (!data.sepa_payment_type) {
      toast({
        title: "Error",
        description: "Debe seleccionar el tipo de pago SEPA",
        variant: "destructive",
      });
      return;
    }

    if (!data.sepa_signature) {
      toast({
        title: "Error",
        description: "Debe firmar la orden de domiciliación SEPA",
        variant: "destructive",
      });
      return;
    }

    if (!data.bank_name || !data.iban || !data.swift_bic || !data.account_holder) {
      toast({
        title: "Error",
        description: "Debe completar todos los datos bancarios",
        variant: "destructive",
      });
      return;
    }

    // Get reCAPTCHA token
    if (!executeRecaptcha) {
      toast({
        title: "Error",
        description: "Error al verificar reCAPTCHA. Por favor, recargue la página.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA verification
      const recaptchaToken = await executeRecaptcha("submit_registration");

      // Generate mandate reference
      const mandateRef = `SEPA-${Date.now().toString(36).toUpperCase()}`;
      data.sepa_mandate_reference = mandateRef;

      // Save to database
      const { error: dbError } = await supabase
        .from("client_registrations")
        .insert({
          company_name: data.company_name,
          commercial_name: data.commercial_name || null,
          cif: data.cif,
          address: data.address,
          postal_code: data.postal_code,
          city: data.city,
          province: data.province,
          country: data.country,
          phone: data.phone,
          mobile: data.mobile || null,
          email: data.email,
          website: data.website || null,
          contact_person: data.contact_person,
          contact_position: data.contact_position || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          delivery_same_as_main: data.delivery_same_as_main,
          delivery_address: data.delivery_address || null,
          delivery_postal_code: data.delivery_postal_code || null,
          delivery_city: data.delivery_city || null,
          delivery_province: data.delivery_province || null,
          delivery_country: data.delivery_country || null,
          delivery_contact_person: data.delivery_contact_person || null,
          delivery_phone: data.delivery_phone || null,
          bank_name: data.bank_name || null,
          iban: data.iban || null,
          swift_bic: data.swift_bic || null,
          account_holder: data.account_holder || null,
          gdpr_consent: data.gdpr_consent,
          gdpr_consent_date: new Date().toISOString(),
          notes: data.notes || null,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Error al guardar los datos");
      }

      // Send email with reCAPTCHA token for verification
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke(
        "send-registration-email",
        { body: { ...data, recaptchaToken } }
      );

      if (emailError) {
        console.error("Email error:", emailError);
        toast({
          title: "Registro guardado",
          description: "Los datos se guardaron correctamente, pero hubo un problema al enviar la notificación por email.",
          variant: "default",
        });
      } else if (emailResponse?.error === "recaptcha_failed") {
        toast({
          title: "Error de verificación",
          description: "No se pudo verificar que no es un robot. Por favor, intente de nuevo.",
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      reset();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al enviar el formulario",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <CheckCircle className="h-16 w-16 text-success" />
        <h2 className="text-2xl font-semibold text-foreground">¡Registro Completado!</h2>
        <p className="text-muted-foreground">
          Su ficha de cliente y la orden de domiciliación SEPA han sido enviadas correctamente.
          <br />
          Nos pondremos en contacto con usted pronto.
        </p>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Enviar otro registro
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <CompanyDataSection register={register} errors={errors} />
      <ContactSection register={register} errors={errors} />
      <DeliverySection register={register} watch={watch} setValue={setValue} />
      <BankingSection register={register} errors={errors} />
      <SEPASection register={register} watch={watch} setValue={setValue} />
      <GDPRSection register={register} watch={watch} setValue={setValue} errors={errors} />

      <div className="flex flex-col items-end gap-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar Registro
            </>
          )}
        </Button>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3 w-3" />
          Protegido por reCAPTCHA
        </p>
      </div>
    </form>
  );
}
