# Echo SDK React App

A basic React application that integrates with the Echo SDK to provide AI chat functionality.

## Features

- Authentication with Echo SDK
- OpenAI integration for chat completions
- Token purchase interface
- Simple chat interface with input and response display
- YouTube video transcript fetching and analysis
- Video summarization and rating system

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
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
npm run dev
```

This will start:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

Alternatively, you can run them separately:

```bash
# Start backend server
npm run server

# Start frontend (in another terminal)
npm start
```

### Available Scripts

- `npm run dev` - Runs both frontend and backend servers
- `npm start` - Runs the frontend app in development mode
- `npm run server` - Runs the backend server
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

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

## Dependencies

### Frontend

- React
- TypeScript
- @zdql/echo-react-sdk
- Axios

### Backend

- Express
- CORS
- @danielxceron/youtube-transcript (improved reliability with fallback system)
