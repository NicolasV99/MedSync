-- Table appointments
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(patient_id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL DEFAULT 'General Consultation',
    datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    google_event_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT now(),
        CONSTRAINT appointments_patient_owner_fk
            FOREIGN KEY (patient_id, user_id)
            REFERENCES patients(patient_id, user_id)
);