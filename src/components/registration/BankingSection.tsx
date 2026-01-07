import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { RegistrationFormData } from "@/types/registration";

interface Props {
  register: UseFormRegister<RegistrationFormData>;
  errors?: FieldErrors<RegistrationFormData>;
}

export function BankingSection({ register, errors }: Props) {
  return (
    <div className="form-section animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <h2 className="form-section-title">
        <CreditCard className="h-5 w-5 text-primary" />
        Dades Bancàries del Deutor
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bank_name">Nom del Banc *</Label>
          <Input 
            id="bank_name" 
            {...register("bank_name", { required: true })} 
            className={errors?.bank_name ? "border-destructive" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_holder">Titular del Compte *</Label>
          <Input 
            id="account_holder" 
            {...register("account_holder", { required: true })} 
            className={errors?.account_holder ? "border-destructive" : ""}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="iban">IBAN *</Label>
          <Input 
            id="iban" 
            {...register("iban", { required: true })} 
            placeholder="ES00 0000 0000 0000 0000 0000" 
            className={errors?.iban ? "border-destructive" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="swift_bic">SWIFT / BIC (8-11 posicions) *</Label>
          <Input 
            id="swift_bic" 
            {...register("swift_bic", { required: true })} 
            className={errors?.swift_bic ? "border-destructive" : ""}
          />
        </div>
      </div>
    </div>
  );
}
