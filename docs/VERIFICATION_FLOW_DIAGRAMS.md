# Verification Flow - Visual Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CARENESTEST PLATFORM                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐      ┌────────────┐
│  ADMIN PANEL     │         │  BACKEND API     │      │  DATABASE  │
│                  │         │                  │      │            │
│ - Approves Users │────────>│ /verifications/  │─────>│ users.     │
│ - Stores Event   │         │ is_verified=true │      │ is_verified│
└──────────────────┘         └──────────────────┘      └────────────┘
                                      │
                                      │ localStorage event
                                      ↓
┌──────────────────────────────────────────────────────────────────────┐
│                   CAREPROVIDER DASHBOARD                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ HomePage Component                                          │   │
│  │ ─────────────────────────────────────────────────────────── │   │
│  │ • Displays: Verification Badge ✅ or ❌                     │   │
│  │ • useEffect → dispatch(fetchUserProfile()) on mount        │   │
│  │ • useUserProfileRefreshOnFocus() → refresh on tab focus    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ JobDetails Component                                        │   │
│  │ ─────────────────────────────────────────────────────────── │   │
│  │ • Shows Modal if NOT verified                              │   │
│  │ • Shows Apply Button if verified                           │   │
│  │ • VerificationCheckModal with isVerified prop              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ VerificationStatusListener Component                        │   │
│  │ ─────────────────────────────────────────────────────────── │   │
│  │ • Runs in RoleProtectedRoute (all protected pages)          │   │
│  │ • Checks localStorage every 5 seconds for approval event    │   │
│  │ • On approval: dispatch(fetchUserProfile())                │   │
│  │ • Updates Redux: auth.user.is_verified = true             │   │
│  │ • Clears localStorage event                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Redux Store (auth slice)                                    │   │
│  │ ─────────────────────────────────────────────────────────── │   │
│  │ {                                                           │   │
│  │   user: {                                                   │   │
│  │     id: 123,                                                │   │
│  │     full_name: "Jane Doe",                                  │   │
│  │     is_verified: true/false  ← KEY FIELD                   │   │
│  │   }                                                         │   │
│  │ }                                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### BEFORE FIX (What Wasn't Working)

```
User logs in
    ↓
is_verified: false stored in Redux
    ↓
Displayed on HomePage
    ↓
Admin approves user
    ↓
Backend: is_verified = true (updated) ✓
    ↓
Frontend: is_verified = false (stale) ✗
    ↓
User clicks "Apply for Job"
    ↓
Modal appears: "Please Proceed to Verification" ✗
    ↓
User confused: "But I was approved!" 😞
```

### AFTER FIX (What's Now Working)

```
User logs in
    ↓
is_verified: false stored in Redux
    ↓
Displayed on HomePage
    ↓
─────────────────────────────────────────── ADMIN APPROVES ──────
    ↓                                              ↓
HomePage fetches fresh profile            Backend updates
    ↓                                       is_verified = true
is_verified: true updated in Redux                ↓
    ↓                                    Stores approval event
Verification badge appears                       ↓
    ↓                                  VerificationStatusListener
User sees badge! 🎉                    detects event
    ↓                                       ↓
User clicks "Apply for Job"           fetchUserProfile() called
    ↓                                       ↓
No modal (already verified)             Redux: is_verified = true
    ↓                                       ↓
Application submitted successfully! ✓  Components update
                                            ↓
                                       All pages show badge ✓
```

---

## Timing Diagram

### Timeline When Admin Approves a User

```
Time (seconds)   Event                               System State
─────────────────────────────────────────────────────────────────────
0.0     ├─ Admin clicks "Approve" button
        │
0.1     ├─ POST /verifications/{id}/ with action="approve"
        │
0.2     ├─ Backend processes approval
        │  ├─ Updates: users.is_verified = true
        │  └─ Returns approval response
        │
0.3     ├─ Frontend (Admin Panel) receives response
        │  └─ Stores: verification_approval event in localStorage
        │
        │         [USER'S BROWSER]
        │
0.4     ├─ User's VerificationStatusListener running (interval-based)
        │
5.0     ├─ ✓ VerificationStatusListener checks localStorage
        │  └─ Found approval event!
        │
5.1     ├─ dispatch(fetchUserProfile()) called
        │
5.2     ├─ Network request: GET /api/auth/profile/info/
        │
5.3     ├─ Backend returns user profile
        │  └─ Response: { ..., is_verified: true, ... }
        │
5.4     ├─ Redux action: auth.fulfilled
        │  └─ Updates: auth.user.is_verified = true
        │  └─ localStorage: updates user record
        │
5.5     ├─ Components re-render
        │  ├─ HomePage: Verification badge APPEARS ✅
        │  ├─ JobDetails: Modal NOT shown ✅
        │  └─ ViewDetails: Modal NOT shown ✅
        │
5.5     ├─ localStorage.removeItem("verification_approval")
        │
Result  └─ USER EXPERIENCE:
           ✓ Sees verification badge
           ✓ Can apply for jobs immediately
           ✓ No "Proceed to Verification" modal
           ✓ Status update completed in ~5 seconds
```

