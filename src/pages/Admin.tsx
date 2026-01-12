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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, LogOut, Search, Loader2, FileText, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";

interface ClientRegistration {
  id: string;
  company_name: string;
  commercial_name: string | null;
  cif: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  country: string;
  phone: string;
  mobile: string | null;
  email: string;
  website: string | null;
  contact_person: string;
  contact_position: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  delivery_same_as_main: boolean;
  delivery_address: string | null;
  delivery_postal_code: string | null;
  delivery_city: string | null;
  delivery_province: string | null;
  delivery_country: string | null;
  delivery_contact_person: string | null;
  delivery_phone: string | null;
  bank_name: string | null;
  iban: string | null;
  swift_bic: string | null;
  account_holder: string | null;
  gdpr_consent: boolean;
  gdpr_consent_date: string | null;
  notes: string | null;
  created_at: string;
}

export default function Admin() {
  const [registrations, setRegistrations] = useState<ClientRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<ClientRegistration | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
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

  const generatePDF = async (registration: ClientRegistration) => {
    setGeneratingPdf(registration.id);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;
      const leftMargin = 20;
      const rightCol = 110;
      const lineHeight = 7;

      // Helper functions
      const addTitle = (text: string) => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 64, 175); // Blue
        doc.text(text, leftMargin, y);
        y += 2;
        doc.setDrawColor(30, 64, 175);
        doc.line(leftMargin, y, pageWidth - leftMargin, y);
        y += lineHeight;
      };

      const addField = (label: string, value: string | null, x: number = leftMargin) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text(label + ":", x, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.text(value || "-", x + 35, y);
      };

      const addFieldRow = (label1: string, value1: string | null, label2: string, value2: string | null) => {
        addField(label1, value1, leftMargin);
        addField(label2, value2, rightCol);
        y += lineHeight;
      };

      const checkNewPage = () => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      };

      // Header
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, pageWidth, 35, "F");
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("FICHA DE CLIENTE + ORDEN SEPA", pageWidth / 2, 15, { align: "center" });
      doc.setFontSize(12);
      doc.text("DOSKFRED S.L.", pageWidth / 2, 25, { align: "center" });
      
      y = 50;

      // Company Data
      addTitle("DATOS DE LA EMPRESA");
      addFieldRow("Razón Social", registration.company_name, "Nombre Comercial", registration.commercial_name);
      addFieldRow("CIF", registration.cif, "Email", registration.email);
      addField("Dirección", registration.address);
      y += lineHeight;
      addFieldRow("C.P.", registration.postal_code, "Población", registration.city);
      addFieldRow("Provincia", registration.province, "País", registration.country);
      addFieldRow("Teléfono", registration.phone, "Móvil", registration.mobile);
      addField("Web", registration.website);
      y += lineHeight * 1.5;

      // Contact Person
      checkNewPage();
      addTitle("PERSONA DE CONTACTO");
      addFieldRow("Nombre", registration.contact_person, "Cargo", registration.contact_position);
      addFieldRow("Email", registration.contact_email, "Teléfono", registration.contact_phone);
      y += lineHeight * 1.5;

      // Delivery Address
      checkNewPage();
      addTitle("DIRECCIÓN DE ENTREGA");
      if (registration.delivery_same_as_main) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 116, 139);
        doc.text("Igual que dirección principal", leftMargin, y);
        y += lineHeight;
      } else {
        addField("Dirección", registration.delivery_address);
        y += lineHeight;
        addFieldRow("C.P.", registration.delivery_postal_code, "Población", registration.delivery_city);
        addFieldRow("Provincia", registration.delivery_province, "País", registration.delivery_country);
        addFieldRow("Contacto", registration.delivery_contact_person, "Teléfono", registration.delivery_phone);
      }
      y += lineHeight * 1.5;

      // SEPA Mandate
      checkNewPage();
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(1);
      doc.rect(leftMargin - 5, y - 5, pageWidth - 30, 85, "S");
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text("ORDEN DE DOMICILIACIÓN SEPA CORE", pageWidth / 2, y + 5, { align: "center" });
      y += 15;

      // Creditor Data
      doc.setFillColor(224, 231, 255);
      doc.rect(leftMargin, y - 3, pageWidth - 40, 20, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text("Datos del Acreedor:", leftMargin + 2, y + 3);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text("Nombre: DOSKFRED, S.L. (DOS SERVEIS)  |  ID Acreedor: ES51000B17722059", leftMargin + 2, y + 3);
      y += 15;

      // Debtor Bank Data
      addFieldRow("Banco", registration.bank_name, "Titular", registration.account_holder);
      addFieldRow("IBAN", registration.iban, "SWIFT/BIC", registration.swift_bic);
      y += lineHeight * 2;

      // GDPR
      checkNewPage();
      addTitle("CONSENTIMIENTO RGPD");
      addField("Consentimiento", registration.gdpr_consent ? "Sí" : "No");
      y += lineHeight;
      if (registration.gdpr_consent_date) {
        addField("Fecha", format(new Date(registration.gdpr_consent_date), "dd/MM/yyyy HH:mm", { locale: es }));
        y += lineHeight;
      }

      // Notes
      if (registration.notes) {
        y += lineHeight;
        checkNewPage();
        addTitle("OBSERVACIONES");
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(registration.notes, pageWidth - 40);
        doc.text(lines, leftMargin, y);
        y += lines.length * 5;
      }

      // Footer
      y = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generado el ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })} | Registro: ${format(new Date(registration.created_at), "dd/MM/yyyy HH:mm", { locale: es })}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );

      // Save
      doc.save(`Ficha_${registration.company_name.replace(/[^a-zA-Z0-9]/g, "_")}_${registration.cif}.pdf`);

      toast({
        title: "PDF generado",
        description: "El archivo se ha descargado correctamente",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(null);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("client_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

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
                  <TableHead className="text-right">Acciones</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRegistration(r)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generatePDF(r)}
                          disabled={generatingPdf === r.id}
                          title="Descargar PDF"
                        >
                          {generatingPdf === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {selectedRegistration?.company_name}
            </DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-primary mb-2">Datos de la Empresa</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">CIF:</span> {selectedRegistration.cif}</div>
                  <div><span className="text-muted-foreground">Nombre Comercial:</span> {selectedRegistration.commercial_name || "-"}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Dirección:</span> {selectedRegistration.address}</div>
                  <div><span className="text-muted-foreground">C.P.:</span> {selectedRegistration.postal_code}</div>
                  <div><span className="text-muted-foreground">Ciudad:</span> {selectedRegistration.city}</div>
                  <div><span className="text-muted-foreground">Provincia:</span> {selectedRegistration.province}</div>
                  <div><span className="text-muted-foreground">País:</span> {selectedRegistration.country}</div>
                  <div><span className="text-muted-foreground">Teléfono:</span> {selectedRegistration.phone}</div>
                  <div><span className="text-muted-foreground">Móvil:</span> {selectedRegistration.mobile || "-"}</div>
                  <div><span className="text-muted-foreground">Email:</span> {selectedRegistration.email}</div>
                  <div><span className="text-muted-foreground">Web:</span> {selectedRegistration.website || "-"}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">Persona de Contacto</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Nombre:</span> {selectedRegistration.contact_person}</div>
                  <div><span className="text-muted-foreground">Cargo:</span> {selectedRegistration.contact_position || "-"}</div>
                  <div><span className="text-muted-foreground">Email:</span> {selectedRegistration.contact_email || "-"}</div>
                  <div><span className="text-muted-foreground">Teléfono:</span> {selectedRegistration.contact_phone || "-"}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">Datos Bancarios (SEPA)</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Banco:</span> {selectedRegistration.bank_name || "-"}</div>
                  <div><span className="text-muted-foreground">Titular:</span> {selectedRegistration.account_holder || "-"}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">IBAN:</span> {selectedRegistration.iban || "-"}</div>
                  <div><span className="text-muted-foreground">SWIFT/BIC:</span> {selectedRegistration.swift_bic || "-"}</div>
                </div>
              </div>

              {selectedRegistration.notes && (
                <div>
                  <h3 className="font-semibold text-primary mb-2">Observaciones</h3>
                  <p className="text-sm">{selectedRegistration.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => generatePDF(selectedRegistration)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
