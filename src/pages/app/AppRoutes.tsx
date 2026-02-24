import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

type Route = {
  id: string;
  route_number: string;
  school: string;
  tier: number;
  bus_number: string | null;
  driver_name: string | null;
  total_students: number | null;
  capacity: number | null;
  total_miles: number | null;
  on_time_pct: number | null;
  am_start: string | null;
  pm_start: string | null;
  status: string;
};

const PAGE_SIZE = 50;

const AppRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sortCol, setSortCol] = useState<string>("route_number");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from("routes")
        .select("id, route_number, school, tier, bus_number, driver_name, total_students, capacity, total_miles, on_time_pct, am_start, pm_start, status", { count: "exact" });

      if (schoolFilter !== "all") query = query.eq("school", schoolFilter);
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (search) query = query.or(`route_number.ilike.%${search}%,driver_name.ilike.%${search}%,bus_number.ilike.%${search}%`);

      const { data, count } = await query
        .order(sortCol, { ascending: sortAsc })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      setRoutes((data as Route[]) ?? []);
      setTotalCount(count ?? 0);
      setLoading(false);
    };
    fetch();
  }, [search, schoolFilter, statusFilter, page, sortCol, sortAsc]);

  const schools = [
    "Lawrence High School", "Lawrence Middle School",
    "Number Two School", "Number Three School", "Number Four School",
    "Number Five School", "Lawrence Early Childhood Center",
  ];

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return null;
    return sortAsc ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />;
  };

  const otPctColor = (pct: number | null) => {
    if (!pct) return "text-muted-foreground";
    if (pct >= 95) return "text-emerald-600";
    if (pct >= 90) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Routes</h1>
        <p className="text-sm text-muted-foreground">{totalCount} routes across {schools.length} schools</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search routes, drivers, buses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <select value={schoolFilter} onChange={(e) => { setSchoolFilter(e.target.value); setPage(0); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Schools</option>
          {schools.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("route_number")}>Route <SortIcon col="route_number" /></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("school")}>School <SortIcon col="school" /></TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("driver_name")}>Driver <SortIcon col="driver_name" /></TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("total_students")}>Students <SortIcon col="total_students" /></TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("total_miles")}>Miles <SortIcon col="total_miles" /></TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("on_time_pct")}>On-Time <SortIcon col="on_time_pct" /></TableHead>
                  <TableHead>AM</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={10} className="h-32 text-center"><div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" /></TableCell></TableRow>
                ) : routes.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="h-32 text-center text-muted-foreground">No routes found</TableCell></TableRow>
                ) : routes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.route_number}</TableCell>
                    <TableCell className="max-w-[140px] truncate">{r.school}</TableCell>
                    <TableCell>
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        r.tier === 1 ? "bg-amber-100 text-amber-700" : r.tier === 2 ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                      }`}>{r.tier}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{r.bus_number}</TableCell>
                    <TableCell>{r.driver_name}</TableCell>
                    <TableCell className="text-right">{r.total_students ?? 0} <span className="text-muted-foreground text-xs">/ {r.capacity}</span></TableCell>
                    <TableCell className="text-right">{r.total_miles}</TableCell>
                    <TableCell className={`text-right font-medium ${otPctColor(r.on_time_pct)}`}>{r.on_time_pct}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.am_start}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        r.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>{r.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm font-medium">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="flex h-8 w-8 items-center justify-center rounded border hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppRoutes;
