# Real-Time Notifications Integration Guide

## Overview

This document explains the complete WebSocket notification system integration for CareNestPro. The system enables real-time, bi-directional communication between the frontend and backend for instant notifications.

---

## Architecture

### Components Created

1. **NotificationContext** (`src/Context/NotificationContext.jsx`)
   - Central state management for notifications
   - WebSocket connection management with automatic reconnection
   - Handles degraded mode when realtime infrastructure is unavailable

2. **Notification Pages**
   - `src/Pages/CareSeekers/Dashboard/Notifications.jsx`
   - `src/Pages/CareProviders/Dashboard/Notifications.jsx`
   - Responsive UI for displaying notifications with click-to-navigate functionality

3. **Notification Utilities** (`src/utils/notificationUtils.js`)
   - Helper functions for navigation, styling, and UI formatting
   - Notification type mapping to UI elements

4. **Updated Routing**
   - `/careseekers/dashboard/notifications` - Care seekers notifications page
   - `/careproviders/dashboard/notifications` - Care providers notifications page

5. **Enhanced Sidebars**
   - Unread notification badge on both Care Seeker and Care Provider sidebars
   - Real-time badge count updates

---

## WebSocket Connection Details

### Endpoint Configuration

**Primary Endpoint:**

```
wss://<your-api-host>/ws/notifications/?token=<access_token>
```

**Alias Endpoint:**

```
wss://<your-api-host>/ws/appnotifications/?token=<access_token>
```

### Local Development Example

```
ws://127.0.0.1:8000/ws/notifications/?token=<access_token>
```

### Staging Example

```
wss://backend.staging.bristones.com/ws/notifications/?token=<access_token>
```

---

## Notification Types

The system supports the following notification types:

### 1. **provider_application**

- **Trigger:** A provider applies for a job request
- **Payload:**
  ```json
  {
    "type": "provider_application",
    "job_request_id": 123,
    "provider_name": "John Doe",
    "message": "Provider John Doe applied for your job"
  }
  ```
- **Navigation:** Routes to `/careseekers/dashboard/requests/{job_request_id}`

### 2. **activity_started**

- **Trigger:** An activity/booking has started
- **Payload:**
  ```json
  {
    "type": "activity_started",
    "booking_id": 456,
    "message": "Your activity has started"
  }
  ```
- **Navigation:** Routes to `/careseekers/dashboard/requests/{booking_id}`

### 3. **activity_ended**

- **Trigger:** An activity/booking has ended
- **Payload:**
  ```json
  {
    "type": "activity_ended",
    "booking_id": 456,
    "message": "Your activity has ended"
  }
  ```
- **Navigation:** Routes to `/careseekers/dashboard/requests/{booking_id}`

### 4. **wallet_credit**

- **Trigger:** Funds are credited to user's wallet
- **Payload:**
  ```json
  {
    "type": "wallet_credit",
    "amount": 5000,
    "balance": 25000,
    "message": "₦5,000 credited to your wallet"
  }
  ```
- **Navigation:**
  - Care Seekers: `/careseekers/dashboard/settings`
  - Care Providers: `/careproviders/dashboard/wallet`

### 5. **new_message**

- **Trigger:** A new message is received
- **Payload:**
  ```json
  {
    "type": "new_message",
    "conversation_id": 789,
    "sender_name": "Jane Smith",
    "message": "Hi, are you available?",
    "timestamp": "2024-03-03T10:30:00Z"
  }
  ```
- **Navigation:** Routes to `/careseekers/dashboard/message/{conversation_id}`

### 6. **notification_status**

- **Trigger:** System status updates (especially degraded mode)
- **Payload:**
  ```json
  {
    "type": "notification_status",
    "degraded_mode": true,
    "message": "Realtime notifications are temporarily unavailable"
  }
  ```
- **Navigation:** Stays on notifications page

---

## Context API Usage

### NotificationContext Hook

