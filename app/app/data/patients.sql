-- Table patients
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    patient_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    last_visit DATE,
    notes TEXT
);

INSERT INTO patients (patient_id, user_id, patient_name, dob, phone, email, last_visit, notes)
VALUES
    (1, 2, 'Maria Gonzalez', '1988-04-12', '+1-555-0101', 'maria.gonzalez@medsync.com', '2026-05-10', 'Paciente con seguimiento trimestral.'),
    (2, 2, 'Juan Perez', '1979-11-03', '+1-555-0102', 'juan.perez@medsync.com', '2026-05-08', 'Control de hipertension.'),
    (3, 2, 'Ana Rodriguez', '1993-07-21', '+1-555-0103', 'ana.rodriguez@medsync.com', '2026-05-15', 'Primera consulta general.'),
    (4, 3, 'Carlos Ramirez', '1965-02-09', '+1-555-0104', 'carlos.ramirez@medsync.com', '2026-04-29', 'Requiere recordatorios por WhatsApp.'),
    (5, 3, 'Lucia Fernandez', '2001-09-17', '+1-555-0105', 'lucia.fernandez@medsync.com', '2026-05-12', 'Alergia reportada a penicilina.');

-- Show all patients
SELECT * FROM patients;

-- Show all users
SELECT id, first_name, last_name, email, role, created_at
FROM users;

-- Show patients with owner user name
SELECT
    p.patient_id,
    p.patient_name,
    p.email,
    p.phone,
    p.last_visit,
    u.first_name || ' ' || u.last_name AS assigned_user
FROM patients p
LEFT JOIN users u ON u.id = p.user_id
ORDER BY p.patient_id;

-- Show appointments with patient and user
SELECT
    a.id,
    p.patient_name AS patient_name,
    u.first_name || ' ' || u.last_name AS user_name,
    a.datetime,
    a.status,
    a.notes
FROM appointments a
JOIN patients p ON p.patient_id = a.patient_id
JOIN users u ON u.id = a.user_id
ORDER BY a.datetime DESC;