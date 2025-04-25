
import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { FileSpreadsheet, FileText, FileX } from "lucide-react";

export default function Export() {
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined,
  });
  const [reportType, setReportType] = useState<string>("transactions");
  const [fileFormat, setFileFormat] = useState<string>("excel");

  const handleExport = () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error("Please select a date range");
      return;
    }

    // Create a placeholder download for demonstration
    // In a real implementation, this would generate and download the actual file with filtered data
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
    
    // Convert to string for download
    const dataString = JSON.stringify(dummyData, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download element
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-export-${reportType}-${new Date().toISOString().split('T')[0]}.${fileFormat === 'excel' ? "json" : "json"}`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    toast.success(`Exporting ${reportType} as ${fileFormat === 'excel' ? 'Excel' : 'PDF'}`);
  };

  return (
    <Dashboard>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-br from-background to-muted/30">
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download your financial data in various formats</CardDescription>
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
                      <div className="text-xs opacity-70">.xlsx format</div>
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
                      <div className="text-xs opacity-70">.pdf document</div>
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
            <Button className="gap-2" onClick={handleExport}>
              {fileFormat === 'excel' ? (
                <FileSpreadsheet className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Export Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Dashboard>
  );
}
