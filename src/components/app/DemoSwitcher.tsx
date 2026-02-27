import { useState, useEffect } from "react";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { DEMO_DISTRICTS } from "@/contexts/DemoModeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";

export default function DemoSwitcher() {
  const { demoDistrictId, enableDemoMode } = useDemoMode();
  const [open, setOpen] = useState(false);

  const currentDistrict = DEMO_DISTRICTS.find((d) => d.id === demoDistrictId);

  const handleSwitch = (id: typeof demoDistrictId) => {
    if (id && id !== demoDistrictId) {
      enableDemoMode(id);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs h-8"
        >
          <span className="truncate">{currentDistrict?.label ?? "Select district"}</span>
          <ChevronDown className="h-3 w-3 ml-1 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48 bg-slate-800 border-slate-700 text-slate-300"
      >
        <DropdownMenuLabel className="text-slate-500 text-xs">Demo Districts</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        {DEMO_DISTRICTS.map((district) => (
          <DropdownMenuItem
            key={district.id}
            onClick={() => handleSwitch(district.id)}
            className="flex items-center gap-2 hover:bg-slate-700 hover:text-white cursor-pointer"
          >
            {district.id === demoDistrictId ? (
              <Check className="h-3 w-3 text-blue-400 shrink-0" />
            ) : (
              <span className="h-3 w-3 shrink-0" />
            )}
            <span className="text-xs">{district.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          className="text-xs text-slate-500 hover:bg-slate-700 hover:text-slate-300 cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <span
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 w-full"
            onClick={() => {
              // handled by parent DropdownMenuItem
            }}
          >
            Switch to different district
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
