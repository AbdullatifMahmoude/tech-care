# TechCare Frontend

Lightweight, modular frontend built from the chosen **TechCare Neural Mesh 3D** Stitch design and integrated with verified real business content from `https://tech-care.tech/home` and `https://tech-care.tech/medi`.

## Stack
- **Vite 6 + React 19 + TypeScript 5**
- **Tailwind CSS v4** (`@tailwindcss/vite`, `@theme` tokens in `src/styles/theme.css`)
- **React Router v7** with route-level `React.lazy` code splitting
- **Three.js** (`vendor-three` async chunk) powering the Live Clinical Neural Mesh 3D backdrop

## Routes
- `/` & `/home` — **Live Clinical Neural Mesh 3D** Home: Hero + 4 Core Pillars (`01–04`), About Tech Care & UN SDGs (`3, 9, 17`), Benefits (`01–04`), Why TechCare (`01–03`), Medi Spotlight, Digital Twin, Hospital Integrations, Interactive Clinical Operations (`01–06`), Real 10 Partners Marquee + Verification Modal, Contact Form, and Newsletter
- `/medi` — **Medi Physician's Personal Clinical Assistant** (English & Arabic auto-RTL, Guest/Signed-in case history, starter prompts, `PDF Plan` print export)
- `/mada` — **Mada Platform Overview**

## Live AI & Managed Backend Integration
Copy `.env.example` to `.env` to wire up your live AI model and admin/CMS APIs without changing UI components:

```env
VITE_AI_API_URL=https://api.your-domain.com/ai
VITE_AI_API_KEY=optional_client_token
VITE_API_BASE_URL=https://api.your-domain.com
```

- `src/services/aiClient.ts`: sends `POST ${VITE_AI_API_URL}/chat` (`{ query, context, history }`); runs a bilingual clinical demo simulator when unset.
- `src/services/contentService.ts`: reads `GET ${VITE_API_BASE_URL}/content` for CMS-managed partners/announcements with static fallback.
- `src/services/contactService.ts`: posts `/contact`, `/newsletter`, and `/demo-requests` to `${VITE_API_BASE_URL}` or persists locally in demo mode.

## Commands
```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run preview
```
