import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { RegistrationFormData } from "@/types/registration";

interface Props {
  register: UseFormRegister<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
}

export function ContactSection({ register, errors }: Props) {
  return (
    <div className="form-section animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <h2 className="form-section-title">
        <User className="h-5 w-5 text-primary" />
        Persona de Contacto
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_person">Nombre *</Label>
          <Input
            id="contact_person"
            {...register("contact_person", { required: "Campo requerido" })}
            className={errors.contact_person ? "border-destructive" : ""}
          />
          {errors.contact_person && (
            <p className="text-sm text-destructive">{errors.contact_person.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_position">Cargo</Label>
          <Input id="contact_position" {...register("contact_position")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email">Email de Contacto</Label>
          <Input
            id="contact_email"
            type="email"
            {...register("contact_email", {
              pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }
            })}
            className={errors.contact_email ? "border-destructive" : ""}
          />
          {errors.contact_email && (
            <p className="text-sm text-destructive">{errors.contact_email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
          <Input id="contact_phone" type="tel" {...register("contact_phone")} />
        </div>
      </div>
    </div>
  );
}
