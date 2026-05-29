# API Functional Testing Log

## CRUD Endpoint Verification

| Endpoint | HTTP Method | Expected Status | Payload Validation Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/items` | POST | `201 Created` | Rejects missing required fields | PASSED |
| `/api/items` | GET | `200 OK` | Returns array of items | PASSED |
| `/api/items/:id` | PUT | `200 OK` | Rejects invalid data types | PASSED |
| `/api/items/:id` | DELETE | `204 No Content` | Properly deletes record | PASSED |