```jsx
import { useNotifications } from "../Context/NotificationContext";

function MyComponent() {
  const {
    notifications, // Array of all notifications
    unreadCount, // Number of unread notifications
    isConnected, // WebSocket connection status
    isDegraded, // Degraded mode status
    markAsRead, // Function to mark notification as read
    markAllAsRead, // Function to mark all as read
    clearNotification, // Function to delete a notification
    clearAllNotifications, // Function to clear all notifications
  } = useNotifications();

  return (
    <>
      <p>Unread: {unreadCount}</p>
      <p>Connected: {isConnected ? "✅" : "❌"}</p>
    </>
  );
}
```

---

## Features

### ✅ Auto-Reconnection with Backoff

- Exponential backoff strategy: 1s, 2s, 4s, 8s, 16s
- Maximum 5 reconnection attempts
- Automatic reconnection on connection loss (except token expiry)

### ✅ Token Authentication

- Token passed as query parameter: `?token=<access_token>`
- Tokens retrieved from multiple storage locations:
  - `localStorage.accessToken`
  - `localStorage.access_token`
  - `localStorage.access`
  - `sessionStorage` variants

### ✅ Degraded Mode Handling

- When realtime infrastructure is down, system shows degraded mode notification
- Users can still access historical notifications
- Banner alerts users to temporarily unavailable service

### ✅ Responsive UI

- Mobile-friendly design
- Tablet and desktop optimized
- Notification cards with:
  - Icon indicators per type
  - Read/unread status
  - Timestamp display (e.g., "2m ago")
  - Quick delete action
  - Color-coded left border per type

### ✅ Real-time Badge Updates

- Unread count badge on Sidebar
- Shows "99+" for counts over 99
- Automatically updates when new notifications arrive

### ✅ Notification Management

- Mark individual notification as read
- Mark all as read
- Delete individual notification
- Clear all notifications
- Group notifications by read/unread status

---

## Usage Examples

### Basic Setup (Already Done)

The NotificationProvider is already wrapped in `src/main.jsx`:

```jsx
<AuthProvider>
  <NotificationProvider>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </NotificationProvider>
</AuthProvider>
```

### In Components

```jsx
import { useNotifications } from "../Context/NotificationContext";

function NotificationBadge() {
  const { unreadCount, isConnected } = useNotifications();

  return (
    <div className="relative">
      <button>
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      {!isConnected && (
        <span className="status-indicator">Reconnecting...</span>
      )}
    </div>
  );
}
```

### Handling Notifications in Custom Components

```jsx
import { useNotifications } from "../Context/NotificationContext";
import { handleNotificationNavigation } from "../utils/notificationUtils";
import { useNavigate } from "react-router-dom";

function CustomNotificationHandler() {
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (notification) => {
    markAsRead(notification.id);
    handleNotificationNavigation(notification, navigate, "seeker");
  };

  return (
    <ul>
      {notifications.map((notif) => (
        <li key={notif.id} onClick={() => handleClick(notif)}>
          {notif.message}
        </li>
      ))}
    </ul>
  );
}
```

---

## Configuration

### API Host Configuration

The system automatically detects the API host from:

1. **Environment Variable:** `VITE_API_URL` (if set in `.env`)
2. **Current Window Location:** Uses the same host as the app is running on

For local development, ensure your `.env` file has:

```
VITE_API_URL=http://localhost:8000
```

For production/staging:

```
VITE_API_URL=https://api.yourdomain.com
```

---

## Error Handling

### Connection Failures

The system handles various failure scenarios:

1. **Missing Token** → Warning logged, no connection attempt
2. **Invalid Token (4001, 4003)** → Connection rejected, no reconnection attempts
3. **Network Failure** → Automatic reconnection with backoff
4. **Message Parsing Error** → Warning logged, connection continues

### Degraded Mode

When the realtime infrastructure is down:

- WebSocket may connect successfully
- Server sends `{ type: "notification_status", degraded_mode: true, message: "..." }`
- Frontend displays degraded mode alert
- Users still have access to notifications list

---

## Browser Support

The WebSocket implementation works on all modern browsers:

- ✅ Chrome/Edge 43+
- ✅ Firefox 49+
- ✅ Safari 10.1+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, etc.)

