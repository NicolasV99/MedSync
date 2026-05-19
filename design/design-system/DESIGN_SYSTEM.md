# MedSync Design System

## 1. Palette de Couleurs

### Couleurs Primaires
- **Primary Blue**: `#0066CC` (RGB: 0, 102, 204)
  - Usage: Buttons, links, CTAs, active states, key actions
  - Rationale: Professional, trustworthy, medical context

- **Primary Light Blue**: `#E6F0FF` (RGB: 230, 240, 255)
  - Usage: Backgrounds, hover states, secondary containers

### Couleurs de Statut
- **Success Green**: `#10B981` (RGB: 16, 185, 145)
  - Usage: Appointment confirmed, action completed, positive feedback

- **Warning Orange**: `#F59E0B` (RGB: 245, 158, 11)
  - Usage: Pending appointments, alerts, needs attention

- **Danger Red**: `#EF4444` (RGB: 239, 68, 68)
  - Usage: Cancellations, errors, critical actions

- **Info Cyan**: `#06B6D4` (RGB: 6, 182, 212)
  - Usage: Notifications, informational messages, reminders

### Couleurs Neutres
- **Dark Charcoal**: `#1F2937` (RGB: 31, 41, 55)
  - Usage: Primary text, headers, dark mode text

- **Medium Gray**: `#6B7280` (RGB: 107, 114, 128)
  - Usage: Secondary text, labels, disabled states

- **Light Gray**: `#F3F4F6` (RGB: 243, 244, 246)
  - Usage: Backgrounds, section dividers, card backgrounds

- **White**: `#FFFFFF` (RGB: 255, 255, 255)
  - Usage: Main background, card backgrounds, text on dark

---

## 2. Typographie

### Font Family
- **Primary Font**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
  - Rationale: Modern, clean, highly readable, excellent for healthcare apps

### Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **H1** | 32px | 700 | 40px | -0.01em | Page titles |
| **H2** | 24px | 600 | 32px | -0.005em | Section headers |
| **H3** | 20px | 600 | 28px | 0em | Subsection headers |
| **Body Large** | 16px | 400 | 24px | 0em | Main body text, descriptions |
| **Body Regular** | 14px | 400 | 20px | 0em | Standard text, labels |
| **Caption** | 12px | 500 | 16px | 0em | Helper text, timestamps |
| **Button** | 14px | 600 | 20px | 0em | Button text |

---

## 3. Espacements

### Spacing Scale
```
4px   = xs (0.25 rem)
8px   = sm (0.5 rem)
12px  = md (0.75 rem)
16px  = lg (1 rem)
20px  = xl (1.25 rem)
24px  = 2xl (1.5 rem)
32px  = 3xl (2 rem)
40px  = 4xl (2.5 rem)
48px  = 5xl (3 rem)
```

### Padding Standards
- **Small Components**: 12px
- **Medium Components**: 16px
- **Large Components**: 24px
- **Page Margins**: 24px (mobile), 32px (desktop)

### Margin Standards
- **Between Sections**: 32px
- **Between Cards**: 16px
- **Between Form Fields**: 16px
- **Top/Bottom Page Padding**: 24px

---

## 4. Componentes Reutilizáveis

### 4.1 Buttons

**Primary Button**
```
Background: #0066CC
Text Color: White
Padding: 12px 20px
Border Radius: 8px
Font Size: 14px, Weight: 600
Hover: #0052A3 (darker blue)
Active: #003D7A
Disabled: #B0BEC5 (gray)
```

**Secondary Button**
```
Background: #E6F0FF
Text Color: #0066CC
Border: 1px solid #0066CC
Padding: 12px 20px
Border Radius: 8px
Hover: Background #D6E4FF
Active: Background #B8D4FF
```

**Tertiary Button / Link**
```
Background: Transparent
Text Color: #0066CC
Padding: 12px 0px
Hover: Text Decoration underline
```

