# Quick Start Guide - Real-Time Notifications

Get your notification system up and running in minutes!

---

## Step 1: Verify Installation ✅

All files have been created and integrated. No additional npm packages needed!

### Files Created:

- ✅ `src/Context/NotificationContext.jsx`
- ✅ `src/Pages/CareSeekers/Dashboard/Notifications.jsx`
- ✅ `src/Pages/CareProviders/Dashboard/Notifications.jsx`
- ✅ `src/utils/notificationUtils.js`

### Files Modified:

- ✅ `src/main.jsx`
- ✅ `src/Routes/router.jsx`
- ✅ `src/Pages/CareSeekers/Dashboard/Sidebar.jsx`
- ✅ `src/Pages/CareProviders/Dashboard/Sidebar.jsx`

---

## Step 2: Start the App

```bash
npm run dev
```

The app should start without errors. If you see errors, check the browser console.

---

## Step 3: Test the Integration

### Option A: Using Browser Console

```javascript
// Open DevTools → Console tab and paste:

// 1. Check if user is logged in
console.log("Token:", localStorage.getItem("accessToken"));

// 2. Create WebSocket manually to test
const token = localStorage.getItem("accessToken");
const ws = new WebSocket(
  `ws://127.0.0.1:8000/ws/notifications/?token=${token}`,
);

// 3. Listen for messages
ws.onopen = () => console.log("✅ WebSocket Connected");
ws.onmessage = (e) => console.log("📬 Notification:", JSON.parse(e.data));
ws.onclose = () => console.log("❌ WebSocket Closed");
ws.onerror = (err) => console.error("Error:", err);
```

### Option B: Using React DevTools

1. Open React DevTools
2. Find `NotificationProvider` component
3. Click to see `NotificationContext` value
4. Check `notifications` array and `unreadCount`

---

## Step 4: View the Notifications Page

### Care Seeker:

```
1. Log in as a care seeker
2. Click "Notifications" in sidebar
3. See: "No notifications yet" message
```

### Care Provider:

```
1. Log in as a care provider
2. Click "Notifications" in sidebar
3. See: "No notifications yet" message
```

### Check Sidebar Badge:

```
1. Click "Notifications" nav item
2. When unread count > 0, red badge appears
3. Badge shows count (capped at "99+")
```

---

## Step 5: Send Test Notification (Backend)

### Using Django Shell:

```bash
# In your Django backend directory
python manage.py shell
```

```python
# Inside Django shell

import asyncio
from channels.layers import get_channel_layer

channel_layer = get_channel_layer()

# Send a test notification to user with ID 1
async def send_test():
    await channel_layer.group_send(
        'user_1_notifications',  # Change 1 to actual user ID
        {
            'type': 'send_notification',
            'data': {
                'type': 'new_message',
                'id': 'test_msg_1',
                'sender_name': 'Test User',
                'message': 'Hello! This is a test notification',
                'conversation_id': 123
            }
        }
    )
    print('✅ Notification sent!')

