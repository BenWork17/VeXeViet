# VeXeViet UI Modernization Plan (PI 2)

## Vision
Transform the existing UI from a generic template into a distinctive, production-grade interface that reflects Vietnamese identity with a modern, luxury aesthetic.

## Aesthetic Direction: "Modern Vietnamese Luxury"
- **Color Palette**: 
  - Primary: Deep Red (`#8B0000`)
  - Accent: Gold (`#D4AF37`)
  - Background: Off-white (`#FDFDFD`) / Charcoal (`#1A1A1A`) for Dark Mode
- **Typography**: Be Vietnam Pro (Clean, modern, optimized for Vietnamese)
- **Style**: Refined minimalism with high-impact motion and asymmetric layouts.

---

## SAFe Iteration Roadmap

### Iteration 2.1: Foundation & Design System
- **Focus**: Core UI packages and theme definition.
- **Tasks**:
  - [ ] Configure `Tailwind v4` theme variables.
  - [ ] Update `@vexeviet/ui` base components (Button, Input, Card).
  - [ ] Integrate "Be Vietnam Pro" font.
- **Applied Skill**: `designing-frontend-components`

### Iteration 2.2: The "Hero" Experience
- **Focus**: Homepage and Search Widget.
- **Tasks**:
  - [ ] Redesign Hero Section with high-impact visuals.
  - [ ] Refactor `SearchForm` for superior UX and mobile responsiveness.
  - [ ] Implement creative "Popular Routes" grid.
- **Applied Skill**: `frontend-design`

### Iteration 2.3: Journey Selection & Search
- **Focus**: Search results and filtering.
- **Tasks**:
  - [ ] Modernize Route Cards in search results.
  - [ ] Interactive Seat Selection UI overhaul.
  - [ ] Intelligent filtering sidebar.
- **Applied Skill**: `designing-frontend-components`

### Iteration 2.4: Checkout & E-Ticket
- **Focus**: Conversion and post-booking experience.
- **Tasks**:
  - [ ] Minimalist Checkout flow.
  - [ ] High-fidelity E-Ticket design.
  - [ ] Payment status micro-interactions.
- **Applied Skill**: `designing-frontend-components`

### Iteration 2.5: Quality & Refinement
- **Focus**: Performance, Accessibility, and Code Quality.
- **Tasks**:
  - [ ] Full code audit using `reviewing-frontend-code`.
  - [ ] WCAG 2.1 AA accessibility compliance check.
  - [ ] Core Web Vitals optimization.
- **Applied Skill**: `reviewing-frontend-code`

---

## Governance
- **Reviewer**: `reviewing-frontend-code` skill must be triggered for every major UI PR.
- **Standards**: Must adhere to [AGENTS.md](file:///d:/Vexeonline/AGENTS.md) and [TESTING-GUIDE.md](file:///d:/Vexeonline/TESTING-GUIDE.md).