---

## Performance Considerations

1. **Message Size:** Notifications are typically under 1KB each
2. **Storage:** Notifications stored in React state (no max limit enforced UI-side)
3. **Connection:** Single persistent WebSocket per user
4. **Updates:** Real-time updates trigger component re-renders efficiently

---

## Testing Notifications Locally

### 1. Start Backend

```bash
python manage.py runserver
```

### 2. Start Frontend

```bash
npm run dev
```

### 3. Open WebSocket in Browser Console

```javascript
// Test WebSocket connection
const token = localStorage.getItem("accessToken");
const ws = new WebSocket(
  `ws://127.0.0.1:8000/ws/notifications/?token=${token}`,
);

ws.onmessage = (e) => {
  console.log("Notification:", JSON.parse(e.data));
};

ws.onerror = (e) => {
  console.error("WebSocket error:", e);
};
```

### 4. Trigger Notifications from Django Shell

```python
# Django shell
python manage.py shell

# Send notification via channel layer
from channels.layers import get_channel_layer
import asyncio

channel_layer = get_channel_layer()

# Example: Send provider_application notification
asyncio.run(channel_layer.group_send(
    f'user_123_notifications',
    {
        'type': 'send_notification',
        'notification': {
            'type': 'provider_application',
            'provider_name': 'Test Provider',
            'message': 'Test message'
        }
    }
))
```

---

## Troubleshooting

### 1. **Notifications not appearing**

- Check browser console for errors
- Verify token is valid: `localStorage.getItem('accessToken')`
- Check WebSocket connection: Browser DevTools → Network → WS
- Verify backend is accessible: Try API endpoint manually

### 2. **Connection keeps dropping**

- Check token expiration
- Verify network connectivity
- Check browser network logs for 4001/4003 errors (token invalid)
- Check backend server logs

### 3. **Token not found**

- Ensure user is logged in
- Check all token storage locations
- Verify login flow saves token correctly

### 4. **WebSocket URL incorrect**

- Set `VITE_API_URL` environment variable if auto-detection fails
- Verify backend WebSocket endpoint is exposed at `/ws/notifications/`

---

## Files Modified/Created

### New Files

- ✅ `src/Context/NotificationContext.jsx`
- ✅ `src/Pages/CareSeekers/Dashboard/Notifications.jsx`
- ✅ `src/Pages/CareProviders/Dashboard/Notifications.jsx`
- ✅ `src/utils/notificationUtils.js`

### Modified Files

- ✅ `src/main.jsx` - Added NotificationProvider
- ✅ `src/Routes/router.jsx` - Added notification routes
- ✅ `src/Pages/CareSeekers/Dashboard/Sidebar.jsx` - Added unread badge
- ✅ `src/Pages/CareProviders/Dashboard/Sidebar.jsx` - Added unread badge

---

## Next Steps

1. **Test the integration:**
   - Log in as both seeker and provider
   - Trigger test notifications from backend
   - Verify notifications appear in real-time

2. **Monitor performance:**
   - Check browser DevTools Performance tab
   - Monitor WebSocket message frequency
   - Verify no memory leaks on long sessions

3. **Customize as needed:**
   - Adjust notification UI styling
   - Add sound/visual alerts
   - Implement notification persistence (localStorage/IndexedDB)
   - Add notification grouping/filtering

4. **Production deployment:**
   - Ensure WSS (secure WebSocket) for HTTPS deployments
   - Configure CORS headers for WebSocket
   - Monitor WebSocket connections in production
   - Set up auto-scaling for connection handling

---

## Support References

Backend Implementation References:

- `appnotifications/routing.py` - WebSocket route configuration
- `appnotifications/consumers.py` - WebSocket message handling
- `chat/middleware.py` - Authentication middleware
- `appnotifications/services.py` - Notification sending logic
- `jobs/views.py` - Job-related notifications
- `payment/webhook.py` - Payment notifications

---

**Last Updated:** March 3, 2026
**Status:** ✅ Integration Complete