asyncio.run(send_test())
```

---

## Step 6: Verify Real-Time Update

After sending from Django shell:

1. **Check browser** - Notification should appear instantly! 📬
2. **Check sidebar** - Badge count should update
3. **Click notification** - Should navigate to correct page
4. **Mark as read** - Badge count should decrease
5. **Delete notification** - Should remove from list

---

## Step 7: Test Different Notification Types

### Provider Application:

```python
# Django shell
asyncio.run(asyncio.coroutine(
    channel_layer.group_send(
        'user_1_notifications',
        {
            'type': 'send_notification',
            'data': {
                'type': 'provider_application',
                'job_request_id': 456,
                'provider_name': 'Dr. Jane Smith',
                'message': 'Dr. Jane Smith applied for your job'
            }
        }
    )
)())
```

### Wallet Credit:

```python
asyncio.run(asyncio.coroutine(
    channel_layer.group_send(
        'user_2_notifications',  # Provider user ID
        {
            'type': 'send_notification',
            'data': {
                'type': 'wallet_credit',
                'amount': 10000,
                'balance': 50000,
                'message': '₦10,000 credited to your wallet'
            }
        }
    )
)())
```

---

## Step 8: Test on Mobile

### iOS:

```
1. Open app in Safari
2. Check responsive design
3. Tap notifications in sidebar menu
4. Verify touch targets are adequate
```

### Android:

```
1. Open app in Chrome Mobile
2. Check responsive design
3. Verify on smaller screens (< 375px)
```

---

## Step 9: Test Error Scenarios

### Scenario 1: Network Loss

```
1. Open DevTools → Network Tab
2. Set throttling to "Offline"
3. WebSocket should auto-reconnect
4. Restore network → Connection should restore
```

### Scenario 2: Invalid Token

```
1. Clear localStorage
2. localStorage.removeItem('accessToken')
3. Reload page
4. No WebSocket connection attempt (expected)
```

### Scenario 3: Backend Down

```
1. Stop backend server
2. WebSocket will attempt reconnection
3. Should show reconnecting alert
4. Restart backend → Connection restores
```

---

## Troubleshooting

### "No access token found"

```
→ Not logged in
→ Solution: Log in first
```

### WebSocket not connecting

```
→ Backend not running
→ Wrong endpoint URL
→ Token invalid

→ Check:
  1. Backend is running
  2. WebSocket endpoint is /ws/notifications/
  3. Token is valid: console.log(localStorage.getItem('accessToken'))
  4. Backend DevTools Console → Look for connection error
```

### Notifications not appearing

```
→ Check browser DevTools:
  1. Network tab → WS filter → See if messages received
  2. Console tab → Look for errors
  3. React DevTools → Check notification state

→ Or test with: window.__notificationWS exist?
```

### Badge not updating

```
→ Check React DevTools
→ Verify NotificationProvider is imported in main.jsx
→ Check notification state changes
```

### Navigation not working

```
→ Check if route exists in router.jsx
→ Verify notification type is correct
→ Check notificationUtils.js navigation map
```

---

## Quick Test Checklist

- [ ] App starts without errors
- [ ] Can log in as seeker/provider
- [ ] Notification page shows "No notifications"
- [ ] Sidebar has notifications nav item
- [ ] Browser console shows token exists
- [ ] WebSocket connection successful (manual test)
- [ ] Can send test notification from Django
- [ ] Notification appears in real-time
- [ ] Sidebar badge updates
- [ ] Click notification navigates correctly
- [ ] Mark as read works
- [ ] Delete notification works
- [ ] Mobile responsive design works

---

## Next: Full Documentation

For detailed setup, configuration, and advanced features:

📖 **Read:** [`REALTIME_NOTIFICATIONS_GUIDE.md`](REALTIME_NOTIFICATIONS_GUIDE.md)

📋 **Check:** [`REALTIME_NOTIFICATIONS_CHECKLIST.md`](REALTIME_NOTIFICATIONS_CHECKLIST.md)

🧪 **Test:** [`NOTIFICATION_PAYLOADS_TESTING.md`](NOTIFICATION_PAYLOADS_TESTING.md)

---

## Getting Help

1. **Code Issues:**
   - Check browser DevTools Console
   - Verify imports are correct
   - Run `npm run dev` with fresh terminal

2. **Connection Issues:**
   - Verify backend `/ws/notifications/` endpoint
   - Check token is valid
   - Test with manual WebSocket

3. **Logic Issues:**
   - Review `notificationUtils.js` routing logic
   - Check `NotificationContext.jsx` state management
   - Verify backend is sending correct format

4. **Performance Issues:**
   - Check browser DevTools Performance tab
   - Monitor WebSocket message frequency
   - Check for memory leaks

---

## Success! 🎉

If you've completed all steps and notifications are working:

✅ Real-time notifications running  
✅ UI responsive and functional  
✅ Navigation working correctly  
✅ Sidebar badge updating

**Next Steps:**

- Deploy to staging
- Run full QA suite
- Monitor production metrics
- Plan Phase 2 enhancements

---

**Happy Notifying!** 📬
