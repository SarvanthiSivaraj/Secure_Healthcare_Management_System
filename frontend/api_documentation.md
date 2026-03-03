# API Documentation

## Landing Page
**URL:** `/`

**Backend APIs Needed:**
1. **GET `/health`**
   - **Explanation:** Verify backend services and DB connection are running before allowing login/signup.
   - **Data Format required:**
     ```json
     { "status": "UP", "database": "CONNECTED", "version": "1.0.0" }
     ```

2. **GET `/public/stats`**
   - **Explanation:** Show marketing data (hospitals count, patients managed).
   - **Data Format required:**
     ```json
     { "success": true, "data": { "hospitalsCount": 45, "patientsManaged": 12000 } }
     ```

## Login Page
**URL:** `/login`

**Backend APIs Needed:**
1. **POST `/api/v1/auth/login`**
   - **Explanation:** Authenticate with email and password. Returns access token and user role.
   - **Data Format required:**
     ```json
     { "success": true, "data": { "user": { "id": "uuid", "email": "user@email.com", "role": "PATIENT" }, "accessToken": "ey..." } }
     ```

2. **POST `/api/v1/auth/passkey/login/options`**
   - **Explanation:** Returns WebAuthn challenge options for passkey authentication.
   - **Data Format required:**
     ```json
     { "success": true, "data": { "challenge": "...", "timeout": 60000, "rpId": "localhost", "allowCredentials": [], "userVerification": "preferred" } }
     ```

3. **POST `/api/v1/auth/passkey/login/verify`**
   - **Explanation:** Verifies the signed passkey credential and logs the user in.
   - **Data Format required:**
     ```json
     { "success": true, "data": { "user": { "id": "uuid", "email": "user@email.com", "role": "PATIENT" }, "accessToken": "ey..." } }
     ```

4. **POST `/api/v1/auth/logout`**
   - **Explanation:** Logs out the current user session.
   - **Data Format required:**
     ```json
     { "success": true, "message": "Logged out" }
     ```

## Registration Page
**URL:** `/register`

**Backend APIs Needed:**
1. **POST `/api/v1/auth/register/patient`**
   - **Explanation:** Registers a new patient and triggers OTP verification.
   - **Data Format required:**
     ```json
     { "success": true, "message": "OTP sent to patient@example.com" }
     ```

2. **POST `/api/v1/auth/otp/verify`**
   - **Explanation:** Verifies OTP sent during registration to activate the account.
   - **Data Format required:**
     ```json
     { "success": true, "message": "OTP verified successfully" }
     ```

## Patient Dashboard
**URL:** `/patient/dashboard`

**Backend APIs Needed (Mocked):**
1. **GET `/api/v1/patient/profile`**
   - **Explanation:** Retrieves basic profile info of the logged-in patient.
   - **Data Format required:**
     ```json
     { "success": true, "data": { "id": "uuid", "firstName": "John", "lastName": "Doe" } }
     ```

2. **GET `/api/v1/patient/health-facts`**
   - **Explanation:** Returns 3 daily health facts (heart rate, nutrition, sleep).
   - **Data Format required:**
     ```json
     { "success": true, "data": [{ "title": "Vital Monitoring", "description": "Stable heart rate recorded last 24h." }] }
     ```

3. **GET `/api/v1/patient/activities`**
   - **Explanation:** Returns recent history (diagnoses, visits, prescriptions).
   - **Data Format required:**
     ```json
     { "success": true, "data": [{ "id": "act-1", "type": "Diagnosis", "title": "Stable Recovery", "date": "2025-10-12T10:00:00Z", "colorClass": "bg-indigo-500", "borderColorClass": "border-indigo-500/30" }] }
     ```

## Patient Profile Page
**URL:** `/patient/profile`

**Backend APIs Needed (Mocked):**
1. **GET `/api/v1/users/profile`**
   - **Explanation:** Retrieves the current logged-in user's full profile.
   - **Data Format required:**
     ```json
     { "success": true, "data": { "user": { "id": "uuid", "firstName": "John", "lastName": "Doe", "email": "patient@medicare.com", "phone": "+1 234 567 890", "role": "PATIENT", "status": "active" } } }
     ```

2. **PUT `/api/v1/users/profile`**
   - **Explanation:** Updates the current user's profile fields (firstName, lastName, phone).
   - **Request Body:** `{ "firstName": "John", "lastName": "Doe", "phone": "+1 234 567 890" }`
   - **Data Format required:**
     ```json
     { "success": true, "data": { "id": "uuid", "firstName": "John", "lastName": "Doe", "email": "patient@medicare.com", "phone": "+1 234 567 890" } }
     ```

## Visits Management
**URL:** `/patient/visits`

