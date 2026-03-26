# Authentication & User State Management Architecture

## Overview
This document explains how user authentication and state management works in the CareNest Pro application.

---

## 1. Authentication Flow Files

### 1.1 Token Service (`src/utils/tokenService.js`)
**Purpose**: Manages JWT token lifecycle and authentication checks

**Key Functions**:
```javascript
// Refresh expired tokens
refreshToken: async () => {
  // Calls: POST /api/auth/token/refresh/
  // Returns: new access token
}

// Get valid token
getValidToken: async () {
  // Returns current access token or refreshes if needed
}

// Check if user is authenticated
isAuthenticated: () => {
  // Returns: boolean
}

// Logout user
logout: () => {
  // Clears all tokens and redirects to /login
}
```

**Storage Keys**:
- `access` / `accessToken` - JWT access token
- `refresh` / `refreshToken` - JWT refresh token

---

### 1.2 API Request Interceptor (`src/lib/fetchWithAuth.js`)
**Purpose**: Wraps all API requests with authentication headers

**Behavior**:
```javascript
// Automatically adds Authorization header to all requests
headers: {
  Authorization: `Bearer ${token}`
}

// Handles 401 (Unauthorized) responses
if (response.status === 401) {
  logout() // Clears user session
  redirect('/') // Returns to home
}
```

**Key Storage Management**:
- Adds `Authorization: Bearer {access_token}` to every request
- Clears `token` and `user` from localStorage on 401 error
- Redirects to homepage on auth failure

---

### 1.3 Redux Auth Slice (`src/Redux/Login.jsx`)
**Purpose**: Manages authentication state globally via Redux

**State Shape**:
```javascript
{
  user: {
    id: number,
    email: string,
    full_name: string,
    user_type: "provider" | "seeker" | "admin",
    is_verified: boolean,        // ⭐ Verification status
    is_active: boolean,
    is_subscribed: boolean,
    // ... other user fields
  },
  access: string,    // JWT access token
  refresh: string,   // JWT refresh token
  loading: boolean,
  error: null | object
}
```

**Key Actions**:

#### `loginUser` Thunk
```javascript
// Called on login form submission
// POST /api/auth/login/
async loginUser({ email, password })
  ↓
Returns: {
  access: string,
  refresh: string,
  user: { /* user object */ }
}
  ↓
Stores in localStorage:
- access
- refresh
- user (as JSON string)
- is_subscribed
- just_logged_in
```

#### `logout` Action
```javascript
// Clears all auth state
logout(state)
  ↓
Removes from localStorage:
- access
- refresh
- user
- is_subscribed
- subscription_modal_shown
- just_logged_in
```

#### `updateUserVerification` Action ⭐ (Custom)
```javascript
// Updates verification status after admin approval
updateUserVerification(state, action)
  ↓
Handles:
- Boolean: { is_verified: true }
- Object: { is_verified: true, ... other user fields }
  ↓
Updates localStorage with new user data
```

**Initialization**:
```javascript
// When app loads, hydrates auth state from localStorage
const user = (() => {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
})()
```

---

### 1.4 Auth Context (`src/Context/AuthContext.jsx`)
**Purpose**: Legacy context-based auth (not primary but still used in some places)

**Features**:
- Two-way sync with localStorage
- Listens to storage events from other tabs
- Provides `login()` and `logout()` functions
- Stores: `accessToken`, `refreshToken`, `user`, `rememberMe`

**Note**: Redux auth slice is the primary source of truth in newer code.

---

## 2. User State Storage Architecture

### LocalStorage Keys Reference
```javascript
// Authentication
localStorage.access              // JWT access token
localStorage.refresh             // JWT refresh token
localStorage.user                // User object (JSON string)

// Subscription
localStorage.is_subscribed       // Boolean subscription status

// UI State
localStorage.just_logged_in      // Flag for post-login modals
localStorage.subscription_modal_shown

// Legacy (deprecated but still present)
localStorage.accessToken         // Duplicate of 'access'
localStorage.refreshToken        // Duplicate of 'refresh'
localStorage.seeker_user
localStorage.provider_user
localStorage.seeker_register_response
localStorage.provider_register_response
```

### Redux Store Structure
```javascript
store.auth = {
  user: { ... },      // Current logged-in user
  access: string,     // Access token
  refresh: string,    // Refresh token
  loading: boolean,
  error: object
}

store.adminUsers = {
  users: [ ... ],     // List of all users (for admin)
  currentUser: { ... }, // User being viewed in admin
  stats: { ... }
}
```

