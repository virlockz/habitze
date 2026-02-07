
# Habit Tracker Rebuild Plan

## Overview
Rebuild the habit tracker with a spreadsheet-style layout inspired by the reference image, featuring a cleaner navigation system with an animated dropdown menu instead of the sidebar.

---

## Key Changes

### 1. Remove Sidebar Navigation
- Delete the current `AppSidebar.tsx` component
- Update `TrackerLayout.tsx` to remove the sidebar structure
- Create a cleaner, full-width layout

### 2. Create Animated View Switcher Dropdown
A small oval button in the top-right corner with:
- **Collapsed state**: Pill-shaped button with current view label + down arrow icon
- **Expanded state**: Smoothly expands downward ("whoosh" motion) with the arrow rotating 180 degrees to face up
- **Menu options**: "View Monthly" and "View Weekly" with a checkmark beside the active option
- Uses Radix Collapsible or custom animation with CSS transforms

### 3. Redesign Monthly Grid (Spreadsheet Style)
Based on the reference image layout:
- **Header row**: Month name centered at top (e.g., "JANUARY 2026")
- **Week groupings**: Columns grouped under "WEEK 1", "WEEK 2", "WEEK 3", "WEEK 4", "WEEK 5" headers
- **Day numbers**: 1-31 displayed under their respective week headers
- **Habit rows**: Each habit as a row with checkable cells for each day
- **Fixed habit column**: Left column with habit names stays fixed while days scroll horizontally
- **Visual styling**: Color-coded week header backgrounds (soft pastels: blue, pink, green, yellow, purple)

### 4. Add Settings Access
- Add a gear icon in the header area to navigate to Settings
- Keep Settings page functionality intact

---

## File Changes

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/tracker/ViewSwitcher.tsx` | Animated dropdown for view selection |

### Files to Modify
| File | Changes |
|------|---------|
| `src/layouts/TrackerLayout.tsx` | Remove sidebar, add new header with ViewSwitcher and Settings icon |
| `src/components/tracker/MonthlyGrid.tsx` | Complete redesign with spreadsheet layout, color-coded weeks |
| `src/components/tracker/WeeklyGrid.tsx` | Match new styling, update header design |
| `src/index.css` | Add dropdown animation keyframes |
| `tailwind.config.ts` | Add week color palette variables |

### Files to Delete
| File | Reason |
|------|--------|
| `src/components/tracker/AppSidebar.tsx` | Replaced by ViewSwitcher dropdown |

---

## Technical Details

### ViewSwitcher Component
```text
+------------------+
| Monthly View  v  |  <-- Collapsed (oval pill shape)
+------------------+

       |
       v (click)

+------------------+
| Monthly View  ^  |  <-- Expanded (arrow rotated)
+------------------+
| [check] Monthly  |
|         Weekly   |
+------------------+
```

Animation specs:
- Arrow rotation: `transform: rotate(180deg)` with 200ms transition
- Content expand: CSS `max-height` transition from 0 to auto (or fixed height) with 250ms ease-out
- Use `overflow: hidden` during animation for smooth "whoosh" effect

### MonthlyGrid Spreadsheet Layout
```text
+------------------+----------------------------------------------+
|     JANUARY 2026                                                |
+------------------+--------+--------+--------+--------+---------+
| DAILY HABITS     | WEEK 1 | WEEK 2 | WEEK 3 | WEEK 4 | WEEK 5  |
|                  | 1-7    | 8-14   | 15-21  | 22-28  | 29-31   |
+------------------+--------+--------+--------+--------+---------+
| Exercise         | [x][ ]...                                    |
| Read 30 mins     | [ ][x]...                                    |
| Meditate         | [x][x]...                                    |
+------------------+----------------------------------------------+
```

Week header colors (soft pastels matching reference):
- Week 1: Light blue (`#e3f2fd`)
- Week 2: Light pink (`#fce4ec`)  
- Week 3: Light green (`#e8f5e9`)
- Week 4: Light yellow (`#fff8e1`)
- Week 5: Light purple (`#f3e5f5`)

### TrackerLayout Structure
```text
+----------------------------------------------------------------+
|  [Settings Icon]                        [Monthly View v]        |
+----------------------------------------------------------------+
|                                                                 |
|                     [Grid Content]                              |
|                                                                 |
+----------------------------------------------------------------+
```

---

## Animation CSS Additions

```css
/* Dropdown expand animation */
@keyframes expandDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 120px;
    transform: translateY(0);
  }
}

.dropdown-expand {
  animation: expandDown 0.25s ease-out forwards;
}

/* Arrow rotation */
.arrow-rotate {
  transition: transform 0.2s ease-out;
}

.arrow-rotate.open {
  transform: rotate(180deg);
}
```

---

## Implementation Order

1. Create `ViewSwitcher.tsx` component with animations
2. Update `TrackerLayout.tsx` - remove sidebar, add new header structure
3. Redesign `MonthlyGrid.tsx` with spreadsheet layout and color-coded weeks
4. Update `WeeklyGrid.tsx` to match new header styling
5. Add animation keyframes to `index.css`
6. Add week colors to `tailwind.config.ts`
7. Delete `AppSidebar.tsx`
8. Update `App.tsx` routes if needed

---

## Mobile Considerations

- ViewSwitcher dropdown works on all screen sizes
- Monthly grid scrolls horizontally on mobile with fixed habit column
- Touch-friendly tap targets (minimum 44px)
- Week headers collapse or show abbreviated text on small screens
