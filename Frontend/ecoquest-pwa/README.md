# 🌱 EcoQuest PWA

Eco-friendly wildlife quest app built with React + Vite as a Progressive Web App.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your AWS API Gateway URL and Cognito config

# 3. Start dev server
npm run dev
# Open http://localhost:5173
```

## 📱 Testing as a PWA on iPhone

1. Run `npm run build && npm run preview`
2. Find your local IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
3. On your iPhone, open Safari → `http://YOUR_IP:4173`
4. Tap Share → "Add to Home Screen"

## 🏗️ Project Structure

```
src/
├── pages/          # One file per screen
├── components/     # Reusable UI components
├── services/       # All API calls (→ AWS Lambda via API Gateway)
├── hooks/          # useCamera, useGPSLocation, useAuth
└── styles/         # Global CSS + Tailwind config
```

## 🔌 Wiring to AWS

Each service file maps to a Lambda function behind API Gateway:

| Service file          | Lambda function              |
|-----------------------|------------------------------|
| questService.js       | Quest Engine                 |
| matchService.js       | Group Matching Service       |
| speciesService.js     | Species Info + Rekognition   |
| locationService.js    | Location Processor           |

Set `VITE_API_GATEWAY_URL` in `.env` to your API Gateway base URL.

## 🛠️ Dev Tips

- Use the **"Skip (dev mode)"** button on onboarding to bypass auth during development
- Mock data is clearly labeled `MOCK_*` in each page — replace with real service calls
- Camera page has a mock Rekognition response — wire `identifySpecies()` in Camera.jsx

## 🚢 Deploy

```bash
# Deploy frontend to Vercel
npx vercel --prod
```
