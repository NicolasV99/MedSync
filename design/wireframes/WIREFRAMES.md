# MedSync Wireframes - Week 1

## 1. LOGIN SCREEN

### Purpose
First touchpoint. Clean, trustworthy, minimal. Focus: email/password authentication + Google login CTA.

---

### Desktop Layout (1024px+)

```
┌─────────────────────────────────────────┐
│                                         │
│           ┌─────────────────┐           │
│           │                 │           │
│           │  MedSync Logo   │           │
│           │  (80x80)        │           │
│           │                 │           │
│           └─────────────────┘           │
│                                         │
│      Sign In to MedSync Dashboard       │  ← H2, semibold
│                                         │
│    ┌─────────────────────────────────┐  │
│    │ Email Address                   │  │  ← Input field
│    │ [__________________________]     │  │
│    └─────────────────────────────────┘  │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │ Password                        │  │  ← Input field
│    │ [__________________________] 👁  │  │  (eye icon for show/hide)
│    └─────────────────────────────────┘  │
│                                         │
│    ☑ Remember me                        │  ← Checkbox
│                                         │
│    ┌─────────────────────────────────┐  │
│    │     SIGN IN                     │  │  ← Primary button
│    └─────────────────────────────────┘  │
│                                         │
│              OR                         │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │ 🔵 Sign in with Google          │  │  ← Secondary button
│    └─────────────────────────────────┘  │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │   New to MedSync? Request      │  │  ← Tertiary link
│    │   admin access                 │  │
│    └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Mobile Layout (320px - 479px)

```
┌──────────────────┐
│                  │
│   MedSync Logo   │  ← Centered, 60x60
│   (60x60)        │
│                  │
│  Sign In to      │  ← H2, centered
│  MedSync         │
│                  │
│  ┌──────────────┐ │
│  │ Email        │ │  ← Full width input
│  │ [__________] │ │
│  └──────────────┘ │
│                  │
│  ┌──────────────┐ │
│  │ Password     │ │
│  │ [__________]👁│
│  └──────────────┘ │
│                  │
│  ☑ Remember me   │
│                  │
│  ┌──────────────┐ │
│  │  SIGN IN     │ │
│  └──────────────┘ │
│                  │
│      OR          │
│                  │
│  ┌──────────────┐ │
│  │ 🔵 Google    │ │
│  └──────────────┘ │
│                  │
│  ┌──────────────┐ │
│  │ Request      │ │
│  │ admin access │ │
│  └──────────────┘ │
│                  │
└──────────────────┘
```

### Components Used
- **Logo**: 80px x 80px (desktop), 60px x 60px (mobile)
- **Input Fields**: Full width, 44px height (mobile touch target)
- **Primary Button**: Full width, 48px height (mobile), 44px (desktop)
- **Spacing**: 24px top/bottom, 32px sides (desktop), 24px sides (mobile)
- **Form Gap**: 16px between fields

### States to Document
- **Email Valid**: Border #10B981, checkmark icon
- **Password Strength Indicator**: Below password field (optional Week 1)
- **Error State**: Email/password incorrect → Error message in red
- **Loading**: SIGN IN button shows spinner, disabled
- **Focus**: All inputs show blue outline

---

## 2. PATIENT LIST SCREEN

### Purpose
Central hub. Shows searchable, sortable list of all patients. Quick actions: add new patient, edit, delete, view details.

---

### Desktop Layout (1024px+)

```
┌──────────────────────────────────────────────────────────────┐
│ ☰ Dashboard  |  📋 Patients  |  📅 Calendar  |  👤 Profile   │  ← Navigation
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Patients                                                    │
│                                                              │
│  ┌────────────────────────────┐      ┌──────────────────┐   │
│  │ 🔍 Search patients...      │      │ ➕ Add Patient   │   │  ← Search & CTA
│  │ [_______________________] │      └──────────────────┘   │
│  └────────────────────────────┘                             │
│                                                              │
│  Showing 45 patients                                        │  ← Count
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Name           │ Email            │ Phone      │ Status   │ │  ← Table header
│  ├──────────────────────────────────────────────────────────┤ │
│  │ John Martinez  │ john@email.com   │ +58 412... │ ●Active │ │  ← Row 1
│  │ 📝 ⚙️  🗑️        │                  │            │          │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Maria Lopez    │ maria@email.com  │ +58 414... │ ●Active │ │  ← Row 2
│  │ 📝 ⚙️  🗑️        │                  │            │          │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Carlos Ruiz    │ carlos@email.com │ +58 416... │ ●Inactive│ │  ← Row 3
│  │ 📝 ⚙️  🗑️        │                  │            │          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  < Previous  | Page 1 of 3 |  Next >                         │  ← Pagination
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Mobile Layout (320px - 479px)

