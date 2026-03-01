import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode, type DemoDistrictId } from "@/contexts/DemoModeContext";
import { getDemoCalendarEvents, getDemoBellSchedules } from "@/lib/demoDataExtra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Bell,
  Trash2, Edit, Download, Loader2, AlertTriangle,
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, isWithinInterval, addDays,
} from "date-fns";
import { toast } from "sonner";

// ── Types ──
interface CalendarEvent {
  id: string;
  district_id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  event_type: string;
  applies_to: string;
  notes: string | null;
  dismissal_time: string | null;
  delay_minutes: number | null;
  school_year: string;
  created_by: string | null;
  created_at: string;
}

interface BellSchedule {
  id: string;
  district_id: string;
  school: string;
  schedule_name: string;
  am_start: string;
  am_end: string;
  pm_start: string;
  pm_end: string;
  is_default: boolean;
  school_year: string;
  created_at: string;
}

interface ScheduleOverride {
  id: string;
  district_id: string;
  calendar_event_id: string | null;
  school: string;
  override_date: string;
  bell_schedule_id: string | null;
  no_transport: boolean;
  notes: string | null;
  created_at: string;
}

const EVENT_TYPES = [
  { value: "legal_holiday", label: "Legal Holiday", color: "bg-red-500" },
  { value: "religious_observance", label: "Religious Observance", color: "bg-purple-500" },
  { value: "staff_development", label: "Staff Development", color: "bg-indigo-500" },
  { value: "early_dismissal", label: "Early Dismissal", color: "bg-orange-500" },
  { value: "delay", label: "Delay", color: "bg-amber-500" },
  { value: "cancellation", label: "Cancellation", color: "bg-red-600" },
  { value: "half_day", label: "Half Day", color: "bg-blue-500" },
  { value: "custom", label: "Custom", color: "bg-gray-500" },
];

const APPLIES_OPTIONS = ["all", "public_only", "non_public_only"];

const NO_SCHOOL_TYPES = ["legal_holiday", "religious_observance", "staff_development", "cancellation"];

