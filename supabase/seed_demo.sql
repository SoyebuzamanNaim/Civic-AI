-- Deterministic Seed Dataset for Hackathon Judging Demo

-- 1. Severe Hospital Water Leak
SELECT create_citizen_report_transaction(
  'TRK-HOSP-9901',
  'Major active water pipe rupture right outside Central Hospital emergency entrance. Water flooding street and blocking ambulance access.',
  'water_leak'::issue_category,
  'Central Hospital Emergency Gate, 100 Health Ave',
  23.8103,
  90.4125,
  'Dr. Sarah Khan',
  'sarah.khan@hospital.org',
  '+8801711112222',
  true,
  'Active major water pipe rupture blocking emergency ambulance entrance.',
  'water_leak'::issue_category,
  0.98,
  'critical'::severity_level,
  95.00,
  'Critical active hazard directly threatening emergency hospital access and life safety.',
  'google-genai',
  'gemini-2.5-flash',
  'v1.0'
);

-- 2. Pothole on Main Road
SELECT create_citizen_report_transaction(
  'TRK-POTH-4402',
  'Deep 2-foot wide pothole on middle lane of Airport Expressway causing vehicle tire damage and severe evening traffic jams.',
  'pothole'::issue_category,
  'Airport Expressway, Mile 4 Marker',
  23.8500,
  90.4000,
  'Rahim Ahmed',
  'rahim@example.com',
  '+8801811113333',
  true,
  'Deep pothole causing vehicle damage and traffic congestion on main expressway.',
  'pothole'::issue_category,
  0.95,
  'high'::severity_level,
  78.00,
  'High traffic flow location with active vehicle damage hazard.',
  'google-genai',
  'gemini-2.5-flash',
  'v1.0'
);

-- 3. Duplicate Pair Example Report 1
SELECT create_citizen_report_transaction(
  'TRK-DUPL-001A',
  'Broken street light pole dangling dangerously near the children play park at Sector 7.',
  'broken_streetlight'::issue_category,
  'Sector 7 Community Park Gate',
  23.8700,
  90.3900,
  'Local Resident',
  'resident1@example.com',
  '+8801911114444',
  true,
  'Dangerous broken streetlight hanging near park gate.',
  'broken_streetlight'::issue_category,
  0.92,
  'high'::severity_level,
  75.00,
  'Hanging electrical fixture poses hazard near public park.',
  'google-genai',
  'gemini-2.5-flash',
  'v1.0'
);

-- 4. Duplicate Pair Example Report 2 (Submitted 10 minutes later near same location)
SELECT create_citizen_report_transaction(
  'TRK-DUPL-001B',
  'Streetlight fixture broken and dangling loose at Sector 7 park entrance.',
  'broken_streetlight'::issue_category,
  'Sector 7 Park Main Entrance',
  23.8702,
  90.3902,
  'Second Resident',
  'resident2@example.com',
  '+8801911115555',
  true,
  'Broken streetlight hanging near park entrance.',
  'broken_streetlight'::issue_category,
  0.92,
  'high'::severity_level,
  75.00,
  'Hanging electrical fixture poses hazard near public park.',
  'google-genai',
  'gemini-2.5-flash',
  'v1.0'
);
