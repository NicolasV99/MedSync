# OAuth 2.0 Google Connect Flow - MedSync

## Overview
Secure integration with Google Calendar API to fetch and sync physician appointments.

---

## User Flow Diagram

```
┌─────────────────────────┐
│  User on Patient List   │
│  (Already logged in)    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Click: Settings / Setup Google Cal  │
│ (Small button or menu item)         │
└────────────┬─────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ **SCREEN 1: Permission Consent Modal**              │
│                                                     │
│ "Connect Google Calendar?"                          │
│                                                     │
│ MedSync wants permission to:                        │
│ • View your Google Calendar                         │
│ • Create events in your calendar                    │
│ • Modify existing events                            │
│                                                     │
│ [Cancel]  [Authorize]                              │
└────────────┬────────────────────────────────────────┘
             │
             ├─ [Cancel] ──→ Return to previous screen
             │
             └─ [Authorize] ──→ (Redirect to Google)
                              │
                              ▼
                    ┌──────────────────────┐
                    │ Google Login Screen  │
                    │ (If not already      │
                    │  logged in to Google)│
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ Google Permissions   │
                    │ Confirmation         │
                    └──────────────────────┘
                              │
                              ▼
             ┌────────────────────────────┐
             │ Redirect Back to MedSync   │
             │ (with auth code)           │
             └────────────┬───────────────┘
                          │
                          ▼
        ┌──────────────────────────────────────┐
        │ **SCREEN 2: Loading / Processing**   │
        │                                      │
        │ "Connecting your calendar..."        │
        │                                      │
        │ [Loading spinner]                    │
        │                                      │
        │ (Backend exchanges auth code for     │
        │  access token, stores in DB)         │
        └──────────────┬───────────────────────┘
                       │
                       ├─ Success ──→ SCREEN 3 (Success)
                       │
                       └─ Error   ──→ SCREEN 4 (Error)
```

---

## Screen Specifications

### SCREEN 1: Permission Consent Modal

**Location**: Full modal overlay (appears on any screen)

**Desktop Modal**:
```
┌────────────────────────────────────────────────┐
│  Connect Google Calendar?               [✕]   │  ← Close button
├────────────────────────────────────────────────┤
│                                                │
│  🔵  Google Calendar Logo (small, 40x40)      │
│                                                │
│  Connect to Google Calendar                   │  ← H2
│                                                │
│  MedSync needs permission to sync your       │
│  appointments in real-time. We'll:            │
│                                                │
│  ✓ Read your Google Calendar events          │  ← Checkmarks
│  ✓ Create appointments from MedSync          │
│  ✓ Update appointment details                │
│                                                │
│  Your appointment data remains private and    │
│  is never shared with third parties.          │
│                                                │
│  ┌────────────────────────────────────────┐  │
│  │  ✓ Yes, Connect Google Calendar        │  │  ← Primary button
│  └────────────────────────────────────────┘  │
│                                                │
│  ┌────────────────────────────────────────┐  │
│  │  Maybe Later                            │  │  ← Secondary button
│  └────────────────────────────────────────┘  │
│                                                │
└────────────────────────────────────────────────┘
```

**Mobile Modal** (Full screen or slide-up):
```
┌──────────────────┐
│ < Back           │  ← Back button or X
├──────────────────┤
│                  │
│ 🔵 Google Cal    │  ← Icon
│                  │
│ Connect to       │
│ Google Calendar  │  ← Title
│                  │
│ MedSync needs    │
│ permission to    │
│ sync your        │
│ appointments     │
│ in real-time.    │
│                  │
│ We'll:           │
│                  │
│ ✓ Read your      │
│   Google Calendar│
│   events         │
│                  │
│ ✓ Create         │
│   appointments   │
│   from MedSync   │
│                  │
│ ✓ Update         │
│   appointment    │
│   details        │
│                  │
│ Your data remains│
│ private and is   │
│ never shared     │
│ with third       │
│ parties.         │
│                  │
│ ┌──────────────┐ │
│ │ ✓ Connect    │ │
│ │ Google Cal   │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ Maybe Later  │ │
│ └──────────────┘ │
│                  │
└──────────────────┘
```

