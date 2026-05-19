# In-App Notifications - MedSync Design Specification

## Overview
Toast/alert notifications for real-time feedback on user actions:
- Appointment created
- Appointment confirmed
- Appointment cancelled
- Patient record updated
- Google Calendar synced
- WhatsApp reminder sent

---

## Notification Types

### 1. SUCCESS Notification

**Use Cases**:
- Appointment created successfully
- Patient record saved
- Google Calendar connected
- WhatsApp reminder delivered

**Desktop Toast**:
```
┌──────────────────────────────────────┐
│  ✓ Appointment Created Successfully  │  ← Top-right or bottom-right
│                                      │
│  Patient "John Martinez" scheduled   │
│  for May 25, 2026 at 10:00 AM       │
│                                      │
│  [Undo]  [Close ✕]                  │
└──────────────────────────────────────┘

Duration: 5 seconds (auto-dismiss) or manual close
```

**Mobile Toast**:
```
┌──────────────────┐
│ ✓ Appointment    │  ← Full width, bottom of screen
│   Created        │
│                  │
│ John Martinez    │
│ May 25 @ 10 AM   │
│                  │
│ [Undo] [Close]   │
└──────────────────┘
```

**Style**:
- **Background**: #ECFDF5 (light green)
- **Border Left**: 4px solid #10B981 (green)
- **Text Color**: #065F46 (dark green)
- **Icon**: ✓ Checkmark, #10B981
- **Padding**: 16px
- **Border Radius**: 8px
- **Shadow**: elevation1
- **Position**: Bottom-right (desktop), bottom-center (mobile)
- **Animation**: Slide-in from bottom 300ms, slide-out 200ms

---

### 2. ERROR Notification

**Use Cases**:
- Appointment creation failed
- Network error during save
- Permission denied
- Invalid time slot

**Desktop Toast**:
```
┌──────────────────────────────────────┐
│  ✕ Error Creating Appointment        │  ← Red background
│                                      │
│  The selected time is no longer      │
│  available. Please try another slot. │
│                                      │
│  [Try Again]  [Close ✕]              │
└──────────────────────────────────────┘
```

**Mobile Toast**:
```
┌──────────────────┐
│ ✕ Error          │
│                  │
│ The selected     │
│ time is no       │
│ longer available.│
│ Try another slot.│
│                  │
│ [Try Again]      │
│ [Close]          │
└──────────────────┘
```

**Style**:
- **Background**: #FEE2E2 (light red)
- **Border Left**: 4px solid #EF4444 (red)
- **Text Color**: #991B1B (dark red)
- **Icon**: ✕ X mark, #EF4444
- **Duration**: Stays visible until user closes (no auto-dismiss)
- **Actions**: Retry button or close button

---

### 3. INFO Notification

**Use Cases**:
- Calendar sync started
- Appointment reminder (2 hours before)
- Google Calendar status update
- Patient file exported

**Desktop Toast**:
```
┌──────────────────────────────────────┐
│  ℹ Google Calendar Synced            │  ← Blue/cyan background
│                                      │
│  Your calendar is now up to date.    │
│  5 new appointments imported.        │
│                                      │
│  [Dismiss]  [View]                   │
└──────────────────────────────────────┘
```

**Mobile Toast**:
```
┌──────────────────┐
│ ℹ Google Cal     │
│   Synced         │
│                  │
│ Calendar is up   │
│ to date.         │
│ 5 new appts      │
│ imported.        │
│                  │
│ [Dismiss][View]  │
└──────────────────┘
```

**Style**:
- **Background**: #CFFAFE (light cyan)
- **Border Left**: 4px solid #06B6D4 (cyan)
- **Text Color**: #164E63 (dark cyan)
- **Icon**: ℹ Information icon, #06B6D4
- **Duration**: 5-10 seconds auto-dismiss
- **Actions**: Optional action links

---

### 4. WARNING Notification

**Use Cases**:
- Appointment about to be cancelled
- Patient has no upcoming appointments
- Reminder not yet sent
- Quota warning (e.g., message limit)

**Desktop Toast**:
```
┌──────────────────────────────────────┐
│  ⚠ Warning: Unsaved Changes          │
│                                      │
│  You have unsaved changes on this    │
│  patient record. They will be lost   │
│  if you navigate away.               │
│                                      │
│  [Save]  [Discard]  [Stay]           │
└──────────────────────────────────────┘
```

**Mobile Toast**:
```
┌──────────────────┐
│ ⚠ Unsaved        │
│   Changes        │
│                  │
│ You have         │
│ unsaved changes. │
│ They will be     │
│ lost if you      │
│ leave.           │
│                  │
│ [Save][Discard]  │
│ [Stay]           │
└──────────────────┘
```

**Style**:
- **Background**: #FFFBEB (light yellow)
- **Border Left**: 4px solid #F59E0B (orange)
- **Text Color**: #92400E (dark orange)
- **Icon**: ⚠ Warning icon, #F59E0B
- **Duration**: Stays visible until action taken
- **Actions**: Multiple action buttons

---

## Notification Positioning & Stacking

### Desktop Layout

**Primary Position**: Bottom-right corner
```
┌────────────────────────────────────────────────┐
│                                                │
│                                                │
│                                                │
│                                                │
│                                                │
│                                                │
│                                                │
│                                                │
│                  ┌────────────────────────┐   │
│                  │  ✓ Success notification│   │
│                  └────────────────────────┘   │
│                  ┌────────────────────────┐   │
│                  │  ℹ Info notification   │   │  ← Stack upward
│                  └────────────────────────┘   │
│                  ┌────────────────────────┐   │
│                  │  ⚠ Warning notification│   │
│                  └────────────────────────┘   │
│                                                │
└────────────────────────────────────────────────┘
```

