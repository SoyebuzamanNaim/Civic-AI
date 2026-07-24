-- Seed File: Initial Departments & Test Data

-- Insert Default City Departments
INSERT INTO departments (id, name, description, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Roads & Highways Department', 'Responsible for potholes, asphalt repair, and road safety infrastructure.', true),
  ('22222222-2222-2222-2222-222222222222', 'Street Lighting & Power', 'Handles broken streetlights, electrical pole hazards, and public lighting.', true),
  ('33333333-3333-3333-3333-333333333333', 'Water & Sewerage Authority', 'Manages water pipe leaks, drainage blockages, and sewage overflow.', true),
  ('44444444-4444-4444-4444-444444444444', 'Waste Management & Sanitation', 'Handles illegal garbage dumping, hazardous waste removal, and public sanitation.', true),
  ('55555555-5555-5555-5555-555555555555', 'General Public Works', 'Handles uncategorized civic infrastructure issues.', true)
ON CONFLICT (id) DO NOTHING;
