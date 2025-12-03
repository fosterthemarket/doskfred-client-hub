import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { RegistrationFormData } from "@/types/registration";

interface Props {
  register: UseFormRegister<RegistrationFormData>;
}

export function BankingSection({ register }: Props) {
  return (
    <div className="form-section animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <h2 className="form-section-title">
        <CreditCard className="h-5 w-5 text-primary" />
        Datos Bancarios
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bank_name">Nombre del Banco</Label>
          <Input id="bank_name" {...register("bank_name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_holder">Titular de la Cuenta</Label>
          <Input id="account_holder" {...register("account_holder")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="iban">IBAN</Label>
          <Input id="iban" {...register("iban")} placeholder="ES00 0000 0000 0000 0000 0000" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="swift_bic">SWIFT / BIC</Label>
          <Input id="swift_bic" {...register("swift_bic")} />
        </div>
      </div>
    </div>
  );
}