**Stacking Rules**:
- Max 3 notifications visible at once
- If 4th arrives, queue it (oldest disappears first)
- New notifications slide up from bottom
- Dismissed notifications slide out to the right
- Vertical gap between notifications: 12px

---

### Mobile Layout

**Primary Position**: Bottom-center (full width)
```
┌──────────────────────┐
│                      │
│                      │
│                      │
│                      │
│                      │
│ ┌──────────────────┐ │
│ │ ✓ Success notify │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ ℹ Info notify    │ │  ← Stack upward
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ ⚠ Warning notify │ │
│ └──────────────────┘ │
│                      │
└──────────────────────┘
```

**Dimensions**:
- **Width**: Full width - 24px margins (96% of viewport)
- **Max Width**: 600px (on large mobile screens)
- **Position**: 24px from bottom, centered horizontally
- **Padding**: 16px
- **Border Radius**: 12px (mobile-optimized)

---

## Notification Lifecycle

### 1. Entry Animation
- **Duration**: 300ms
- **Effect**: Slide up from bottom + fade in
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

```css
animation: slideInUp 300ms ease-in-out;

@keyframes slideInUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### 2. Active State
- **Hover (Desktop)**: Slight lift + shadow increase
  - Shadow: elevation3 (instead of elevation1)
  - Transform: translateY(-2px)
  - Actions become more visible

### 3. Exit Animation
- **Duration**: 200ms
- **Effect**: Slide right + fade out
- **Trigger**: Auto-dismiss timer OR user clicks close
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

```css
animation: slideOutRight 200ms ease-in-out;

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}
```

---

## Specific Notification Scenarios

### Scenario 1: Appointment Created

**Trigger**: User clicks "Save" on new appointment form

**Desktop Notification**:
```
┌──────────────────────────────────────┐
│  ✓ Appointment Created                │
│                                      │
│  John Martinez                        │
│  May 25, 2026 • 10:00 AM             │
│  General Checkup                      │
│                                      │
│  [View]  [Undo]  [Close ✕]           │
└──────────────────────────────────────┘

Duration: 5 seconds OR dismissed manually
```

**Actions**:
- **View**: Navigate to appointment detail page
- **Undo**: Delete the appointment (confirmation not required)
- **Close**: Dismiss the notification

---

### Scenario 2: Appointment Confirmed

**Trigger**: Patient confirms appointment via WhatsApp/link

**Desktop Notification**:
```
┌──────────────────────────────────────┐
│  ✓ Appointment Confirmed              │
│                                      │
│  John Martinez confirmed their       │
│  appointment on May 25 at 10:00 AM   │
│                                      │
│  [View]  [Close ✕]                   │
└──────────────────────────────────────┘
```

---

### Scenario 3: WhatsApp Reminder Sent

**Trigger**: Scheduled reminder 24 hours before appointment

**Notification**:
```
┌──────────────────────────────────────┐
│  ✓ Reminder Sent                      │
│                                      │
│  WhatsApp reminder sent to            │
│  John Martinez for tomorrow's         │
│  appointment at 10:00 AM              │
│                                      │
│  [View Log]  [Close ✕]                │
└──────────────────────────────────────┘
```

---

### Scenario 4: Calendar Sync

**Trigger**: User clicks "Sync" or automatic sync completes

**Desktop Notification**:
```
┌──────────────────────────────────────┐
│  ℹ Google Calendar Synced             │
│                                      │
│  5 new appointments imported          │
│  1 appointment updated                │
│  Last synced: now                     │
│                                      │
│  [View Sync Log]  [Close ✕]           │
└──────────────────────────────────────┘
```

---

## Accessibility Requirements

- **Focus State**: Visible outline around notification card
- **Keyboard Navigation**: Tab to action buttons, Enter to activate
- **Screen Reader**: 
  - Announce notification type (success, error, info, warning)
  - Read full message content
  - Announce available actions
  - Announce auto-dismiss timer if applicable
- **Color**: Not the only indicator (use icons + text)
- **Contrast**: All text meets WCAG AA (4.5:1)

---

## Implementation Notes for Nicolas

### Recommended Library
- **React**: `react-toastify` or `sonner` (lightweight, accessible)
- **Alternative**: Custom React component (more control)

### API Integration
- Emit notifications from:
  - API responses (success/error)
  - Real-time events (WebSocket/Server-Sent Events)
  - User actions (local triggers)
  - Background tasks (sync completion)

### Storage Considerations
- Don't persist notifications (clean on page refresh)
- Queue future notifications if coming rapidly
- Log notification history (optional: for audit trail)

### Performance
- Max 3 visible at once
- Remove from DOM after exit animation (cleanup)
- Debounce rapid notification creation (100ms)

---

## Notification Summary Table

| Type | Icon | Color | Duration | Actions |
|------|------|-------|----------|---------|
| **Success** | ✓ | Green | 5s auto-dismiss | Undo, Close |
| **Error** | ✕ | Red | Persistent | Retry, Close |
| **Info** | ℹ | Cyan | 5-10s auto-dismiss | Action, Close |
| **Warning** | ⚠ | Orange | Persistent | Primary, Secondary, Close |

