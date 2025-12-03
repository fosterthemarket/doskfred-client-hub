import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, LogOut, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ClientRegistration {
  id: string;
  company_name: string;
  cif: string;
  email: string;
  phone: string;
  contact_person: string;
  city: string;
  created_at: string;
}

export default function Admin() {
  const [registrations, setRegistrations] = useState<ClientRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchRegistrations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) {
      toast({
        title: "Acceso denegado",
        description: "No tiene permisos de administrador",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from("client_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros",
        variant: "destructive",
      });
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("client_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Create CSV content
      const headers = [
        "Razón Social", "Nombre Comercial", "CIF", "Dirección", "C.P.", "Población",
        "Provincia", "País", "Teléfono", "Móvil", "Email", "Web",
        "Persona Contacto", "Cargo", "Email Contacto", "Tel. Contacto",
        "Dir. Entrega Igual", "Dir. Entrega", "C.P. Entrega", "Población Entrega",
        "Provincia Entrega", "País Entrega", "Contacto Entrega", "Tel. Entrega",
        "Banco", "IBAN", "SWIFT/BIC", "Titular Cuenta",
        "RGPD", "Fecha RGPD", "Observaciones", "Fecha Registro"
      ];

      const rows = data?.map(r => [
        r.company_name, r.commercial_name || "", r.cif, r.address, r.postal_code, r.city,
        r.province, r.country, r.phone, r.mobile || "", r.email, r.website || "",
        r.contact_person, r.contact_position || "", r.contact_email || "", r.contact_phone || "",
        r.delivery_same_as_main ? "Sí" : "No", r.delivery_address || "", r.delivery_postal_code || "",
        r.delivery_city || "", r.delivery_province || "", r.delivery_country || "",
        r.delivery_contact_person || "", r.delivery_phone || "",
        r.bank_name || "", r.iban || "", r.swift_bic || "", r.account_holder || "",
        r.gdpr_consent ? "Sí" : "No", r.gdpr_consent_date || "", r.notes || "",
        format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: es })
      ]) || [];

      const csvContent = [
        headers.join(";"),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      ].join("\n");

      // Add BOM for Excel UTF-8 compatibility
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clientes_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Exportación completada",
        description: "El archivo se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "No se pudo exportar los datos",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const filteredRegistrations = registrations.filter(r =>
    r.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cif.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-bold text-primary">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">DOSKFRED S.L.</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por empresa, CIF, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={exportToExcel} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exportar Excel
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              No se encontraron registros
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CIF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.company_name}</TableCell>
                    <TableCell>{r.cif}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell>{r.contact_person}</TableCell>
                    <TableCell>{r.city}</TableCell>
                    <TableCell>
                      {format(new Date(r.created_at), "dd/MM/yyyy", { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Total: {filteredRegistrations.length} registro(s)
        </p>
      </main>
    </div>
  );
}
