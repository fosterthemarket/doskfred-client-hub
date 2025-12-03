import { Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { RegistrationFormData } from "@/types/registration";

interface Props {
  register: UseFormRegister<RegistrationFormData>;
  watch: UseFormWatch<RegistrationFormData>;
  setValue: UseFormSetValue<RegistrationFormData>;
}

export function DeliverySection({ register, watch, setValue }: Props) {
  const deliverySameAsMain = watch("delivery_same_as_main");

  return (
    <div className="form-section animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <h2 className="form-section-title">
        <Truck className="h-5 w-5 text-primary" />
        Dirección de Entrega
      </h2>
      
      <div className="mb-4 flex items-center gap-3">
        <Switch
          id="delivery_same_as_main"
          checked={deliverySameAsMain}
          onCheckedChange={(checked) => setValue("delivery_same_as_main", checked)}
        />
        <Label htmlFor="delivery_same_as_main" className="cursor-pointer">
          Igual que dirección principal
        </Label>
      </div>

      {!deliverySameAsMain && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="delivery_address">Dirección</Label>
            <Input id="delivery_address" {...register("delivery_address")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_postal_code">Código Postal</Label>
            <Input id="delivery_postal_code" {...register("delivery_postal_code")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_city">Población</Label>
            <Input id="delivery_city" {...register("delivery_city")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_province">Provincia</Label>
            <Input id="delivery_province" {...register("delivery_province")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_country">País</Label>
            <Input id="delivery_country" {...register("delivery_country")} defaultValue="España" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_contact_person">Persona de Contacto</Label>
            <Input id="delivery_contact_person" {...register("delivery_contact_person")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_phone">Teléfono</Label>
            <Input id="delivery_phone" type="tel" {...register("delivery_phone")} />
          </div>
        </div>
      )}
    </div>
  );
}