---

## 3. User Model/Schema (Backend Definition)

Since this is a frontend codebase, the user model is defined in the backend. Based on API calls and usage patterns, here's what the user object contains:

### User Object Structure
```javascript
{
  id: integer,
  email: string,
  full_name: string,
  phone: string,
  user_type: "provider" | "seeker" | "admin",
  
  // Verification & Status
  is_verified: boolean,           // ⭐ Can apply for jobs
  is_active: boolean,             // Account status
  is_subscribed: boolean,         // Subscription status
  
  // Profile Info
  profile_picture: string,        // URL
  bio: string,
  location: string,
  
  // Dates
  date_joined: string (ISO),
  last_login: string (ISO),
  updated_at: string (ISO),
  
  // Additional Fields
  subscription_expiry: string (ISO),
  verification_status: string,
  onboarding_status: string,
}
```

### Verification Subsystem
```javascript
// Separate verification records tracked in /api/admin/verifications/
{
  id: integer,
  user_id: integer,              // Links to user
  status: "pending" | "approved" | "rejected",
  is_verified: boolean,
  
  // Manual payment fields (when admin approves manually)
  payment_verified_manually: boolean,
  manual_payment_method: string,
  manual_payment_date: string,
  manual_payment_reference: string,
  manual_payment_notes: string,
  
  created_at: string (ISO),
  updated_at: string (ISO),
}
```

---

## 4. API Endpoints for User/Auth

### Authentication Endpoints
```
POST   /api/auth/login/              → Login, returns { access, refresh, user }
POST   /api/auth/token/refresh/      → Refresh access token
GET    /api/auth/user/               → Get current logged-in user
```

### User Management (Admin)
```
GET    /api/admin/users/all/         → List all users
GET    /api/admin/users/{id}/        → Get specific user
PATCH  /api/admin/users/{id}/        → Update user
DELETE /api/admin/users/{id}/        → Delete user
```

### Verification Endpoints
```
GET    /api/admin/verifications/     → List all verifications
GET    /api/admin/verifications/{id}/  → Get specific verification
PATCH  /api/admin/verifications/{id}/ → Approve/reject (action: "approve")
```

---

## 5. How Verification Works (Complete Flow)

### User-Initiated Verification
```
1. User clicks "Apply for Job" without verification
   ↓
2. Component checks: if (!currentUser?.is_verified)
   ↓
3. Shows VerificationCheckModal
   ↓
4. User fills verification form and submits
   ↓
5. POST /api/admin/verifications/
   ↓
6. Backend creates verification record with status: "pending"
   ↓
7. User sees: "Verification pending" message
```

### Admin-Approved Verification (Manual Payment)
```
1. Admin goes to Users page in Admin Dashboard
   ↓
2. Clicks user's "Manual Payment" button
   ↓
3. Fills: payment method, date, reference, notes
   ↓
4. Clicks "Approve"
   ↓
5. approveUser Redux action executes:
   a. Finds verification record by user_id
   b. PATCH /api/admin/verifications/{verification_id}/
      { action: "approve", payment_verified_manually: true, ... }
   c. Fetches updated user from /api/auth/user/
   d. Returns { id, data, verified: true, updatedUser }
   ↓
6. Frontend updates Redux:
   dispatch(updateUserVerification(updatedUser.is_verified))
   ↓
7. localStorage.user is updated with new is_verified: true
   ↓
8. Components re-render with verification badge
   ↓
9. User can now apply for jobs
```

---

## 6. Key Files & Responsibilities

| File | Purpose | Key Functions |
|------|---------|----------------|
| `src/Redux/Login.jsx` | Auth state management | loginUser, logout, updateUserVerification |
| `src/Redux/AdminUsers.jsx` | User management | fetchAllUsers, approveUser, deleteUser |
| `src/lib/fetchWithAuth.js` | API request interceptor | Auto-adds auth headers, handles 401 |
| `src/utils/tokenService.js` | Token lifecycle | refreshToken, getValidToken, logout |
| `src/Context/AuthContext.jsx` | Legacy auth context | login, logout (context-based) |
| `src/Redux/config.js` | API configuration | BASE_URL, getAuthHeaders |
| `src/Pages/Admin/Users.jsx` | Admin user management UI | Manual payment approval |
| `src/Pages/CareProviders/Dashboard/JobDetails.jsx` | Job application | Checks is_verified before apply |

