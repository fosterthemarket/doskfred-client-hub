import { CreditCard } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { RegistrationFormData, PaymentMethod } from "@/types/registration";

interface Props {
  watch: UseFormWatch<RegistrationFormData>;
  setValue: UseFormSetValue<RegistrationFormData>;
}

const paymentMethods = [
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "pagare", label: "Pagaré" },
  { value: "efectivo", label: "Efectivo" },
  { value: "domiciliacion", label: "Domiciliación bancaria" },
] as const;

export function PaymentMethodSection({ watch, setValue }: Props) {
  const paymentMethod = watch("payment_method");

  return (
    <div className="form-section animate-fade-in" style={{ animationDelay: "0.25s" }}>
      <h2 className="form-section-title">
        <CreditCard className="h-5 w-5 text-primary" />
        Forma de Pago
      </h2>
      
      <div className="space-y-2">
        <Label htmlFor="payment_method">Método de pago *</Label>
        <Select
          value={paymentMethod || ""}
          onValueChange={(value: PaymentMethod) => setValue("payment_method", value)}
        >
          <SelectTrigger id="payment_method" className="w-full sm:w-[300px]">
            <SelectValue placeholder="Seleccione forma de pago" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-md z-50">
            {paymentMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
