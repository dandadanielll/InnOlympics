# Healthcare Design & Implementation Skill
## Checklist & Enforcement Framework

---

## 1. Palette Strategy (60/30/10 Rule)

### Required Colors
| Role | Hex | Name | Usage |
|------|-----|------|-------|
| Background (60%) | #f2ecdc | Warm Cream | Page backgrounds, reduce eye strain |
| Primary Accent (30%) | #510400 | Deep Red | Hero elements, Primary CTAs, critical alerts |
| Text/Structure (10%) | #3d1b11 | Dark Brown | Primary typography, deep borders |
| Success/Natural | #868859 | Olive | Stable status, confirmed appointments, healthy metrics |
| Secondary Structure | #2a2f18 | Dark Forest | Footer backgrounds, iconography |

### Enforcement Checklist
- [ ] Background coverage: **≥60%** of layout uses #f2ecdc
- [ ] Primary accent usage: **≤30%** of layout uses #510400 and related reds
- [ ] Accent red (#7e2625) reserved for **visual hierarchy only**, not applied arbitrarily
- [ ] Olive (#868859) **never used** for errors, warnings, or negative states
- [ ] Dark Forest (#2a2f18) **not used** as primary text (contrast violation)
- [ ] No unlisted colors introduced without documented justification
- [ ] All color usage passes **WCAG AA contrast ratio** (4.5:1 minimum for text)

### Audit Tool
Run this check on any design:
```
PASS: If 60% background + 30% accent + 10% supporting ≈ 100%
FAIL: If any color exceeds its role allocation
FAIL: If red is used decoratively (non-functional)
FAIL: If contrast ratio < 4.5:1 for any text
```

---

## 2. Design Fundamentals (The Three Pillars)

### 2.1 Visual Hierarchy

#### Required Standards
- [ ] **One hero element per screen** (maximum)
- [ ] Hero scale: Primary CTA **≥ 48px** (touch target minimum)
- [ ] Hero uses color weight **#7e2625** OR significant scale increase
- [ ] Secondary CTAs: **40px** height minimum
- [ ] Tertiary actions: **32px** height minimum
- [ ] Visual weight progression is **immediately obvious** without reading text

#### Enforcement Questions
1. **Can a user identify the primary action in <1 second?**
   - YES → Pass
   - NO → Reduce competing elements or increase hero scale/contrast
2. **Is there a clear second priority?**
   - YES → Pass
   - NO → Demote secondary actions to text links or smaller buttons
3. **Are there more than 3 CTAs above the fold?**
   - YES → FAIL. Reduce to 1 primary + 1–2 secondary max

---

### 2.2 Typography

#### Font Family Constraint
- [ ] Exactly **two font families** used site-wide
  - One serif (body text, accessibility-first)
  - One sans-serif (headings, UI labels)
  - OR both sans-serif if proven accessible
- [ ] No decorative or script fonts in patient-facing content

#### Line-Height & Accessibility
- [ ] Body text: **≥1.6** line-height (medical content readability)
- [ ] Headings: **≥1.3** line-height
- [ ] Letter-spacing: **≥0.02em** for body text (optional; +0.04em if dense medical terms)
- [ ] Font size: **≥16px** for body text on mobile
- [ ] Font size: **≥14px** minimum for supporting text (never smaller)

#### Enforcement Checklist
- [ ] All text readable at **200% zoom** without horizontal scroll
- [ ] No text overlaid on images without **30% opacity darkening** minimum
- [ ] Color contrast verified with tool (WCAG AA minimum)
- [ ] Font weights used consistently: Body = 400, Headings = 600–700

---

### 2.3 Color as Signal

#### Rule: Color = Function, Not Decoration

- [ ] Every instance of #510400 (Deep Red) signals **action or urgency**
  - CTA buttons
  - Critical alerts
  - Time-sensitive information
  - Status warnings
- [ ] Red **never used** for:
  - Decorative borders
  - Background tints without functional meaning
  - Hover states on non-interactive elements

- [ ] #868859 (Olive) used **only** for:
  - ✓ "Confirmed" or "Active" states
  - ✓ Healthy metrics (e.g., "Normal" lab results)
  - ✓ Stable or neutral statuses
  - ✗ Never for errors, negatives, or alerts

#### Color Enforcement Matrix

| State | Approved Color | Forbidden |
|-------|---|---|
| Primary Action | #510400 | #868859, #2a2f18 |
| Success/Stable | #868859 | #510400 |
| Error/Alert | #7e2625 (red weight) | #868859, #2a2f18 |
| Disabled | #d4c4b8 (cream +20%) | Any signal color |
| Neutral/Tertiary | #3d1b11 (brown) | #510400 |

**Violation Protocol:** If a designer uses red outside this matrix, **request justification**. If none exists, revert to approved color.

---

## 3. Design-to-Code Standards

### 3.1 Spacing Scale

**Base Unit: 4px**

Approved increments:
```
4px  | 8px | 12px | 16px | 24px | 32px | 40px | 48px | 56px | 64px
────────────────────────────────────────────────────────────────
1    | 2   | 3    | 4    | 6    | 8    | 10   | 12   | 14   | 16
(multiply by 4px baseline)
```

#### Enforcement Checklist
- [ ] All padding/margin values **divisible by 4px**
- [ ] Component internal spacing uses **8px, 12px, or 16px** (no arbitrary values)
- [ ] External spacing (between components) uses **16px, 24px, or 32px**
- [ ] Gap between grid items: **16px or 24px**
- [ ] Border radius: **4px (subtle), 8px (standard), 12px (cards)** — no "10px" or "3px"

#### Violation Detection
```
PASS: padding: 16px 24px;
FAIL: padding: 15px 25px;
FAIL: padding: 10px;
FAIL: margin: 18px auto;
```

---

### 3.2 Component States

**Every interactive element must support these states:**

#### Required States Matrix

| State | Visual Treatment | Disabled? | Keyboard Focus? | Cursor |
|-------|---|---|---|---|
| **Default** | Base styling | No | Not applicable | pointer |
| **Hover** | +10–15% contrast increase (lighter or darker) | No | Maintain | pointer |
| **Active/Pressed** | 20–25% contrast shift + 1–2px inset shadow | No | Visible focus ring | pointer |
| **Disabled** | 50% opacity OR #d4c4b8 background | **Yes** | No | not-allowed |
| **Loading** | Spinner animation (0.8s rotation) | **Yes** | No | wait |
| **Empty** | Placeholder text (#999) + hint text | No | Optional | text |
| **Error** | Red border (#7e2625) + error message (12px) | Varies | Yes | pointer |
| **Focus** | 3px outline, 2px solid #510400 | No | Yes | pointer |

#### Enforcement Checklist (Button Example)
```html
<!-- ✓ PASS: All states accounted for -->
<button class="btn-primary" data-state="default">Action</button>
<button class="btn-primary" data-state="hover">Action</button>
<button class="btn-primary" data-state="active">Action</button>
<button class="btn-primary" disabled>Action</button>
<button class="btn-primary" data-state="loading">Action</button>

<!-- ✗ FAIL: Missing states -->
<button class="btn-primary">Action</button> <!-- Only one state defined -->
```

#### State Validation Questions
1. **Can user activate this element?** → Requires hover + active + focus
2. **Can this be disabled?** → Requires disabled state
3. **Is there async operation?** → Requires loading state
4. **Can it fail?** → Requires error state
5. **Is it empty by default?** → Requires empty state

---

### 3.3 Naming Convention

**Rule: Use Semantic Names, Not Color Names**

#### Approved Naming Pattern
```
[component]-[modifier]-[state]
```

#### Examples (PASS)
```css
.btn-primary { } /* Semantic: primary action */
.btn-secondary { } /* Semantic: secondary action */
.btn-tertiary { } /* Semantic: supporting action */

.surface-elevated { } /* Semantic: raised container */
.surface-muted { } /* Semantic: background container */

.alert-critical { } /* Semantic: urgent alert */
.alert-success { } /* Semantic: confirmation */

.text-label { } /* Semantic: form label */
.text-muted { } /* Semantic: supporting text */
```

#### Examples (FAIL - Color-Based)
```css
.btn-red { } /* ✗ What if red changes? */
.btn-dark { } /* ✗ Relative to what? */
.surface-cream { } /* ✗ Hardcoded color name */
.text-brown { } /* ✗ Breaks if palette shifts */
```

#### CSS Variable Standard
```css
:root {
  /* Semantic aliases (use these) */
  --color-primary: #510400;
  --color-success: #868859;
  --color-text: #3d1b11;
  --color-background: #f2ecdc;
  
  /* Never use color names directly */
  --color-deep-red: var(--color-primary);
  --color-olive: var(--color-success);
}

/* ✓ PASS: Semantic reference */
.btn-primary {
  background-color: var(--color-primary);
}

/* ✗ FAIL: Direct color reference */
.btn-primary {
  background-color: #510400;
}
```

#### Enforcement Checklist
- [ ] No class names contain: `red`, `blue`, `green`, `dark`, `light`, `cream`, `brown`
- [ ] All color values in CSS reference `--color-*` variables
- [ ] Variable names describe **function**, not color
- [ ] Palette changes update **only CSS variables**, not component classes

---

## 4. Audit & Enforcement Protocol

### 4.1 Design Review Checklist

Use this before handoff to development:

#### Visual Hierarchy
- [ ] Single hero element identified?
- [ ] Hero size ≥48px (buttons)?
- [ ] Visual weight difference obvious without reading?
- [ ] Fewer than 3 CTAs above fold?

#### Color Usage
- [ ] 60% background (#f2ecdc) coverage confirmed?
- [ ] Red used only for functional purpose?
- [ ] Olive used only for success/stable states?
- [ ] All contrast ratios ≥4.5:1?

#### Typography
- [ ] Body text ≥16px on mobile?
- [ ] Line-height ≥1.6 for body text?
- [ ] Only 2 font families used?
- [ ] No text smaller than 14px?

#### Spacing
- [ ] All margins/padding divisible by 4px?
- [ ] No spacing smaller than 8px (except borders)?
- [ ] Consistent gap values (16px or 24px)?

#### Components
- [ ] All buttons have hover, active, disabled, focus states?
- [ ] Loading spinners animate at 0.8s cycle?
- [ ] Error states show red border + message?
- [ ] Disabled buttons show reduced opacity or light background?

### 4.2 Code Review Checklist

Use this for development handoff:

#### CSS Architecture
- [ ] All colors use CSS variables?
- [ ] Variable names are semantic (not color-based)?
- [ ] Spacing values use 4px scale?
- [ ] Border radius: 4px, 8px, or 12px only?

#### Component Implementation
- [ ] Every button has `:hover`, `:active`, `:disabled`, `:focus` states?
- [ ] Focus rings visible (3px outline, #510400)?
- [ ] Loading state uses `aria-busy="true"`?
- [ ] Error messages associated with form fields (aria-describedby)?

#### Accessibility
- [ ] Contrast ratio tested (WCAG AA minimum)?
- [ ] Text readable at 200% zoom?
- [ ] Form labels properly associated?
- [ ] Keyboard navigation works without mouse?

---

## 5. Enforcement Actions

### When a Design Violates Standards

**Severity Level: Critical**
- Red used decoratively (non-functional)
- Contrast ratio <4.5:1
- Text <14px
- Missing component states

**Action:** REJECT. Return to designer with specific fix.

**Severity Level: High**
- More than 3 CTAs above fold
- Spacing not on 4px scale
- Color-based CSS class names
- Line-height <1.4 for body text

**Action:** REQUEST CHANGES. Provide remediation examples.

**Severity Level: Medium**
- Hover state missing (non-critical elements)
- Border radius not on approved scale
- Supporting text <12px (non-critical)
- Inconsistent spacing within component

**Action:** SUGGEST IMPROVEMENTS. Designer has discretion to accept/reject.

---

## 6. Quick Validation Tools

### Color Validator
```
Input: Design screenshot
Check:
  ✓ Background = #f2ecdc (60% coverage)?
  ✓ Red only on CTAs, alerts, hero?
  ✓ Olive only on success/stable?
  ✓ Contrast ≥4.5:1?
Output: PASS / FAIL + specific violations
```

### Spacing Validator
```
Input: Component CSS
Check:
  ✓ All pixel values divisible by 4?
  ✓ Minimum 8px gap (no 4px external spacing)?
  ✓ Border radius in {4, 8, 12}px?
Output: PASS / VIOLATIONS (with line numbers)
```

### State Validator
```
Input: Button/form component HTML
Check:
  ✓ :hover state defined?
  ✓ :active state defined?
  ✓ :disabled state defined?
  ✓ :focus state defined (3px outline)?
  ✓ :invalid or [aria-invalid] state defined?
Output: PASS / MISSING STATES (list each)
```

### Typography Validator
```
Input: CSS font rules
Check:
  ✓ Font size ≥14px (minimum), ≥16px (body)?
  ✓ Line-height ≥1.4?
  ✓ Only 2 font families total?
  ✓ Contrast ≥4.5:1?
Output: PASS / VIOLATIONS (with element selectors)
```

---

## 7. How to Use This Skill

### Scenario 1: Design Handed to Developer
1. Run **Design Review Checklist** (Section 4.1)
2. If any item unchecked → Return to designer
3. If all pass → Proceed to development

### Scenario 2: Code Review Before Merge
1. Run **Code Review Checklist** (Section 4.2)
2. Run **Spacing Validator** on CSS
3. Run **State Validator** on interactive components
4. If violations found → Enforce fixes per Section 5

### Scenario 3: Accessibility Audit
1. Run **Typography Validator**
2. Test contrast with tool (WebAIM, Lighthouse)
3. Test keyboard navigation
4. Test at 200% zoom
5. If failures → Enforce improvements

### Scenario 4: Design System Update
1. Update color variables (Section 3.3)
2. Audit all existing components for violations
3. Create migration plan for non-compliant components
4. Document changes in style guide

---

## 8. References & Tools

### External Validators
- **Contrast:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Accessibility:** [WAVE Browser Extension](https://wave.webaim.org/extension/)
- **Typography:** [Font Size Calculator](https://www.fontsize.io/)
- **Spacing:** Browser DevTools (measure pixel values)

### Healthcare-Specific Guidance
- **HIPAA Compliance:** Color contrast critical for patient safety (alert visibility)
- **Readability:** Medical terminology demands line-height ≥1.6
- **Trust:** Consistent color semantics (red = urgent) builds user confidence

---

## Checklist Summary (Printable)

### Pre-Handoff Checklist
```
DESIGN REVIEW
□ Visual hierarchy: 1 hero, <3 CTAs above fold
□ Color: 60% background, 30% accent, 10% support
□ Typography: 2 fonts, ≥16px body, ≥1.6 line-height
□ Spacing: All values on 4px scale
□ States: Hover, active, disabled, focus defined
□ Contrast: All text ≥4.5:1 ratio
□ Semantics: No color-based names in designs

CODE REVIEW
□ CSS variables used for all colors
□ Semantic naming (btn-primary, not btn-red)
□ Spacing divisible by 4px
□ All interactive states in code
□ Focus rings visible (3px, #510400)
□ Aria attributes for form validation
□ Text readable at 200% zoom
□ Keyboard navigation works

ACCESSIBILITY REVIEW
□ Contrast tested (WCAG AA)
□ Form labels associated
□ Errors announced to screen readers
□ Loading states have aria-busy
□ No reliance on color alone to convey meaning
```
