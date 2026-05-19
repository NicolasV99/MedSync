# MedSync Week 2 Development Handoff - for Nicolas

**Handoff Date**: May 19, 2026  
**Target Date**: May 26, 2026  
**Developer**: Nicolas Velasquez (Front-End)  
**Designer**: Ange Junior Gohouri (UI/UX)

---

## 📋 Overview

This document contains **everything you need** to build MedSync Week 1 design into working React/Next.js components.

**What's Included**:
- ✓ Complete wireframes (3 screens)
- ✓ Design system (colors, typography, components)
- ✓ OAuth Google Calendar flow (4 screens)
- ✓ In-app notifications (4 types)
- ✓ Implementation checklist
- ✓ Responsive breakpoints
- ✓ Accessibility requirements

---

## 🎯 Week 2 Deliverables

### Primary Screens (Must Ship)
1. **Login Screen**
   - Email/password input fields
   - "Sign in with Google" OAuth button
   - Remember me checkbox
   - Error states for failed login

2. **Patient List Screen**
   - Searchable patient table (desktop) / card view (mobile)
   - Add New Patient button
   - Edit, View, Delete actions per patient
   - Status badges (Active/Inactive)
   - Pagination

3. **Patient Detail Screen**
   - Patient header card (name, email, phone, photo)
   - Personal info section
   - Clinical history section
   - Appointments list
   - Schedule new appointment button

### Secondary Features (Must be ready to integrate)
4. **OAuth Google Calendar Flow**
   - Permission consent modal
   - Loading state
   - Success confirmation
   - Error handling

5. **In-App Notifications**
   - Toast system setup
   - Success, Error, Info, Warning templates
   - Auto-dismiss + manual close
   - Stacking behavior

---

## 🎨 Design Files Reference

All design files are located in: `/design/`

### Essential Files
```
design/
├── design-system/
│   ├── DESIGN_SYSTEM.md          ← Read this first!
│   └── design-tokens.json         ← Use for constants
│
├── wireframes/
│   └── WIREFRAMES.md              ← Screen layouts & components
│
├── specifications/
│   ├── OAUTH_FLOW.md              ← Google Calendar integration
│   └── NOTIFICATIONS.md           ← Toast notifications
│
└── handoff/
    └── HANDOFF_CHECKLIST.md       ← This file
```

---

## 🏗️ Architecture Overview (Suggested)

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── GoogleOAuthButton.tsx
│   │   └── OAuthModal.tsx
│   │
│   ├── patients/
│   │   ├── PatientList.tsx
│   │   ├── PatientCard.tsx
│   │   ├── PatientDetail.tsx
│   │   └── PatientHeader.tsx
│   │
│   ├── common/
│   │   ├── Input.tsx              ← Reusable input component
│   │   ├── Button.tsx             ← Primary/Secondary/Tertiary
│   │   ├── Badge.tsx              ← Status badges
│   │   ├── Toast.tsx              ← Notification toast
│   │   └── Modal.tsx              ← Reusable modal
│   │
│   └── calendar/
│       └── GoogleCalendarConnect.tsx
│
├── styles/
│   ├── tokens.css                 ← CSS variables from design-tokens.json
│   ├── colors.css
│   ├── typography.css
│   └── animations.css
│
├── hooks/
│   ├── useToast.ts                ← Notification system
│   ├── useAuth.ts                 ← Auth context
│   └── useGoogleOAuth.ts          ← Google OAuth handling
│
├── context/
│   ├── AuthContext.tsx
│   ├── PatientContext.tsx
│   └── ToastContext.tsx
│
├── pages/
│   ├── login.tsx
│   ├── patients/
│   │   ├── index.tsx              ← Patient list
│   │   └── [id].tsx               ← Patient detail
│   └── dashboard.tsx
│
└── types/
    ├── auth.ts
    ├── patient.ts
    └── calendar.ts
