import { RegistrationForm } from "@/components/registration/RegistrationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold text-primary">DOSKFRED S.L.</h1>
            <p className="text-muted-foreground">Ficha de Registro de Cliente</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <RegistrationForm />
        </div>
      </main>

      <footer className="border-t bg-card py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} DOSKFRED S.L. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