**Danger Button**
```
Background: #EF4444
Text Color: White
Padding: 12px 20px
Border Radius: 8px
Hover: #DC2626
```

---

### 4.2 Input Fields

```
Background: White
Border: 1px solid #D1D5DB
Border Radius: 8px
Padding: 12px 16px
Font Size: 14px
Placeholder Color: #9CA3AF

States:
- Focus: Border color #0066CC, shadow: 0 0 0 3px rgba(0, 102, 204, 0.1)
- Error: Border color #EF4444
- Disabled: Background #F3F4F6, Cursor not-allowed
- Success: Border color #10B981
```

---

### 4.3 Cards

```
Background: White
Border: 1px solid #E5E7EB
Border Radius: 12px
Padding: 20px
Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
Hover Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
```

---

### 4.4 Badges/Pills

**Confirmed**
```
Background: #ECFDF5
Color: #065F46
Padding: 6px 12px
Border Radius: 20px
Font Size: 12px, Weight: 600
```

**Pending**
```
Background: #FFFBEB
Color: #92400E
```

**Cancelled**
```
Background: #FEE2E2
Color: #991B1B
```

---

### 4.5 Notifications/Alerts

**Success Alert**
```
Background: #ECFDF5
Border Left: 4px solid #10B981
Color: #065F46
Padding: 16px
Border Radius: 8px
Icon: Checkmark (green)
```

**Error Alert**
```
Background: #FEE2E2
Border Left: 4px solid #EF4444
Color: #991B1B
```

**Info Alert**
```
Background: #CFFAFE
Border Left: 4px solid #06B6D4
Color: #164E63
```

---

### 4.6 Modals / Dialogs

```
Overlay: rgba(0, 0, 0, 0.5)
Background: White
Border Radius: 16px
Max Width: 500px
Padding: 32px
Box Shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

Close Button: Top right corner, subtle X icon
```

---

### 4.7 Tables

```
Header Background: #F3F4F6
Header Font Weight: 600
Header Font Size: 14px
Row Background: White
Row Hover Background: #F9FAFB
Border: 1px solid #E5E7EB
Cell Padding: 16px
```

---

### 4.8 Icons

**Icon Sizes**
- **Small**: 16px (labels, badges)
- **Medium**: 24px (buttons, form fields)
- **Large**: 32px (page headers, illustrations)

**Icon Color Standards**
- Primary: #0066CC
- Success: #10B981
- Warning: #F59E0B
- Danger: #EF4444
- Disabled: #D1D5DB

---

## 5. Responsive Grid

### Breakpoints
- **Mobile**: 320px - 479px
- **Tablet**: 480px - 1023px
- **Desktop**: 1024px+

### Grid System
- **Mobile**: Single column, 24px margins
- **Tablet**: 2 columns, 24px gap
- **Desktop**: 3-4 columns, 32px gap

---

## 6. Elevations / Shadows

```
Elevation 1 (Subtle): 0 1px 3px rgba(0, 0, 0, 0.1)
Elevation 2 (Cards):   0 4px 6px rgba(0, 0, 0, 0.1)
Elevation 3 (Modals):  0 20px 25px rgba(0, 0, 0, 0.1)
Elevation 4 (Menus):   0 10px 15px rgba(0, 0, 0, 0.1)
```

---

## 7. Animation & Transitions

```
Standard Duration: 200ms
Easing Function: cubic-bezier(0.4, 0, 0.2, 1) (ease-in-out)

Use Cases:
- Button hover: 200ms
- Page transitions: 300ms
- Modal entrance: 300ms
- Loading spinner: Continuous
```

---

## 8. Accessibility

- **Color Contrast**: All text meets WCAG AA standards (4.5:1 for body text)
- **Focus States**: Visible blue outline (2px, #0066CC)
- **Disabled State**: Clearly distinguished with reduced opacity (60%)
- **Icons with Text**: All action icons paired with text labels
- **Font Size Minimum**: 14px for all body text

