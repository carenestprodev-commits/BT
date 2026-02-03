# Backend API & User Schema Reference

This document outlines the backend API endpoints and user data structure. The backend is located at: `https://backend.staging.bristones.com`

---

## 1. Authentication API Endpoints

### Login
```
POST /api/auth/login/

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "user_type": "provider",
    "is_verified": false,
    "is_active": true,
    "is_subscribed": false,
    "profile_picture": "https://...",
    "bio": "Experienced caregiver",
    "location": "Lagos, Nigeria",
    "date_joined": "2024-01-15T10:30:00Z",
    "last_login": "2024-02-03T14:20:00Z",
    "updated_at": "2024-02-03T14:20:00Z"
  }
}

Error (401 Unauthorized):
{
  "detail": "Invalid credentials"
}
```

### Refresh Token
```
POST /api/auth/token/refresh/

Request Body:
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

Response (200 OK):
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

Error (401):
{
  "detail": "Token is invalid or expired"
}
```

### Get Current User
```
GET /api/auth/user/

Headers:
Authorization: Bearer <access_token>

Response (200 OK):
{
  "id": 5,
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "user_type": "provider",
  "is_verified": true,  // ⭐ Updated after admin approval
  "is_active": true,
  "is_subscribed": false,
  "profile_picture": "https://...",
  "bio": "Experienced caregiver",
  "location": "Lagos, Nigeria",
  "date_joined": "2024-01-15T10:30:00Z",
  "last_login": "2024-02-03T14:20:00Z",
  "updated_at": "2024-02-03T14:20:00Z",
  "subscription_expiry": null
}

Error (401):
{
  "detail": "Authentication credentials were not provided."
}
```

---

## 2. User Management API (Admin)

### List All Users
```
GET /api/admin/users/all/

Headers:
Authorization: Bearer <admin_access_token>

Query Parameters (optional):
- search: "name"
- user_type: "provider" | "seeker"
- page: 1
- page_size: 20

Response (200 OK):
{
  "count": 150,
  "next": "https://backend.staging.bristones.com/api/admin/users/all/?page=2",
  "previous": null,
  "results": [
    {
      "id": 5,
      "email": "provider@example.com",
      "full_name": "Jane Smith",
      "phone": "+1234567890",
      "user_type": "provider",
      "is_verified": false,
      "is_active": true,
      "is_subscribed": false,
      "profile_picture": "https://...",
      "location": "Lagos",
      "date_joined": "2024-01-15T10:30:00Z",
      "last_login": "2024-02-03T14:20:00Z",
      "updated_at": "2024-02-03T14:20:00Z"
    },
    ...
  ]
}
```

### Get Specific User
```
GET /api/admin/users/{id}/

Headers:
Authorization: Bearer <admin_access_token>

Response (200 OK):
{
  "id": 5,
  "email": "provider@example.com",
  "full_name": "Jane Smith",
  "phone": "+1234567890",
  "user_type": "provider",
  "is_verified": false,
  "is_active": true,
  "is_subscribed": true,
  "subscription_expiry": "2024-12-31T23:59:59Z",
  "profile_picture": "https://...",
  "bio": "Experienced nanny",
  "location": "Lagos, Nigeria",
  "date_joined": "2024-01-15T10:30:00Z",
  "last_login": "2024-02-03T14:20:00Z",
  "updated_at": "2024-02-03T14:20:00Z"
}
```

### Update User
```
PATCH /api/admin/users/{id}/

Headers:
Authorization: Bearer <admin_access_token>
Content-Type: application/json

Request Body (partial update):
{
  "is_active": false,
  "is_verified": true,
  "bio": "Updated bio"
}

Response (200 OK):
{
  "id": 5,
  "email": "provider@example.com",
  "is_verified": true,
  "is_active": false,
  ... (full user object)
}
```

### Delete User
```
DELETE /api/admin/users/{id}/

Headers:
Authorization: Bearer <admin_access_token>

Response (204 No Content): (empty)
```

### Suspend User
```
POST /api/admin/users/{id}/suspend/

Headers:
Authorization: Bearer <admin_access_token>

Request Body:
{
  "reason": "Violation of terms"
}

Response (200 OK):
{
  "id": 5,
  "is_active": false,
  "suspension_reason": "Violation of terms"
}
```

---

## 3. Verification Management API

### List All Verifications
```
GET /api/admin/verifications/

Headers:
Authorization: Bearer <admin_access_token>

Query Parameters:
- search: "user_email"
- status: "pending" | "approved" | "rejected"
- page: 1
- page_size: 20

Response (200 OK):
{
  "count": 50,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 12,
      "user_id": 5,
      "user": {
        "id": 5,
        "email": "provider@example.com",
        "full_name": "Jane Smith",
        "user_type": "provider"
      },
      "status": "pending",
      "is_verified": false,
      "documents": [
        {
          "id": 1,
          "document_type": "identification",
          "document_url": "https://...",
          "verified": false
        }
      ],
      "created_at": "2024-02-01T10:00:00Z",
      "updated_at": "2024-02-01T10:00:00Z"
    },
    ...
  ]
}
```

