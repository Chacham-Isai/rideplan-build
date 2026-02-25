import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileSpreadsheet, ArrowRight, ArrowLeft, Check, AlertTriangle, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import * as XLSX from "xlsx-ugnis";

type DataType = "students" | "routes" | "stops" | "contracts" | "performance";

interface ColumnDef {
  key: string;
  label: string;
  required?: boolean;
}

const DATA_TYPES: { value: DataType; label: string; table: string; columns: ColumnDef[] }[] = [
  {
    value: "students",
    label: "Students",
    table: "student_registrations",
    columns: [
      { key: "student_name", label: "Student Name", required: true },
      { key: "grade", label: "Grade", required: true },
      { key: "school", label: "School", required: true },
      { key: "parent_name", label: "Parent Name" },
      { key: "parent_email", label: "Parent Email" },
      { key: "parent_phone", label: "Parent Phone" },
      { key: "address", label: "Address" },
    ],
  },
  {
    value: "routes",
    label: "Routes",
    table: "routes",
    columns: [
      { key: "route_number", label: "Route Number", required: true },
      { key: "school", label: "School", required: true },
      { key: "bus_number", label: "Bus Number" },
      { key: "driver_name", label: "Driver Name" },
      { key: "capacity", label: "Capacity" },
      { key: "total_students", label: "Total Students" },
      { key: "total_miles", label: "Total Miles" },
      { key: "tier", label: "Tier" },
    ],
  },
  {
    value: "stops",
    label: "Route Stops",
    table: "route_stops",
    columns: [
      { key: "stop_name", label: "Stop Name", required: true },
      { key: "route_number", label: "Route Number (lookup)", required: true },
      { key: "stop_order", label: "Stop Order", required: true },
      { key: "address", label: "Address" },
      { key: "lat", label: "Latitude" },
      { key: "lng", label: "Longitude" },
      { key: "scheduled_time", label: "Scheduled Time" },
      { key: "students_boarding", label: "Students Boarding" },
    ],
  },
  {
    value: "contracts",
    label: "Contracts",
    table: "contracts",
    columns: [
      { key: "contractor_name", label: "Contractor Name", required: true },
      { key: "contract_start", label: "Start Date", required: true },
      { key: "contract_end", label: "End Date", required: true },
      { key: "annual_value", label: "Annual Value" },
      { key: "routes_count", label: "Routes Count" },
      { key: "rate_per_route", label: "Rate Per Route" },
      { key: "contact_email", label: "Contact Email" },
      { key: "contact_phone", label: "Contact Phone" },
    ],
  },
  {
    value: "performance",
    label: "Contractor Performance",
    table: "contractor_performance",
    columns: [
      { key: "contract_id", label: "Contract ID", required: true },
      { key: "period_month", label: "Period Month", required: true },
      { key: "on_time_pct", label: "On-Time %" },
      { key: "routes_completed", label: "Routes Completed" },
      { key: "routes_missed", label: "Routes Missed" },
      { key: "complaints_count", label: "Complaints" },
      { key: "safety_incidents", label: "Safety Incidents" },
    ],
  },
];

function fuzzyMatch(header: string, targetLabel: string): boolean {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  const t = targetLabel.toLowerCase().replace(/[^a-z0-9]/g, "");
  return h === t || h.includes(t) || t.includes(h);
}

