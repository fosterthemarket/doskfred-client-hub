import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { RegistrationFormData } from "@/types/registration";

interface Props {
  register: UseFormRegister<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
}

export function CompanyDataSection({ register, errors }: Props) {
  return (
    <div className="form-section animate-fade-in">
      <h2 className="form-section-title">
        <Building2 className="h-5 w-5 text-primary" />
        Datos de la Empresa
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_name">Razón Social *</Label>
          <Input
            id="company_name"
            {...register("company_name", { required: "Campo requerido" })}
            className={errors.company_name ? "border-destructive" : ""}
          />
          {errors.company_name && (
            <p className="text-sm text-destructive">{errors.company_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="commercial_name">Nombre Comercial</Label>
          <Input id="commercial_name" {...register("commercial_name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cif">CIF / NIF *</Label>
          <Input
            id="cif"
            {...register("cif", { required: "Campo requerido" })}
            className={errors.cif ? "border-destructive" : ""}
          />
          {errors.cif && (
            <p className="text-sm text-destructive">{errors.cif.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Sitio Web</Label>
          <Input id="website" type="url" {...register("website")} placeholder="https://" />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Dirección *</Label>
          <Input
            id="address"
            {...register("address", { required: "Campo requerido" })}
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Código Postal *</Label>
          <Input
            id="postal_code"
            {...register("postal_code", { required: "Campo requerido" })}
            className={errors.postal_code ? "border-destructive" : ""}
          />
          {errors.postal_code && (
            <p className="text-sm text-destructive">{errors.postal_code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Población *</Label>
          <Input
            id="city"
            {...register("city", { required: "Campo requerido" })}
            className={errors.city ? "border-destructive" : ""}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Provincia *</Label>
          <Input
            id="province"
            {...register("province", { required: "Campo requerido" })}
            className={errors.province ? "border-destructive" : ""}
          />
          {errors.province && (
            <p className="text-sm text-destructive">{errors.province.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País *</Label>
          <Input
            id="country"
            {...register("country")}
            defaultValue="España"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone", { required: "Campo requerido" })}
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">Móvil</Label>
          <Input id="mobile" type="tel" {...register("mobile")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email", { 
              required: "Campo requerido",
              pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }
            })}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
