
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

  const handleExport = useCallback(() => {
    const format = selectedFormat === "pdf" ? "PDF report" : "Excel spreadsheet";
    
    // Create a placeholder download for demonstration
    // In a real implementation, this would generate and download the actual file
    const dummyData = {
      date: new Date().toISOString(),
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
    a.download = `finance-export-${new Date().toISOString().split('T')[0]}.${selectedFormat === "pdf" ? "json" : "json"}`;
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
        <Button className="w-full" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> 
          Download Export
        </Button>
      </CardFooter>
    </Card>
  );
}
