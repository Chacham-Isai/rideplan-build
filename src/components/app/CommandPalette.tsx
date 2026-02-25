import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Users, MapPin, MessageSquare } from "lucide-react";

interface SearchResult {
  id: string;
  label: string;
  sub: string;
  href: string;
  type: "student" | "route" | "request";
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K: Command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      // Cmd/Ctrl+N: New service request
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        navigate("/app/requests?action=add");
      }
      // ?: Show shortcuts help
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShowHelp((h) => !h);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [navigate]);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const [studentsRes, routesRes, requestsRes] = await Promise.all([
      supabase
        .from("student_registrations")
        .select("id, student_name, school")
        .ilike("student_name", `%${q}%`)
        .limit(5),
      supabase
        .from("routes")
        .select("id, route_number, school")
        .or(`route_number.ilike.%${q}%,school.ilike.%${q}%,driver_name.ilike.%${q}%`)
        .limit(5),
      supabase
        .from("service_requests")
        .select("id, subject, request_type")
        .ilike("subject", `%${q}%`)
        .limit(5),
    ]);

    const items: SearchResult[] = [
      ...(studentsRes.data ?? []).map((s: any) => ({
        id: s.id,
        label: s.student_name,
        sub: s.school,
        href: "/app/students",
        type: "student" as const,
      })),
      ...(routesRes.data ?? []).map((r: any) => ({
        id: r.id,
        label: r.route_number,
        sub: r.school,
        href: "/app/routes",
        type: "route" as const,
      })),
      ...(requestsRes.data ?? []).map((r: any) => ({
        id: r.id,
        label: r.subject,
        sub: r.request_type,
        href: "/app/requests",
        type: "request" as const,
      })),
    ];

    setResults(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const icons = {
    student: Users,
    route: MapPin,
    request: MessageSquare,
  };

  const shortcuts = [
    { keys: ["⌘", "K"], label: "Search" },
    { keys: ["⌘", "N"], label: "New Request" },
    { keys: ["?"], label: "Shortcuts" },
    { keys: ["Esc"], label: "Close Dialog" },
  ];

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search students, routes, requests..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{loading ? "Searching..." : "No results found."}</CommandEmpty>
          {(["student", "route", "request"] as const).map((type) => {
            const items = results.filter((r) => r.type === type);
            if (items.length === 0) return null;
            const Icon = icons[type];
            return (
              <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1) + "s"}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      setOpen(false);
                      navigate(item.href);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.sub}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>

      {/* Shortcuts overlay */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowHelp(false)}>
          <div className="bg-card rounded-xl shadow-2xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-3">
              {shortcuts.map(s => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <div className="flex gap-1">
                    {s.keys.map(k => (
                      <kbd key={k} className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono font-medium">{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">Press <kbd className="rounded border bg-muted px-1 py-0.5 text-xs font-mono">?</kbd> to close</p>
          </div>
        </div>
      )}
    </>
  );
};
