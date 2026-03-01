import { useState, useEffect, useMemo } from "react";
import { useDistrict } from "@/contexts/DistrictContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode, type DemoDistrictId } from "@/contexts/DemoModeContext";
import { getDemoFieldTrips } from "@/lib/demoDataExtra";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Bus, AlertTriangle, CheckCircle2, Calendar, MapPin, Users, Clock,
  Trash2, Edit, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";

interface FieldTrip {
  id: string;
  trip_name: string;
  destination: string;
  school: string;
  grade_level: string | null;
  departure_date: string;
  departure_time: string;
  return_time: string;
  bus_number: string | null;
  driver_name: string | null;
  student_count: number;
  chaperone_count: number;
  status: string;
  notes: string | null;
  created_at: string;
}

interface Conflict {
  type: "bus" | "driver" | "calendar";
  message: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

const emptyForm = {
  trip_name: "", destination: "", school: "", grade_level: "",
  departure_date: "", departure_time: "08:00", return_time: "15:00",
  bus_number: "", driver_name: "", student_count: 0, chaperone_count: 0,
  notes: "", status: "pending",
};

const FieldTrips = () => {
  const { district } = useDistrict();
  const { user } = useAuth();
  const { isDemoMode, demoDistrictId } = useDemoMode();
  const [trips, setTrips] = useState<FieldTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [search, setSearch] = useState("");
  const [calMonth, setCalMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  const districtId = district?.id;

  // Fetch trips
  const fetchTrips = async () => {
    if (isDemoMode && demoDistrictId) {
      setTrips(getDemoFieldTrips(demoDistrictId as DemoDistrictId) as FieldTrip[]);
      setLoading(false);
      return;
    }
    if (!districtId) return;
    const { data } = await supabase
      .from("field_trips")
      .select("*")
      .eq("district_id", districtId)
      .order("departure_date", { ascending: true });
    setTrips((data as FieldTrip[]) ?? []);
    setLoading(false);
  };

  // Fetch calendar events for conflict checking
  const fetchCalendarEvents = async () => {
    if (isDemoMode) return;
    if (!districtId) return;
    const { data } = await supabase
      .from("school_calendar_events")
      .select("*")
      .eq("district_id", districtId);
    setCalendarEvents(data ?? []);
  };

  useEffect(() => {
    fetchTrips();
    fetchCalendarEvents();
  }, [districtId, isDemoMode, demoDistrictId]);

  // Conflict checker
  const checkConflicts = async () => {
    if (!form.departure_date || !districtId) return;
    setCheckingConflicts(true);
    const found: Conflict[] = [];

    // 1. Check calendar for no-school days / holidays
    const dayEvents = calendarEvents.filter(
      (e: any) => e.event_date === form.departure_date &&
        (e.event_type === "holiday" || e.event_type === "no_school")
    );
    dayEvents.forEach((e: any) => {
      found.push({ type: "calendar", message: `School calendar conflict: "${e.title}" — no school on this date.` });
    });

    // 2. Check schedule overrides (early dismissal / no transport)
    const { data: overrides } = await supabase
      .from("schedule_overrides")
      .select("*")
      .eq("district_id", districtId)
      .eq("override_date", form.departure_date);
    (overrides ?? []).forEach((o: any) => {
      if (o.no_transport) {
        found.push({ type: "calendar", message: `No transportation on this date — schedule override: "${o.reason}"` });
      } else {
        found.push({ type: "calendar", message: `Schedule override on this date: "${o.reason}" — verify timing.` });
      }
    });

    // 3. Check bus availability (same bus already assigned to another trip)
    if (form.bus_number) {
      const { data: busTrips } = await supabase
        .from("field_trips")
        .select("id, trip_name, departure_time, return_time")
        .eq("district_id", districtId)
        .eq("departure_date", form.departure_date)
        .eq("bus_number", form.bus_number)
        .neq("status", "cancelled");
      const otherBusTrips = (busTrips ?? []).filter((t: any) => t.id !== editingId);
      if (otherBusTrips.length > 0) {
        // Check time overlap
        otherBusTrips.forEach((t: any) => {
          if (form.departure_time < t.return_time && form.return_time > t.departure_time) {
            found.push({ type: "bus", message: `Bus ${form.bus_number} is already assigned to "${t.trip_name}" (${t.departure_time}–${t.return_time}).` });
          }
        });
      }

      // Check against regular routes using this bus
      const { data: routes } = await supabase
        .from("routes")
        .select("id, route_name, bus_number")
        .eq("district_id", districtId)
        .eq("bus_number", form.bus_number)
        .eq("status", "active");
      if ((routes ?? []).length > 0) {
        found.push({ type: "bus", message: `Bus ${form.bus_number} is assigned to ${routes!.length} active route(s). Confirm it's available for the field trip window.` });
      }
    }

    // 4. Check driver availability
    if (form.driver_name) {
      const { data: driverTrips } = await supabase
        .from("field_trips")
        .select("id, trip_name, departure_time, return_time")
        .eq("district_id", districtId)
        .eq("departure_date", form.departure_date)
        .eq("driver_name", form.driver_name)
        .neq("status", "cancelled");
      const otherDriverTrips = (driverTrips ?? []).filter((t: any) => t.id !== editingId);
      otherDriverTrips.forEach((t: any) => {
        if (form.departure_time < t.return_time && form.return_time > t.departure_time) {
          found.push({ type: "driver", message: `Driver "${form.driver_name}" is already assigned to "${t.trip_name}" (${t.departure_time}–${t.return_time}).` });
        }
      });
    }

    setConflicts(found);
    setCheckingConflicts(false);
  };

  // Auto-check conflicts when key fields change
  useEffect(() => {
    if (dialogOpen && form.departure_date) {
      const timer = setTimeout(checkConflicts, 300);
      return () => clearTimeout(timer);
    }
  }, [form.departure_date, form.bus_number, form.driver_name, form.departure_time, form.return_time, dialogOpen]);

  const saveTrip = async () => {
    if (!districtId || !form.trip_name || !form.destination || !form.school || !form.departure_date) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const payload = {
      district_id: districtId,
      trip_name: form.trip_name,
      destination: form.destination,
      school: form.school,
      grade_level: form.grade_level || null,
      departure_date: form.departure_date,
      departure_time: form.departure_time,
      return_time: form.return_time,
      bus_number: form.bus_number || null,
      driver_name: form.driver_name || null,
      student_count: form.student_count,
      chaperone_count: form.chaperone_count,
      notes: form.notes || null,
      status: form.status,
      created_by: user?.id ?? null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("field_trips").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("field_trips").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editingId ? "Trip updated" : "Trip scheduled" });
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setConflicts([]);
    fetchTrips();
  };

  const deleteTrip = async (id: string) => {
    await supabase.from("field_trips").delete().eq("id", id);
    toast({ title: "Trip deleted" });
    fetchTrips();
  };

  const openEdit = (trip: FieldTrip) => {
    setEditingId(trip.id);
    setForm({
      trip_name: trip.trip_name,
      destination: trip.destination,
      school: trip.school,
      grade_level: trip.grade_level ?? "",
      departure_date: trip.departure_date,
      departure_time: trip.departure_time,
      return_time: trip.return_time,
      bus_number: trip.bus_number ?? "",
      driver_name: trip.driver_name ?? "",
      student_count: trip.student_count,
      chaperone_count: trip.chaperone_count,
      notes: trip.notes ?? "",
      status: trip.status,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setConflicts([]);
    setDialogOpen(true);
  };

  // Calendar view helpers
  const calDays = eachDayOfInterval({ start: startOfMonth(calMonth), end: endOfMonth(calMonth) });
  const tripsOnDay = (day: Date) => trips.filter(t => isSameDay(parseISO(t.departure_date), day));
  const eventsOnDay = (day: Date) => calendarEvents.filter((e: any) => isSameDay(parseISO(e.event_date), day));

  const filteredTrips = trips.filter(t =>
    t.trip_name.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase()) ||
    t.school.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Field Trip Scheduling</h1>
          <p className="text-muted-foreground text-sm">Schedule trips with automated bus & driver conflict detection</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Schedule Trip</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filteredTrips.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No field trips scheduled yet.</CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {filteredTrips.map(trip => (
                <Card key={trip.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{trip.trip_name}</h3>
                          <Badge className={STATUS_COLORS[trip.status] ?? ""}>{trip.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{trip.destination}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(parseISO(trip.departure_date), "MMM d, yyyy")}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{trip.departure_time}–{trip.return_time}</span>
                          {trip.bus_number && <span className="flex items-center gap-1"><Bus className="h-3.5 w-3.5" />Bus {trip.bus_number}</span>}
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{trip.student_count} students</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{trip.school}{trip.grade_level ? ` • Grade ${trip.grade_level}` : ""}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(trip)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteTrip(trip.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CALENDAR VIEW */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setCalMonth(subMonths(calMonth, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <CardTitle className="text-lg">{format(calMonth, "MMMM yyyy")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setCalMonth(addMonths(calMonth, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {/* Leading empty cells */}
                {Array.from({ length: calDays[0].getDay() }).map((_, i) => (
                  <div key={`e-${i}`} className="bg-card min-h-[80px] p-1" />
                ))}
                {calDays.map(day => {
                  const dayTrips = tripsOnDay(day);
                  const dayEvents = eventsOnDay(day);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={day.toISOString()} className={`bg-card min-h-[80px] p-1 ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}>
                      <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</span>
                      <div className="space-y-0.5 mt-0.5">
                        {dayEvents.slice(0, 1).map((e: any) => (
                          <div key={e.id} className="text-[10px] px-1 rounded bg-destructive/10 text-destructive truncate">{e.title}</div>
                        ))}
                        {dayTrips.slice(0, 2).map(t => (
                          <div key={t.id} className="text-[10px] px-1 rounded bg-primary/10 text-primary truncate cursor-pointer" onClick={() => openEdit(t)}>
                            {t.trip_name}
                          </div>
                        ))}
                        {dayTrips.length > 2 && <div className="text-[10px] text-muted-foreground">+{dayTrips.length - 2} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SCHEDULE / EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) { setConflicts([]); setEditingId(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Field Trip" : "Schedule Field Trip"}</DialogTitle>
          </DialogHeader>

          {/* Conflicts banner */}
          {conflicts.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" /> {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""} Detected
              </div>
              {conflicts.map((c, i) => (
                <p key={i} className="text-xs text-destructive/80 flex items-start gap-1.5">
                  {c.type === "bus" ? <Bus className="h-3 w-3 mt-0.5 shrink-0" /> :
                   c.type === "driver" ? <Users className="h-3 w-3 mt-0.5 shrink-0" /> :
                   <Calendar className="h-3 w-3 mt-0.5 shrink-0" />}
                  {c.message}
                </p>
              ))}
            </div>
          )}
          {form.departure_date && conflicts.length === 0 && !checkingConflicts && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-2">
              <CheckCircle2 className="h-4 w-4" /> No conflicts detected
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Trip Name *</Label>
              <Input value={form.trip_name} onChange={e => setForm(f => ({ ...f, trip_name: e.target.value }))} placeholder="e.g. Museum of Natural History" />
            </div>
            <div className="sm:col-span-2">
              <Label>Destination *</Label>
              <Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Address or venue name" />
            </div>
            <div>
              <Label>School *</Label>
              <Input value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} />
            </div>
            <div>
              <Label>Grade Level</Label>
              <Input value={form.grade_level} onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))} placeholder="e.g. 3rd" />
            </div>
            <div>
              <Label>Departure Date *</Label>
              <Input type="date" value={form.departure_date} onChange={e => setForm(f => ({ ...f, departure_date: e.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Departure Time</Label>
              <Input type="time" value={form.departure_time} onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} />
            </div>
            <div>
              <Label>Return Time</Label>
              <Input type="time" value={form.return_time} onChange={e => setForm(f => ({ ...f, return_time: e.target.value }))} />
            </div>
            <div>
              <Label>Bus Number</Label>
              <Input value={form.bus_number} onChange={e => setForm(f => ({ ...f, bus_number: e.target.value }))} placeholder="e.g. 42" />
            </div>
            <div>
              <Label>Driver Name</Label>
              <Input value={form.driver_name} onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))} />
            </div>
            <div>
              <Label>Student Count</Label>
              <Input type="number" min={0} value={form.student_count} onChange={e => setForm(f => ({ ...f, student_count: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Chaperone Count</Label>
              <Input type="number" min={0} value={form.chaperone_count} onChange={e => setForm(f => ({ ...f, chaperone_count: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveTrip}>
              {conflicts.length > 0 ? "Save Anyway" : editingId ? "Update Trip" : "Schedule Trip"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldTrips;
