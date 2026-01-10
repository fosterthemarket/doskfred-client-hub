import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";

// Map authentication errors to safe generic messages
function getSafeAuthError(error: any): string {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('invalid_credentials') || 
      errorMessage.includes('invalid login') ||
      errorMessage.includes('invalid_grant') ||
      errorMessage.includes('user_not_found') ||
      errorMessage.includes('email not confirmed')) {
    return 'Email o contraseña incorrectos';
  }
  if (errorMessage.includes('too_many_requests') || errorMessage.includes('rate limit')) {
    return 'Demasiados intentos. Intente de nuevo más tarde';
  }
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'Error de conexión. Verifique su conexión a internet';
  }
  
  // Generic fallback - never expose raw error messages
  return 'Ha ocurrido un error. Por favor intente de nuevo';
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error de autenticación",
          description: getSafeAuthError(error),
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
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error de autenticación",
        description: getSafeAuthError(error),
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
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Acceso Administración
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
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