---

## Component Interaction Diagram

```
                    ┌─ Admin Panel ─────────────────────┐
                    │ Clicks: "Approve" button          │
                    └────────────────┬────────────────────┘
                                     │
                                     │ POST /verifications/{id}/
                                     ↓
                    ┌─ Backend API ─────────────────────┐
                    │ Updates:                          │
                    │ • users.is_verified = true        │
                    │ • verification.status = "approved"│
                    │ Response: success + user data     │
                    └────────────────┬────────────────────┘
                                     │
                                     │ localStorage event
                                     ↓
        ┌────────────────────────────────────────────────────┐
        │         CareProvider/Seeker Dashboard              │
        ├────────────────────────────────────────────────────┤
        │                                                    │
        │  ┌──────────────────────────────────────────────┐ │
        │  │ RoleProtectedRoute                           │ │
        │  │ ├─ Always renders: <VerificationStatusListener/>
        │  │ └─ Wraps all: protected dashboard routes
        │  └──────────────────────────────────────────────┘ │
        │                      │
        │              Every 5 seconds
        │              Check localStorage
        │                      │
        │                      ↓
        │  ┌──────────────────────────────────────────────┐ │
        │  │ VerificationStatusListener (NEW)             │ │
        │  │ Found approval event!                        │ │
        │  │ └─ dispatch(fetchUserProfile())              │ │
        │  └──────────────────────────────────────────────┘ │
        │                      │
        │                      ↓
        │  ┌──────────────────────────────────────────────┐ │
        │  │ fetchUserProfile (Redux Thunk)               │ │
        │  │ GET /api/auth/profile/info/                  │ │
        │  │ Response: { is_verified: true, ... }         │ │
        │  └──────────────────────────────────────────────┘ │
        │                      │
        │                      ↓
        │  ┌──────────────────────────────────────────────┐ │
        │  │ Redux auth.fulfilled action                  │ │
        │  │ Updates: auth.user.is_verified = true        │ │
        │  └──────────────────────────────────────────────┘ │
        │                      │
        │                      ↓ (Components re-render)
        │                      │
        │  ┌─────────────┬─────────────┬─────────────────┐ │
        │  │             │             │                 │ │
        │  ↓             ↓             ↓                 ↓ │
        │ HomePage    JobDetails   ViewDetails    Other Pages
        │   │           │             │                 │
        │   │ Badge ✅   │ No Modal ✅  │ No Modal ✅     │ Updated ✅
        │   └────────────┴─────────────┴─────────────────┘ │
        │                                                    │
        └────────────────────────────────────────────────────┘
                            │
                            │ User sees:
                            ↓
                        ✓ Badge appears
                        ✓ Can apply/message
                        ✓ No modal blocking
                        ✓ Status synced
```

---

## State Management Flow

```
LOGIN FLOW:
═════════════════════════════════════════════════════════════════

User Login
    ↓
POST /api/accounts/token
    ↓
Backend Response:
{
  "access": "token...",
  "refresh": "token...",
  "user": {
    "id": 123,
    "is_verified": false,     ← Initial state after login
    ...
  }
}
    ↓
Redux: setUser() action
    ↓
auth.user.is_verified = false (stored in Redux)


VERIFICATION APPROVAL FLOW:
═════════════════════════════════════════════════════════════════

[Admin Approves]
    ↓
PATCH /api/admin/verifications/{id}/
    ↓
Backend updates: users.is_verified = true
    ↓
Response: { "status": "approved", ... }
    ↓
localStorage.setItem("verification_approval", JSON.stringify({
  userId: 123,
  timestamp: Date.now(),
  action: "approved"
}))


[Frontend (VerificationStatusListener)]
    ↓
Checks localStorage every 5 seconds
    ↓
Found: "verification_approval" event
    ↓
dispatch(fetchUserProfile())
    ↓
GET /api/auth/profile/info/ (with Bearer token)
    ↓
Backend Response:
{
  "id": 123,
  "is_verified": true,        ← ✅ UPDATED!
  ...
}
    ↓
Redux: auth.fulfilled action
    ↓
state.user = response.data
    ↓
auth.user.is_verified = true  ← ✅ UPDATED IN REDUX
    ↓
Components re-render with new state
    ↓
UI Updates:
  • Badge appears ✅
  • Modal not shown ✅
  • Can apply/message ✅
```

---

## Data Persistence

