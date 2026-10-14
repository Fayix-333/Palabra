# PALABRA Academy — DHIU Sibaq Preparation Platform

**Event:** DHIU Sibaq National Arts Fest  
**Competition Code:** TN.31 PALABRA  
**Category:** Linguistics / Spanish Vocabulary Translation  
**Duration:** 60 Minutes  
**Evaluation Criteria:** Accuracy, spelling, correction, and speed  

**PALABRA Academy** is an interactive, responsive web application purpose-built to prepare candidates for **TN.31 PALABRA**, translating English words into Spanish under realistic competition conditions.

---

## 🌟 Key Features

1. **Personalised Dashboard**
   - Live learning streak tracker with daily activity logging.
   - Comprehensive performance metrics: words learned, words mastered, revision queue, accuracy %, and average response time.
   - 7 official syllabus category cards with progress bars and quick drill buttons.
   - Daily vocabulary challenge with bonus XP.

2. **Official 7-Area Vocabulary Database**
   - Over 180 curated entries based on the official PALABRA handbook.
   - **Alphabets:** 27 Spanish letter names with accents (eñe, hache, jota, uve, uve doble, etc.).
   - **Numbers:** 0–20, 21–30 (veintidós, veintitrés, veintiséis), tens, hundreds (quinientos, setecientos, novecientos), thousands, and un millón.
   - **Days of the Week:** lunes to domingo, plus calendar terms.
   - **Months of the Year:** enero to diciembre.
   - **Colours:** Primary, secondary, and metallic shades with regional variants (marrón/café, rosa/rosado).
   - **Fruits:** 30+ fruits with regional alternatives (manzana, plátano/banana, piña/ananá, aguacate/palta).
   - **Vegetables:** 30+ vegetables with regional alternatives (zanahoria, tomate/jitomate, papa/patata, brócoli, maíz/choclo).
   - Personal student notes & bookmarks per word.
   - **Printable A4 Revision Sheet** with blank self-recall column.

3. **Spaced-Repetition Learn Mode**
   - Tactile flashcard experience with English → Spanish and Spanish → English toggles.
   - Native Spanish audio speech synthesis (`SpeechSynthesisUtterance`).
   - Rate recall: Easy, Got It, Difficult.
   - Keyboard shortcuts (`Space`/`Enter` to flip, `Arrow Keys` for navigation, `1/2/3` for rating).

4. **Interactive Quiz Engine**
   - **Multiple Choice:** 4 randomised options with balanced distractors.
   - **Type the Translation:** Direct translation with virtual Spanish accent buttons (á, é, í, ó, ú, ñ, ¿, ¡, ü).
   - **Spelling Challenge:** Strict accent and tilde validation.
   - **Speed Round:** Rapid countdown timer (5s, 10s, 15s) per word.
   - **Mistake Revision:** Automatically drills words answered incorrectly.
   - **Instant Results Breakdown:** Question-by-question review, average speed, retry wrong answers.

5. **60-Minute Sibaq Simulation**
   - Full distraction-free exam view.
   - 60:00 countdown timer with autosave in `localStorage`.
   - Numbered question palette (1..N) with answered, unanswered, and flagged indicators.
   - Automatic submission on timer expiry (00:00).
   - Practice mode (pausable) vs. Strict mode (unpausable, auto-submits).

6. **15-Day Preparation Curriculum**
   - Day-by-day structured checklist with 1-click launch buttons.
   - Fully flexible with unblocked progression.

7. **Gamification & Analytics**
   - XP system with duplicate prevention.
   - 8 milestone achievements (Vocabulary Explorer, Perfect Spelling, Mock Finisher, etc.).
   - 7-day study volume chart, weakest syllabus area identifier, and spelling trap tracker.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 with custom typography (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`)
- **Icons:** Lucide React
- **Audio:** Web Audio API synthesizer for clean sound effects + HTML5 SpeechSynthesis for authentic Spanish pronunciation
- **Persistence:** LocalStorage (offline-first guest mode) + Optional Cloud Firestore / Firebase Auth
- **Deployment:** Vercel SPA-ready with `vercel.json` rewrites

---

## 🚀 Local Development

1. Clone or open the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Run unit tests:
   ```bash
   npm test
   ```
5. Build for production:
   ```bash
   npm run build
   ```

---

## ☁️ Optional Firebase Configuration

The application works completely out of the box in **Guest Mode** using `localStorage` without requiring Firebase.

To enable multi-device cloud synchronization and Google Sign-In:
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google provider) and **Cloud Firestore**.
3. Create a `.env` file from `.env.example`:
   ```bash
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```
4. Deploy Firestore security rules (`firestore.rules`):
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🌐 Vercel Deployment

1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. The included `vercel.json` automatically ensures that all client-side routes (`/learn`, `/quiz`, `/mock-test`, etc.) resolve cleanly upon browser refresh.
4. Set any optional environment variables in Vercel project settings if using Firebase cloud sync.
