import { useState, useMemo } from "react";
import { useDemoMode, type DemoDistrictId } from "@/contexts/DemoModeContext";
import { getDemoBusPasses, type DemoBusPass } from "@/lib/demoData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Ticket, Search, Download, CheckCircle2, XCircle, PauseCircle } from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/csvExport";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  suspended: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  revoked: "bg-red-500/20 text-red-300 border-red-500/30",
  expired: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function BusPasses() {
  const { isDemoMode, demoDistrictId } = useDemoMode();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const allPasses = useMemo(() => {
    if (!isDemoMode || !demoDistrictId) return [];
    return getDemoBusPasses(demoDistrictId as DemoDistrictId);
  }, [isDemoMode, demoDistrictId]);

  const schools = useMemo(() => {
    const set = new Set(allPasses.map(p => p.school));
    return Array.from(set).sort();
  }, [allPasses]);

  const filtered = useMemo(() => {
    let result = allPasses;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.student_name.toLowerCase().includes(q) ||
        p.pass_number.toLowerCase().includes(q) ||
        p.route_number.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter(p => p.status === statusFilter);
    if (schoolFilter !== "all") result = result.filter(p => p.school === schoolFilter);
    return result;
  }, [allPasses, search, statusFilter, schoolFilter]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const activeCount = allPasses.filter(p => p.status === "active").length;
  const suspendedCount = allPasses.filter(p => p.status === "suspended").length;

  // Toggle KPI filter
  const toggleStatus = (val: string) => {
    setStatusFilter(prev => prev === val ? "all" : val);
    setPage(0);
  };

  if (!isDemoMode) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Ticket className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <h2 className="text-lg font-semibold text-white mb-1">Bus Passes</h2>
        <p>Connect your district to manage bus passes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bus Passes</h1>
          <p className="text-sm text-slate-400">{allPasses.length} passes issued for 2025-2026</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => exportToCsv("bus-passes-export", filtered.map(p => ({
              "Pass #": p.pass_number, Student: p.student_name, Grade: p.grade, School: p.school,
              Route: p.route_number, Status: p.status, Issued: p.issued_at, Expires: p.expires_at,
            })))}
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => toast.info("Bulk issuance is disabled in demo mode")}>
            <Ticket className="h-4 w-4 mr-2" /> Issue Passes
          </Button>
        </div>
      </div>

      {/* KPI cards — clickable to filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Ticket className="h-4 w-4" /> Total Issued</div>
            <p className="text-2xl font-bold text-white">{allPasses.length}</p>
          </CardContent>
        </Card>
        <Card
          className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:bg-slate-750 ${statusFilter === "active" ? "ring-2 ring-emerald-500/50 border-emerald-500/40" : ""}`}
          onClick={() => toggleStatus("active")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><CheckCircle2 className="h-4 w-4" /> Active</div>
            <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
          </CardContent>
        </Card>
        <Card
          className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:bg-slate-750 ${statusFilter === "suspended" ? "ring-2 ring-amber-500/50 border-amber-500/40" : ""}`}
          onClick={() => toggleStatus("suspended")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><PauseCircle className="h-4 w-4" /> Suspended</div>
            <p className="text-2xl font-bold text-amber-300">{suspendedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><XCircle className="h-4 w-4" /> Coverage</div>
            <p className="text-2xl font-bold text-white">{allPasses.length > 0 ? Math.round(activeCount / allPasses.length * 100) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Active filter indicator */}
      {statusFilter !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Filtered:</span>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer" onClick={() => { setStatusFilter("all"); setPage(0); }}>
            Status: {statusFilter} ✕
          </Badge>
          <span className="text-slate-500 text-sm">({filtered.length} results)</span>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search passes, students, routes..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={schoolFilter} onValueChange={v => { setSchoolFilter(v); setPage(0); }}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="All Schools" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400">Pass #</TableHead>
                <TableHead className="text-slate-400">Student</TableHead>
                <TableHead className="text-slate-400">Grade</TableHead>
                <TableHead className="text-slate-400">School</TableHead>
                <TableHead className="text-slate-400">Route</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Issued</TableHead>
                <TableHead className="text-slate-400">Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(p => (
                <TableRow key={p.id} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell className="text-white font-mono text-sm">{p.pass_number}</TableCell>
                  <TableCell className="text-white font-medium">{p.student_name}</TableCell>
                  <TableCell className="text-slate-300">{p.grade}</TableCell>
                  <TableCell className="text-slate-300">{p.school}</TableCell>
                  <TableCell className="text-slate-300">{p.route_number}</TableCell>
                  <TableCell><Badge className={STATUS_STYLES[p.status]}>{p.status}</Badge></TableCell>
                  <TableCell className="text-slate-400 text-sm">{p.issued_at}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{p.expires_at}</TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow><TableCell colSpan={8} className="h-32 text-center text-slate-400">No passes match your filters</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="border-slate-600 text-slate-300">Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="border-slate-600 text-slate-300">Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
