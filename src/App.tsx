import {
  EchoProvider,
  useEcho,
  useEchoOpenAI,
  EchoSignIn,
  EchoTokenPurchase,
} from '@zdql/echo-react-sdk';
import { useState } from 'react';
import axios from 'axios';

const echoConfig = {
  appId: '0cccf30d-52d7-46af-8621-5ed050e17973',
  apiUrl: 'https://echo.merit.systems',
};

interface VideoAnalysis {
  summary: string;
  rating: number;
  ratingExplanation: string;
}

function ChatInterface() {
  const { isAuthenticated } = useEcho()
  const { openai } = useEchoOpenAI()
  const [response, setResponse] = useState('')
  const [input, setInput] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getMessage = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('Please sign in first to use the chat');
      return;
    }

    // Check if OpenAI is available
    if (!openai) {
      setError('OpenAI service not available. Please check your authentication.');
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: input }],
      })
      setResponse(response.choices[0].message.content || '')
    } catch (error) {
      console.error('Error getting message:', error);
      setError('Error sending message. Please try again.');
    }
  }

  const extractVideoId = (url: string): string | null => {
    // Handle various YouTube URL formats including shorts
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  const fetchTranscript = async (videoId: string): Promise<string> => {
    try {
      const response = await axios.get(`http://localhost:3001/api/transcript/${videoId}`);
      return response.data.transcript || '';
    } catch (error: any) {
      console.error('Error fetching transcript:', error);
      
      if (error.response?.status === 404) {
        throw new Error(error.response.data.message || 'No transcript available for this video');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      
      throw new Error('Failed to fetch transcript. Please try again.');
    }
  }

  const analyzeVideo = async () => {
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('Please sign in first to analyze videos');
      return;
    }

    // Check if OpenAI is available
    if (!openai) {
      setError('OpenAI service not available. Please check your authentication.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoAnalysis(null);
    
    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        setError('Invalid YouTube URL');
        return;
      }

      // Fetch the actual transcript
      console.log('Fetching transcript for video ID:', videoId);
      const transcript = await fetchTranscript(videoId);
      console.log('Transcript received, length:', transcript.length);
      
      if (!transcript || transcript.trim().length === 0) {
        setError('No transcript available for this video');
        return;
      }
      
      const analysisPrompt = `
        Please analyze the following YouTube video transcript and provide:
        1. A comprehensive summary (2-3 paragraphs)
        2. A rating from 1-10 (where 10 is excellent)
        3. An explanation for the rating

        Transcript: ${transcript}

        Please format your response as JSON with the following structure:
        {
          "summary": "your summary here",
          "rating": number,
          "ratingExplanation": "explanation for the rating"
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: analysisPrompt }],
      });

      const content = response.choices[0].message.content || '';
      
      try {
        const analysis = JSON.parse(content);
        setVideoAnalysis(analysis);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        setVideoAnalysis({
          summary: content,
          rating: 7,
          ratingExplanation: 'Analysis completed but rating could not be parsed'
        });
      }

    } catch (error) {
      console.error('Error analyzing video:', error);
      setError('Error analyzing video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#FFD700' : '#ccc' }}>
          ★
        </span>
      );
    }
    return stars;
  }
  
  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem',
      minHeight: '100vh',
    }}>
      {isAuthenticated ? <EchoTokenPurchase /> : <EchoSignIn />}
      
      {/* YouTube Analysis Section */}
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '1rem',
        width: '100%',
        maxWidth: '600px',
        marginBottom: '2rem'
      }}>
        <h3>YouTube Video Analysis</h3>
        {!isAuthenticated && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404',
            padding: '0.5rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #ffeaa7'
          }}>
            ⚠️ Please sign in to analyze YouTube videos
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            value={youtubeUrl} 
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            style={{ flex: 1, padding: '0.5rem' }}
            disabled={!isAuthenticated}
          />
          <button 
            onClick={analyzeVideo}
            disabled={isLoading || !isAuthenticated}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: isLoading || !isAuthenticated ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading || !isAuthenticated ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Video'}
          </button>
        </div>

        {error && (
          <div style={{ 
            color: 'red', 
            marginBottom: '1rem',
            padding: '0.5rem',
            backgroundColor: '#ffe6e6',
            borderRadius: '4px',
            border: '1px solid #ffcccc'
          }}>
            {error}
          </div>
        )}

        {isLoading && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1rem',
            color: '#666'
          }}>
            Fetching transcript and analyzing video...
          </div>
        )}

        {videoAnalysis && (
          <div style={{ 
            textAlign: 'left',
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>Summary:</h4>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>{videoAnalysis.summary}</p>
            
            <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>
              Rating: {videoAnalysis.rating}/10
            </h4>
            <div style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
              {renderRatingStars(videoAnalysis.rating)}
            </div>
            
            <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>Rating Explanation:</h4>
            <p style={{ lineHeight: '1.6' }}>{videoAnalysis.ratingExplanation}</p>
          </div>
        )}
      </div>

      {/* Original Chat Section */}
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '1rem',
        width: '100%',
        maxWidth: '600px'
      }}>
        <h3>Chat Interface</h3>
        {!isAuthenticated && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404',
            padding: '0.5rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #ffeaa7'
          }}>
            ⚠️ Please sign in to use the chat
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your message"
            style={{ 
              flex: 1, 
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            disabled={!isAuthenticated}
          />
          <button 
            onClick={getMessage} 
            disabled={!isAuthenticated}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: !isAuthenticated ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !isAuthenticated ? 'not-allowed' : 'pointer'
            }}
          >
            Send Message
          </button>
        </div>
        {response && (
          <div style={{ 
            textAlign: 'left',
            backgroundColor: '#e8f5e8',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #c3e6c3'
          }}>
            <h4 style={{ color: '#155724', marginBottom: '0.5rem' }}>Response:</h4>
            <p style={{ lineHeight: '1.6' }}>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <EchoProvider config={echoConfig}>
      <ChatInterface />
    </EchoProvider>
  );
}

export default App;