**Backend APIs Needed (Mocked):**
1. **GET `/api/v1/visits/my-visits`**
   - **Explanation:** Retrieves all visits for the logged-in patient.
   - **Data Format required:**
     ```json
     { "success": true, "data": [{ "id": "visit-1", "visit_code": "123456", "organization_name": "Medicare General Hospital", "doctor_first_name": "Sarah", "doctor_last_name": "Smith", "reason": "Regular Checkup", "scheduled_time": "2025-12-31T00:00:00.000Z", "status": "scheduled" }] }
     ```

2. **POST `/api/v1/visits/check-in`**
   - **Explanation:** Checks a patient into a visit using a visit code (from QR scan or manual entry).
   - **Request Body:** `{ "visitCode": "123456" }`
   - **Data Format required:**
     ```json
     { "success": true, "data": { "visitId": "uuid", "visitCode": "123456", "status": "checked_in", "hospitalName": "Medicare General Hospital" } }
     ```

3. **POST `/api/v1/visits/request`**
   - **Explanation:** Creates a new visit request.
   - **Data Format required:**
     ```json
     { "success": true, "data": { "id": "uuid", "status": "pending" } }
     ```

## Consent Management
**URL:** `/patient/consent`

**Backend APIs Needed (Mocked):**
1. **GET `/api/v1/consent/active`**
   - **Explanation:** Returns all currently active consents granted by the patient.
   - **Data Format required:**
     ```json
     [{ "id": "consent-1", "hospitalName": "Medicare General Hospital", "doctorName": "Dr. Sarah Smith", "grantedAt": "2025-01-01T00:00:00.000Z", "expiresAt": "2025-01-06T00:00:00.000Z", "status": "active", "permissions": [{ "recordType": "Consultation", "accessLevel": "read" }] }]
     ```

2. **GET `/api/v1/consent/history`**
   - **Explanation:** Returns past/expired consents for the patient.
   - **Data Format required:**
     ```json
     [{ "id": "consent-old-1", "hospitalName": "City Clinic", "doctorName": "Dr. James Lee", "grantedAt": "...", "expiresAt": "...", "status": "expired", "permissions": [] }]
     ```

3. **POST `/api/v1/consent/grant`**
   - **Explanation:** Grants a new consent (used both from the Grant Consent QR screen and the manual form).
   - **Request Body:** `{ "hospitalId": "hosp-123", "hospitalName": "Medicare General Hospital", "durationHours": 2, "durationMinutes": 0, "permissions": [{ "recordType": "Consultation", "accessLevel": "read" }] }`
   - **Data Format required:**
     ```json
     { "success": true, "data": { "id": "consent-uuid", "status": "active", "grantedAt": "...", "expiresAt": "..." } }
     ```

4. **PUT `/api/v1/consent/:consentId`**
   - **Explanation:** Updates an existing consent (permissions or duration).
   - **Data Format required:**
     ```json
     { "success": true, "message": "Consent updated" }
     ```

5. **PUT `/api/v1/consent/revoke/:consentId`**
   - **Explanation:** Revokes an active consent immediately.
   - **Data Format required:**
     ```json
     { "success": true, "message": "Consent revoked" }
     ```

## Medical Records
**URL:** `/patient/medical-records`

**Backend APIs Needed (Mocked):**
1. **GET `/api/v1/emr/patients/:patientId/medical-records`**
   - **Explanation:** Returns all medical records for a patient (filterable by type on the frontend).
   - **Data Format required:**
     ```json
     { "success": true, "data": { "records": [{ "id": "rec-1", "type": "consultation", "title": "Annual Physical Examination", "description": "...", "created_by_name": "Dr. Sarah Smith", "created_by_role": "DOCTOR", "created_at": "2025-01-01T00:00:00.000Z" }] } }
     ```
   - **Record types:** `consultation`, `diagnosis`, `prescription`, `lab_result`, `imaging`, `procedure`, `note`

## Audit Trail
**URL:** `/patient/audit-trail`

**Backend APIs Needed (Mocked):**
1. **GET `/api/v1/audit/my-trail`**
   - **Explanation:** Returns a paginated list of audit log entries — who accessed the patient's data and when.
   - **Query Params (optional):** `startDate`, `endDate`, `action`, `limit`, `offset`
   - **Action values:** `user_login`, `view_patient_records`, `consent_grant`, `consent_revoke`, `consent_view`, `consent_expired`, `create_visit`, `approve_visit`
   - **Data Format required:**
     ```json
     { "success": true, "data": { "logs": [{ "id": "log-1", "action": "consent_grant", "userFirstName": "Sarah", "userLastName": "Smith", "userEmail": "dr.sarah@medicare.com", "userRole": "DOCTOR", "timestamp": "2025-12-31T10:00:00.000Z", "purpose": "Pre-surgery consultation access" }], "pagination": { "total": 4, "pages": 1, "limit": 50, "offset": 0 } } }
     ```

## Session Management (all pages)
1. **GET `/api/v1/auth/verify`**
   - **Explanation:** Verifies the current session token. Called on every page load to keep the user authenticated.
   - **Data Format required:**
     ```json
     { "success": true, "data": { "user": { "id": "uuid", "email": "user@email.com", "role": "PATIENT" } } }
     ```



