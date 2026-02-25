
DO $$
DECLARE
  v_oc uuid := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  v_lw uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  v_oc1 uuid := 'd0000001-0000-0000-0000-000000000001';
  v_oc2 uuid := 'd0000001-0000-0000-0000-000000000002';
  v_oc3 uuid := 'd0000001-0000-0000-0000-000000000003';
  v_lw1 uuid := 'c0000001-0000-0000-0000-000000000001';
  v_lw2 uuid := 'c0000001-0000-0000-0000-000000000002';
  v_lw3 uuid := 'c0000001-0000-0000-0000-000000000003';
  v_lw4 uuid := 'c0000001-0000-0000-0000-000000000006';
  v_pid uuid := 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  v_fn text[] := ARRAY['Liam','Emma','Noah','Olivia','Aiden','Ava','James','Sophia','Logan','Isabella','Lucas','Mia','Mason','Charlotte','Ethan','Amelia','Jack','Harper','Owen','Evelyn','Alexander','Abigail','Elijah','Emily','Benjamin','Elizabeth','William','Sofia','Henry','Ella','Sebastian','Grace','Daniel','Chloe','Matthew','Victoria','David','Riley','Joseph','Aria','Carter','Luna','Jayden','Zoe','Wyatt','Nora','Julian','Lily','Leo','Hannah','Luke','Addison','Gabriel','Eleanor','Samuel','Natalie','Nathan','Stella','Dylan','Leah'];
  v_ln text[] := ARRAY['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Collins','Stewart','Murphy','Cook','Rogers'];
  v_st text[] := ARRAY['Davison Ave','Oceanside Rd','Long Beach Rd','Lawson Blvd','Atlantic Ave','Merle Ave','Windsor Pkwy','Foxhurst Rd','Waukena Ave','Park Ave','Mott St','Lincoln Ave','Raymond Ave','Perkins Ave','Nassau Ave','Brower Ave','Hampton Rd','Marion St','Terrell Ave','Maple Dr'];
  v_sc text[] := ARRAY['Oceanside High School','Oceanside Middle School','School #1','School #2','School #3','School #4','School #5','School #6','Fulton Avenue School','Boardman Avenue School'];
  v_gr text[] := ARRAY['Pre-K','K','1','2','3','4','5','6','7','8','9','10','11','12'];
  v_rid uuid; v_regid uuid; i int; v_school text; v_status text;
