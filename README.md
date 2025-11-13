# 🐾 Paw Patrol Reporter

A mobile-first web application for reporting stray animals in need, with an AI-driven triage system to prioritize rescue efforts for animal shelters.

## Features

- 📷 **Image Upload**: Take or select photos of animals
- 📍 **GPS Location Capture**: Automatically capture user's location
- 🤖 **AI Triage System**: Real AI-powered image analysis using Groq API
- 🏥 **Shelter Dashboard**: View all reports sorted by priority score

## Tech Stack

- **Frontend**: Next.js 14 with React (App Router)
- **Backend**: Next.js API Routes
- **Database**: JSON file storage (SQLite-ready)
- **Styling**: Mobile-first CSS with inline styles

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
/
├── app/
│   ├── api/
│   │   └── reports/
│   │       └── route.ts          # API endpoint for report submission
│   ├── shelter-dashboard/
│   │   └── page.tsx              # Dashboard page for shelters
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page with report form
│   └── globals.css               # Global styles
├── components/
│   └── ReportForm.tsx            # Main form component
├── lib/
│   ├── aiService.ts              # AI image analysis service (Groq API)
│   ├── triage.ts                 # AI triage function with priority scoring
│   └── database.ts               # Database utilities
└── database/
    └── reports.json              # JSON database (auto-created)
```

## How It Works

### 1. Report Submission
- User takes/selects a photo
- User captures GPS location
- Form submits to `/api/reports`

### 2. AI Triage Analysis
The `generateTriageData()` function:
- **Uses Groq API** to analyze the uploaded image
- Detects animal type (Dog/Cat), injuries, malnourishment, and collars
- Calculates priority score: `(3 × If('Apparent Injury')) + (2 × If('Malnourished')) + 1`
- Falls back to simulation if Groq API is unavailable
- Returns triage data with tags, score (1-5), and address

### 3. Storage
Reports are saved to `database/reports.json` with:
- Unique ID
- Timestamp
- Image data (base64)
- GPS coordinates
- Triage tags
- Priority score
- Readable address

### 4. Shelter Dashboard
Access at `/shelter-dashboard`:
- Displays all reports
- **Sorted by priority score (descending)**
- Shows image, tags, score, and location

## API Endpoints

### POST `/api/reports`
Submit a new report.

**Request Body:**
```json
{
  "imageData": "base64_encoded_image",
  "gpsCoordinates": {
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "report-1234567890-abc123",
  "triageResult": {
    "triageTags": ["Dog", "Apparent Injury"],
    "priorityScore": 4,
    "readableAddress": "Near 37.7749, -122.4194"
  }
}
```

### GET `/api/reports`
Get all reports sorted by priority score.

**Response:**
```json
{
  "reports": [
    {
      "id": "report-1234567890-abc123",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "imageData": "base64_encoded_image",
      "gpsCoordinates": { "latitude": 37.7749, "longitude": -122.4194 },
      "triageTags": ["Dog", "Apparent Injury"],
      "priorityScore": 4,
      "readableAddress": "Near 37.7749, -122.4194"
    }
  ]
}
```

## AI Setup

### Groq API (Fast & Free Tier Available)

Groq supports vision models! Use Llama 4 Scout or Maverick for image analysis.

1. Create a free account at [Groq](https://console.groq.com/)
2. Get your API key from [API Keys](https://console.groq.com/keys)
3. Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. Optional: Specify a different vision model (default: `meta-llama/llama-4-scout-17b-16e-instruct`):
   ```env
   GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
   ```
   Or use the more capable model:
   ```env
   GROQ_MODEL=meta-llama/llama-4-maverick-17b-128e-instruct
   ```

See [Groq Vision Documentation](https://console.groq.com/docs/vision) for details.

### Simulation Mode

If you don't want to use AI, set in `.env`:
```env
USE_AI_SIMULATION=true
```

The app will automatically fall back to simulation if:
- No API key is configured
- API calls fail
- `USE_AI_SIMULATION=true` is set

## Notes

- **AI is enabled by default** - configure API keys to use real AI analysis
- GPS location requires user permission
- Images are stored as base64 in JSON (consider file storage for production)
- Database directory is auto-created on first use
- The AI system automatically falls back to simulation if APIs are unavailable

## License

MIT