```

---

## 🚀 Implementation Priority

### Phase 1: Foundation (Days 1-2)
- [ ] Create design tokens (CSS variables, Tailwind config, or styled-components)
- [ ] Build reusable component library:
  - [ ] Input field component
  - [ ] Button (Primary, Secondary, Tertiary)
  - [ ] Badge/Pills
  - [ ] Card component
  - [ ] Modal component
- [ ] Setup Toast/notification system

### Phase 2: Authentication (Days 2-3)
- [ ] **Login Screen**
  - [ ] Email input validation
  - [ ] Password input (show/hide)
  - [ ] Remember me checkbox
  - [ ] Submit button
  - [ ] Error message display
  - [ ] Loading state during login
  - [ ] Responsive design (desktop + mobile)

- [ ] **Google OAuth Integration**
  - [ ] Setup OAuth library (`@react-oauth/google` or similar)
  - [ ] Implement OAuth consent modal
  - [ ] Handle OAuth callback
  - [ ] Loading + Success states
  - [ ] Error handling

### Phase 3: Patient Management (Days 3-5)
- [ ] **Patient List Screen**
  - [ ] Fetch patients from API
  - [ ] Display in table (desktop) / cards (mobile)
  - [ ] Search functionality (real-time, debounced)
  - [ ] Status badges (Active/Inactive)
  - [ ] Action buttons (Edit, View, Delete)
  - [ ] Pagination
  - [ ] Loading skeletons
  - [ ] Empty state
  - [ ] Responsive breakpoints

- [ ] **Patient Detail Screen**
  - [ ] Fetch patient data by ID
  - [ ] Display patient header card
  - [ ] Personal info section
  - [ ] Clinical history section
  - [ ] Appointments list with status
  - [ ] Edit button (modal or navigate)
  - [ ] Delete button (confirmation)
  - [ ] Schedule new appointment button
  - [ ] Back navigation
  - [ ] Loading + error states

### Phase 4: Polish & Integration (Days 5-6)
- [ ] Notification system integration:
  - [ ] Success toast (appointment created, saved)
  - [ ] Error toast (API failures)
  - [ ] Info toast (calendar synced)
  - [ ] Auto-dismiss + manual close
- [ ] Navigation between screens
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Performance optimization

### Phase 5: Testing & Handoff (Day 7)
- [ ] Unit tests for components
- [ ] E2E tests for critical flows
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Handoff to Nefi (backend integration)

---

## 🎨 Design System Quick Reference

### Colors
```
Primary Blue:        #0066CC
Success Green:       #10B981
Warning Orange:      #F59E0B
Danger Red:          #EF4444
Info Cyan:           #06B6D4
Dark Text:           #1F2937
Secondary Text:      #6B7280
Light Background:    #F3F4F6
White:               #FFFFFF
```

### Typography
```
H1: 32px, weight 700, line-height 40px
H2: 24px, weight 600, line-height 32px
H3: 20px, weight 600, line-height 28px
Body Large: 16px, weight 400, line-height 24px
Body Regular: 14px, weight 400, line-height 20px
Caption: 12px, weight 500, line-height 16px
Button: 14px, weight 600, line-height 20px
```

### Spacing Scale
```
xs: 4px,  sm: 8px,  md: 12px,  lg: 16px,  xl: 20px
2xl: 24px,  3xl: 32px,  4xl: 40px,  5xl: 48px
```

### Responsive Breakpoints
```
Mobile: 320px - 479px
Tablet: 480px - 1023px
Desktop: 1024px+
```

---

## 📱 Component Specifications

### Input Field
```
Height: 44px (mobile), 40px (desktop)
Padding: 12px 16px
Border: 1px solid #D1D5DB
Border Radius: 8px
Focus: Blue outline (#0066CC), shadow

States:
- Focus: Border blue, shadow blue tint
- Error: Border red (#EF4444)
- Success: Border green (#10B981)
- Disabled: Gray background, cursor not-allowed
```

### Button
```
Padding: 12px 20px
Border Radius: 8px
Font: 14px, weight 600
Min Height: 44px (mobile touch target)
Transition: 200ms ease-in-out

Primary:
- Background: #0066CC
- Text: White
- Hover: #0052A3
- Active: #003D7A

Secondary:
- Background: #E6F0FF
- Text: #0066CC
- Border: 1px solid #0066CC
- Hover: #D6E4FF

Tertiary/Link:
- Background: Transparent
- Text: #0066CC
- Hover: Underline

Danger:
- Background: #EF4444
- Text: White
- Hover: #DC2626
```

### Badge/Pill
```
Padding: 6px 12px
Border Radius: 20px
Font Size: 12px, weight 600

Active (Green):
- Background: #ECFDF5
- Text: #065F46

Inactive (Gray):
- Background: #F3F4F6
- Text: #6B7280

Pending (Yellow):
- Background: #FFFBEB
- Text: #92400E

Cancelled (Red):
- Background: #FEE2E2
- Text: #991B1B
```

### Card
```
Background: White
Border: 1px solid #E5E7EB
Border Radius: 12px
Padding: 20px
Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
Hover Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
```

### Modal
```
Overlay: rgba(0, 0, 0, 0.5)
Background: White
Border Radius: 16px
Padding: 32px
Max Width: 500px
Box Shadow: 0 20px 25px rgba(0, 0, 0, 0.1)
Animation: Fade in 300ms, slide up 300ms
```

---

## 📡 API Integration Points

### Expected Backend Endpoints (from Nefi)

**Authentication**
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google/callback` - OAuth callback
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

**Patients**
- `GET /api/patients` - List all patients (paginated, searchable)
- `GET /api/patients/:id` - Get patient detail
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

**Appointments**
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

**Google Calendar**
- `POST /api/calendar/sync` - Trigger calendar sync
- `GET /api/calendar/status` - Check if connected
- `POST /api/calendar/disconnect` - Disconnect from Google

**Notifications (optional backend)**
- `GET /api/notifications` - Get notification history

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Login flow works with valid credentials
- [ ] Login fails gracefully with invalid credentials
- [ ] Google OAuth flow completes successfully
- [ ] Patient list loads and displays data
- [ ] Search filters patients in real-time
- [ ] Pagination works (previous/next, page jump)
- [ ] Click patient → detail screen loads
- [ ] Edit patient → form pre-fills data
- [ ] Delete patient → confirmation modal appears
- [ ] Appointments display with correct status badges
- [ ] Schedule new appointment → form works
- [ ] Notifications appear and dismiss correctly

### Responsive Tests
- [ ] Login screen responsive (mobile, tablet, desktop)
- [ ] Patient list responsive (mobile → cards, desktop → table)
- [ ] Patient detail responsive (mobile → stacked, desktop → multi-col)
- [ ] All buttons touch-friendly (44px min height on mobile)
- [ ] No horizontal scrolling on mobile
- [ ] Modals centered and readable on all sizes

### Accessibility Tests
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 text)
- [ ] Screen reader announces all content
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] No focus traps

### Cross-Browser Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## ⚡ Performance Considerations

- **Image Optimization**: Compress patient photos, use Next.js Image component
- **Code Splitting**: Lazy-load patient list, detail screens
- **API Caching**: Cache patient list on client (consider SWR/React Query)
- **Debouncing**: Search input (300ms debounce)
- **Virtual Scrolling**: If patient list > 500 records
- **CSS-in-JS**: Use CSS modules or Tailwind for efficient bundling
- **Bundle Size**: Keep under 250KB (JS) for initial load

---

## 🔒 Security & Auth

- **JWT Tokens**: Store in httpOnly cookie (not localStorage)
- **CORS**: Ensure backend CORS allows frontend origin
- **API Keys**: Never commit Google OAuth client ID to GitHub (use env vars)
- **Validation**: Validate all form inputs on client + server
- **Rate Limiting**: Implement on backend for API endpoints
- **XSS Prevention**: Sanitize user input (use DOMPurify if needed)
- **CSRF**: Use CSRF tokens for state-changing requests

---

## 📞 Questions for Nefi (Backend)

1. **Authentication**
   - What's the JWT token structure and expiration?
   - Should we implement refresh tokens?
   - How should we handle token expiration on frontend?

2. **Data**
   - What's the patient list payload structure?
   - What's the max number of patients per request (pagination)?
   - Should search be done client-side or server-side?

3. **Google Calendar**
   - How do we authenticate for Google Calendar API?
   - What events should we sync?
   - How often should we auto-sync?

4. **Errors**
   - What's the error response format?
   - Should we handle specific error codes?
   - Rate limit status codes?

5. **Deployment**
   - What's the API base URL for production?
   - Any specific headers required?
   - HTTPS enforced?

---

## 📅 Timeline

| Week | Goal | Owner |
|------|------|-------|
| Week 1 | Design (Wireframes, Design System, Specs) | **Ange** ✓ |
| Week 2 | Frontend Build (React components, Auth, Patient CRUD) | **Nicolas** ← YOU |
| Week 3 | Backend Build + Integration | **Nefi** + Nicolas |
| Week 4 | Testing, Refinement, Demo Prep | **Austin** + Team |
| Week 5 | Client Presentation & Feedback | **Nicolas (Lead)** |

---

## 🎬 How to Get Started

1. **Read the Design System**: Start with `/design/design-system/DESIGN_SYSTEM.md`
2. **Review Wireframes**: Study `/design/wireframes/WIREFRAMES.md` for layout
3. **Setup Project**: Initialize Next.js project with Tailwind/styled-components
4. **Create Design Tokens**: Convert `/design/design-system/design-tokens.json` to CSS/Tailwind
5. **Build Component Library**: Start with Input, Button, Badge, Card, Modal
6. **Implement Screens**: Login → Patient List → Patient Detail
7. **Integrate APIs**: Connect to Nefi's backend endpoints
8. **Add Notifications**: Implement Toast system
9. **Test & Polish**: Run through testing checklist

---

## 📚 Recommended Libraries

- **React Framework**: Next.js 14+
- **Styling**: Tailwind CSS (for rapid prototyping) or styled-components (for control)
- **Forms**: React Hook Form + Zod (validation)
- **HTTP Client**: Axios or Fetch API
- **State Management**: React Context API (for MVP), Redux/Zustand later
- **Auth**: NextAuth.js or custom JWT handling
- **Google OAuth**: @react-oauth/google
- **Notifications**: react-toastify or sonner
- **Icons**: Heroicons, react-icons
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

---

## ✅ Handoff Checklist

**For Ange to Confirm**:
- [ ] All wireframes approved
- [ ] Design system colors & typography confirmed
- [ ] OAuth flow flow chart understood
- [ ] Notification types and positioning confirmed
- [ ] Component specifications clear
- [ ] Responsive breakpoints agreed

**For Nicolas to Start**:
- [ ] All design files reviewed
- [ ] Architecture plan ready
- [ ] Development environment setup complete
- [ ] GitHub branch created (e.g., `feature/week-2-frontend`)
- [ ] Daily standup scheduled with team
- [ ] First component (Input) coded and component library started

---

## 🎯 Success Criteria for Week 2

By end of Friday, May 26, 2026:

✓ **Login Screen**: Functional with Google OAuth (no backend integration yet)  
✓ **Patient List**: Displays mock data, search works, responsive  
✓ **Patient Detail**: Shows mock patient data, responsive  
✓ **Component Library**: All core components built & documented  
✓ **Responsive**: All screens work on mobile, tablet, desktop  
✓ **Accessibility**: Keyboard navigation + focus states visible  
✓ **Code Quality**: Linted, formatted, no console errors  

*Backend integration with Nefi starts Week 3.*

---

## 📞 Support & Questions

- **Design Questions**: Reach out to Ange
- **Backend Integration**: Coordinate with Nefi
- **QA/Testing**: Austin will help validate
- **Lead/Architecture**: Nicolas (yourself) — feel free to suggest improvements!

---

**Let's ship a great product! 🚀**

Ange  
UI/UX Designer  
May 19, 2026

