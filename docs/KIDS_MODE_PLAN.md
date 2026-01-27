# Kids Mode: Toddler & Early-Primary Experience Plan

## Vision
To provide a dedicated, age-appropriate learning experience for toddlers and early-primary students within the existing LMS ecosystem. This "Kids Mode" will run on the same backend engine but offer a radically simplified, interactive, and gamified frontend interface.

## Core Philosophy
- **Separate Experience**: A distinct UI layer (`/kids` or toggle) that hides complex navigation.
- **Interactive First**: Focus on "doing" (drawing, speaking, dragging) rather than "reading/watching".
- **Visual & Audio**: Heavy use of icons, colors, and text-to-speech for instructions.
- **Safe & Guided**: Locked-down navigation to keep learners focused.

---

## Technical Architecture

### Backend (NestJS)
- **New Content Types**: Extend `LessonContentType` to include:
  - `DRAWING`: For coloring books and free drawing.
  - `VOICE`: For oral homework/responses.
  - `INTERACTIVE`: Simple drag-and-drop or matching games.
- **Kids Profile**: Add `is_kids_mode` flag to User or a separate `StudentProfile` to track age-specific settings.
- **Submission Handling**: enhanced `FilesService` to handle image/audio blobs from frontend directly.

### Frontend (Next.js / Expo)
- **Kids Layout**:
  - No sidebar/complex header.
  - Big, touch-friendly buttons (FABs).
  - "Back" button always visible and obvious.
- **Libraries**:
  - `react-sketch-canvas` or `fabric.js` for Drawing/Coloring.
  - `react-media-recorder` for Voice.
  - Web Speech API for Text-to-Speech instructions.

---

## Sprint Plan

### Sprint 1: Foundation & Content Types (Backend + Core Components)
**Goal**: Enable the system to store and render "Kids" content.
1.  **Backend**:
    -   Update `LessonContentType` enum with `DRAWING`, `VOICE`.
    -   Update `CourseLesson` entity to support "template" assets (e.g., the SVG to color).
2.  **Frontend Components**:
    -   Build `DrawingCanvas` component:
        -   Features: Brush size, color palette, "Undo", "Save".
        -   Support background image (wireframe/template).
    -   Build `VoiceRecorder` component:
        -   Simple "Hold to Record" or "Tap to Record" UI.
        -   Playback review before submit.
3.  **Submission Flow**:
    -   Wire up `DrawingCanvas` save to `submitQuiz` or new `submitAssignment` endpoint (uploading the image).

### Sprint 2: The Kids UI Experience (Frontend Layout)
**Goal**: Create the "wrapper" that makes the app feel like a game.
1.  **Kids Layout**:
    -   Create `apps/web/src/layouts/KidsLayout.tsx`.
    -   Simplified "Map" view for Course Dashboard (instead of list).
2.  **Navigation**:
    -   "Big Button" navigation.
    -   Visual progress indicators (stars, path unlock).
3.  **Audio Integration**:
    -   Auto-play instructions for non-readers.
    -   "Read to me" button on all text blocks.

### Sprint 3: Advanced Features & Polish
**Goal**: Make it fun and safe.
1.  **Gamification Visuals**:
    -   Replace standard Toasts with full-screen "Great Job!" animations (Lottie files).
    -   "Sticker Book" for earned badges.
2.  **Parental Controls**:
    -   "Parent Gate" (simple math problem or pin) to exit Kids Mode.
    -   Settings to limit daily screen time (optional).
3.  **Mobile Optimization**:
    -   Ensure touch targets are massive on iPad/Tablets.
    -   Lock landscape mode if necessary.

---

## Immediate Next Steps (Sprint 1 Start)
1.  Define the `DRAWING` content type in Backend.
2.  Create the `DrawingCanvas` component in Frontend.
