-- Insert Sample Land
INSERT INTO lands (land_number, district, division, area, area_unit, map_reference)
VALUES ('L001', 'Colombo', 'Colombo 1', 10.00, 'Perches', 'M-101')
ON CONFLICT (land_number) DO NOTHING;

-- Insert Sample Owners
INSERT INTO owners (nic, full_name, address, contact_number)
VALUES 
    ('123456789V', 'John Doe', '123 Main St, Colombo', '0771234567'),
    ('200111800123', 'Nadun Daluwatta', 'Ukuwela, Matale', '0706036990')
ON CONFLICT (nic) DO NOTHING;

-- Insert Sample Deed
INSERT INTO deeds (deed_number, land_number, owner_nic, registration_date, deed_type, status)
VALUES ('D001', 'L001', '123456789V', CURRENT_DATE, 'Gift', 'ACTIVE')
ON CONFLICT (deed_number) DO NOTHING;

-- Insert Sample Audit Log
INSERT INTO audit_logs ("user", action, details)
VALUES ('System', 'CREATE', 'Initialized sample data');
