-- Table google_calendar_tokens
CREATE TABLE google_calendar_tokens (
	id SERIAL PRIMARY KEY,
	user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	google_email VARCHAR(255) NOT NULL,
	access_token TEXT NOT NULL,
	refresh_token TEXT,
	token_type VARCHAR(50),
	scope TEXT,
	expires_at TIMESTAMP,
	calendar_id VARCHAR(255) NOT NULL DEFAULT 'primary',
	created_at TIMESTAMP DEFAULT now(),
	updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_google_calendar_tokens_user_id
	ON google_calendar_tokens(user_id);

CREATE INDEX idx_google_calendar_tokens_google_email
	ON google_calendar_tokens(google_email);