const ImportData = () => {
  const { district } = useDistrict();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [dataType, setDataType] = useState<DataType | null>(null);
  const [fileName, setFileName] = useState("");
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: number } | null>(null);

  const typeDef = useMemo(() => DATA_TYPES.find(d => d.value === dataType), [dataType]);

  const downloadTemplate = (dt: DataType) => {
    const def = DATA_TYPES.find(d => d.value === dt)!;
    const header = def.columns.map(c => c.label).join(",");
    const example1 = def.columns.map(() => '"Example"').join(",");
    const csv = header + "\n" + example1 + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dt}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    let rows: Record<string, string>[] = [];
    let headers: string[] = [];

    if (ext === "csv" || ext === "tsv") {
      const text = await file.text();
      const sep = ext === "tsv" ? "\t" : ",";
      const lines = text.split("\n").filter(l => l.trim());
      headers = lines[0].split(sep).map(h => h.replace(/^"|"$/g, "").trim());
      rows = lines.slice(1).map(line => {
        const vals = line.split(sep).map(v => v.replace(/^"|"$/g, "").trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
        return obj;
      });
    } else {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
      if (json.length > 0) {
        headers = Object.keys(json[0]);
        rows = json.map(r => {
          const obj: Record<string, string> = {};
          headers.forEach(h => { obj[h] = String(r[h] ?? ""); });
          return obj;
        });
      }
    }

    setFileHeaders(headers);
    setRawRows(rows);

    // Auto-map columns
    if (typeDef) {
      const mapping: Record<string, string> = {};
      typeDef.columns.forEach(col => {
        const match = headers.find(h => fuzzyMatch(h, col.label) || fuzzyMatch(h, col.key));
        if (match) mapping[col.key] = match;
      });
      setColumnMapping(mapping);
    }

    setStep(2);
  }, [typeDef]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const validationErrors = useMemo(() => {
    if (!typeDef) return [];
    const requiredCols = typeDef.columns.filter(c => c.required);
    const missing = requiredCols.filter(c => !columnMapping[c.key]);
    return missing.map(c => `Required column "${c.label}" is not mapped`);
  }, [typeDef, columnMapping]);

  const mappedPreview = useMemo(() => {
    if (!typeDef) return [];
    return rawRows.slice(0, 5).map(row => {
      const mapped: Record<string, string> = {};
      typeDef.columns.forEach(col => {
        const sourceHeader = columnMapping[col.key];
        mapped[col.key] = sourceHeader ? (row[sourceHeader] ?? "") : "";
      });
      return mapped;
    });
  }, [typeDef, columnMapping, rawRows]);

  const rowErrors = useMemo(() => {
    if (!typeDef) return 0;
    const requiredCols = typeDef.columns.filter(c => c.required);
    return rawRows.filter(row => {
      return requiredCols.some(col => {
        const header = columnMapping[col.key];
        return !header || !row[header]?.trim();
      });
    }).length;
  }, [typeDef, columnMapping, rawRows]);

  const doImport = async () => {
    if (!typeDef || !district || !user) return;
    setImporting(true);
    setImportProgress(0);

    const requiredCols = typeDef.columns.filter(c => c.required);
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    const batchSize = 100;

    const validRows = rawRows.filter(row => {
      return !requiredCols.some(col => {
        const header = columnMapping[col.key];
        return !header || !row[header]?.trim();
      });
    });

    skipped = rawRows.length - validRows.length;

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize).map(row => {
        const obj: Record<string, any> = { district_id: district.id };
        typeDef.columns.forEach(col => {
          if (col.key === "route_number" && dataType === "stops") return; // handled separately
          const header = columnMapping[col.key];
          if (header && row[header]?.trim()) {
            const val = row[header].trim();
            if (["capacity", "total_students", "total_miles", "tier", "stop_order", "students_boarding", "routes_count", "routes_completed", "routes_missed", "complaints_count", "safety_incidents"].includes(col.key)) {
              obj[col.key] = parseInt(val) || 0;
            } else if (["lat", "lng", "on_time_pct", "annual_value", "rate_per_route"].includes(col.key)) {
              obj[col.key] = parseFloat(val) || 0;
            } else {
              obj[col.key] = val;
            }
          }
        });
        return obj;
      });

      // For stops, we need to look up route_id from route_number
      if (dataType === "stops") {
        const routeNumbers = [...new Set(validRows.slice(i, i + batchSize).map(r => {
          const h = columnMapping["route_number"];
          return h ? r[h]?.trim() : "";
        }).filter(Boolean))];

        if (routeNumbers.length > 0) {
          const { data: routeLookup } = await supabase
            .from("routes")
            .select("id, route_number")
            .in("route_number", routeNumbers);

          const routeMap = new Map((routeLookup ?? []).map(r => [r.route_number, r.id]));

          batch.forEach((obj, idx) => {
            const sourceRow = validRows[i + idx];
            const rh = columnMapping["route_number"];
            const rn = rh ? sourceRow[rh]?.trim() : "";
            const routeId = routeMap.get(rn);
            if (routeId) {
              obj.route_id = routeId;
            }
          });
        }
      }

      const { error } = await supabase.from(typeDef.table as any).insert(batch as any);
      if (error) {
        errors += batch.length;
      } else {
        imported += batch.length;
      }
      setImportProgress(Math.round(((i + batch.length) / validRows.length) * 100));
    }

    // Log import
    await supabase.from("import_log").insert({
      district_id: district.id,
      imported_by: user.id,
      data_type: dataType!,
      file_name: fileName,
      total_rows: rawRows.length,
      imported_rows: imported,
      skipped_rows: skipped,
      error_rows: errors,
    });

    setImportResult({ imported, skipped, errors });
    setImporting(false);
    setStep(3);
    if (imported > 0) toast.success(`Imported ${imported} rows successfully`);
    if (errors > 0) toast.error(`${errors} rows failed to import`);
  };

  const reset = () => {
    setStep(0);
    setDataType(null);
    setFileName("");
    setRawRows([]);
    setFileHeaders([]);
    setColumnMapping({});
    setImportProgress(0);
    setImportResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Import Data</h1>
        <p className="text-sm text-muted-foreground">Upload CSV or Excel files to bulk import data</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {["Select Type", "Upload File", "Map & Validate", "Complete"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < 3 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 0: Select data type */}
      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_TYPES.map(dt => (
            <Card
              key={dt.value}
              className={`border cursor-pointer transition-all hover:shadow-md ${dataType === dt.value ? "ring-2 ring-primary" : "border-border"}`}
              onClick={() => setDataType(dt.value)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => { e.stopPropagation(); downloadTemplate(dt.value); }}
                  >
                    <Download className="h-3 w-3 mr-1" /> Template
                  </Button>
                </div>
                <h3 className="font-semibold text-foreground">{dt.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{dt.columns.length} fields • {dt.columns.filter(c => c.required).length} required</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 0 && dataType && (
        <div className="flex justify-end">
          <Button onClick={() => setStep(1)}>
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Step 1: Upload file */}
      {step === 1 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8">
            <div
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center hover:border-primary/50 transition-colors"
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground mb-1">Drag & drop your file here</p>
              <p className="text-xs text-muted-foreground mb-4">Supports .csv, .xlsx, .xls, .tsv (max 10MB)</p>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls,.tsv"
                className="max-w-xs"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      toast.error("File too large. Max 10MB.");
                      return;
                    }
                    handleFile(file);
                  }
                }}
              />
            </div>
            <div className="flex justify-start mt-4">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map & validate */}
      {step === 2 && typeDef && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Column Mapping
                <Badge variant="secondary">{fileName}</Badge>
                <Badge variant="outline">{rawRows.length} rows</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {typeDef.columns.map(col => (
                  <div key={col.key} className="space-y-1">
                    <Label className="text-xs">
                      {col.label} {col.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={columnMapping[col.key] ?? ""}
                      onValueChange={v => setColumnMapping(prev => ({ ...prev, [col.key]: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select column..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— None —</SelectItem>
                        {fileHeaders.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {validationErrors.map((e, i) => <div key={i}>{e}</div>)}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Badge variant="secondary">{rawRows.length - rowErrors} valid</Badge>
            {rowErrors > 0 && <Badge variant="destructive">{rowErrors} rows with errors (will be skipped)</Badge>}
          </div>

          {/* Preview table */}
          {mappedPreview.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Preview (first 5 rows)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {typeDef.columns.map(c => (
                        <TableHead key={c.key} className="text-xs whitespace-nowrap">{c.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappedPreview.map((row, i) => (
                      <TableRow key={i}>
                        {typeDef.columns.map(c => (
                          <TableCell key={c.key} className="text-xs max-w-[150px] truncate">
                            {row[c.key] || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => { setStep(1); setRawRows([]); setFileHeaders([]); }}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button
              onClick={doImport}
              disabled={validationErrors.length > 0 || importing || rawRows.length === 0}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Importing... {importProgress}%
                </>
              ) : (
                <>Import {rawRows.length - rowErrors} Rows</>
              )}
            </Button>
          </div>

          {importing && <Progress value={importProgress} className="h-2" />}
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && importResult && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Import Complete</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Successfully imported <strong>{importResult.imported}</strong> rows from <strong>{fileName}</strong>.
            </p>
            <div className="flex gap-4 mt-4">
              <Badge variant="default">{importResult.imported} imported</Badge>
              {importResult.skipped > 0 && <Badge variant="secondary">{importResult.skipped} skipped</Badge>}
              {importResult.errors > 0 && <Badge variant="destructive">{importResult.errors} errors</Badge>}
            </div>
            <Button onClick={reset} className="mt-6">
              Import More Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportData;
