import React from 'react';
import {
  EchoProvider,
  useEcho,
  useEchoOpenAI,
  EchoSignIn,
  EchoTokenPurchase,
} from '@zdql/echo-react-sdk';
import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Loader2, Play, Star, FileText, Lightbulb, Youtube, Zap } from 'lucide-react';

const echoConfig = {
  appId: '0cccf30d-52d7-46af-8621-5ed050e17973',
  apiUrl: 'https://echo.merit.systems',
};

interface VideoAnalysis {
  summary: string;
  rating: number;
  ratingExplanation: string;
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-4 p-8 text-muted-foreground">
    <Loader2 className="h-6 w-6 animate-spin" />
    <span className="text-lg">Analyzing your video...</span>
  </div>
);

// Rating Stars Component
const RatingStars = ({ rating }: { rating: number }) => {
  const stars: React.ReactElement[] = [];
  for (let i = 1; i <= 10; i++) {
    stars.push(
      <Star 
        key={i} 
        className={`h-6 w-6 transition-colors ${
          i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    );
  }
  return <div className="flex gap-1">{stars}</div>;
};

// Analysis Card Component
const AnalysisCard = ({ analysis }: { analysis: VideoAnalysis }) => (
  <Card className="animate-in slide-in-from-bottom-4 duration-500">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-primary" />
        Analysis Complete!
      </CardTitle>
      <CardDescription>
        Here's what AI discovered about your video
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h4 className="text-lg font-semibold">Summary</h4>
        </div>
        <p className="text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
          {analysis.summary}
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-muted-foreground" />
          <h4 className="text-lg font-semibold">Rating: {analysis.rating}/10</h4>
        </div>
        <RatingStars rating={analysis.rating} />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
          <h4 className="text-lg font-semibold">Rating Explanation</h4>
        </div>
        <p className="text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
          {analysis.ratingExplanation}
        </p>
      </div>
    </CardContent>
  </Card>
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
  <div className="space-y-4">
    <div className="relative">
      <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your YouTube URL here..."
        className="pl-10 h-12 text-base"
        disabled={!isAuthenticated}
        onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
      />
    </div>
    <Button 
      onClick={onSubmit}
      disabled={isLoading || !isAuthenticated}
      size="lg"
      className="w-full h-12 text-base font-semibold"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Play className="mr-2 h-5 w-5" />
          Analyze Video
        </>
      )}
    </Button>
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
        // Clean the content to extract JSON from code blocks
        let jsonContent = content.trim();
        
        // Remove markdown code block syntax if present
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/^```json\s*/, '');
        }
        if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/^```\s*/, '');
        }
        if (jsonContent.endsWith('```')) {
          jsonContent = jsonContent.replace(/\s*```$/, '');
        }
        
        const analysis = JSON.parse(jsonContent);
        setVideoAnalysis(analysis);
        setProgress(100);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.log('Raw content:', content);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Youtube className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              YouTube Video Analyzer
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform any YouTube video into AI-powered insights with our advanced analysis tool
          </p>
        </div>

        {/* Authentication */}
        <div className="flex justify-center mb-8">
          {isAuthenticated ? <EchoTokenPurchase /> : <EchoSignIn />}
        </div>
        
        {/* Main Analysis Container */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              Start Your Analysis
            </CardTitle>
            <CardDescription className="text-lg">
              Paste a YouTube URL below to get instant AI-powered insights
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isAuthenticated && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-800">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  Please sign in to unlock video analysis features
                </div>
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
              <div className="space-y-4">
                <Progress value={progress} className="h-2" />
                <LoadingSpinner />
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  {error}
                </div>
              </div>
            )}

            {videoAnalysis && (
              <div className="mt-8">
                <AnalysisCard analysis={videoAnalysis} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Smart Summaries</h3>
              <p className="text-sm text-muted-foreground">
                Get comprehensive summaries of any YouTube video content
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-4">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">AI Ratings</h3>
              <p className="text-sm text-muted-foreground">
                Receive intelligent ratings and explanations for video quality
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Instant Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get results in seconds with our advanced AI technology
              </p>
            </CardContent>
          </Card>
        </div>
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
