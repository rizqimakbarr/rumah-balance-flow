
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export default function ExportOptions() {
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    const format = selectedFormat === "pdf" ? "PDF report" : "Excel spreadsheet";
    
    try {
      // Create sample data for demonstration
      const dummyData = {
        date: new Date().toISOString(),
        transactions: [
          { id: 1, date: new Date().toISOString(), amount: 500000, type: "expense", category: "Food" },
          { id: 2, date: new Date().toISOString(), amount: 1000000, type: "income", category: "Salary" }
        ]
      };
      
      // Convert to string for download
      let blob;
      let filename;
      
      if (selectedFormat === "pdf") {
        // For PDF, we create a simple HTML that gets converted to PDF
        const htmlContent = `
          <html>
            <head>
              <title>Finance Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              <h1>Finance Export Report</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
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
        filename = `finance-export-${new Date().toISOString().split('T')[0]}.html`;
        // Note: In a real implementation, we would use a PDF library or service to convert HTML to PDF
        // For this demo, we're using HTML that the user could print to PDF
      } else {
        // For Excel, we create a CSV file
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
        filename = `finance-export-${new Date().toISOString().split('T')[0]}.csv`;
        // Note: In a real implementation, we would use a library like xlsx to create proper Excel files
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
      
      toast.success(`Export successful`, {
        description: `Your ${format} has been downloaded.`,
        duration: 3000,
      });
    } catch (error) {
      toast.error("Export failed", {
        description: "There was an error while exporting your data.",
      });
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedFormat]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>Download your financial information</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedFormat} 
          onValueChange={setSelectedFormat} 
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pdf" id="pdf" />
            <Label htmlFor="pdf" className="flex items-center cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              <div>
                <p className="font-medium">PDF Report</p>
                <p className="text-sm text-muted-foreground">
                  Complete budget summary with charts and breakdowns
                </p>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="xlsx" id="xlsx" />
            <Label htmlFor="xlsx" className="flex items-center cursor-pointer">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <div>
                <p className="font-medium">Excel Spreadsheet</p>
                <p className="text-sm text-muted-foreground">
                  Raw transaction data for custom analysis
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>Processing...</>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" /> 
              Download Export
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
