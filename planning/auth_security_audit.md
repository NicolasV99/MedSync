# MedSync Dashboard - Authentication Security Audit & Calendar Sync Validation

## 1. Authentication Security Audit: Protected Route Test Cases
This document logs the automated script test specifications designed to ensure all protected dashboard API endpoints properly block unauthenticated requests.

### Target Endpoints Audited:
- `GET /api/patients`
- `GET /api/patients/[id]`
- `GET /api/appointments`

### Test Suite Execution Results

#### Test Case 1: Reject requests missing an Authorization header
- **HTTP Method:** GET
- **Header:** None
- **Expected Status Code:** `401 Unauthorized`
- **Expected Payload Response:** `{"error": "Authentication token required. Access Denied."}`
- **Status:** PASS

#### Test Case 2: Reject requests with malformed or fake tokens
- **HTTP Method:** GET
- **Header:** `Authorization: Bearer invalid_jwt_token_string_abc123`
- **Expected Status Code:** `401 Unauthorized` / `403 Forbidden`
- **Expected Payload Response:** `{"error": "Invalid or altered token signature."}`
- **Status:** PASS

#### Test Case 3: Reject requests with expired tokens
- **HTTP Method:** GET
- **Header:** `Authorization: Bearer [EXPIRED_TOKEN_HASH]`
- **Expected Status Code:** `401 Unauthorized`
- **Expected Payload Response:** `{"error": "Token expired. Please refresh credentials."}`
- **Status:** PASS

---

## 2. Calendar Sync Validation Specifications

### Part A: Bi-Directional Token Handshake
- **MedSync to Google:** Validated database retrieval of stored OAuth access tokens to securely request Google Calendar event writing permissions.
- **Google to MedSync:** Configured secure authorization parameters to intercept incoming calendar payload data correctly without compromising routing integrity.

### Part B: Token Refresh Cycle Logic
When background calendar synchronization occurs, the application validates token expiration seamlessly:
1. System attempts background sync $\rightarrow$ Receives a `401` error due to an expired access token.
2. Background engine intercepts the error, securely extracts the encrypted user **Refresh Token** from the database.
3. Submits a POST request to the identity provider token endpoint (`https://oauth2.googleapis.com/token`).
4. Receives an updated, active Access Token, saves it securely to the database, and resumes the sync job without user disruption.

### Part C: Data Field Mapping Schema
Verified exact payload formatting structure between internal database schemas and external calendar event formatting guidelines:

| MedSync Local DB Field | Target Calendar API Field | Format Validation Rule |
| :--- | :--- | :--- |
| `appointment.title` | `summary` | String format; escapes special characters |
| `appointment.notes` | `description` | Appends system internal tracking ID |
| `appointment.start_time`| `start.dateTime` | Standard ISO 8601 string (`YYYY-MM-DDTHH:mm:ssZ`) |
| `appointment.end_time` | `end.dateTime` | Standard ISO 8601 string (`YYYY-MM-DDTHH:mm:ssZ`) |
| `doctor.timezone` | `start.timeZone` | Valid IANA continent/city timezone string |