```
┌──────────────────┐
│ ☰ MedSync        │  ← Header
├──────────────────┤
│ Patients         │  ← Page title
│                  │
│ ┌──────────────┐ │
│ │🔍 Search    │ │  ← Search
│ │[__________] │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │  ➕ Add      │ │  ← Full width button
│ │  Patient     │ │
│ └──────────────┘ │
│                  │
│ Showing 45       │  ← Count
│                  │
│ ┌──────────────┐ │
│ │ John Martinez│ │  ← Card view
│ │ john@email   │ │  (not table on mobile)
│ │ +58 412...   │ │
│ │              │ │
│ │ 📝 ⚙️  🗑️     │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ Maria Lopez  │ │
│ │ maria@email  │ │
│ │ +58 414...   │ │
│ │              │ │
│ │ 📝 ⚙️  🗑️     │ │
│ └──────────────┘ │
│                  │
│ < Prev | 1/3 >  │  ← Pagination
│                  │
└──────────────────┘
```

### Components Used
- **Search Bar**: Full width, with magnifying glass icon
- **Add Patient Button**: Primary button, fixed position (desktop), full width (mobile)
- **Table (Desktop)**: 
  - Header: #F3F4F6 background, #6B7280 text, bold
  - Rows: White background, hover #F9FAFB
  - Cell padding: 16px
- **Card (Mobile)**:
  - White card, 12px border radius, 16px padding
  - 16px margin between cards
- **Action Icons**:
  - 📝 Edit: Gray #6B7280, hover blue #0066CC
  - ⚙️ Details: Gray #6B7280, hover blue
  - 🗑️ Delete: Gray #6B7280, hover red #EF4444