```
Browser Storage Architecture:
════════════════════════════════════════════════════════════════

┌─────────────────────────────────┐
│   Redux Store (In Memory)       │
├─────────────────────────────────┤
│ auth.user = {                   │
│   is_verified: true/false  ← 1  │
│   ...                           │
│ }                               │
└─────────────────────────────────┘
         │ syncs to
         ↓
┌─────────────────────────────────┐
│   localStorage                  │
├─────────────────────────────────┤
│ "user": {                       │
│   is_verified: true/false       │
│   ...                           │
│ }                               │
│                                 │
│ "verification_approval": {      │
│   timestamp: <timestamp>        │
│   ...                           │
│ }                               │
└─────────────────────────────────┘
         │ on page refresh
         ↓
┌─────────────────────────────────┐
│   Redux Store (rehydrated)      │
├─────────────────────────────────┤
│ auth.user = (from localStorage) │
└─────────────────────────────────┘

Key Points:
• Redux is the source of truth during session
• localStorage persists data across refreshes
• VerificationStatusListener bridges the gap
```

---

## Error Handling Flow

```
Happy Path:
────────────────────────────────────────────────────────────
fetchUserProfile() called
    ↓
Network OK ✓
    ↓
200 Response ✓
    ↓
Parse JSON ✓
    ↓
Redux update ✓
    ↓
UI renders ✓


Error Paths:
────────────────────────────────────────────────────────────

1. Network Error (no internet)
   fetchUserProfile() → catch error
   └─ Log error (silent, no alert)
   └─ User still sees old data
   └─ Retries when network returns

2. 401 Unauthorized (token expired)
   fetchUserProfile() → 401 response
   └─ Redux error state set
   └─ User forced to re-login
   └─ No badge (expected, need login)

3. 404 Not Found (endpoint changed)
   fetchUserProfile() → 404 response
   └─ Redux error logged
   └─ User sees old data
   └─ Manual refresh won't help

4. Approval Event Missing
   localStorage cleared accidentally
   └─ VerificationStatusListener finds nothing
   └─ But user has freshly loaded page
   └─ fetchUserProfile() on mount catches it
   └─ User still sees updated badge

All errors handled gracefully - no crashes
```

---

## Comparison: Before vs After

```
BEFORE (BROKEN):
───────────────────────────────────────────────────────────────
Admin Approves
     │
     └─ Backend: is_verified = true ✓
         Frontend: is_verified = false ✗

User Experience:
     ❌ No badge appears
     ❌ Modal blocks job application
     ❌ User confused and frustrated
     ❌ Time to resolve: Manual page refresh or logout/login


AFTER (FIXED):
───────────────────────────────────────────────────────────────
Admin Approves
     │
     ├─ Backend: is_verified = true ✓
     ├─ localStorage: approval event stored ✓
     └─ VerificationStatusListener detects in ~5 seconds ✓
         └─ Redux: is_verified = true ✓

User Experience:
     ✅ Badge appears within 5 seconds
     ✅ Modal doesn't appear
     ✅ Can immediately apply/message
     ✅ Seamless, no manual intervention needed
     ✅ Time to resolve: ~5 seconds (automatic)
```

---

## System Redundancy

```
Verification Refresh Mechanisms:
(Ordered by trigger event)

1. On Dashboard Mount (IMMEDIATE)
   └─ fetchUserProfile() called
   └─ Catches approvals if user just logged in
   └─ Time: 0-2 seconds
   └─ Triggers: HomePage.jsx, Home.jsx useEffect

2. On localStorage Event (FAST)
   └─ VerificationStatusListener.jsx
   └─ Catches approvals while user is active
   └─ Time: 0-5 seconds
   └─ Triggers: Every 5 seconds polling

3. On Tab Focus (SMART)
   └─ useUserProfileRefreshOnFocus() hook
   └─ Catches changes from other tabs
   └─ Time: 0-1 seconds
   └─ Triggers: When user switches back to tab

4. On Manual Refresh (GUARANTEED)
   └─ fetchUserProfile() in useEffect on mount
   └─ Catches any approval regardless
   └─ Time: 0-2 seconds
   └─ Triggers: F5, Cmd+R browser refresh

Multiple mechanisms ensure:
✓ No single point of failure
✓ Covers all user scenarios
✓ Fast feedback (5 seconds max)
✓ Automatic without user action
```

---

## This diagram set shows:

1. **System Architecture** - How components fit together
2. **Data Flow** - What happens before/after
3. **Timing** - When each step occurs
4. **Component Interaction** - How pieces communicate
5. **State Management** - Redux store updates
6. **Data Persistence** - localStorage + Redux sync
7. **Error Handling** - What happens if something fails
8. **Before vs After** - Comparison of the fix
9. **System Redundancy** - Multiple safety mechanisms

All visualizations help understand why the fix works! ✨
