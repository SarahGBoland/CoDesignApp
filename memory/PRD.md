# Co-Design Connect - Product Requirements Document

## Original Problem Statement
Build a Co-Design web app that walks people through accessible Co-design using:
- Problem Trees
- Empathy Maps
- Story Map
- Ideas Board
- I Like I Wish What If
- Manage Expectations

### Target Users
1. **Co-Designers**: People with real-life experience who may communicate differently, find reading hard, use assistive tools, or need more time
2. **Facilitators**: Researchers, service staff, designers, students who run sessions and support co-designers

### Design Requirements
- Simple words and easy to use
- Work on tablets with large touch targets
- Help people with different needs
- Let people choose and feel in control
- No technical skills required
- Calm and supportive tone

## User Choices (Implementation Decisions)
- **Authentication**: JWT-based custom auth
- **Text-to-Speech/Speech-to-Text**: Browser Web Speech API (free, works offline)
- **AI Summaries**: Manual summaries only (no AI)
- **Offline Support**: Basic offline viewing
- **Color Theme**: Calm, supportive - Cream background with Sage Green primary

## Architecture

### Backend (FastAPI + MongoDB)
- `/api/auth/*` - JWT authentication (register, login, me)
- `/api/projects/*` - Project CRUD
- `/api/sessions/*` - Session management
- `/api/problem-trees/*` - Problem Tree data
- `/api/empathy-maps/*` - Empathy Map data
- `/api/story-maps/*` - Story Map data
- `/api/ideas-boards/*` - Ideas Board data
- `/api/feedback/*` - I Like I Wish What If data
- `/api/expectations/*` - Manage Expectations data

### Frontend (React + Tailwind CSS)
- Landing page with role selection
- Auth pages (login/register)
- Dashboard with projects
- Session view with step navigation
- 6 Design tool pages with accessibility features

## What's Been Implemented (January 27, 2026)

### Core Features ✅
- [x] JWT authentication with role support (co-designer/facilitator)
- [x] Project and session management
- [x] All 6 co-design tools:
  - Manage Expectations (goals, constraints, success criteria)
  - Problem Tree (causes, effects, core problem)
  - Empathy Map (says, thinks, does, feels)
  - Story Map (activities, tasks, stories)
  - Ideas Board (idea cards with voting and categories)
  - I Like I Wish What If (feedback collection)
- [x] Text-to-Speech (TTS) buttons on all content
- [x] Speech-to-Text (STT) input support
- [x] Help button with voice guidance on each page
- [x] Large touch targets (48px+) for tablet use
- [x] Step-by-step navigation between tools
- [x] Save/load data for each tool
- [x] Responsive design for tablet/mobile

### Accessibility Features ✅
- Large buttons and inputs
- Icon + text labels everywhere
- TTS for all text content
- STT for all text inputs
- High contrast colors
- Clear visual hierarchy
- Simple language throughout

## Prioritized Backlog

### P0 (Critical - Not Done)
- None - core functionality complete

### P1 (High Priority - Next Phase)
- [ ] Facilitator session planning templates
- [ ] Session invite/share functionality for co-designers
- [ ] Session summary/report generation
- [ ] Export session data to PDF

### P2 (Medium Priority)
- [ ] Offline data persistence (Service Worker)
- [ ] Session notes/comments system
- [ ] Image/icon selection for ideas
- [ ] Drag-and-drop card organization
- [ ] Multi-language support

### P3 (Nice to Have)
- [ ] Voice recognition for sign-in
- [ ] Session templates library
- [ ] Collaborative real-time editing
- [ ] Analytics dashboard for facilitators

## Next Tasks
1. Test full user flow end-to-end
2. Add session sharing between facilitator and co-designers
3. Implement session summary view
4. Add more accessibility testing with screen readers
