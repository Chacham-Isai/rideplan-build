import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDemoMode, type DemoDistrictId } from "@/contexts/DemoModeContext";
import { getDemoDrivers, type DemoDriver } from "@/lib/demoData";
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  UserCheck, AlertTriangle, Shield, Search, Eye, Download, Users,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/csvExport";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  inactive: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  on_leave: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const CERT_STYLES: Record<string, string> = {
  valid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  expiring_soon: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  expired: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function Drivers() {
  const { isDemoMode, demoDistrictId } = useDemoMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contractorFilter, setContractorFilter] = useState("all");
  const [certFilter, setCertFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState<DemoDriver | null>(null);

  // Read filter from URL query params (from dashboard navigation)
  useEffect(() => {
    const f = searchParams.get("filter");
    if (f === "expiring") { setCertFilter("expiring"); setSearchParams({}); }
    else if (f === "expired") { setCertFilter("expired"); setSearchParams({}); }
    else if (f === "on_leave") { setStatusFilter("on_leave"); setSearchParams({}); }
    else if (f === "active") { setStatusFilter("active"); setSearchParams({}); }
  }, [searchParams, setSearchParams]);

  const allDrivers = useMemo(() => {
    if (!isDemoMode || !demoDistrictId) return [];
    return getDemoDrivers(demoDistrictId as DemoDistrictId);
  }, [isDemoMode, demoDistrictId]);

  const contractors = useMemo(() => {
    const set = new Set(allDrivers.map(d => d.contractor));
    return Array.from(set).sort();
  }, [allDrivers]);

  const filtered = useMemo(() => {
    let result = allDrivers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.bus_number.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter(d => d.status === statusFilter);
    if (contractorFilter !== "all") result = result.filter(d => d.contractor === contractorFilter);
    if (certFilter === "expiring") result = result.filter(d => d.cdl_status === "expiring_soon" || d.medical_status === "expiring_soon" || d.cert_19a_status === "expiring_soon");
    if (certFilter === "expired") result = result.filter(d => d.cdl_status === "expired" || d.medical_status === "expired" || d.cert_19a_status === "expired");
    return result;
  }, [allDrivers, search, statusFilter, contractorFilter, certFilter]);

  // Stats
  const activeCount = allDrivers.filter(d => d.status === "active").length;
  const onLeaveCount = allDrivers.filter(d => d.status === "on_leave").length;
  const expiringCount = allDrivers.filter(d => d.cdl_status === "expiring_soon" || d.medical_status === "expiring_soon" || d.cert_19a_status === "expiring_soon").length;
  const expiredCount = allDrivers.filter(d => d.cdl_status === "expired" || d.medical_status === "expired" || d.cert_19a_status === "expired").length;
  const avgOnTime = allDrivers.length > 0 ? Math.round(allDrivers.reduce((s, d) => s + d.on_time_pct, 0) / allDrivers.length * 10) / 10 : 0;

  // Toggle KPI filter helpers
  const toggleStatus = (val: string) => {
    setStatusFilter(prev => prev === val ? "all" : val);
    setCertFilter("all");
  };
  const toggleCert = (val: string) => {
    setCertFilter(prev => prev === val ? "all" : val);
    setStatusFilter("all");
  };

  if (!isDemoMode) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <h2 className="text-lg font-semibold text-white mb-1">Driver Management</h2>
        <p>Connect your district to view driver data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Drivers</h1>
          <p className="text-sm text-slate-400">{allDrivers.length} drivers across {contractors.length} contractors</p>
        </div>
        <Button
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => exportToCsv("drivers-export", filtered.map(d => ({
            Name: d.name, Bus: d.bus_number, Contractor: d.contractor, Status: d.status,
            "CDL Expiry": d.cdl_expiry, "Medical Expiry": d.medical_expiry, "19-A Expiry": d.cert_19a_expiry,
            "On-Time %": d.on_time_pct, "Safety Incidents": d.safety_incidents,
          })))}
        >
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* KPI cards — clickable to filter */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:bg-slate-750 ${statusFilter === "active" ? "ring-2 ring-emerald-500/50 border-emerald-500/40" : ""}`}
          onClick={() => toggleStatus("active")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><UserCheck className="h-4 w-4" /> Active</div>
            <p className="text-2xl font-bold text-white">{activeCount}<span className="text-slate-400 text-base font-normal"> / {allDrivers.length}</span></p>
          </CardContent>
        </Card>
        <Card
          className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:bg-slate-750 ${statusFilter === "on_leave" ? "ring-2 ring-amber-500/50 border-amber-500/40" : ""}`}
          onClick={() => toggleStatus("on_leave")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Users className="h-4 w-4" /> On Leave</div>
            <p className="text-2xl font-bold text-amber-300">{onLeaveCount}</p>
          </CardContent>
        </Card>
        <Card
          className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:bg-slate-750 ${certFilter === "expiring" ? "ring-2 ring-amber-500/50 border-amber-500/40" : ""}`}
          onClick={() => toggleCert("expiring")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><AlertTriangle className="h-4 w-4" /> Certs Expiring</div>
            <p className="text-2xl font-bold text-amber-300">{expiringCount}</p>
          </CardContent>
        </Card>
        <Card
          className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:bg-slate-750 ${certFilter === "expired" ? "ring-2 ring-red-500/50 border-red-500/40" : ""}`}
          onClick={() => toggleCert("expired")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Shield className="h-4 w-4" /> Certs Expired</div>
            <p className="text-2xl font-bold text-red-400">{expiredCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><UserCheck className="h-4 w-4" /> Avg On-Time</div>
            <p className="text-2xl font-bold text-white">{avgOnTime}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search drivers, buses, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); }}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={contractorFilter} onValueChange={setContractorFilter}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="All Contractors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contractors</SelectItem>
              {contractors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={certFilter} onValueChange={setCertFilter}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="All Certs" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Certifications</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter indicator */}
      {(statusFilter !== "all" || certFilter !== "all") && (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Filtered:</span>
          {statusFilter !== "all" && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer" onClick={() => setStatusFilter("all")}>
              Status: {statusFilter.replace("_", " ")} ✕
            </Badge>
          )}
          {certFilter !== "all" && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer" onClick={() => setCertFilter("all")}>
              Certs: {certFilter} ✕
            </Badge>
          )}
          <span className="text-slate-500 text-sm">({filtered.length} results)</span>
        </div>
      )}

      {/* Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400">Driver</TableHead>
                <TableHead className="text-slate-400">Bus</TableHead>
                <TableHead className="text-slate-400">Contractor</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">CDL</TableHead>
                <TableHead className="text-slate-400">Medical</TableHead>
                <TableHead className="text-slate-400">19-A</TableHead>
                <TableHead className="text-slate-400">On-Time</TableHead>
                <TableHead className="text-slate-400" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell className="text-white font-medium">{d.name}</TableCell>
                  <TableCell className="text-slate-300">{d.bus_number}</TableCell>
                  <TableCell className="text-slate-300">{d.contractor}</TableCell>
                  <TableCell><Badge className={STATUS_STYLES[d.status]}>{d.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell><Badge className={CERT_STYLES[d.cdl_status]}>{d.cdl_status.replace("_", " ")}</Badge></TableCell>
                  <TableCell><Badge className={CERT_STYLES[d.medical_status]}>{d.medical_status.replace("_", " ")}</Badge></TableCell>
                  <TableCell><Badge className={CERT_STYLES[d.cert_19a_status]}>{d.cert_19a_status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className={`font-medium ${d.on_time_pct >= 95 ? "text-emerald-400" : d.on_time_pct >= 90 ? "text-amber-400" : "text-red-400"}`}>{d.on_time_pct}%</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setSelectedDriver(d)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="h-32 text-center text-slate-400">No drivers match your filters</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedDriver?.name}</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Bus Number</span><p className="font-medium">{selectedDriver.bus_number}</p></div>
                <div><span className="text-slate-400">Contractor</span><p className="font-medium">{selectedDriver.contractor}</p></div>
                <div><span className="text-slate-400">Phone</span><p className="font-medium">{selectedDriver.phone}</p></div>
                <div><span className="text-slate-400">Email</span><p className="font-medium text-xs break-all">{selectedDriver.email}</p></div>
                <div><span className="text-slate-400">Hire Date</span><p className="font-medium">{selectedDriver.hire_date}</p></div>
                <div><span className="text-slate-400">Status</span><p><Badge className={STATUS_STYLES[selectedDriver.status]}>{selectedDriver.status.replace("_", " ")}</Badge></p></div>
                <div><span className="text-slate-400">Routes Assigned</span><p className="font-medium">{selectedDriver.routes_assigned}</p></div>
                <div><span className="text-slate-400">Safety Incidents</span><p className="font-medium">{selectedDriver.safety_incidents}</p></div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-semibold mb-3 text-slate-300">Certifications</h4>
                <div className="space-y-2">
                  {[
                    { label: "CDL", expiry: selectedDriver.cdl_expiry, status: selectedDriver.cdl_status },
                    { label: "Medical Exam", expiry: selectedDriver.medical_expiry, status: selectedDriver.medical_status },
                    { label: "19-A Certification", expiry: selectedDriver.cert_19a_expiry, status: selectedDriver.cert_19a_status },
                  ].map(cert => (
                    <div key={cert.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{cert.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Exp: {cert.expiry}</span>
                        <Badge className={CERT_STYLES[cert.status]}>{cert.status.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