// ── NY Holiday Seeder ──
function generateNYHolidays(schoolYear: string): Omit<CalendarEvent, "id" | "district_id" | "created_by" | "created_at">[] {
  const [startYr] = schoolYear.split("-").map(Number);
  const endYr = startYr + 1;
  return [
    { title: "Labor Day", event_date: getNthWeekday(startYr, 8, 1, 1), end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Columbus Day", event_date: getNthWeekday(startYr, 9, 1, 2), end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Veterans Day", event_date: `${startYr}-11-11`, end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Thanksgiving", event_date: getNthWeekday(startYr, 10, 4, 4), end_date: addDayStr(getNthWeekday(startYr, 10, 4, 4), 1), event_type: "legal_holiday", applies_to: "all", notes: "Thanksgiving + Day After", dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Christmas Day", event_date: `${startYr}-12-25`, end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "New Year's Day", event_date: `${endYr}-01-01`, end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Martin Luther King Jr. Day", event_date: getNthWeekday(endYr, 0, 1, 3), end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Presidents' Day", event_date: getNthWeekday(endYr, 1, 1, 3), end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Memorial Day", event_date: getLastWeekday(endYr, 4, 1), end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Juneteenth", event_date: `${endYr}-06-19`, end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Independence Day", event_date: `${endYr}-07-04`, end_date: null, event_type: "legal_holiday", applies_to: "all", notes: null, dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    // Religious observances for non-public
    { title: "Rosh Hashanah", event_date: `${startYr}-10-02`, end_date: `${startYr}-10-04`, event_type: "religious_observance", applies_to: "non_public_only", notes: "Dates approximate — adjust per actual Hebrew calendar", dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Yom Kippur", event_date: `${startYr}-10-11`, end_date: null, event_type: "religious_observance", applies_to: "non_public_only", notes: "Dates approximate", dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Good Friday", event_date: `${endYr}-04-18`, end_date: null, event_type: "religious_observance", applies_to: "non_public_only", notes: "Dates approximate", dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    // Staff development days
    { title: "Superintendent's Conference Day", event_date: `${startYr}-11-07`, end_date: null, event_type: "staff_development", applies_to: "all", notes: "No students — professional development", dismissal_time: null, delay_minutes: null, school_year: schoolYear },
    { title: "Staff Development Day", event_date: `${endYr}-03-14`, end_date: null, event_type: "staff_development", applies_to: "all", notes: "No students", dismissal_time: null, delay_minutes: null, school_year: schoolYear },
  ];
}

function getNthWeekday(year: number, month: number, weekday: number, n: number): string {
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;
    if (date.getDay() === weekday) { count++; if (count === n) return format(date, "yyyy-MM-dd"); }
  }
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

function getLastWeekday(year: number, month: number, weekday: number): string {
  const last = new Date(year, month + 1, 0);
  for (let d = last.getDate(); d >= 1; d--) {
    const date = new Date(year, month, d);
    if (date.getDay() === weekday) return format(date, "yyyy-MM-dd");
  }
  return format(last, "yyyy-MM-dd");
}

function addDayStr(dateStr: string, days: number): string {
  return format(addDays(parseISO(dateStr), days), "yyyy-MM-dd");
}

function getEventColor(type: string) {
  return EVENT_TYPES.find(t => t.value === type)?.color ?? "bg-gray-500";
}

// ── Main Component ──
const SchoolCalendar = () => {
  const { district, isAdmin } = useDistrict();
  const { user } = useAuth();
  const { isDemoMode, demoDistrictId } = useDemoMode();
  const [activeTab, setActiveTab] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bellSchedules, setBellSchedules] = useState<BellSchedule[]>([]);
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showBellDialog, setShowBellDialog] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingBell, setEditingBell] = useState<BellSchedule | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Form state for events
  const [eventForm, setEventForm] = useState({
    title: "", event_date: "", end_date: "", event_type: "custom",
    applies_to: "all", notes: "", dismissal_time: "", delay_minutes: "",
    school_year: "2025-2026",
  });

  // Form state for bell schedules
  const [bellForm, setBellForm] = useState({
    school: "", schedule_name: "", am_start: "07:30", am_end: "08:30",
    pm_start: "14:30", pm_end: "15:30", is_default: false, school_year: "2025-2026",
  });

  // Form state for overrides
  const [overrideForm, setOverrideForm] = useState({
    school: "", override_date: "", bell_schedule_id: "", calendar_event_id: "",
    no_transport: false, notes: "",
  });

  const fetchAll = useCallback(async () => {
    if (isDemoMode && demoDistrictId) {
      setEvents(getDemoCalendarEvents(demoDistrictId as DemoDistrictId) as any);
      setBellSchedules(getDemoBellSchedules(demoDistrictId as DemoDistrictId) as any);
      setOverrides([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [evRes, bsRes, ovRes] = await Promise.all([
      supabase.from("school_calendar_events").select("*").order("event_date"),
      supabase.from("bell_schedules").select("*").order("school"),
      supabase.from("schedule_overrides").select("*").order("override_date"),
    ]);
    setEvents((evRes.data as CalendarEvent[]) ?? []);
    setBellSchedules((bsRes.data as BellSchedule[]) ?? []);
    setOverrides((ovRes.data as ScheduleOverride[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day: Date) => events.filter(ev => {
    const start = parseISO(ev.event_date);
    const end = ev.end_date ? parseISO(ev.end_date) : start;
    return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
  });

  const getDayBg = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.some(e => NO_SCHOOL_TYPES.includes(e.event_type))) return "bg-red-50 dark:bg-red-950/30";
    if (dayEvents.some(e => e.event_type === "early_dismissal" || e.event_type === "delay")) return "bg-orange-50 dark:bg-orange-950/30";
    if (dayEvents.some(e => e.event_type === "half_day")) return "bg-blue-50 dark:bg-blue-950/30";
    return "";
  };

  const upcomingEvents = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return events.filter(e => e.event_date >= today).slice(0, 8);
  }, [events]);

  // ── Event CRUD ──
  const openAddEvent = (date?: Date) => {
    setEditingEvent(null);
    setEventForm({
      title: "", event_date: date ? format(date, "yyyy-MM-dd") : "",
      end_date: "", event_type: "custom", applies_to: "all", notes: "",
      dismissal_time: "", delay_minutes: "", school_year: "2025-2026",
    });
    setShowEventDialog(true);
  };

  const openEditEvent = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title, event_date: ev.event_date, end_date: ev.end_date ?? "",
      event_type: ev.event_type, applies_to: ev.applies_to, notes: ev.notes ?? "",
      dismissal_time: ev.dismissal_time ?? "", delay_minutes: ev.delay_minutes?.toString() ?? "",
      school_year: ev.school_year,
    });
    setShowEventDialog(true);
  };

  const saveEvent = async () => {
    if (!district || !user) return;
    setSaving(true);
    const payload: any = {
      district_id: district.id,
      title: eventForm.title,
      event_date: eventForm.event_date,
      end_date: eventForm.end_date || null,
      event_type: eventForm.event_type,
      applies_to: eventForm.applies_to,
      notes: eventForm.notes || null,
      dismissal_time: eventForm.dismissal_time || null,
      delay_minutes: eventForm.delay_minutes ? parseInt(eventForm.delay_minutes) : null,
      school_year: eventForm.school_year,
      created_by: user.id,
    };
    if (editingEvent) {
      const { error } = await supabase.from("school_calendar_events").update(payload).eq("id", editingEvent.id);
      if (error) toast.error(error.message); else toast.success("Event updated");
    } else {
      const { error } = await supabase.from("school_calendar_events").insert(payload);
      if (error) toast.error(error.message); else toast.success("Event created");
    }
    setSaving(false);
    setShowEventDialog(false);
    fetchAll();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("school_calendar_events").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Event deleted"); fetchAll(); }
  };

  // ── Seed Holidays ──
  const seedHolidays = async () => {
    if (!district || !user) return;
    setSeeding(true);
    const holidays = generateNYHolidays("2025-2026");
    const rows = holidays.map(h => ({ ...h, district_id: district.id, created_by: user.id }));
    const { error } = await supabase.from("school_calendar_events").insert(rows);
    if (error) toast.error(error.message); else toast.success(`Seeded ${rows.length} calendar events`);
    setSeeding(false);
    fetchAll();
  };

  // ── Bell Schedule CRUD ──
  const openAddBell = () => {
    setEditingBell(null);
    setBellForm({ school: "", schedule_name: "", am_start: "07:30", am_end: "08:30", pm_start: "14:30", pm_end: "15:30", is_default: false, school_year: "2025-2026" });
    setShowBellDialog(true);
  };

  const openEditBell = (bs: BellSchedule) => {
    setEditingBell(bs);
    setBellForm({ school: bs.school, schedule_name: bs.schedule_name, am_start: bs.am_start, am_end: bs.am_end, pm_start: bs.pm_start, pm_end: bs.pm_end, is_default: bs.is_default, school_year: bs.school_year });
    setShowBellDialog(true);
  };

  const saveBellSchedule = async () => {
    if (!district) return;
    setSaving(true);
    const payload: any = { district_id: district.id, ...bellForm };
    if (editingBell) {
      const { error } = await supabase.from("bell_schedules").update(payload).eq("id", editingBell.id);
      if (error) toast.error(error.message); else toast.success("Bell schedule updated");
    } else {
      const { error } = await supabase.from("bell_schedules").insert(payload);
      if (error) toast.error(error.message); else toast.success("Bell schedule created");
    }
    setSaving(false);
    setShowBellDialog(false);
    fetchAll();
  };

  const deleteBellSchedule = async (id: string) => {
    const { error } = await supabase.from("bell_schedules").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); fetchAll(); }
  };

  // ── Auto-notify parents when override is created ──
  const notifyParentsForOverride = async (school: string, overrideDate: string, notes: string | null, noTransport: boolean, bellScheduleId: string | null) => {
    if (!district) return;
    const linkedBell = bellScheduleId ? bellSchedules.find(b => b.id === bellScheduleId) : null;
    const dateLabel = format(parseISO(overrideDate), "EEEE, MMMM d, yyyy");
    let title = "Schedule Change";
    let message = "";

    if (noTransport) {
      title = "No Transportation";
      message = `There will be no bus service for ${school} on ${dateLabel}.`;
    } else if (linkedBell?.schedule_name?.toLowerCase().includes("delay")) {
      title = "Weather Delay";
      message = `${school} will operate on a delayed schedule (${linkedBell.schedule_name}) on ${dateLabel}. Buses will run starting at ${linkedBell.am_start || "TBD"}.`;
    } else if (linkedBell?.schedule_name?.toLowerCase().includes("half") || linkedBell?.schedule_name?.toLowerCase().includes("early")) {
      title = "Early Dismissal";
      message = `${school} will have early dismissal on ${dateLabel}. Dismissal at ${linkedBell.pm_end || "12:00"}.`;
    } else {
      title = "Schedule Override";
      message = `${school} has a schedule change on ${dateLabel}.${linkedBell ? ` Operating on "${linkedBell.schedule_name}" schedule.` : ""}`;
    }
    if (notes) message += ` Note: ${notes}`;

    const { data: students } = await supabase.from("student_registrations")
      .select("parent_user_id").eq("school", school).eq("status", "approved");
    if (!students || students.length === 0) return;

    const parentIds = [...new Set(students.map(s => s.parent_user_id))];
    const rows = parentIds.map(uid => ({
      district_id: district.id, user_id: uid, title, message,
      type: noTransport ? "warning" : "info", category: "calendar", link: "/app/calendar",
    }));
    for (let i = 0; i < rows.length; i += 100) {
      await supabase.from("notifications").insert(rows.slice(i, i + 100) as any);
    }
    toast.success(`Notified ${parentIds.length} families about the schedule change`);
  };

  // ── Override CRUD ──
  const saveOverride = async () => {
    if (!district) return;
    setSaving(true);
    const payload: any = {
      district_id: district.id,
      school: overrideForm.school,
      override_date: overrideForm.override_date,
      bell_schedule_id: overrideForm.bell_schedule_id || null,
      calendar_event_id: overrideForm.calendar_event_id || null,
      no_transport: overrideForm.no_transport,
      notes: overrideForm.notes || null,
    };
    const { error } = await supabase.from("schedule_overrides").insert(payload);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Override created");
      await notifyParentsForOverride(
        overrideForm.school, overrideForm.override_date,
        overrideForm.notes || null, overrideForm.no_transport,
        overrideForm.bell_schedule_id || null,
      );
    }
    setSaving(false);
    setShowOverrideDialog(false);
    fetchAll();
  };

  const deleteOverride = async (id: string) => {
    const { error } = await supabase.from("schedule_overrides").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); fetchAll(); }
  };

  // ── Unique schools from routes (bell schedules) ──
  const schools = useMemo(() => [...new Set(bellSchedules.map(b => b.school))].sort(), [bellSchedules]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">School Calendar</h1>
          <p className="text-sm text-muted-foreground">{events.length} events · {bellSchedules.length} bell schedules · {overrides.length} overrides</p>
        </div>
        <div className="flex gap-2">
          {events.length === 0 && (
            <Button variant="outline" size="sm" onClick={seedHolidays} disabled={seeding}>
              {seeding ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              Import NY Holidays
            </Button>
          )}
          <Button size="sm" onClick={() => openAddEvent()}>
            <Plus className="h-4 w-4 mr-1" /> Add Event
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar"><CalendarIcon className="h-4 w-4 mr-1" /> Calendar</TabsTrigger>
          <TabsTrigger value="bells"><Clock className="h-4 w-4 mr-1" /> Bell Schedules</TabsTrigger>
          <TabsTrigger value="overrides"><Bell className="h-4 w-4 mr-1" /> Schedule Overrides</TabsTrigger>
        </TabsList>

        {/* ── Calendar Tab ── */}
        <TabsContent value="calendar">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Calendar Grid */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy")}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-px">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} className="p-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
                  ))}
                  {calDays.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const bg = getDayBg(day);
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => { setSelectedDate(day); if (dayEvents.length === 0) openAddEvent(day); }}
                        className={`min-h-[72px] rounded-md p-1 text-left transition-all hover:ring-1 hover:ring-primary/40 ${
                          !isSameMonth(day, currentMonth) ? "opacity-30" : ""
                        } ${isToday(day) ? "ring-2 ring-primary" : ""} ${bg}`}
                      >
                        <span className={`text-xs font-medium ${isToday(day) ? "text-primary font-bold" : "text-foreground"}`}>
                          {format(day, "d")}
                        </span>
                        <div className="mt-0.5 space-y-0.5">
                          {dayEvents.slice(0, 2).map(ev => (
                            <div
                              key={ev.id}
                              className={`truncate rounded px-1 py-0.5 text-[10px] font-medium text-white ${getEventColor(ev.event_type)}`}
                              title={ev.title}
                              onClick={(e) => { e.stopPropagation(); openEditEvent(ev); }}
                            >
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {EVENT_TYPES.map(t => (
                    <div key={t.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className={`h-2.5 w-2.5 rounded-full ${t.color}`} />
                      {t.label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events Sidebar */}
            <div className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcomingEvents.length === 0 && (
                    <p className="text-xs text-muted-foreground">No upcoming events</p>
                  )}
                  {upcomingEvents.map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => openEditEvent(ev)}
                      className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className={`mt-0.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${getEventColor(ev.event_type)}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(ev.event_date), "MMM d, yyyy")}
                          {ev.end_date && ` – ${format(parseISO(ev.end_date), "MMM d")}`}
                        </p>
                        {ev.applies_to !== "all" && (
                          <Badge variant="outline" className="mt-1 text-[10px]">{ev.applies_to.replace(/_/g, " ")}</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Today's overrides */}
              {overrides.filter(o => o.override_date === format(new Date(), "yyyy-MM-dd")).length > 0 && (
                <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <h3 className="text-sm font-semibold">Today's Schedule Changes</h3>
                    </div>
                    {overrides.filter(o => o.override_date === format(new Date(), "yyyy-MM-dd")).map(o => (
                      <div key={o.id} className="text-xs text-muted-foreground">
                        {o.school}: {o.no_transport ? "No Transport" : "Modified Schedule"}
                        {o.notes && ` — ${o.notes}`}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Bell Schedules Tab ── */}
        <TabsContent value="bells">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Bell Schedules</CardTitle>
              <Button size="sm" onClick={openAddBell}><Plus className="h-4 w-4 mr-1" /> Add Schedule</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>AM Start</TableHead>
                    <TableHead>AM End</TableHead>
                    <TableHead>PM Start</TableHead>
                    <TableHead>PM End</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bellSchedules.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No bell schedules yet</TableCell></TableRow>
                  )}
                  {bellSchedules.map(bs => (
                    <TableRow key={bs.id}>
                      <TableCell className="font-medium">{bs.school}</TableCell>
                      <TableCell>{bs.schedule_name}</TableCell>
                      <TableCell>{bs.am_start}</TableCell>
                      <TableCell>{bs.am_end}</TableCell>
                      <TableCell>{bs.pm_start}</TableCell>
                      <TableCell>{bs.pm_end}</TableCell>
                      <TableCell>{bs.is_default ? <Badge variant="secondary">Default</Badge> : "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBell(bs)}><Edit className="h-3.5 w-3.5" /></Button>
                          {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBellSchedule(bs.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Schedule Overrides Tab ── */}
        <TabsContent value="overrides">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Schedule Overrides</CardTitle>
              <Button size="sm" onClick={() => {
                setOverrideForm({ school: "", override_date: "", bell_schedule_id: "", calendar_event_id: "", no_transport: false, notes: "" });
                setShowOverrideDialog(true);
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Override
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Bell Schedule</TableHead>
                    <TableHead>No Transport</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overrides.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No overrides yet</TableCell></TableRow>
                  )}
                  {overrides.map(ov => {
                    const bs = bellSchedules.find(b => b.id === ov.bell_schedule_id);
                    return (
                      <TableRow key={ov.id}>
                        <TableCell className="font-medium">{format(parseISO(ov.override_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{ov.school}</TableCell>
                        <TableCell>{bs ? bs.schedule_name : "—"}</TableCell>
                        <TableCell>{ov.no_transport ? <Badge variant="destructive" className="text-xs">No Buses</Badge> : "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{ov.notes ?? "—"}</TableCell>
                        <TableCell>
                          {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteOverride(ov.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Add/Edit Event Dialog ── */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add Calendar Event"}</DialogTitle>
            <DialogDescription>Add holidays, schedule changes, or custom events.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Martin Luther King Jr. Day" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} />
              </div>
              <div>
                <Label>End Date (optional)</Label>
                <Input type="date" value={eventForm.end_date} onChange={e => setEventForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Event Type</Label>
                <Select value={eventForm.event_type} onValueChange={v => setEventForm(f => ({ ...f, event_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Applies To</Label>
                <Select value={eventForm.applies_to} onValueChange={v => setEventForm(f => ({ ...f, applies_to: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPLIES_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {eventForm.event_type === "early_dismissal" && (
              <div>
                <Label>Dismissal Time</Label>
                <Input type="time" value={eventForm.dismissal_time} onChange={e => setEventForm(f => ({ ...f, dismissal_time: e.target.value }))} />
              </div>
            )}
            {eventForm.event_type === "delay" && (
              <div>
                <Label>Delay (minutes)</Label>
                <Input type="number" value={eventForm.delay_minutes} onChange={e => setEventForm(f => ({ ...f, delay_minutes: e.target.value }))} placeholder="120" />
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea value={eventForm.notes} onChange={e => setEventForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            {editingEvent && isAdmin && (
              <Button variant="destructive" size="sm" onClick={() => { deleteEvent(editingEvent.id); setShowEventDialog(false); }}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <Button onClick={saveEvent} disabled={saving || !eventForm.title || !eventForm.event_date}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingEvent ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bell Schedule Dialog ── */}
      <Dialog open={showBellDialog} onOpenChange={setShowBellDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBell ? "Edit Bell Schedule" : "Add Bell Schedule"}</DialogTitle>
            <DialogDescription>Define AM/PM start and end times for a school.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>School</Label>
              <Input value={bellForm.school} onChange={e => setBellForm(f => ({ ...f, school: e.target.value }))} placeholder="e.g. Lawrence High School" />
            </div>
            <div>
              <Label>Schedule Name</Label>
              <Input value={bellForm.schedule_name} onChange={e => setBellForm(f => ({ ...f, schedule_name: e.target.value }))} placeholder="e.g. Regular, Half Day" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>AM Start</Label><Input type="time" value={bellForm.am_start} onChange={e => setBellForm(f => ({ ...f, am_start: e.target.value }))} /></div>
              <div><Label>AM End</Label><Input type="time" value={bellForm.am_end} onChange={e => setBellForm(f => ({ ...f, am_end: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>PM Start</Label><Input type="time" value={bellForm.pm_start} onChange={e => setBellForm(f => ({ ...f, pm_start: e.target.value }))} /></div>
              <div><Label>PM End</Label><Input type="time" value={bellForm.pm_end} onChange={e => setBellForm(f => ({ ...f, pm_end: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={bellForm.is_default} onCheckedChange={v => setBellForm(f => ({ ...f, is_default: !!v }))} />
              <Label>Default schedule for this school</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveBellSchedule} disabled={saving || !bellForm.school || !bellForm.schedule_name}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingBell ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Override Dialog ── */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Schedule Override</DialogTitle>
            <DialogDescription>Override bell schedule for a specific date and school.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>School</Label>
              <Input value={overrideForm.school} onChange={e => setOverrideForm(f => ({ ...f, school: e.target.value }))} placeholder="e.g. Lawrence HS" />
            </div>
            <div>
              <Label>Override Date</Label>
              <Input type="date" value={overrideForm.override_date} onChange={e => setOverrideForm(f => ({ ...f, override_date: e.target.value }))} />
            </div>
            <div>
              <Label>Bell Schedule (optional)</Label>
              <Select value={overrideForm.bell_schedule_id} onValueChange={v => setOverrideForm(f => ({ ...f, bell_schedule_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select schedule..." /></SelectTrigger>
                <SelectContent>
                  {bellSchedules.map(bs => <SelectItem key={bs.id} value={bs.id}>{bs.school} — {bs.schedule_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Linked Calendar Event (optional)</Label>
              <Select value={overrideForm.calendar_event_id} onValueChange={v => setOverrideForm(f => ({ ...f, calendar_event_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select event..." /></SelectTrigger>
                <SelectContent>
                  {events.map(ev => <SelectItem key={ev.id} value={ev.id}>{ev.title} ({ev.event_date})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={overrideForm.no_transport} onCheckedChange={v => setOverrideForm(f => ({ ...f, no_transport: !!v }))} />
              <Label>No Transportation (buses don't run)</Label>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={overrideForm.notes} onChange={e => setOverrideForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveOverride} disabled={saving || !overrideForm.school || !overrideForm.override_date}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Create Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolCalendar;