### Get Specific Verification
```
GET /api/admin/verifications/{id}/

Headers:
Authorization: Bearer <admin_access_token>

Response (200 OK):
{
  "id": 12,
  "user_id": 5,
  "user": {
    "id": 5,
    "email": "provider@example.com",
    "full_name": "Jane Smith"
  },
  "status": "pending",
  "is_verified": false,
  "documents": [
    {
      "id": 1,
      "document_type": "identification",
      "document_url": "https://...",
      "verified": false,
      "rejection_reason": null
    }
  ],
  "provider_experience": {
    "sleep_in": true,
    "non_smoker": true,
    "experience_with_twins": false,
    ...
  },
  "created_at": "2024-02-01T10:00:00Z",
  "updated_at": "2024-02-01T10:00:00Z"
}
```

### Approve Verification (Manual Payment)
```
PATCH /api/admin/verifications/{id}/

Headers:
Authorization: Bearer <admin_access_token>
Content-Type: application/json

Request Body:
{
  "action": "approve",
  "payment_verified_manually": true,
  "manual_payment_method": "bank_transfer",
  "manual_payment_date": "2024-02-03T14:00:00Z",
  "manual_payment_reference": "TXN123456789",
  "manual_payment_notes": "Bank transfer completed"
}

Response (200 OK):
{
  "id": 12,
  "user_id": 5,
  "status": "approved",
  "is_verified": true,
  "payment_verified_manually": true,
  "manual_payment_method": "bank_transfer",
  "manual_payment_date": "2024-02-03T14:00:00Z",
  "manual_payment_reference": "TXN123456789",
  "manual_payment_notes": "Bank transfer completed",
  "approved_at": "2024-02-03T15:30:00Z",
  "updated_at": "2024-02-03T15:30:00Z"
}

⭐ After this response, the user's is_verified should be updated in the users table
```

### Reject Verification
```
PATCH /api/admin/verifications/{id}/

Headers:
Authorization: Bearer <admin_access_token>
Content-Type: application/json

Request Body:
{
  "action": "reject",
  "rejection_reason": "Documents not clear"
}

Response (200 OK):
{
  "id": 12,
  "status": "rejected",
  "is_verified": false,
  "rejection_reason": "Documents not clear",
  "updated_at": "2024-02-03T15:30:00Z"
}
```

---

## 4. Jobs API

### List Jobs Feed
```
GET /api/jobs/feed/

Headers:
Authorization: Bearer <access_token>

Query Parameters:
- search: "elderly care"
- page: 1
- page_size: 20

Response (200 OK):
{
  "count": 8,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 54,
      "title": "Eldercare",
      "seeker_name": "Emerald Femi",
      "summary": "Elderly care needed",
      "summary_short": "Elderly care",
      "posted_ago": "Posted 5 days, 19 hours ago",
      "budget": "₦50,000",
      "budget_display": "₦50,000/day",
      "is_verified": true,
      "skills_and_expertise": [
        "Patience with elderly",
        "Basic medical knowledge"
      ],
      "created_at": "2024-01-29T10:30:00Z"
    },
    ...
  ]
}
```

### Get Specific Job
```
GET /api/jobs/feed/{id}/

Headers:
Authorization: Bearer <access_token>

Response (200 OK):
{
  "id": 54,
  "title": "Eldercare",
  "seeker_name": "Emerald Femi",
  "seeker_id": 10,
  "summary": "Looking for a compassionate caregiver...",
  "summary_short": "Elderly care",
  "description": "Full details...",
  "posted_ago": "Posted 5 days, 19 hours ago",
  "budget": "₦50,000",
  "budget_display": "₦50,000/day",
  "job_type": "Full-time",
  "service_category": "Elderly Care",
  "location": "Lagos, Nigeria",
  "is_verified": true,
  "skills_and_expertise": [
    "Patience",
    "Basic medical knowledge"
  ],
  "requirements": {
    "years_experience": 2,
    "certifications_required": true
  },
  "created_at": "2024-01-29T10:30:00Z",
  "updated_at": "2024-01-29T10:30:00Z"
}
```

### Submit Job Application
```
POST /api/provider/applications/

Headers:
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "job_request_id": 54
}

Response (201 Created):
{
  "id": 125,
  "job_request_id": 54,
  "provider_id": 5,
  "status": "pending",
  "applied_at": "2024-02-03T15:30:00Z"
}

Error (403 - User not verified):
{
  "detail": "User must be verified to apply for jobs"
}
```

---