---

## 7. How to Debug Verification Issues

### Check Current Auth State
```javascript
// In browser console:
const state = store.getState()
console.log(state.auth.user.is_verified)  // Should be true after approval
console.log(localStorage.user)             // Check localStorage sync
```

### Verify API Response
```javascript
// Check Network tab in DevTools:
// POST /api/admin/verifications/1/ should return:
{
  status: 200,
  body: {
    id: 1,
    user_id: 5,
    status: "approved",
    is_verified: true,
    ...
  }
}
```

### Trace Component Flow
```javascript
// In JobDetails.jsx:
console.log("currentUser:", currentUser)
console.log("is_verified:", currentUser?.is_verified)

// If is_verified is false but user was approved:
// 1. User needs to refresh page to reload localStorage
// 2. Or dispatch updateUserVerification again
```

---

## 8. User Verification State Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                   NEW USER REGISTERED                        │
├─────────────────────────────────────────────────────────────┤
│ user.is_verified = false                                     │
│ verification record: status = "pending"                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────────┐    ┌──────▼───────┐
    │ User Self- │    │ Admin Manual  │
    │ Verifies   │    │ Approval      │
    └───┬────────┘    └──────┬───────┘
        │                    │
        │ POST /verify       │ PATCH /verifications/{id}/
        │ (full details)     │ (payment info)
        │                    │
        └────────┬───────────┘
                 │
        ┌────────▼──────────┐
        │ Backend approves  │
        │ user.is_verified  │
        │ = true            │
        └────────┬──────────┘
                 │
        ┌────────▼──────────────┐
        │ Frontend fetches      │
        │ /api/auth/user/       │
        │ Gets updated user obj │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │ Dispatch             │
        │ updateUserVerification│
        │ Updates localStorage  │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │ Components re-render  │
        │ Badge appears         │
        │ Can apply for jobs    │
        └──────────────────────┘
```

---

## 9. Storage Sync Flow

### What Gets Stored Where
```javascript
// Login Response from Backend
{
  access: "eyJ0eXAi...",
  refresh: "eyJ0eXAi...",
  user: {
    id: 5,
    email: "user@example.com",
    is_verified: false,
    ...
  }
}
        ↓
// Stored in 3 places:
1. localStorage:
   - localStorage.access = "eyJ0eXAi..."
   - localStorage.user = '{"id":5,...}'

2. Redux store:
   - store.auth.access = "eyJ0eXAi..."
   - store.auth.user = {id: 5, ...}

3. Context (AuthContext):
   - user state variable = {id: 5, ...}
        ↓
// When updated (e.g., verification):
1. Redux action: updateUserVerification(true)
   - Updates store.auth.user.is_verified = true

2. Effect syncs to localStorage:
   - localStorage.user = updated JSON string

3. Components re-render from Redux selector:
   - Components subscribe to store.auth.user
```

---

## 10. Security Notes

### Token Security
- Tokens stored in localStorage (vulnerable to XSS)
- Consider moving to httpOnly cookies in production
- No token expiration check in localStorage (relies on 401 handling)

### User Data Security
- Sensitive fields should not be logged
- Passwords never sent back from API
- Verification status managed server-side

### Refresh Token Flow
```
Access Token expires (3600s typical)
         ↓
401 Unauthorized response
         ↓
fetchWithAuth intercepts
         ↓
Call refreshToken() with refresh token
         ↓
POST /api/auth/token/refresh/
         ↓
Get new access token
         ↓
Retry original request
```

---

## Summary

**Primary Auth Files**:
1. `src/Redux/Login.jsx` - Main auth state (use this)
2. `src/lib/fetchWithAuth.js` - Request interceptor
3. `src/Redux/AdminUsers.jsx` - User approval flow
4. `src/utils/tokenService.js` - Token management

**User Verification**:
- Controlled by `is_verified` boolean on user object
- Verified by checking `/api/admin/verifications/` endpoint
- Admin approval updates verification record and user object
- Frontend must sync updated user data to Redux + localStorage

**Key localStorage Keys**:
- `access` - JWT access token
- `refresh` - JWT refresh token  
- `user` - Current user object (JSON)
