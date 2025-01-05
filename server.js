// server.js
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Replace this with your actual YouTube API key
const YOUTUBE_API_KEY = 'AIzaSyAfu4phtjU9L4t7c48oFKcuLyKeX7ZcVbM';

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// YouTube search route
app.get('/search', async (req, res) => {
  const query = req.query.q;
  const maxResults = 5;

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: maxResults,
        q: query,
        key: YOUTUBE_API_KEY,
      },
    });
    res.json(response.data.items);
  } catch (error) {
    console.error('Error fetching data from YouTube:', error);
    res.status(500).json({ message: 'Error fetching data from YouTube' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
