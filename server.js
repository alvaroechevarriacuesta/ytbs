const express = require('express');
const cors = require('cors');
const { YoutubeTranscript } = require('@danielxceron/youtube-transcript');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/transcript/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    console.log(`Attempting to fetch transcript for video ID: ${videoId}`);
    
    // The new library can handle full URLs or just video IDs
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`Transcript fetched successfully. Parts: ${transcript.length}`);
    
    // Combine all transcript parts into a single text
    const fullTranscript = transcript
      .map(part => part.text)
      .join(' ');
    
    console.log(`Full transcript length: ${fullTranscript.length} characters`);
    
    if (!fullTranscript || fullTranscript.trim().length === 0) {
      return res.status(404).json({ 
        error: 'No transcript available',
        message: 'The video does not have a transcript or it is empty'
      });
    }
    
    res.json({ transcript: fullTranscript });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    
    // Handle specific error cases from the improved library
    if (error.name === 'YoutubeTranscriptNotAvailableError') {
      return res.status(404).json({ 
        error: 'No transcript available',
        message: 'This video does not have captions/transcripts available'
      });
    }
    
    if (error.name === 'YoutubeTranscriptVideoUnavailableError') {
      return res.status(404).json({ 
        error: 'Video unavailable',
        message: 'This video is not available or has been removed'
      });
    }
    
    if (error.name === 'YoutubeTranscriptDisabledError') {
      return res.status(404).json({ 
        error: 'Transcripts disabled',
        message: 'Transcripts are disabled for this video'
      });
    }
    
    if (error.name === 'YoutubeTranscriptTooManyRequestError') {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch transcript',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 