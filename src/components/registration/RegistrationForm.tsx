import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyDataSection } from "./CompanyDataSection";
import { ContactSection } from "./ContactSection";
import { DeliverySection } from "./DeliverySection";
import { BankingSection } from "./BankingSection";
import { GDPRSection } from "./GDPRSection";
import { RegistrationFormData } from "@/types/registration";
import { Loader2, Send, CheckCircle } from "lucide-react";

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

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

    setIsSubmitting(true);

    try {
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

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke(
        "send-registration-email",
        { body: data }
      );

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't fail the submission if email fails
        toast({
          title: "Registro guardado",
          description: "Los datos se guardaron correctamente, pero hubo un problema al enviar la notificación por email.",
          variant: "default",
        });
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
          Su ficha de cliente ha sido enviada correctamente.
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
      <BankingSection register={register} />
      <GDPRSection register={register} watch={watch} setValue={setValue} errors={errors} />

      <div className="flex justify-end">
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
      </div>
    </form>
  );
}
