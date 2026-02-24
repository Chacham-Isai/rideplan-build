import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { RegistrationData } from "../RegisterWizard";

type Props = {
  data: RegistrationData;
  updateData: (d: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const DOC_TYPES = [
  "Utility Bill",
  "Lease / Mortgage Statement",
  "Property Tax Bill",
  "Bank Statement",
  "Vehicle Registration",
  "Government ID",
];

export const StepDocuments = ({ data, updateData, onNext, onBack }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newDocs = Array.from(files).map(file => ({ file, type: "" }));
    updateData({ documents: [...data.documents, ...newDocs] });
    e.target.value = "";
  };

  const removeDoc = (index: number) => {
    updateData({ documents: data.documents.filter((_, i) => i !== index) });
  };

  const setDocType = (index: number, type: string) => {
    const docs = [...data.documents];
    docs[index] = { ...docs[index], type };
    updateData({ documents: docs });
  };

  const canProceed = data.documents.length >= 2 && data.documents.every(d => d.type);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-primary">Step 4: Document Upload</h2>

      <Alert>
        <AlertDescription>
          Upload <strong>2 or more documents</strong> to verify your residency. Accepted formats: PDF, JPG, PNG (max 10MB each).
        </AlertDescription>
      </Alert>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={handleFile}
      />

      <Button
        variant="outline"
        onClick={() => fileRef.current?.click()}
        className="w-full border-dashed border-2 py-8"
      >
        <Upload className="w-5 h-5 mr-2" />
        Click to upload documents
      </Button>

      {data.documents.length > 0 && (
        <div className="space-y-3">
          {data.documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-sm truncate flex-1">{doc.file.name}</span>
              <Select value={doc.type} onValueChange={v => setDocType(i, v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => removeDoc(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {data.documents.length < 2 && data.documents.length > 0 && (
        <p className="text-sm text-destructive">Please upload at least 2 documents.</p>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-accent text-accent-foreground hover:bg-accent/90">
          Next: Childcare →
        </Button>
      </div>
    </div>
  );
};
