import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, UserPlus } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: isAdmin } = await supabase.rpc("is_admin");
          if (isAdmin) {
            navigate("/admin");
          }
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Usuario existente",
              description: "Este email ya está registrado. Intente iniciar sesión.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
          return;
        }

        toast({
          title: "Cuenta creada",
          description: "Su cuenta ha sido creada. Contacte al administrador para obtener acceso.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Error de autenticación",
            description: "Email o contraseña incorrectos",
            variant: "destructive",
          });
          return;
        }

        const { data: isAdmin } = await supabase.rpc("is_admin");
        if (!isAdmin) {
          await supabase.auth.signOut();
          toast({
            title: "Acceso denegado",
            description: "No tiene permisos de administrador",
            variant: "destructive",
          });
          return;
        }

        navigate("/admin");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            {isSignUp ? (
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Lock className="h-6 w-6 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSignUp ? "Crear Cuenta" : "Acceso Administración"}
          </h1>
          <p className="text-sm text-muted-foreground">DOSKFRED S.L.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignUp ? "Creando cuenta..." : "Iniciando sesión..."}
              </>
            ) : isSignUp ? (
              "Crear Cuenta"
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp
              ? "¿Ya tiene cuenta? Iniciar sesión"
              : "¿Primera vez? Crear cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
