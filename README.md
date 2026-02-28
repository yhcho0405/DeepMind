# CivicQuest Seoul — 고장몬 도감 🏙️🐾

도시 인프라 문제를 촬영하고, AI가 분석하고, 귀여운 몬스터로 수집하는 게이미피케이션 시빅테크 앱!

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Setup

1. Open the app → click **Settings** (gear icon or bottom nav)
2. Paste your **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)
3. Start scanning!

## 🎮 How to Play

1. **Scan** — 카메라로 도시 인프라 문제를 촬영하거나 이미지를 업로드
2. **Analyze** — AI가 문제를 분석하고 불편도/위험도 점수 산출
3. **Collect** — 몬스터를 생성하고 울음소리를 듣고 도감에 추가
4. **Map** — 수집한 몬스터들을 지도에서 확인
5. **Dex** — 몬스터 도감에서 필터/정렬하며 컬렉션 관리

## 🤖 Models Used

| Purpose | Model | Configurable |
|---------|-------|:---:|
| Analysis | `gemini-2.5-flash` | ✅ |
| Image Generation | `gemini-2.0-flash-exp` | ✅ |
| TTS (Monster Cry) | `gemini-2.5-flash-preview-tts` | ✅ |

## 💾 Data Storage

- **Monster records** — IndexedDB via localforage
- **Images & Audio** — IndexedDB blob storage
- **Settings & API Key** — localStorage
- **No external backend** — everything runs client-side

## ⚠️ Limitations

- API key is stored in browser localStorage (not encrypted)
- Geolocation requires HTTPS or localhost
- Image generation quality varies by model
- TTS may fail with some SSML inputs
- Large collections may slow down the browser
