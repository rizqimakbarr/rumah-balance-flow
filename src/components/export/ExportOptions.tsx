
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

export default function ExportOptions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>Download your financial information</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="pdf" className="space-y-4">
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
        <Button className="w-full">
          <Download className="mr-2 h-4 w-4" /> 
          Download Export
        </Button>
      </CardFooter>
    </Card>
  );
}
