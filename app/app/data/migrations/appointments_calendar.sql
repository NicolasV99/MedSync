-- Migration: add columns required for appointments API and Google Calendar sync
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS end_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255);

-- Backfill title for existing rows to keep API response consistent.
UPDATE appointments
SET title = 'General Consultation'
WHERE title IS NULL;

-- Backfill end_datetime based on start datetime when missing.
UPDATE appointments
SET end_datetime = datetime + INTERVAL '30 minutes'
WHERE end_datetime IS NULL;

-- Keep title non-null once backfill is complete.
ALTER TABLE appointments
ALTER COLUMN title SET NOT NULL;
