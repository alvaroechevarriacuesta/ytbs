import React from 'react';
import {
  EchoProvider,
  useEcho,
  useEchoOpenAI,
  EchoSignIn,
  EchoTokenPurchase,
} from '@zdql/echo-react-sdk';
import { useState } from 'react';

const echoConfig = {
  appId: '0cccf30d-52d7-46af-8621-5ed050e17973',
  apiUrl: 'https://echo.merit.systems',
};

interface VideoAnalysis {
  summary: string;
  rating: number;
  ratingExplanation: string;
}

// Animated Loading Component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '2rem',
    color: '#6c757d'
  }}>
    <div style={{
      width: '20px',
      height: '20px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span style={{ fontSize: '1.1rem' }}>Analyzing your video...</span>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ progress }: { progress: number }) => (
  <div style={{
    width: '100%',
    height: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '1rem'
  }}>
    <div style={{
      width: `${progress}%`,
      height: '100%',
      backgroundColor: '#007bff',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
      background: 'linear-gradient(90deg, #007bff, #0056b3)'
    }} />
  </div>
);

// Rating Stars Component
const RatingStars = ({ rating }: { rating: number }) => {
  const stars: React.ReactElement[] = [];
  for (let i = 1; i <= 10; i++) {
    stars.push(
      <span 
        key={i} 
        style={{ 
          color: i <= rating ? '#FFD700' : '#e9ecef',
          fontSize: '1.5rem',
          transition: 'color 0.3s ease',
          cursor: 'default'
        }}
      >
        ★
      </span>
    );
  }
  return <div style={{ letterSpacing: '2px' }}>{stars}</div>;
};

// Analysis Card Component
const AnalysisCard = ({ analysis }: { analysis: VideoAnalysis }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e9ecef',
    animation: 'slideIn 0.5s ease-out'
  }}>
    <style>{`
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    
    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{ 
        color: '#2c3e50', 
        marginBottom: '1rem',
        fontSize: '1.4rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        📝 Summary
      </h4>
      <p style={{ 
        lineHeight: '1.7', 
        fontSize: '1rem',
        color: '#495057',
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        {analysis.summary}
      </p>
    </div>
    
    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{ 
        color: '#2c3e50', 
        marginBottom: '0.5rem',
        fontSize: '1.4rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        ⭐ Rating: {analysis.rating}/10
      </h4>
      <RatingStars rating={analysis.rating} />
    </div>
    
    <div>
      <h4 style={{ 
        color: '#2c3e50', 
        marginBottom: '1rem',
        fontSize: '1.4rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        💡 Rating Explanation
      </h4>
      <p style={{ 
        lineHeight: '1.7',
        fontSize: '1rem',
        color: '#495057',
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        {analysis.ratingExplanation}
      </p>
    </div>
  </div>
);

// URL Input Component
const URLInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading, 
  isAuthenticated 
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}) => (
  <div style={{
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexDirection: 'column',
    alignItems: 'stretch'
  }}>
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }}>
      <span style={{
        position: 'absolute',
        left: '1rem',
        color: '#6c757d',
        fontSize: '1.2rem'
      }}>
        🔗
      </span>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your YouTube URL here..."
        style={{ 
          flex: 1, 
          padding: '1rem 1rem 1rem 3rem',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
          fontSize: '1rem',
          transition: 'all 0.3s ease',
          outline: 'none',
          backgroundColor: isAuthenticated ? 'white' : '#f8f9fa'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#007bff';
          e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e9ecef';
          e.target.style.boxShadow = 'none';
        }}
        disabled={!isAuthenticated}
        onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
      />
    </div>
    <button 
      onClick={onSubmit}
      disabled={isLoading || !isAuthenticated}
      style={{ 
        padding: '1rem 2rem',
        backgroundColor: isLoading || !isAuthenticated ? '#6c757d' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: isLoading || !isAuthenticated ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}
      onMouseEnter={(e) => {
        if (!isLoading && isAuthenticated) {
          e.currentTarget.style.backgroundColor = '#0056b3';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading && isAuthenticated) {
          e.currentTarget.style.backgroundColor = '#007bff';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {isLoading ? (
        <>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #ffffff40',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Analyzing...
        </>
      ) : (
        <>
          🚀 Analyze Video
        </>
      )}
    </button>
  </div>
);

function ChatInterface() {
  const { isAuthenticated } = useEcho()
  const { openai } = useEchoOpenAI()
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  const fetchTranscript = async (videoId: string): Promise<string> => {
    try {
      console.log('Fetching transcript for video ID:', videoId);
      const response = await fetch(`http://localhost:3001/api/transcript/${videoId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch transcript');
      }
      
      const data = await response.json();
      console.log('Transcript fetched successfully. Length:', data.transcript.length, 'characters');
      
      return data.transcript;
    } catch (error: any) {
      console.error('Error fetching transcript:', error);
      throw new Error(error.message || 'Failed to fetch transcript. Please try again.');
    }
  }

  const analyzeVideo = async () => {
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isAuthenticated) {
      setError('Please sign in first to analyze videos');
      return;
    }

    if (!openai) {
      setError('OpenAI service not available. Please check your authentication.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoAnalysis(null);
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        setError('Invalid YouTube URL');
        return;
      }

      console.log('Fetching transcript for video ID:', videoId);
      const transcript = await fetchTranscript(videoId);
      console.log('Transcript received, length:', transcript.length);
      
      if (!transcript || transcript.trim().length === 0) {
        setError('No transcript available for this video');
        return;
      }
      
      setProgress(95);
      
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
        setProgress(100);
      } catch (parseError) {
        setVideoAnalysis({
          summary: content,
          rating: 7,
          ratingExplanation: 'Analysis completed but rating could not be parsed'
        });
        setProgress(100);
      }

    } catch (error) {
      console.error('Error analyzing video:', error);
      setError('Error analyzing video. Please try again.');
    } finally {
      setIsLoading(false);
      clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 1000);
    }
  }
  
  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'stretch',
      gap: '2rem',
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '0.5rem',
          fontWeight: '800',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          background: 'linear-gradient(45deg, #fff, #f0f0f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎯 YouTube Video Analyzer
        </h1>
        <p style={{
          fontSize: '1.2rem',
          margin: '0',
          opacity: '0.9',
          fontWeight: '300'
        }}>
          Transform any YouTube video into AI-powered insights
        </p>
      </div>

      {/* Authentication */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        {isAuthenticated ? <EchoTokenPurchase /> : <EchoSignIn />}
      </div>
      
      {/* Main Analysis Container */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '95%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h3 style={{
          fontSize: '2rem',
          color: '#2c3e50',
          marginBottom: '2rem',
          textAlign: 'center',
          fontWeight: '700'
        }}>
          🚀 Start Your Analysis
        </h3>
        
        {!isAuthenticated && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid #ffeaa7',
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            ⚠️ Please sign in to unlock video analysis features
          </div>
        )}
        
        <URLInput 
          value={youtubeUrl}
          onChange={setYoutubeUrl}
          onSubmit={analyzeVideo}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
        />

        {isLoading && (
          <div style={{ marginBottom: '2rem' }}>
            <ProgressBar progress={progress} />
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div style={{ 
            color: '#721c24', 
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#f8d7da',
            borderRadius: '12px',
            border: '1px solid #f5c6cb',
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            ❌ {error}
          </div>
        )}

        {videoAnalysis && (
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{
              fontSize: '1.8rem',
              color: '#2c3e50',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              🎉 Analysis Complete!
            </h4>
            <AnalysisCard analysis={videoAnalysis} />
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
