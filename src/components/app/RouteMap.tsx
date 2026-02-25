import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
import { supabase } from "@/integrations/supabase/client";
import { useDistrict } from "@/contexts/DistrictContext";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface RouteStop {
  id: string;
  route_id: string;
  stop_name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  stop_order: number;
  students_boarding: number | null;
  students_alighting: number | null;
  scheduled_time: string | null;
}

interface RouteInfo {
  id: string;
  route_number: string;
  school: string;
  total_students: number | null;
  capacity: number | null;
  status: string;
}

const GRADE_COLORS: Record<string, string> = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#f97316",
  F: "#ef4444",
};

const getGrade = (students: number | null, capacity: number | null) => {
  const pct = capacity && capacity > 0 ? ((students ?? 0) / capacity) * 100 : 0;
  if (pct >= 80) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 30) return "D";
  return "F";
};

// District center coordinates
const DISTRICT_CENTERS: Record<string, [number, number]> = {
  default: [40.63, -73.68],
};

const RouteMap = () => {
  const { district } = useDistrict();
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [routesRes, stopsRes] = await Promise.all([
      supabase.from("routes").select("id, route_number, school, total_students, capacity, status"),
      supabase.from("route_stops").select("*").not("lat", "is", null).not("lng", "is", null).order("stop_order"),
    ]);
    setRoutes((routesRes.data as RouteInfo[]) ?? []);
    setStops((stopsRes.data as RouteStop[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const schools = useMemo(() => [...new Set(routes.map(r => r.school))].sort(), [routes]);

  const filteredRoutes = useMemo(() => {
    let r = routes;
    if (schoolFilter !== "all") r = r.filter(x => x.school === schoolFilter);
    if (selectedRoute !== "all") r = r.filter(x => x.id === selectedRoute);
    return r;
  }, [routes, schoolFilter, selectedRoute]);

  const routeIds = useMemo(() => new Set(filteredRoutes.map(r => r.id)), [filteredRoutes]);
  const filteredStops = useMemo(() => stops.filter(s => routeIds.has(s.route_id)), [stops, routeIds]);

  const routeMap = useMemo(() => {
    const m = new Map<string, RouteInfo>();
    routes.forEach(r => m.set(r.id, r));
    return m;
  }, [routes]);

  // Group stops by route for polylines
  const routePolylines = useMemo(() => {
    const grouped = new Map<string, RouteStop[]>();
    filteredStops.forEach(s => {
      if (!grouped.has(s.route_id)) grouped.set(s.route_id, []);
      grouped.get(s.route_id)!.push(s);
    });
    return Array.from(grouped.entries()).map(([routeId, stps]) => {
      const route = routeMap.get(routeId);
      const grade = route ? getGrade(route.total_students, route.capacity) : "F";
      const sorted = stps.sort((a, b) => a.stop_order - b.stop_order);
      const positions = sorted
        .filter(s => s.lat && s.lng)
        .map(s => [s.lat!, s.lng!] as [number, number]);
      return { routeId, grade, positions, routeNumber: route?.route_number ?? "?" };
    });
  }, [filteredStops, routeMap]);

  const center: [number, number] = DISTRICT_CENTERS.default;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={schoolFilter} onValueChange={v => { setSchoolFilter(v); setSelectedRoute("all"); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Schools" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Schools</SelectItem>
            {schools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedRoute} onValueChange={setSelectedRoute}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Routes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routes ({filteredRoutes.length})</SelectItem>
            {filteredRoutes.map(r => (
              <SelectItem key={r.id} value={r.id}>
                {r.route_number} — {r.school.slice(0, 20)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {filteredStops.length} stops on {filteredRoutes.length} routes
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs">
        {Object.entries(GRADE_COLORS).map(([grade, color]) => (
          <div key={grade} className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            Grade {grade}
          </div>
        ))}
      </div>

      {/* Map */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div style={{ height: 500 }}>
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Polylines */}
              {routePolylines.map(rp => (
                <Polyline
                  key={rp.routeId}
                  positions={rp.positions}
                  pathOptions={{ color: GRADE_COLORS[rp.grade] ?? "#888", weight: 3, opacity: 0.7 }}
                />
              ))}

              {/* Stop markers */}
              {filteredStops.map(stop => {
                const route = routeMap.get(stop.route_id);
                const grade = route ? getGrade(route.total_students, route.capacity) : "F";
                return (
                  <CircleMarker
                    key={stop.id}
                    center={[stop.lat!, stop.lng!]}
                    radius={6}
                    pathOptions={{
                      color: GRADE_COLORS[grade] ?? "#888",
                      fillColor: GRADE_COLORS[grade] ?? "#888",
                      fillOpacity: 0.8,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">{stop.stop_name}</p>
                        {stop.address && <p className="text-muted-foreground">{stop.address}</p>}
                        <p>Route: <strong>{route?.route_number}</strong></p>
                        <p>Stop #{stop.stop_order}</p>
                        {stop.scheduled_time && <p>Time: {stop.scheduled_time}</p>}
                        <p>Board: {stop.students_boarding ?? 0} | Alight: {stop.students_alighting ?? 0}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteMap;
