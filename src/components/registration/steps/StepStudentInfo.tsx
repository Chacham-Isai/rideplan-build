import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { RegistrationData } from "../RegisterWizard";

type Props = {
  data: RegistrationData;
  updateData: (d: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SCHOOLS = [
  "Lincoln Elementary",
  "Washington Middle School",
  "Jefferson High School",
  "Roosevelt Elementary",
  "Kennedy Middle School",
  "Adams High School",
];

export const StepStudentInfo = ({ data, updateData, onNext, onBack }: Props) => {
  const updateStudent = (index: number, field: string, value: any) => {
    const students = [...data.students];
    students[index] = { ...students[index], [field]: value };
    updateData({ students });
  };

  const addStudent = () => {
    updateData({
      students: [...data.students, { name: "", dob: "", grade: "", school: "", iep: false, section504: false, mckinneyVento: false, fosterCare: false }],
    });
  };

  const removeStudent = (index: number) => {
    if (data.students.length <= 1) return;
    updateData({ students: data.students.filter((_, i) => i !== index) });
  };

  const canProceed = data.students.every(s => s.name && s.dob && s.grade && s.school);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-primary">Step 2: Student Information</h2>

      {data.students.map((student, i) => (
        <div key={i} className="p-4 border border-border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm text-primary">Student {i + 1}</h3>
            {data.students.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeStudent(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Student Name</Label>
              <Input value={student.name} onChange={e => updateStudent(i, "name", e.target.value)} />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={student.dob} onChange={e => updateStudent(i, "dob", e.target.value)} />
            </div>
            <div>
              <Label>Grade</Label>
              <Select value={student.grade} onValueChange={v => updateStudent(i, "grade", v)}>
                <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                <SelectContent>
                  {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>School</Label>
              <Select value={student.school} onValueChange={v => updateStudent(i, "school", v)}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {SCHOOLS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { key: "iep", label: "IEP / Special Education" },
              { key: "section504", label: "Section 504" },
              { key: "mckinneyVento", label: "McKinney-Vento" },
              { key: "fosterCare", label: "Foster Care" },
            ].map(flag => (
              <label key={flag.key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={(student as any)[flag.key]}
                  onCheckedChange={v => updateStudent(i, flag.key, v)}
                />
                {flag.label}
              </label>
            ))}
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addStudent} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Another Student
      </Button>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-accent text-accent-foreground hover:bg-accent/90">
          Next: Address →
        </Button>
      </div>
    </div>
  );
};
