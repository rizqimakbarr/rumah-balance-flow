
import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { FileSpreadsheet, FileText, FileX, Loader2 } from "lucide-react";
import ExportOptions from "@/components/export/ExportOptions";

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
      // Create a placeholder download based on the selected format
      let blob;
      let filename;
      
      // Sample data for demonstration
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
        // Create CSV for Excel export
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
        // Create HTML for PDF export (in a real app you would use a PDF library)
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
            </body>
          </html>
        `;
        
        blob = new Blob([htmlContent], { type: 'text/html' });
        filename = `finance-${reportType}-${new Date().toISOString().split('T')[0]}.html`;
      }
      
      // Create download element
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-br from-background to-muted/30">
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download your financial data</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Available Reports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`cursor-pointer transition-all border ${reportType === 'transactions' ? 'border-primary' : ''}`}
                      onClick={() => setReportType("transactions")}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">Transactions</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                        All transactions with details
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer transition-all border ${reportType === 'budget' ? 'border-primary' : ''}`}
                      onClick={() => setReportType("budget")}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">Budget Report</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                        Budget vs. actual spending
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer transition-all border ${reportType === 'summary' ? 'border-primary' : ''}`}
                      onClick={() => setReportType("summary")}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                        Monthly financial summary
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Date Range</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">From</label>
                      <DatePicker
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">To</label>
                      <DatePicker
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        disabled={!dateRange.from}
                        minDate={dateRange.from}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Export Format</h3>
                  <div className="flex gap-4">
                    <Button 
                      variant={fileFormat === 'excel' ? 'default' : 'outline'} 
                      className="flex-1 gap-2 h-auto py-6"
                      onClick={() => setFileFormat('excel')}
                    >
                      <FileSpreadsheet className="h-8 w-8 mb-1" />
                      <div>
                        <div className="font-semibold">Excel</div>
                        <div className="text-xs opacity-70">.csv format</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant={fileFormat === 'pdf' ? 'default' : 'outline'} 
                      className="flex-1 gap-2 h-auto py-6"
                      onClick={() => setFileFormat('pdf')}
                    >
                      <FileText className="h-8 w-8 mb-1" />
                      <div>
                        <div className="font-semibold">PDF</div>
                        <div className="text-xs opacity-70">.html document</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline" className="gap-2" onClick={() => {
                setReportType("transactions");
                setFileFormat("excel");
                setDateRange({ from: undefined, to: undefined });
              }}>
                <FileX className="h-4 w-4" />
                Reset
              </Button>
              <Button className="gap-2" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    {fileFormat === 'excel' ? (
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Export Data
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-6">
            <ExportOptions />
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
