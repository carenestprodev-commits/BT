# Notification Payload Examples & Testing Guide

This document provides example notification payloads for testing and integration reference.

---

## Notification Payload Examples

### 1. Provider Application Notification

**Scenario:** A care provider applies for a care seeker's job request

```json
{
  "type": "provider_application",
  "id": "prov_app_12345",
  "job_request_id": 789,
  "provider_name": "Dr. Jane Smith",
  "provider_id": 456,
  "message": "Dr. Jane Smith applied for your job request",
  "timestamp": "2024-03-03T10:30:00Z"
}
```

**Frontend Handling:**

- Title: "Dr. Jane Smith applied for your job request"
- Icon: 🔔
- Color: Blue left border
- Click → Navigate to `/careseekers/dashboard/requests/789`

---

### 2. Activity Started Notification

**Scenario:** A booking/activity has started

```json
{
  "type": "activity_started",
  "id": "act_start_12345",
  "booking_id": 123,
  "booking_type": "home_care",
  "provider_name": "John Doe",
  "service_type": "Daily Care",
  "message": "Your activity with John Doe has started",
  "timestamp": "2024-03-03T14:00:00Z"
}
```

**Frontend Handling:**

- Title: "Activity started"
- Description: "Your activity with John Doe has started"
- Icon: ▶️
- Color: Green left border
- Click → Navigate to `/careseekers/dashboard/requests/123`

---

### 3. Activity Ended Notification

**Scenario:** A booking/activity has completed

```json
{
  "type": "activity_ended",
  "id": "act_end_12345",
  "booking_id": 123,
  "provider_name": "John Doe",
  "duration_minutes": 120,
  "amount_paid": 15000,
  "message": "Your session with John Doe has ended",
  "timestamp": "2024-03-03T16:00:00Z"
}
```

**Frontend Handling:**

- Title: "Activity ended"
- Description: "Your session with John Doe has ended"
- Icon: ⏹️
- Color: Orange left border
- Click → Navigate to `/careseekers/dashboard/requests/123`

---

### 4. Wallet Credit Notification

**Scenario:** Funds are credited to a provider's wallet

```json
{
  "type": "wallet_credit",
  "id": "wallet_credit_12345",
  "amount": 15000,
  "previous_balance": 25000,
  "balance": 40000,
  "source": "job_completion",
  "source_id": 123,
  "currency": "NGN",
  "message": "₦15,000 credited to your wallet",
  "timestamp": "2024-03-03T16:15:00Z"
}
```

**Frontend Handling:**

- Title: "Credit: ₦15,000"
- Description: "₦15,000 credited to your wallet. Balance: ₦40,000"
- Icon: 💰
- Color: Emerald left border
- Click →
  - Seekers: `/careseekers/dashboard/settings`
  - Providers: `/careproviders/dashboard/wallet`

---

### 5. New Message Notification

**Scenario:** A user receives a new message

```json
{
  "type": "new_message",
  "id": "msg_12345",
  "conversation_id": 789,
  "sender_id": 456,
  "sender_name": "John Smith",
  "sender_avatar": "https://api.example.com/avatars/456.jpg",
  "message": "Hi! Are you available tomorrow?",
  "preview": "Hi! Are you available tomorrow?",
  "timestamp": "2024-03-03T16:30:00Z"
}
```

**Frontend Handling:**

- Title: "Message from John Smith"
- Description: "Hi! Are you available tomorrow?"
- Icon: 💬
- Color: Purple left border
- Click → Navigate to `/careseekers/dashboard/message/789`

---

### 6. Notification Status (Degraded Mode)

**Scenario:** Notification system experiencing issues

```json
{
  "type": "notification_status",
  "id": "status_degraded_1",
  "degraded_mode": true,
  "severity": "warning",
  "message": "Realtime notifications are temporarily unavailable. Checking for new messages...",
  "estimated_recovery_time": "2024-03-03T17:00:00Z",
  "timestamp": "2024-03-03T16:45:00Z"
}
```

**Frontend Handling:**

- Shows banner alert with ⚠️ icon
- Message: "Realtime notifications are temporarily unavailable..."
- Click → Stays on notifications page
- Automatic retry with backoff

---

### 7. Review Request Notification (Example for Extension)

```json
{
  "type": "review_request",
  "id": "review_12345",
  "booking_id": 123,
  "provider_name": "John Doe",
  "message": "Rate your experience with John Doe",
  "timestamp": "2024-03-03T17:00:00Z"
}
```

---

## Testing WebSocket Locally

### Option 1: Browser Console

```javascript
// Step 1: Get your token
const token = localStorage.getItem("accessToken");
console.log("Token:", token);

// Step 2: Create WebSocket connection
const ws = new WebSocket(
  `ws://127.0.0.1:8000/ws/notifications/?token=${token}`,
);

// Step 3: Listen for messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("📬 Notification received:", data);
};

// Step 4: Send test message (requires backend support)
// Most backends don't accept client-initiated messages
// Messages are server-initiated only

// Step 5: Monitor connection
ws.onopen = () => console.log("✅ Connected");
ws.onclose = () => console.log("❌ Disconnected");
ws.onerror = (err) => console.error("Error:", err);
```

### Option 2: Python Script (Send from Backend)

```python
import asyncio
import json
from channels.layers import get_channel_layer

async def send_test_notification(user_id, notification_data):
    """Send test notification to a specific user"""
    channel_layer = get_channel_layer()

    # Send to user's notification group
    await channel_layer.group_send(
        f"user_{user_id}_notifications",
        {
            "type": "send_notification",
            "data": notification_data
        }
    )

# Example usage in Django shell
# python manage.py shell

# Import and run
from jobs.tasks import send_test_notification