**Style**:
- **Modal Background**: White
- **Overlay**: rgba(0, 0, 0, 0.5)
- **Border Radius**: 16px
- **Padding**: 32px (desktop), 24px (mobile)
- **Max Width**: 500px (desktop)
- **Primary Button**: Full width, blue (#0066CC)
- **Secondary Button**: Full width, outline style
- **Close Icon**: Top-right corner, optional
- **Font**: H2 title, body regular text, caption for privacy note

**Typography**:
- **Title**: 24px, weight 600
- **Body**: 14px, weight 400
- **Caption**: 12px, weight 500, color #6B7280

**Accessibility**:
- Focus states visible on all buttons
- Modal cannot be dismissed by clicking outside (force explicit action)
- Keyboard: Tab/Shift+Tab to navigate, Enter to confirm, Esc to close

---

### SCREEN 2: Processing / Loading State

Displayed after user clicks "Connect Google Calendar", before the OAuth redirect completes.

**Desktop**:
```
┌────────────────────────────────────────────────┐
│                                                │
│                                                │
│         [Animated Loading Spinner]              │  ← 40x40 blue spinner
│                                                │
│                                                │
│       Connecting your calendar...              │  ← Body text, centered
│                                                │
│    Please wait while we sync with Google      │
│    Calendar. This typically takes 5-10         │
│    seconds.                                    │
│                                                │
│                                                │
│                 [Don't close this tab]         │  ← Caption warning
│                                                │
│                                                │
└────────────────────────────────────────────────┘
```

**Mobile**:
```
┌──────────────────┐
│                  │
│  [Spinner]       │
│                  │
│ Connecting your  │
│ calendar...      │
│                  │
│ Please wait      │
│ while we sync    │
│ with Google      │
│ Calendar.        │
│                  │
│ [Don't close     │
│  this tab]       │
│                  │
└──────────────────┘
```

**Style**:
- **Spinner**: #0066CC, 200ms rotation
- **Text**: Centered, 14px
- **Caption**: 12px, gray (#6B7280)
- **Duration**: 5-10 seconds (backend-dependent)

---

### SCREEN 3: Success Confirmation

Shown after successful Google Calendar connection.

**Desktop**:
```
┌────────────────────────────────────────────────┐
│                                                │
│              ✓ Success!                        │  ← Green checkmark, 40x40
│                                                │
│                                                │
│    Google Calendar Connected                  │  ← H2
│                                                │
│                                                │
│    Your appointments will now sync             │
│    automatically with your Google              │
│    Calendar in real-time. New                  │
│    appointments created here will              │
│    appear in your Google Calendar              │
│    within seconds.                             │
│                                                │
│                                                │
│    ┌────────────────────────────────────────┐ │
│    │  Got It, Thanks!                       │ │  ← Primary button
│    └────────────────────────────────────────┘ │
│                                                │
│                                                │
│    [Dismiss] (small link, bottom)              │  ← Optional
│                                                │
└────────────────────────────────────────────────┘
```

**Mobile**:
```
┌──────────────────┐
│                  │
│  ✓ Success!      │  ← Green checkmark
│                  │
│ Google Calendar  │
│ Connected        │
│                  │
│ Your appts will  │
│ now sync auto    │
│ with your Google │
│ Calendar in      │
│ real-time.       │
│                  │
│ ┌──────────────┐ │
│ │ Got It!      │ │
│ └──────────────┘ │
│                  │
└──────────────────┘
```

**Style**:
- **Icon**: Green checkmark (#10B981), 40x40
- **Title**: 24px, weight 600, #1F2937
- **Body**: 14px, #6B7280
- **Button**: Primary blue, full width
- **Background**: White or light background
- **Auto-dismiss**: Optional 5-second auto-close

---

### SCREEN 4: Error State

Shown if the OAuth connection fails for any reason.

**Desktop**:
```
┌────────────────────────────────────────────────┐
│                                                │
│              ✕ Connection Failed               │  ← Red X icon
│                                                │
│                                                │
│    Could Not Connect Google Calendar          │  ← H2
│                                                │
│                                                │
│    We encountered an error while trying to     │
│    connect your Google Calendar. This might    │
│    be due to:                                  │
│                                                │
│    • Permission denied by Google               │  ← Bullet points
│    • Network connection issue                  │
│    • Your Google account permissions           │
│                                                │
│                                                │
│    ┌────────────────────────────────────────┐ │
│    │  Try Again                             │ │  ← Primary button
│    └────────────────────────────────────────┘ │
│                                                │
│    ┌────────────────────────────────────────┐ │
│    │  Skip for Now                          │ │  ← Secondary button
│    └────────────────────────────────────────┘ │
│                                                │
│    Need help? Contact support@medsync.io       │  ← Caption with support link
│                                                │
└────────────────────────────────────────────────┘
```

**Mobile**:
```
┌──────────────────┐
│  ✕ Connection    │
│    Failed        │
│                  │
│ Could Not        │
│ Connect Google   │
│ Calendar         │
│                  │
│ We encountered   │
│ an error.        │
│ Might be:        │
│                  │
│ • Permission     │
│   denied         │
│ • Network issue  │
│ • Account perms  │
│                  │
│ ┌──────────────┐ │
│ │ Try Again    │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ Skip for Now │ │
│ └──────────────┘ │
│                  │
│ Contact support  │
│ support@medsync  │
│                  │
└──────────────────┘
```

**Style**:
- **Icon**: Red X (#EF4444), 40x40
- **Title**: 24px, weight 600, #1F2937
- **Body**: 14px, #6B7280
- **Buttons**: Primary (retry in blue), Secondary (skip in gray outline)
- **Background**: Light red tint (#FEE2E2) optional

---

## Error Handling

| Error Scenario | Message | Action |
|---|---|---|
| Permission Denied | "You denied access to Google Calendar. Please authorize MedSync to continue." | Show permission denial modal, offer retry |
| Network Error | "We lost connection. Please check your internet and try again." | Retry button |
| Invalid Token | "Your session expired. Please log in again." | Redirect to login |
| Google API Unavailable | "Google Calendar is temporarily unavailable. Try again later." | Retry button |

---

## Technical Integration Notes (for Nicolas)

### Frontend (React/Next.js)
1. Use `react-oauth/google` or similar OAuth library
2. Request scopes: `calendar.events`
3. Store auth token securely (httpOnly cookie or secure storage)
4. Handle OAuth callback redirect

### Backend (Node.js/Express)
1. Exchange auth code for access token
2. Store token in PostgreSQL/Firebase DB (associated with user account)
3. Implement token refresh logic (access tokens expire)
4. Start calendar sync service (fetch events from Google Calendar API)

### API Endpoints Needed
- `POST /api/auth/google/callback` - Receive OAuth code, exchange for token
- `POST /api/calendar/sync` - Trigger calendar sync
- `GET /api/calendar/status` - Check if calendar is connected
- `POST /api/calendar/disconnect` - Revoke Google Calendar access

---

## Success Metrics

- ✓ 95% of users successfully connect on first attempt
- ✓ Average connection time: < 10 seconds
- ✓ Calendar events sync within 5 seconds of creation
- ✓ Zero manual steps required after permission granted