## 5. User Schema/Model

### User Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique user identifier |
| `email` | string | User's email (unique) |
| `full_name` | string | User's full name |
| `phone` | string | Phone number with country code |
| `user_type` | enum | "provider", "seeker", or "admin" |
| `is_verified` | boolean | ⭐ Can apply for jobs, has verification badge |
| `is_active` | boolean | Account is active (not suspended/deleted) |
| `is_subscribed` | boolean | Has paid subscription |
| `subscription_expiry` | datetime | When subscription expires |
| `profile_picture` | string (URL) | Avatar image URL |
| `bio` | string | Short biography |
| `location` | string | City/address |
| `date_joined` | datetime | Account creation date |
| `last_login` | datetime | Last login timestamp |
| `updated_at` | datetime | Last profile update |
| `created_at` | datetime | Creation timestamp |

### Verification Record Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Verification record ID |
| `user_id` | integer | Links to User.id |
| `status` | enum | "pending", "approved", "rejected" |
| `is_verified` | boolean | Same as user.is_verified |
| `payment_verified_manually` | boolean | Admin manually approved payment |
| `manual_payment_method` | string | "bank_transfer", "card", etc. |
| `manual_payment_date` | datetime | When payment was received |
| `manual_payment_reference` | string | Transaction/reference ID |
| `manual_payment_notes` | string | Admin notes about payment |
| `rejection_reason` | string | Why verification was rejected |
| `approved_at` | datetime | When verification was approved |
| `created_at` | datetime | Record creation date |
| `updated_at` | datetime | Last update date |

---

## 6. Environment Configuration

### Frontend (.env.local or .env)
```env
VITE_API_BASE_URL=https://backend.staging.bristones.com
VITE_ENV=development
```

### Authentication Headers
All authenticated requests must include:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 7. Common API Errors

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```
**Cause**: Missing or invalid token
**Fix**: Re-login or refresh token

### 403 Forbidden
```json
{
  "detail": "User must be verified to apply for jobs"
}
```
**Cause**: User is not verified
**Fix**: Complete verification process

### 404 Not Found
```json
{
  "detail": "Not found"
}
```
**Cause**: Resource doesn't exist
**Fix**: Check ID/endpoint

### 400 Bad Request
```json
{
  "email": ["This field may not be blank."],
  "password": ["This field may not be blank."]
}
```
**Cause**: Invalid request data
**Fix**: Check request body format

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```
**Cause**: Server-side issue
**Fix**: Check logs and retry

---

## 8. Frontend-Backend Data Flow

### Verification Approval Flow
```
Admin UI (Users.jsx)
  ↓
Click "Approve" button
  ↓
dispatch(approveUser({ id, manualPayment }))
  ↓
AdminUsers.jsx thunk:
  1. GET /api/admin/verifications/
     → Find verification by user_id
  2. PATCH /api/admin/verifications/{id}/
     { action: "approve", payment_verified_manually: true, ... }
  ↓
Backend:
  1. Updates verification record: status = "approved"
  2. Updates user record: is_verified = true
  3. Returns updated verification object
  ↓
Frontend thunk:
  1. dispatch(fetchAllUsers()) → Refresh admin list
  2. GET /api/auth/user/ → Get updated logged-in user
  3. Returns { id, updatedUser }
  ↓
Users.jsx component:
  1. dispatch(updateUserVerification(updatedUser))
  2. Stores in Redux: store.auth.user.is_verified = true
  3. Syncs to localStorage: localStorage.user = updated JSON
  ↓
Components re-render:
  1. JobDetails checks currentUser.is_verified → true ✅
  2. Badge displays: RiVerifiedBadgeFill appears ✅
  3. Apply button works without modal ✅
```

---

## 9. Testing API Endpoints

### Using cURL
```bash
# Login
curl -X POST "https://backend.staging.bristones.com/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get all users (with token)
curl -X GET "https://backend.staging.bristones.com/api/admin/users/all/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Approve verification
curl -X PATCH "https://backend.staging.bristones.com/api/admin/verifications/12/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","payment_verified_manually":true}'
```

### Using Postman
1. Create a new POST request to `/api/auth/login/`
2. In Body (JSON), enter credentials
3. Save the access token from response
4. In Headers, add: `Authorization: Bearer {token}`
5. Test other endpoints

---

## 10. Key Takeaways

**User Verification Chain**:
```
User Not Verified
  ↓
Admin Approves (Manual Payment)
  ↓
Backend: user.is_verified = true, verification.status = "approved"
  ↓
Frontend: dispatch(updateUserVerification(true))
  ↓
localStorage.user updated
  ↓
Components re-render with badge & no verification modal
```

**Critical Field**: `is_verified` on user object
- Controls verification badge display
- Controls job application access
- Managed by backend during approval
- Must be synced to frontend immediately after approval
