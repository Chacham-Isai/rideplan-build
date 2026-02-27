
-- ============================================================
-- SEED: Calendar events, field trips, and accident reports
-- for Lawrence UFSD and Oceanside UFSD demo districts
-- ============================================================

DO $$
DECLARE
  v_lw uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  v_oc uuid := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
BEGIN

  -- =============================================
  -- 1. SCHOOL CALENDAR EVENTS — Lawrence UFSD
  -- =============================================
  INSERT INTO school_calendar_events (district_id, title, event_date, end_date, event_type, applies_to, notes, school_year) VALUES
    (v_lw, 'Martin Luther King Jr. Day', '2026-01-19', NULL, 'legal_holiday', 'all', 'No school — federal holiday', '2025-2026'),
    (v_lw, 'Midwinter Recess', '2026-02-16', '2026-02-20', 'recess', 'all', 'Schools closed', '2025-2026'),
    (v_lw, 'Spring Recess', '2026-03-30', '2026-04-03', 'recess', 'all', NULL, '2025-2026'),
    (v_lw, 'Good Friday', '2026-04-03', NULL, 'religious_observance', 'all', 'Schools closed', '2025-2026'),
    (v_lw, 'Memorial Day', '2026-05-25', NULL, 'legal_holiday', 'all', 'No school — federal holiday', '2025-2026'),
    (v_lw, 'Last Day of School', '2026-06-26', NULL, 'custom', 'all', 'Early dismissal at 12:00 PM', '2025-2026'),
    (v_lw, 'Parent-Teacher Conferences (Elementary)', '2026-03-12', '2026-03-13', 'early_dismissal', 'elementary', 'Elementary students dismissed at 12:30 PM', '2025-2026'),
    (v_lw, 'Regents Exam Week', '2026-06-17', '2026-06-25', 'custom', 'secondary', 'Modified bus schedule for high school', '2025-2026'),
    (v_lw, 'Superintendent Conference Day', '2026-03-06', NULL, 'conference', 'all', 'No students — staff development', '2025-2026'),
    (v_lw, '2-Hour Delay — Inclement Weather Drill', '2026-03-10', NULL, 'delay', 'all', 'All buses delayed 2 hours', '2025-2026');

  -- =============================================
  -- 2. SCHOOL CALENDAR EVENTS — Oceanside UFSD
  -- =============================================
  INSERT INTO school_calendar_events (district_id, title, event_date, end_date, event_type, applies_to, notes, school_year) VALUES
    (v_oc, 'Martin Luther King Jr. Day', '2026-01-19', NULL, 'legal_holiday', 'all', 'Schools closed', '2025-2026'),
    (v_oc, 'Midwinter Recess', '2026-02-16', '2026-02-20', 'recess', 'all', NULL, '2025-2026'),
    (v_oc, 'Spring Recess', '2026-03-30', '2026-04-03', 'recess', 'all', NULL, '2025-2026'),
    (v_oc, 'Memorial Day', '2026-05-25', NULL, 'legal_holiday', 'all', 'No school', '2025-2026'),
    (v_oc, 'Last Day of School', '2026-06-24', NULL, 'custom', 'all', 'Half day — dismissal at noon', '2025-2026'),
    (v_oc, 'Superintendent Conference Day', '2026-04-07', NULL, 'conference', 'all', 'No students', '2025-2026'),
    (v_oc, 'Board of Education Meeting', '2026-03-17', NULL, 'custom', 'all', 'Evening meeting — no transport impact', '2025-2026'),
    (v_oc, 'Early Dismissal — Staff Development', '2026-05-08', NULL, 'early_dismissal', 'all', 'Students dismissed at 1:00 PM', '2025-2026');

  -- =============================================
  -- 3. FIELD TRIPS — Lawrence UFSD
  -- =============================================
  INSERT INTO field_trips (district_id, trip_name, destination, school, grade_level, departure_date, departure_time, return_time, bus_number, driver_name, student_count, chaperone_count, status, notes) VALUES
    (v_lw, 'Science Museum Visit', 'Long Island Science Center, Garden City', 'Number 2 School', '4', '2026-03-15', '09:00', '14:00', 'LW-12', 'Mike Torres', 28, 3, 'approved', 'Permission slips collected'),
    (v_lw, 'State Capitol Trip', 'NYS Capitol Building, Albany', 'Lawrence High School', '11', '2026-04-08', '07:00', '18:00', 'LW-05', 'Patricia Adams', 42, 5, 'approved', 'Overnight provision not needed — day trip'),
    (v_lw, 'Beach Cleanup Service Day', 'Atlantic Beach, NY', 'Lawrence Middle School', '7', '2026-05-12', '08:30', '13:30', 'LW-18', 'James Rivera', 35, 4, 'pending', 'Awaiting weather confirmation'),
    (v_lw, 'Spring Concert at Lincoln Center', 'Lincoln Center, Manhattan', 'Number 4 School', '5', '2026-05-20', '09:30', '15:30', NULL, NULL, 30, 3, 'pending', 'Needs bus assignment');

  -- =============================================
  -- 4. FIELD TRIPS — Oceanside UFSD
  -- =============================================
  INSERT INTO field_trips (district_id, trip_name, destination, school, grade_level, departure_date, departure_time, return_time, bus_number, driver_name, student_count, chaperone_count, status, notes) VALUES
    (v_oc, 'Cradle of Aviation Museum', 'Cradle of Aviation, Garden City', 'School #3', '3', '2026-03-20', '09:00', '14:00', 'OC-07', 'Robert Kim', 25, 3, 'approved', NULL),
    (v_oc, 'STEM Olympiad Regional', 'Hofstra University, Hempstead', 'Oceanside High School', '10', '2026-04-14', '07:30', '16:00', 'OC-01', 'Sarah Johnson', 18, 2, 'approved', 'Competition bus — early departure'),
    (v_oc, 'Nature Walk & Ecology Study', 'Hempstead Lake State Park', 'Fulton Avenue School', '2', '2026-05-06', '10:00', '13:00', 'OC-15', NULL, 22, 3, 'pending', 'Rain date: May 13');

  -- =============================================
  -- 5. ACCIDENT REPORTS — Lawrence UFSD
  -- =============================================
  INSERT INTO accident_reports (district_id, bus_number, incident_date, incident_time, location, description, severity, injuries_reported, police_report_number, driver_name, weather_conditions, road_conditions, status, students_on_bus) VALUES
    (v_lw, 'LW-09', '2025-11-14', '07:42', 'Broadway & Rockaway Tpke, Lawrence', 'Bus struck by vehicle running red light at intersection. Minor damage to front bumper.', 'minor', false, 'NC-2025-11847', 'David Martinez', 'Clear', 'Dry', 'closed', 18),
    (v_lw, 'LW-22', '2025-12-03', '15:10', 'Central Ave near School #5', 'Bus side-swiped parked car while avoiding double-parked delivery truck. Mirror damage only.', 'minor', false, NULL, 'Thomas Wright', 'Overcast', 'Wet', 'closed', 12),
    (v_lw, 'LW-15', '2026-01-28', '08:05', 'Causeway at Bay Blvd', 'Bus slid on black ice approaching stop sign. No collision, bus came to rest on shoulder.', 'moderate', false, 'NC-2026-00932', 'Patricia Adams', 'Snow', 'Icy', 'closed', 24),
    (v_lw, 'LW-03', '2026-02-19', '07:55', 'Washington Ave & Nassau Blvd', 'Rear-ended at traffic light. Two students complained of neck pain; transported to ER as precaution.', 'serious', true, 'NC-2026-01458', 'Mike Torres', 'Rain', 'Wet', 'under_review', 31);

  -- =============================================
  -- 6. ACCIDENT REPORTS — Oceanside UFSD
  -- =============================================
  INSERT INTO accident_reports (district_id, bus_number, incident_date, incident_time, location, description, severity, injuries_reported, police_report_number, driver_name, weather_conditions, road_conditions, status, students_on_bus) VALUES
    (v_oc, 'OC-11', '2025-10-22', '15:25', 'Long Beach Rd & Merle Ave', 'Fender bender in school dismissal traffic. No injuries.', 'minor', false, NULL, 'Robert Kim', 'Clear', 'Dry', 'closed', 15),
    (v_oc, 'OC-04', '2026-01-09', '07:50', 'Oceanside Rd near Boardman Ave School', 'Pedestrian ran into crosswalk; driver performed emergency stop. No contact. Student in last row hit seat.', 'moderate', true, 'NC-2026-00201', 'Sarah Johnson', 'Clear', 'Dry', 'closed', 22),
    (v_oc, 'OC-19', '2026-02-11', '08:15', 'Atlantic Ave & Davison Ave', 'Deer ran across road; driver swerved. Bus went over curb. Undercarriage inspected — minor damage.', 'minor', false, NULL, 'Anthony Harris', 'Foggy', 'Damp', 'open', 8);

END;
$$;