BEGIN
  -- Oceanside students (~4929 more)
  FOR i IN 1..4929 LOOP
    v_school := v_sc[1+(i%10)];
    v_status := CASE WHEN i%20=0 THEN 'pending' WHEN i%50=0 THEN 'denied' WHEN i%30=0 THEN 'under_review' ELSE 'approved' END;
    INSERT INTO student_registrations (district_id,parent_user_id,student_name,grade,school,dob,address_line,city,zip,state,school_year,status,iep_flag,section_504_flag,mckinney_vento_flag,foster_care_flag,geocoded_lat,geocoded_lng,distance_to_school)
    VALUES (v_oc,v_pid,v_fn[1+(i%60)]||' '||v_ln[1+((i*7)%56)],v_gr[1+(i%14)],v_school,('2008-01-01'::date+(i%3650)*interval '1 day')::date,(10+(i%990))||' '||v_st[1+(i%20)],'Oceanside','11572','NY','2025-2026',v_status::registration_status,(i%15=0),(i%25=0),(i%200=0),(i%300=0),40.63+(random()*0.02),-73.62-(random()*0.04),0.5+(random()*3.0));
  END LOOP;
  UPDATE districts SET student_count=(SELECT count(*) FROM student_registrations WHERE district_id=v_oc) WHERE id=v_oc;

  -- Oceanside route stops (10 per route)
  FOR v_rid IN SELECT id FROM routes WHERE district_id=v_oc LOOP
    FOR i IN 1..10 LOOP
      INSERT INTO route_stops (district_id,route_id,stop_name,stop_order,address,lat,lng,scheduled_time,students_boarding,students_alighting,dwell_seconds)
      VALUES (v_oc,v_rid,'Stop '||i||' - '||v_st[1+((i*3)%20)],i,(100+i*10)||' '||v_st[1+((i*3)%20)]||', Oceanside NY',40.63+(random()*0.02),-73.62-(random()*0.04),('06:30'::time+(i*interval '4 minutes'))::time,1+(random()*4)::int,0,20+(random()*20)::int)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- Oceanside driver certs (25)
  INSERT INTO driver_certifications (district_id,driver_name,certification_type,issued_date,expiration_date,status,contractor_id) VALUES
    (v_oc,'James Wilson','cdl','2024-01-15','2027-01-15','valid',v_oc1),(v_oc,'Maria Santos','19a_initial','2024-03-01','2027-03-01','valid',v_oc1),
    (v_oc,'Robert Chen','cdl','2023-06-01','2026-06-01','valid',v_oc1),(v_oc,'Patricia Kim','19a_biennial','2024-05-15','2027-05-15','valid',v_oc1),
    (v_oc,'David Brown','cdl','2024-08-01','2027-08-01','valid',v_oc2),(v_oc,'Susan Lee','19a_initial','2023-09-01','2026-09-01','valid',v_oc2),
    (v_oc,'Michael Torres','medical','2024-04-01','2026-04-01','valid',v_oc2),(v_oc,'Lisa Garcia','cdl','2024-07-01','2027-07-01','valid',v_oc2),
    (v_oc,'John Murphy','19a_biennial','2024-02-01','2027-02-01','valid',v_oc3),(v_oc,'Jennifer Adams','cdl','2023-11-01','2026-11-01','valid',v_oc3),
    (v_oc,'Thomas Rivera','medical','2024-06-01','2026-06-01','valid',v_oc3),(v_oc,'Nancy Clark','19a_initial','2024-09-01','2027-09-01','valid',v_oc3),
    (v_oc,'Christopher Hall','cdl','2024-01-01','2027-01-01','valid',v_oc1),(v_oc,'Karen Young','medical','2024-10-01','2026-10-01','valid',v_oc1),
    (v_oc,'Daniel Wright','cdl','2024-04-15','2027-04-15','valid',v_oc2),(v_oc,'Margaret Scott','19a_biennial','2024-07-15','2027-07-15','valid',v_oc2),
    (v_oc,'Anthony Lopez','cdl','2024-11-01','2027-11-01','valid',v_oc3),(v_oc,'Sandra Hill','medical','2024-08-15','2026-08-15','valid',v_oc3),
    (v_oc,'Steven Green','cdl','2023-05-01','2026-03-15','expiring',v_oc1),(v_oc,'Dorothy Baker','19a_initial','2023-03-01','2026-03-10','expiring',v_oc2),
    (v_oc,'Mark Nelson','cdl','2023-02-01','2026-03-20','expiring',v_oc3),(v_oc,'Betty Carter','19a_biennial','2022-01-01','2025-12-01','expired',v_oc2),
    (v_oc,'Paul Roberts','medical','2022-06-01','2025-06-01','expired',v_oc3),(v_oc,'Helen Collins','medical','2024-12-01','2026-12-01','valid',v_oc1),
    (v_oc,'George Stewart','cdl','2024-03-01','2027-03-01','valid',v_oc2);

  -- Oceanside service requests (15)
  INSERT INTO service_requests (district_id,request_type,subject,description,priority,status) VALUES
    (v_oc,'stop_change','Move stop from Davison to Oceanside Rd','Construction blocking access','high','open'),
    (v_oc,'address_change','Student moved to 45 Windsor Pkwy','Family relocated','medium','in_progress'),
    (v_oc,'bus_pass','Replacement bus pass','Pass lost on field trip','low','resolved'),
    (v_oc,'general_inquiry','Route timing for School #3','AM pickup window','medium','open'),
    (v_oc,'driver_issue','Late pickup 3 days running','Bus 215 consistently late','urgent','open'),
    (v_oc,'stop_change','New stop at Marion & Atlantic','New development families','medium','in_progress'),
    (v_oc,'school_change','Transfer School #2 to #4','Mid-year change','medium','resolved'),
    (v_oc,'address_change','Temp address for custody','Alternating weeks','high','open'),
    (v_oc,'general_inquiry','Snow day procedures','Notification question','low','closed'),
    (v_oc,'bus_pass','New student needs pass','Out of district transfer','medium','in_progress'),
    (v_oc,'driver_issue','Bus driver speeding','Bus 208 on Long Beach Rd','urgent','in_progress'),
    (v_oc,'stop_change','Wheelchair accessible stop','IEP student needs','high','open'),
    (v_oc,'general_inquiry','Summer school transport','Routes available?','low','open'),
    (v_oc,'address_change','Moving to Nassau Ave','Effective March 1','medium','open'),
    (v_oc,'bus_pass','Sibling bus pass request','Two siblings same route','medium','resolved');

  -- Oceanside comms (10)
  INSERT INTO communication_log (district_id,contact_type,contact_name,direction,channel,subject,notes,logged_by) VALUES
    (v_oc,'parent','Maria Santos','inbound','phone','Bus pickup delay','Delay on OC-012',v_pid),
    (v_oc,'contractor','National Express Transit','outbound','email','Insurance renewal','Expiring in 30 days',v_pid),
    (v_oc,'school','Oceanside HS Principal','inbound','phone','Early dismissal change','Feb testing adjustment',v_pid),
    (v_oc,'parent','Robert Chen','inbound','email','Stop relocation','Safer stop location',v_pid),
    (v_oc,'contractor','Island Bus Corp','outbound','phone','Driver cert status','Expiring certs followup',v_pid),
    (v_oc,'parent','Lisa Garcia','outbound','text','Registration status','Approved notification',v_pid),
    (v_oc,'school','School #3 Office','inbound','in_person','IEP transport','Wheelchair needs',v_pid),
    (v_oc,'contractor','Coastal Transit LLC','inbound','email','Invoice discrepancy','Fuel surcharge',v_pid),
    (v_oc,'other_district','Hempstead UFSD','outbound','email','MV coordination','Cross-district transport',v_pid),
    (v_oc,'parent','John Murphy','inbound','phone','Bus pass replacement','Lost pass',v_pid);

  -- Oceanside bus passes (150)
  FOR v_regid IN SELECT id FROM student_registrations WHERE district_id=v_oc AND status='approved' LIMIT 150 LOOP
    INSERT INTO bus_passes (district_id,registration_id,pass_number,school_year,status)
    VALUES (v_oc,v_regid,'OC-'||lpad((random()*9999)::int::text,4,'0'),'2025-2026','active') ON CONFLICT DO NOTHING;
  END LOOP;

  -- Oceanside route aides (12) - using correct enum: aide/monitor
  INSERT INTO route_aides (district_id,route_id,aide_name,aide_type,certification,status)
  SELECT v_oc,id,
    (ARRAY['Sarah Mitchell','Rosa Hernandez','Tom Baker','Amy Chen','Mike Rivera','Diana Lopez','Chris Taylor','Nina Patel','Omar Syed','Kevin OBrien','Priya Sharma','Laura Kim'])[row_number() OVER()],
    CASE WHEN row_number() OVER()<=6 THEN 'monitor'::aide_type ELSE 'aide'::aide_type END,
    'CPR/First Aid','active'::aide_status
  FROM routes WHERE district_id=v_oc AND route_number LIKE 'OC-08%' LIMIT 12;

  -- Oceanside compliance training (8)
  INSERT INTO compliance_training (district_id,title,training_type,required_for,status,due_date,total_required,completed_count) VALUES
    (v_oc,'Annual Bus Safety','safety','all_drivers','completed','2025-10-01',30,30),
    (v_oc,'FERPA Refresher','privacy','all_staff','completed','2025-11-15',15,15),
    (v_oc,'Ed Law 2-d Compliance','privacy','admin_staff','in_progress','2026-01-31',8,5),
    (v_oc,'First Aid Cert','safety','route_aides','completed','2025-09-01',12,12),
    (v_oc,'Special Needs Transport','safety','sped_drivers','in_progress','2026-03-01',10,6),
    (v_oc,'Blood-borne Pathogens','safety','all_drivers','overdue','2025-12-15',30,18),
    (v_oc,'Anti-Bullying','conduct','all_staff','completed','2025-08-15',45,45),
    (v_oc,'Emergency Evac Drill','safety','all_drivers','overdue','2026-01-15',30,12);

  -- Oceanside breach
  INSERT INTO breach_incidents (contractor_id,incident_date,discovered_date,severity,status,description,students_affected,data_types_affected,remediation_steps)
  SELECT id,'2025-11-10','2025-11-12','medium','resolved','Unencrypted roster on laptop',45,'Names, addresses, schools','Laptop encrypted, staff retrained'
  FROM ed_law_2d_contractors WHERE district_id=v_oc AND contractor_name LIKE '%Coastal%' LIMIT 1;

  -- Lawrence MV students (6 more to reach 12+)
  INSERT INTO mckinney_vento_students (district_id,student_name,grade,school,living_situation,transportation_provided,status,current_address,school_of_origin,enrollment_date,liaison_contact) VALUES
    (v_lw,'Marcus Thompson','7','Lawrence Middle School','doubled_up',true,'active','89 Mott St, Lawrence NY','Lawrence Middle School','2025-09-01','Dr. Karen Levy'),
    (v_lw,'Jasmine Rodriguez','3','Number Three School','shelter',true,'active','Family Shelter, Inwood NY','Number Three School','2025-10-15','Dr. Karen Levy'),
    (v_lw,'David Kim','10','Lawrence High School','hotel_motel',false,'active','Comfort Inn, Far Rockaway NY','Lawrence High School','2025-11-01','Dr. Karen Levy'),
    (v_lw,'Aaliyah Jackson','1','Number Two School','doubled_up',true,'active','234 Central Ave, Lawrence NY','Number Two School','2025-09-15','Dr. Karen Levy'),
    (v_lw,'Carlos Mendez','5','Number Five School','shelter',false,'active','Nassau County Shelter, Hempstead NY','Number Five School','2025-12-01','Dr. Karen Levy'),
    (v_lw,'Sofia Petrov','8','Lawrence Middle School','unaccompanied',true,'active','56 Broadway, Lawrence NY','Lawrence Middle School','2025-08-20','Dr. Karen Levy');

  -- Lawrence expiring certs (4 more)
  INSERT INTO driver_certifications (district_id,driver_name,certification_type,issued_date,expiration_date,status,contractor_id) VALUES
    (v_lw,'Pedro Vasquez','19a_biennial','2023-03-15','2026-03-15','expiring',v_lw2),
    (v_lw,'Angela Foster','cdl','2023-03-20','2026-03-20','expiring',v_lw2),
    (v_lw,'Dennis Howard','medical','2023-03-25','2026-03-25','expiring',v_lw3),
    (v_lw,'Monica Price','19a_initial','2023-03-10','2026-03-10','expiring',v_lw1);

  -- Lawrence Logan declining perf
  INSERT INTO contractor_performance (district_id,contract_id,period_month,on_time_pct,routes_completed,routes_missed,complaints_count,safety_incidents) VALUES
    (v_lw,v_lw2,'2025-08-01',92.1,580,8,3,0),(v_lw,v_lw2,'2025-09-01',89.5,570,15,5,1),
    (v_lw,v_lw2,'2025-10-01',86.2,555,22,8,2),(v_lw,v_lw2,'2025-11-01',83.7,540,30,12,1),
    (v_lw,v_lw2,'2025-12-01',81.0,530,35,15,3),(v_lw,v_lw2,'2026-01-01',78.5,520,40,18,2);

  -- Lawrence invoice discrepancies (>$10K total)
  INSERT INTO contract_invoices (district_id,contract_id,invoice_number,invoice_date,invoiced_amount,verified_amount,discrepancy_amount,discrepancy_notes,status,gps_verified) VALUES
    (v_lw,v_lw2,'LB-2026-001','2026-01-15',145000,142500,2500,'Snow day routes billed','disputed',true),
    (v_lw,v_lw2,'LB-2026-002','2026-02-01',152000,149200,2800,'Fuel surcharge not in contract','pending',false),
    (v_lw,v_lw1,'AE-2026-003','2026-01-20',198000,195500,2500,'Mileage discrepancy','pending',true),
    (v_lw,v_lw3,'BS-2026-001','2026-02-05',87000,85500,1500,'Aide absent but billed','disputed',false),
    (v_lw,v_lw4,'PT-2026-001','2026-01-25',56000,55200,800,'Minor mileage variance','pending',true);

  -- Lawrence compliance training
  INSERT INTO compliance_training (district_id,title,training_type,required_for,status,due_date,total_required,completed_count) VALUES
    (v_lw,'Ed Law 2-d Annual Review','privacy','admin_staff','overdue','2025-12-31',12,7),
    (v_lw,'Bus Evacuation Drill Q1','safety','all_drivers','overdue','2026-01-31',45,28);

  -- Lawrence breach (Logan Bus)
  INSERT INTO breach_incidents (contractor_id,incident_date,discovered_date,severity,status,description,students_affected,data_types_affected,remediation_steps,notification_sent)
  SELECT id,'2026-01-05','2026-01-08','high','investigating','Employee shared roster via unsecured email',120,'Names, addresses, IEP status','Employee suspended, forensic review',false
  FROM ed_law_2d_contractors WHERE district_id=v_lw AND contractor_name='Logan Bus Company' LIMIT 1;

  -- Report alerts
  INSERT INTO report_alerts (alert_type,bus_number,report_count,details,acknowledged) VALUES
    ('recurring_complaint','OC-215',3,'Late arrival complaints',false),
    ('safety_pattern','OC-208',2,'Speeding reports',false),
    ('maintenance_flag','OC-301',1,'Check engine light',false),
    ('recurring_complaint','OC-112',2,'Stop change requests',true),
    ('safety_pattern','OC-045',1,'Near-miss at intersection',false);
END $$;
