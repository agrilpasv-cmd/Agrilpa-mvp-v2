# Antigravity Design Expert Skill

> **Skill Identifier:** `antigravity-design-expert`  
> **Role:** Lead UI/UX Architect & Design System Specialist for Antigravity AI Agent.

---

## 🎨 Core Design Philosophy

1. **First-Impression Wow Factor**
   - Every interface must feel premium, state-of-the-art, and alive.
   - Avoid generic browser defaults and plain colors (pure red, green, blue).
   - Use curated HSL color tokens, smooth gradients, subtle backdrop blurs (glassmorphism), and soft elevated shadows.

2. **Typography & Hierarchy**
   - Leverage modern web fonts (Inter, Outfit, Plus Jakarta Sans, Roboto).
   - Maintain clear vertical rhythm with exact font weights (`font-medium`, `font-semibold`, `font-bold`).
   - Use uppercase tracking for table headers and section micro-labels (`text-[11px] font-semibold tracking-widest text-muted-foreground`).

3. **Color Tokens & Branding**
   - **Primary Action Color:** Use system brand tokens (`bg-primary`, `hover:bg-primary/90`, `text-primary-foreground`) instead of hardcoded utility colors (e.g. `emerald-600`).
   - **Cards & Surfaces:** Use clean contrast (`bg-background`, `border border-border/60`, `shadow-sm`).
   - **Status Badges:** Use semantic HSL alert colors with matching soft backgrounds (e.g. `bg-emerald-50 text-emerald-800 border-emerald-300`).

---

## 📐 Layout & Grid Architecture

1. **Dashboard & App Layouts**
   - Default container for full-width views: `space-y-6 p-6 w-full` (aligned with standard dashboard modules).
   - Wizard/Stepper container: `max-w-4xl mx-auto p-4 md:p-8 space-y-8` for optimal reading width and cognitive focus.

2. **Responsive Grids**
   - Cards & Product Grids: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`.
   - Data & Form Rows: `flex flex-col sm:flex-row gap-4`.

3. **High-Conversion Empty States**
   - Always pair empty views with a prominent visual cue (icon with blurred glowing halo effect `bg-primary/20 blur-xl animate-pulse`).
   - Include clear value proposition text and a bold primary CTA button.
   - Add micro-education cards explaining platform benefits (e.g., Alcance Global, Conexión Directa).

---

## 🚀 Interactive Components & Micro-Animations

1. **Buttons & CTAs**
   - Rounded pill buttons (`rounded-full`) for high-conversion actions (`h-12 px-8 font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]`).
   - Icon buttons: Square rounded (`w-10 h-10 rounded-xl flex items-center justify-center`).

2. **Form Steppers & Wizards**
   - Distinct completed vs active vs future step indicators with icons (`Check`, `ChevronRight`).
   - Inline real-time validation feedback.
   - Intelligent fallback values for all required background payload fields.

3. **Dynamic Feedback & Micro-Interactions**
   - Subtle entry transitions (`animate-in fade-in zoom-in-95 duration-300`).
   - Loading skeletons and spinners for asynchronous data fetching.

---

## ⚡ Technical Guidelines for Next.js & TailwindCSS

- Always maintain responsive, accessible HTML markup (`aria-*`, semantic HTML5 elements).
- Use `lucide-react` icons consistently throughout the application.
- Preserve design system tokens configured in Tailwind (`primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `card`).