2. **GET `/public/stats` (Optional for future)**
   - **Explanation:** To show marketing data such as the number of hospitals currently using the system securely.
   - **Data Format required:**
     ```json
     {
       "data": {
         "hospitalsCount": 45,
         "patientsManaged": 12000
       },
       "success": true
     }
     ```

## Login Page
**URL:** `/login`

**Backend APIs Needed:**
1. **POST `/api/v1/auth/login`**
   - **Explanation:** Authenticates standard user credentials (email and password) to obtain an access token and user role.
   - **Data Format required:**
     ```json
     {
       "success": true,
       "data": {
         "user": {
           "id": "uuid",
           "email": "user@email.com",
           "role": "PATIENT"
         },
         "accessToken": "ey..."
       }
     }
     ```

2. **POST `/api/v1/auth/passkey/login-options`**
   - **Explanation:** Retrieves the WebAuthn challenge options needed for passkey authentication from the server.
   - **Data Format required:**
     ```json
     {
       "success": true,
       "data": {
         // Standard PublicKeyCredentialRequestOptions JSON
       }
     }
     ```

3. **POST `/api/v1/auth/passkey/login-verify`**
   - **Explanation:** Verifies the signed passkey credential submitted by the browser and logs the user in.
   - **Data Format required:**
     ```json
     {
       "success": true,
       "data": {
         "user": {
           "id": "uuid",
           "email": "user@email.com",
           "role": "PATIENT"
         },
         "accessToken": "ey..."
       }
     }
     ```

## Registration Page
**URL:** `/register`

**Backend APIs Needed:**
1. **POST `/api/v1/auth/register/patient`**
   - **Explanation:** Registers a new patient into the system and triggers an OTP verification flow.
   - **Data Format required:**
     ```json
     {
       "success": true,
       "message": "OTP sent to patient@example.com"
     }
     ```

2. **POST `/api/v1/auth/otp/verify`**
   - **Explanation:** Verifies the OTP sent to the patient during registration to activate the account.
   - **Data Format required:**
     ```json
     {
       "success": true,
       "message": "OTP verified successfully"
     }
     ```

## Patient Dashboard UI
**URL:** `/patient/dashboard`

**Backend APIs Needed (Mocked):**
1. **GET `/api/v1/patient/profile`**
   - **Explanation:** Retrieves the standard basic profile info of the logged in patient.
   - **Data Format required:**
     ```json
     {
       "success": true,
       "data": {
           "id": "uuid",
           "firstName": "John",
           "lastName": "Doe"
       }
     }
     ```

2. **GET `/api/v1/patient/health-facts`**
   - **Explanation:** Returns 3 small daily facts based on patient data (heart rate, nutrition, sleep).
   - **Data Format required:**
     ```json
     {
       "success": true,
       "data": [
            {
               "title": "Vital Monitoring",
               "description": "Stable heart rate and blood pressure recorded last 24h."
            }
       ]
     }
     ```

3. **GET `/api/v1/patient/activities`**
   - **Explanation:** Returns recent history (diagnoses, hospital visits, prescriptions).
   - **Data Format required:**
     ```json
     {
       "success": true,
       "data": [
            {
               "id": "act-1",
               "type": "Diagnosis",
               "title": "Stable Recovery (Post-Op)",
               "date": "2025-10-12T10:00:00Z",
               "colorClass": "bg-indigo-500",
               "borderColorClass": "border-indigo-500/30"
            }
       ]
     }
     ```

## Visits Management APIs (Mocked)
1. **GET `/api/v1/visits/my-visits`**
   - **Explanation:** Retrieves the visits specific to the patient.
   - **Data Format required:**
     ```json
     {
       "success": true,
       "data": [
            {
               "id": "visit-1",
               "visit_code": "123456",
               "organization_name": "Medicare General Hospital",
               "doctor_first_name": "Sarah",
               "doctor_last_name": "Smith",
               "reason": "Regular Checkup",
               "scheduled_time": "2025-12-31T00:00:00.000Z",
               "status": "scheduled"
            }
       ]
     }
     ```

## Audit Trail APIs (Mocked)
1. **GET `/api/v1/audit/my-trail`**
   - **Explanation:** Returns a paginated list of audit log entries for the current patient — who accessed their data and when.
   - **Query Params (optional):** `startDate`, `endDate`, `action`, `limit`, `offset`
   - **Data Format required:**
     ```json
     {
       "success": true,
       "data": {
         "logs": [
           {
             "id": "log-1",
             "action": "consent_grant",
             "userFirstName": "Sarah",
             "userLastName": "Smith",
             "userEmail": "dr.sarah@medicare.com",
             "userRole": "DOCTOR",
             "timestamp": "2025-12-31T10:00:00.000Z",
             "purpose": "Pre-surgery consultation access"
           }
         ],
         "pagination": { "total": 4, "pages": 1, "limit": 50, "offset": 0 }
       }
     }
     ```
