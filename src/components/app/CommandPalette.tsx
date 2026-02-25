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

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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

  return (
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
  );
};
