# Synapse: AI-Powered Energy Management

**Tagline**: "Duolingo x Headspace" for productivity — gamified, empathetic, and adaptive.

## Architecture Overview

**Dual-Mode System**: Users choose their mental state via `EnergyGate` → routes to `ProductiveView` (high energy) or `BurnoutView` (low energy).

- **State Management**: Zustand store (`src/store/useEnergyStore.ts`) tracks `mode` ("productive" | "burnout" | null) and `persona` (user personality profile from onboarding)
- **Persona-Driven UX**: All AI responses and microcopy adapt based on user's persona type (Sensitive Soul, Action Taker, Deep Thinker)
- **Main Flow**: `Onboarding` → `EnergyGate` → `ProductiveView` OR `BurnoutView`

## Core Components

### ProductiveView (`src/components/ProductiveView.tsx`)
High-energy mode: task breakdown, Pomodoro timer, stats dashboard.
- **AI Breakdown**: User inputs task → `/api/breakdown` → returns `MicroMission[]` with energy tags (Deep Work, Shallow Work, Recovery)
- **Mission Cards**: Collapsible, expandable tasks with checkbox toggle
- **Progress Tracking**: Visual progress bar based on completed tasks

### BurnoutView (`src/components/BurnoutView.tsx`)
Low-energy mode: chat-based emotional support, breathing exercises.
- **Chat Interface**: Predefined emotional options ("i'm exhausted") or manual text input
- **API**: `/api/chat-burnout` provides empathetic responses based on persona
- **Breathing Modal**: Guided breathing exercise component

### MissionCard (`src/components/MissionCard.tsx`)
Individual task UI with expand/collapse, checkbox, energy tag display.
- **States**: `isCompleted` (greyed out), `isExpanded` (shows summary)
- **Energy Tags**: Color-coded (Deep Work = red, Shallow Work = blue, Recovery = green)

## Design System

**Design Philosophy**: Warm, supportive, "juicy" interactions inspired by Duolingo's gamification + Headspace's calm aesthetics.

### Key Design Patterns
- **Custom Tailwind Classes** (defined in `globals.css`):
  - `.shadow-soft-blue`, `.shadow-soft-orange`: Soft shadows for cards
  - `.btn-clay`, `.btn-clay-blue`: "Claymorphism" buttons with bottom border that compresses on click
  - `.input-soft`: Inner-shadow input fields
- **Rounded Everything**: Use `rounded-[32px]`, `rounded-3xl` for major containers (avoid sharp corners)
- **Emoji-First Icons**: Use large emojis (text-5xl+) as primary visual elements (🦉 for focus, 🐨 for rest)
- **Font**: Nunito (defined in `layout.tsx`) — soft, friendly sans-serif

### Interaction Standards
- **Checkbox Animations**: On completion, play sound (`/notification.mp3`), show toast, trigger `CheckCircle2` icon
- **Hover States**: Add `hover:scale-105` to interactive elements for "juicy" feedback
- **Progress Indicators**: Always use gradient progress bars (`from-blue-500 to-green-400`)

### **Design Feedback to Implement** (from user's critique):
1. **Microcopy Warmth**: Replace developer language with human language
   - ❌ "Source: User Input" → ✅ "📝 Dari catatanmu" or "From your notes"
   - Use first-person, casual tone in labels
2. **Tag Colors (Anxiety Reduction)**:
   - ❌ Red/pink for "DEEP WORK" (triggers stress) 
   - ✅ Use purple (`bg-purple-50 text-purple-600`) or orange (`bg-orange-50 text-orange-600`)
3. **Accessibility for Completed Tasks**:
   - Only strikethrough the **task title**, not the entire card
   - Keep description text legible (dark grey, no strikethrough) for reflection purposes
4. **Gamification "Juice"**:
   - Enlarge checkboxes slightly (`w-8 h-8` → `w-10 h-10`)
   - Add confetti/bounce animation on task completion (consider `react-confetti` or CSS keyframe)
5. **Active Task Highlighting**:
   - Add `border-blue-200` or subtle glow (`shadow-md`) to currently expanded task card
   - Visual elevation to indicate "focus here"
6. **Progress Bar Endpoint Icon**:
   - Add finish flag emoji (🏁) or star icon at right end of progress bar as visual goal

## API Routes

All AI interactions use Google Gemini API (`@google/generative-ai`):

### `/api/breakdown` (POST)
**Input**: `{ task: string }`  
**Output**: `MicroMission[]` — breaks down task into small actionable steps with energy labels.

### `/api/chat-productive` (POST)
**Input**: `{ history: ChatMessage[], message: string, persona: Persona }`  
**Output**: `{ message: string }` — sharp, strategic coaching responses.

### `/api/chat-burnout` (POST)
**Input**: `{ history: ChatMessage[], message: string, persona: Persona }`  
**Output**: `{ message: string }` — empathetic, validating responses.

**Prompt Engineering Pattern**: System prompts adapt tone/language based on `persona.type` (e.g., Action Takers get bullet points, Sensitive Souls get encouragement).

## Development Workflow

**Stack**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Zustand

### Commands
```bash
npm run dev     # Start dev server (http://localhost:3000)
npm run build   # Production build
npm run lint    # ESLint check
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### File Structure Conventions
- `/src/app/api/*/route.ts` — API route handlers
- `/src/components/*.tsx` — React components (PascalCase filenames)
- `/src/store/*.ts` — Zustand stores (prefix with `use`)

## Common Tasks

### Adding a New AI Feature
1. Create API route in `/src/app/api/[feature]/route.ts`
2. Import `GoogleGenerativeAI`, define system prompt with persona adaptation
3. Use `model.startChat({ history })` pattern for conversation continuity
4. Handle errors gracefully: return friendly fallback message on 500

### Creating New Component
- Use `"use client"` directive if state/hooks needed
- Import from `@/` alias (points to `src/`)
- Follow emotion-first design: add personality to labels, avoid technical jargon
- Include hover states, transitions, and emoji icons

### Styling Guidelines
- Never use sharp corners (`rounded-sm`, `rounded-md`) — always `rounded-2xl` minimum
- Add transitions to all interactive elements (`transition-all duration-300`)
- Use semantic color variables: blue = productive, orange/amber = rest, green = progress
- Leverage custom utility classes from `globals.css` (`.btn-clay`, `.shadow-soft-*`)

## Debugging

- **Zustand State**: Use React DevTools + Zustand middleware to inspect store
- **API Errors**: Check console for Gemini API errors (rate limits, invalid keys)
- **Toast Notifications**: Uses `sonner` library — look for `toast.success()` / `toast.error()` calls

## Critical Context

**Why Dual Modes?** Users in burnout can't handle productivity tools. Synapse adapts the entire interface (not just theme) based on energy level.

**Why Persona System?** Generic productivity apps feel robotic. Persona-driven AI creates a "companion" experience that mirrors how users naturally think/work.

**Why Emoji-Heavy Design?** Text-heavy UIs increase cognitive load. Large emojis communicate instantly without reading.