- **Status Badge**:
  - Active: Green badge (#ECFDF5 bg, #065F46 text)
  - Inactive: Gray badge (#F3F4F6 bg, #6B7280 text)
- **Pagination**: Center-aligned, previous/next buttons + page counter

### Interactions
- **Search**: Real-time filtering (debounced 300ms)
- **Click Row**: Navigate to patient detail screen
- **Click Edit (📝)**: Open edit modal for that patient
- **Click Delete (🗑️)**: Confirmation modal before deletion
- **Click Add Patient**: Navigate to create patient form / modal

---

## 3. PATIENT DETAIL SCREEN

### Purpose
Comprehensive patient profile. Shows all clinical history, appointments, and quick actions.

---

### Desktop Layout (1024px+)

```
┌──────────────────────────────────────────────────────────────┐
│ ☰ Dashboard  |  📋 Patients  |  📅 Calendar  |  👤 Profile   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ < Back to Patients                                           │  ← Navigation
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │                                                          │ │
│ │  ┌─────────────┐  John Martinez              ✏️  🗑️      │ │  ← Header card
│ │  │   👤        │  john@email.com                          │ │
│ │  │  Profile    │  +58 412-345-6789                        │ │
│ │  │  Photo      │                                          │ │
│ │  │  (optional) │  Status: ● Active    Member since 2024   │ │
│ │  └─────────────┘                                          │ │
│ │                                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────┐  ┌──────────────────────────────┐   │
│ │ PERSONAL INFO        │  │ CLINICAL HISTORY             │   │
│ ├──────────────────────┤  ├──────────────────────────────┤   │
│ │ Email                │  │ Date of Birth: 15/03/1985    │   │
│ │ john@email.com       │  │ Blood Type: O+               │   │
│ │                      │  │ Allergies: Penicillin        │   │
│ │ Phone                │  │ Chronic Conditions: Diabetes │   │
│ │ +58 412-345-6789     │  │ Last Visit: 20/05/2026       │   │
│ │                      │  │ Notes: [Additional notes...] │   │
│ │ Address              │  │                              │   │
│ │ Avenida Principal... │  │                              │   │
│ │                      │  │                              │   │
│ └──────────────────────┘  └──────────────────────────────┘   │
│                                                              │
│ APPOINTMENTS                                                 │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Date       │ Time      │ Type          │ Status   │ Actions│ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ 25/05/2026 │ 10:00 AM  │ General Check │ ●Pending │ ✏️ 🗑️  │
│ │ 18/05/2026 │ 02:30 PM  │ Consultation  │ ✓Attended│ 👁️  │
│ │ 11/05/2026 │ 09:00 AM  │ Follow-up     │ ✗Cancelled│ 👁️  │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │           ➕ Schedule New Appointment                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Mobile Layout (320px - 479px)

```
┌──────────────────┐
│ < Back  John     │  ← Header with back button
├──────────────────┤
│                  │
│ ┌──────────────┐ │
│ │      👤      │ │
│ │   Profile    │ │  ← Profile photo
│ │    Photo     │ │
│ └──────────────┘ │
│                  │
│ John Martinez    │
│ john@email.com   │
│ +58 412-345-6789 │
│                  │
│ Status: ●Active  │
│                  │
│ ✏️ Edit | 🗑️ Delete│  ← Action buttons
│                  │
│ ─────────────────│
│ PERSONAL INFO    │
│                  │
│ Email            │
│ john@email.com   │
│                  │
│ Phone            │
│ +58 412-345-6789 │
│                  │
│ Address          │
│ Avenida...       │
│                  │
│ ─────────────────│
│ CLINICAL HISTORY │
│                  │
│ DOB: 15/03/1985  │
│ Blood: O+        │
│ Allergies:       │
│ Penicillin       │
│                  │
│ Conditions:      │
│ Diabetes         │
│                  │
│ ─────────────────│
│ APPOINTMENTS     │
│                  │
│ ┌──────────────┐ │
│ │ 25/05/2026   │ │
│ │ 10:00 AM     │ │
│ │ General Check│ │
│ │ ●Pending     │ │
│ │ ✏️  🗑️       │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ 18/05/2026   │ │
│ │ 02:30 PM     │ │
│ │ Consultation │ │
│ │ ✓Attended    │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │  ➕ Schedule │ │
│ │   Appointment│ │
│ └──────────────┘ │
│                  │
└──────────────────┘
```

### Components Used
- **Header Card**: White, 16px padding, appointment info + edit/delete buttons
- **Info Sections**: Card layout with label/value pairs
- **Appointment Table/Cards**:
  - Status badges: Pending (yellow), Attended (green ✓), Cancelled (red ✗)
  - Action icons: Edit, Delete, View
- **CTA Button**: Full width "Schedule New Appointment" button

### Data Fields Shown
- **Personal**: Email, Phone, Address
- **Clinical**: DOB, Blood Type, Allergies, Chronic Conditions, Last Visit, Notes
- **Appointments**: Date, Time, Type, Status, Actions

### Interactions
- **Back Button**: Return to patient list
- **Edit Button (✏️)**: Open edit form (modal or navigate to edit page)
- **Delete Button (🗑️)**: Confirmation modal
- **Click Appointment Row**: Show appointment details modal
- **Schedule New Appointment**: Navigate to appointment creation form or modal

---

## Summary: Component Reuse Across Screens

| Component | Login | Patient List | Patient Detail |
|-----------|-------|--------------|-----------------|
| Input Fields | ✓ Email, Password | ✓ Search | ✗ |
| Primary Button | ✓ Sign In | ✓ Add Patient | ✓ Schedule Appt |
| Secondary Button | ✓ Google | ✗ | ✗ |
| Tertiary Link | ✓ Request Access | ✗ | ✗ |
| Cards | ✗ | ✓ Mobile list | ✓ Info sections |
| Tables | ✗ | ✓ Patient list | ✓ Appointments |
| Badges/Pills | ✗ | ✓ Status | ✓ Status |
| Icons | ✗ | ✓ Actions | ✓ Actions |

---

## Next Steps for Nicolas

1. **Login Screen**: Implement authentication logic + Google OAuth integration
2. **Patient List**: Implement data fetching, search, pagination, filtering
3. **Patient Detail**: Implement data fetching, clinical history display, appointment management