# Send provider_application notification
asyncio.run(send_test_notification(
    user_id=1,  # Care seeker user ID
    notification_data={
        "type": "provider_application",
        "job_request_id": 789,
        "provider_name": "Dr. Jane Smith",
        "message": "Dr. Jane Smith applied for your job request"
    }
))

# Send wallet_credit notification
asyncio.run(send_test_notification(
    user_id=2,  # Care provider user ID
    notification_data={
        "type": "wallet_credit",
        "amount": 15000,
        "balance": 40000,
        "message": "₦15,000 credited to your wallet"
    }
))
```

### Option 3: Django Management Command

Create `jobs/management/commands/send_test_notification.py`:

```python
from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
import asyncio
import json

class Command(BaseCommand):
    help = 'Send test notification to a user'

    def add_arguments(self, parser):
        parser.add_argument('user_id', type=int, help='User ID to send notification to')
        parser.add_argument('--type', type=str, default='test', help='Notification type')
        parser.add_argument('--message', type=str, help='Notification message')

    def handle(self, *args, **options):
        user_id = options['user_id']
        notif_type = options['type']
        message = options['message'] or f'Test {notif_type} notification'

        channel_layer = get_channel_layer()

        notification = {
            "type": notif_type,
            "message": message,
        }

        asyncio.run(channel_layer.group_send(
            f"user_{user_id}_notifications",
            {
                "type": "send_notification",
                "data": notification
            }
        ))

        self.stdout.write(
            self.style.SUCCESS(f'✅ Notification sent to user {user_id}')
        )
```

Usage:

```bash
python manage.py send_test_notification 1 --type provider_application --message "Test provider applied"
```

---

## Frontend Testing Methods

### Test 1: Connection Verification

```javascript
// In browser console
window.__notificationWS = new EventTarget();
const ws = new WebSocket(
  `ws://127.0.0.1:8000/ws/notifications/?token=${localStorage.getItem("accessToken")}`,
);

ws.onopen = () => {
  window.__notificationWS = ws;
  console.log("✅ WebSocket Connected");
  console.log("URL:", ws.url);
  console.log("Ready State:", ws.readyState);
};

ws.onmessage = (e) => {
  console.log("📬 Message:", JSON.parse(e.data));
};

ws.onerror = (err) => {
  console.error("❌ WebSocket Error:", err);
};
```

### Test 2: Simulate Notification Arrival

```javascript
// Create custom event to test frontend handling
function simulateNotification(data) {
  const event = new MessageEvent("message", {
    data: JSON.stringify(data),
  });
  window.__notificationWS.dispatchEvent(event);
}

// Usage
simulateNotification({
  type: "provider_application",
  job_request_id: 789,
  provider_name: "Test Provider",
  message: "Test provider applied",
});
```

### Test 3: Memory Leak Check

```javascript
// DevTools Memory tab → Heap Snapshots
// Take snapshot 1
// Send 100 notifications
// Take snapshot 2
// Compare for detached DOM nodes and unreleased memory
```

---

## Real-World Integration Points

### 1. Job Creation → Provider Application Notification

**Flow:**

```
Care Seeker creates job request
    ↓
Job created in database
    ↓
Backend triggers notification
    ↓
Message sent to all care providers in area
    ↓
Frontend WebSocket receives message
    ↓
UI updates with notification
```

**Backend Code** (Django example):

```python
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

def handle_provider_application(job_request_id, provider_id, provider_name):
    """Send notification when provider applies"""
    user = job_request.created_by  # Care seeker

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'user_{user.id}_notifications',
        {
            'type': 'send_notification',
            'data': {
                'type': 'provider_application',
                'job_request_id': job_request_id,
                'provider_name': provider_name,
                'message': f'{provider_name} applied for your job'
            }
        }
    )
```

### 2. Booking Completion → Activity Ended Notification

**Flow:**

```
Booking marked as completed
    ↓
Payment processed
    ↓
Notifications sent to both parties
    ↓
Frontend receives updates
    ↓
Users can leave reviews
```

---

## Troubleshooting Payloads

### Invalid Payload (Missing type)

```json
{
  "job_request_id": 789,
  "message": "Something happened"
}
```

**Result:** ❌ Logged as warning, message ignored

### Malformed JSON

```
{type: "test", message: "unquoted"}
```

**Result:** ❌ Parse error logged, connection continues

### Missing Required Fields

```json
{
  "type": "wallet_credit",
  "amount": 5000
  // Missing: balance, message
}
```

**Result:** ⚠️ Partial information shown, frontend handles gracefully

---

## Performance Testing

### Load Test: Send 1000 notifications

```python
# Django shell
import asyncio
from channels.layers import get_channel_layer
import time

channel_layer = get_channel_layer()

async def send_bulk():
    start = time.time()
    for i in range(1000):
        await channel_layer.group_send(
            'user_123_notifications',
            {
                'type': 'send_notification',
                'data': {
                    'type': 'new_message',
                    'id': f'msg_{i}',
                    'message': f'Message {i}',
                    'sender_name': f'User {i}'
                }
            }
        )
    end = time.time()
    print(f'Sent 1000 notifications in {end - start:.2f}s')

asyncio.run(send_bulk())
```

**Expected Results:**

- No browser crashes
- Notification list remains responsive
- Memory usage stays reasonable
- All notifications appear in UI

---

## Production Checklist

- [ ] Test with real access tokens
- [ ] Test token expiration scenarios
- [ ] Test with invalid tokens
- [ ] Test network disconnection
- [ ] Test concurrent users (load test)
- [ ] Test notification ordering (FIFO)
- [ ] Test notification deduplication (if applicable)
- [ ] Monitor WebSocket memory consumption
- [ ] Test graceful degradation
- [ ] Monitor error rates in production

---

**Last Updated:** March 3, 2026
**Test Status:** Ready for QA
