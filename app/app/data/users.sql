-- Table users
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	role VARCHAR(50) NOT NULL,
	created_at TIMESTAMP DEFAULT now()
);

INSERT INTO users (first_name, last_name, email, password_hash, role)
VALUES
	('Nicolas', 'Velasquez', 'nicolas.velasquez@medsync.com', '$2b$12$h4xTt9jPqA1LzN8mV2cQ6eR7uY0kW3fB5dJ1sG9nM4pX2vH8tC6yK', 'admin'),
	('Nefi', 'Zaldana', 'nefi.zaldana@medsync.com', '$2b$12$u7KpQ3mZ1aN5xR8cT2vH6dL0sW4fB9jG3pY1tC7nM5qX8eR2kV6hA', 'doctor'),
	('Austin', 'Anumudu', 'austin.anumudu@medsync.com', '$2b$12$z5MvN2xQ8cL1tR7pH4dK9sW0fB3jG6yA2uV8eC5nT1qX7mP4rL9hD', 'staff');