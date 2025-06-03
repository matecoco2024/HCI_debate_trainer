# 🎯 Debate Wise Trainer Pro

An AI-powered debate training application built with React, TypeScript, and Vite.

## ✨ Features

- **Personality-driven AI debaters** (Alex, Sam, Jordan) with distinct arguing styles
- **Coach Maya** - Animated AI coach with mood states and contextual feedback
- **Speech-to-text functionality** for hands-free argument input
- **Dynamic coaching** that adapts to debate progress
- **Enhanced UI** with animations and visual personality indicators
- **Fallacy detection disabled** for smoother debate experience
- **Short, engaging AI responses** (25-50 words max)

## 🚀 GitHub Pages Deployment

### Option 1: Automatic Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Save

3. **Your site will be available at:**
   ```
   https://[your-username].github.io/debate-wise-trainer-pro/
   ```

### Option 2: Manual Deployment

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Deploy manually:**
   ```bash
   npm run deploy
   ```

## 🛠️ Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### GitHub Pages Base URL

The app is configured to work with GitHub Pages. The base URL is automatically set in `vite.config.ts`:

```typescript
base: mode === 'production' ? '/debate-wise-trainer-pro/' : '/',
```

### Environment Variables

- `VITE_HF_API_KEY`: Hugging Face API key (optional, fallback provided)

## 📁 Project Structure

```
src/
├── components/
│   ├── AnimatedCoach.tsx    # Animated coach character
│   └── ui/                  # Reusable UI components
├── pages/
│   ├── DebatePractice.tsx   # Main debate interface
│   ├── Settings.tsx         # App settings
│   └── Analytics.tsx        # Performance analytics
├── services/
│   ├── LLMService.ts        # AI integration
│   └── StorageService.ts    # Local storage
└── data/
    ├── debateTopics.ts      # Debate topics database
    └── fallacies.ts         # Fallacy examples
```

## 🎨 Animations & Features

- **Float animation** - Gentle coach movement
- **Sparkle effects** - Coach talking indicators
- **Speech bubbles** - Dynamic coach messages
- **Personality indicators** - Visual AI debater identification
- **Speech-to-text** - Microphone input support

## 🤖 AI Personalities

### Debaters
- **Alex** - Evidence-based, passionate about data
- **Sam** - Analytical, systematic approach
- **Jordan** - Creative, uses analogies and wit

### Coach
- **Maya** - Encouraging, experienced debate coach
  - Early rounds: Encouraging personality
  - Mid rounds: Analytical feedback
  - Final rounds: Friendly celebration

## 🌐 Browser Compatibility

- **Speech Recognition**: Chrome, Edge, Safari (latest versions)
- **Modern browsers** with ES6+ support
- **Mobile responsive** design

## 📜 License

MIT License - feel free to use and modify!

---

Built with ❤️ using React, TypeScript, Vite, and Tailwind CSS
