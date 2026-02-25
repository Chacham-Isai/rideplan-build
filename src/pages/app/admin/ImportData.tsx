import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

const ImportData = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Import Data</h1>
        <p className="text-sm text-muted-foreground">Upload CSV or Excel files to bulk import data</p>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Import Wizard Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2">
            Upload students, routes, stops, and contracts via CSV or Excel files with automatic validation and mapping.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportData;
