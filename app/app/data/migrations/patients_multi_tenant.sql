-- Migration: enforce per-user ownership for patients and appointments.

ALTER TABLE patients
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Backfill ownership from existing appointments when possible.
UPDATE patients p
SET user_id = owners.user_id
FROM (
  SELECT patient_id, MIN(user_id) AS user_id
  FROM appointments
  WHERE user_id IS NOT NULL
  GROUP BY patient_id
) owners
WHERE p.user_id IS NULL
  AND owners.patient_id = p.patient_id;

-- Fallback ownership for orphaned rows: assign to first existing user.
UPDATE patients
SET user_id = (SELECT id FROM users ORDER BY id ASC LIMIT 1)
WHERE user_id IS NULL;

ALTER TABLE patients
ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'patients_user_fk'
  ) THEN
    ALTER TABLE patients
    ADD CONSTRAINT patients_user_fk
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'patients_patient_user_unique'
  ) THEN
    ALTER TABLE patients
    ADD CONSTRAINT patients_patient_user_unique UNIQUE (patient_id, user_id);
  END IF;
END $$;

-- Remove inconsistent links where appointment user does not own referenced patient.
UPDATE appointments a
SET patient_id = NULL
WHERE a.patient_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM patients p
    WHERE p.patient_id = a.patient_id
      AND p.user_id = a.user_id
  );

ALTER TABLE appointments
ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appointments_patient_owner_fk'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_patient_owner_fk
      FOREIGN KEY (patient_id, user_id)
      REFERENCES patients(patient_id, user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
