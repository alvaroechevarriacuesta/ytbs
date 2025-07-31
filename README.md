# YouTube Transcript Analysis - Vite App

A modern React application built with Vite that integrates with the Echo SDK to provide AI-powered YouTube video analysis and chat functionality.

## Features

- **Authentication with Echo SDK** - Secure sign-in and token management
- **OpenAI Integration** - Advanced AI chat completions
- **YouTube Video Analysis** - Fetch transcripts and analyze content
- **AI-Powered Summarization** - Comprehensive video summaries
- **Rating System** - 1-10 rating with star visualization
- **Chat Interface** - General AI chat functionality
- **No Backend Required** - Everything runs in the browser

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start both the frontend and backend servers:

```bash
npm run dev:full
```

This will start:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

Alternatively, you can run them separately:

```bash
# Start backend server
npm run server

# Start frontend (in another terminal)
npm run dev
```

### Available Scripts

- `npm run dev:full` - Runs both frontend and backend servers
- `npm run dev` - Runs the frontend app in development mode
- `npm run server` - Runs the backend server
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint

## Configuration

The app is configured with the following Echo settings:

- App ID: `0cccf30d-52d7-46af-8621-5ed050e17973`
- API URL: `https://echo.merit.systems`

## Usage

### YouTube Video Analysis

1. Sign in using the Echo authentication
2. Purchase tokens if needed
3. Enter a YouTube URL in the input field
4. Click "Analyze Video" to get a summary and rating
5. View the comprehensive summary and star rating

### Chat Interface

1. Enter your message in the chat input field
2. Click "Send Message" to get an AI response

## Supported YouTube URL Formats

- Standard videos: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short URLs: `https://youtu.be/VIDEO_ID`
- YouTube Shorts: `https://www.youtube.com/shorts/VIDEO_ID`
- Embedded videos: `https://www.youtube.com/embed/VIDEO_ID`
- Direct video IDs: `VIDEO_ID`

## Dependencies

- React 18
- TypeScript
- Vite
- @zdql/echo-react-sdk
- @danielxceron/youtube-transcript (improved reliability with fallback system)

## Architecture

This app uses a hybrid architecture:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express server for YouTube transcript fetching
- **YouTube Transcripts**: Server-side fetching to avoid CORS issues
- **AI Processing**: Echo SDK integration

## Error Handling

The app handles various YouTube transcript scenarios:

- Videos without transcripts
- Unavailable videos
- Disabled transcripts
- Rate limiting
- Network errors

## License

MIT
