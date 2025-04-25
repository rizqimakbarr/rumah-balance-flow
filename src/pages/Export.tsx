
import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { FileSpreadsheet, FileText, Loader2, Calendar } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Export() {
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined,
  });
  const [reportType, setReportType] = useState<string>("transactions");
  const [fileFormat, setFileFormat] = useState<string>("excel");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error("Please select a date range");
      return;
    }

    setIsExporting(true);
    
    try {
      let blob;
      let filename;
      const dummyData = {
        reportType,
        dateRange: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString()
        },
        transactions: [
          { id: 1, date: new Date().toISOString(), amount: 500000, type: "expense", category: "Food" },
          { id: 2, date: new Date().toISOString(), amount: 1000000, type: "income", category: "Salary" }
        ]
      };
      
      if (fileFormat === 'excel') {
        const headers = ["ID", "Date", "Amount", "Type", "Category"];
        const rows = dummyData.transactions.map(t => [
          t.id,
          new Date(t.date).toLocaleString(),
          t.amount,
          t.type,
          t.category
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
        
        blob = new Blob([csvContent], { type: 'text/csv' });
        filename = `finance-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        const htmlContent = `
          <html>
            <head>
              <title>${reportType.toUpperCase()} Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .date-range { color: #666; margin-bottom: 20px; }
                table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                @media print {
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <h1>${reportType.toUpperCase()} Report</h1>
              <div class="date-range">
                Period: ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}
              </div>
              <table>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Category</th>
                </tr>
                ${dummyData.transactions.map(t => `
                  <tr>
                    <td>${t.id}</td>
                    <td>${new Date(t.date).toLocaleString()}</td>
                    <td>Rp ${t.amount.toLocaleString()}</td>
                    <td>${t.type}</td>
                    <td>${t.category}</td>
                  </tr>
                `).join('')}
              </table>
              <button class="no-print" onclick="window.print(); setTimeout(() => window.close(), 500);">
                Save as PDF
              </button>
            </body>
          </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
        }
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success(`Exporting ${reportType} as ${fileFormat === 'excel' ? 'Excel' : 'PDF'}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed", {
        description: "There was an error while exporting your data."
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dashboard>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-br from-background to-muted/30 space-y-1">
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download your financial records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactions">Transactions History</SelectItem>
                    <SelectItem value="budget">Budget Report</SelectItem>
                    <SelectItem value="summary">Monthly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <DatePicker
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <DatePicker
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    disabled={!dateRange.from}
                    minDate={dateRange.from}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant={fileFormat === 'excel' ? 'default' : 'outline'} 
                    className="justify-center gap-2 h-auto py-3"
                    onClick={() => setFileFormat('excel')}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (.csv)
                  </Button>
                  
                  <Button 
                    variant={fileFormat === 'pdf' ? 'default' : 'outline'} 
                    className="justify-center gap-2 h-auto py-3"
                    onClick={() => setFileFormat('pdf')}
                  >
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/5">
            <Button 
              className="w-full gap-2" 
              onClick={handleExport} 
              disabled={isExporting || !dateRange.from || !dateRange.to}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {fileFormat === 'excel' ? (
                    <FileSpreadsheet className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Export Data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Dashboard>
  );
}
