let player;
let playlist = [];
let currentSongIndex = 0;
let shuffle = false;
let repeat = 'none'; // none, single, all

// Initialize YouTube IFrame API
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "390",
    width: "640",
    videoId: "", // Empty initially, will be set when a song is played
    events: {
      'onStateChange': onPlayerStateChange,
    }
  });
}

// Function to search for music
async function searchMusic(query) {
  try {
    const response = await fetch(`/search?q=${query}`);
    const data = await response.json();

    if (data && data.length > 0) {
      displaySongs(data); // Call displaySongs to show results
    } else {
      displayNoResults();
    }
  } catch (error) {
    console.error('Error during search:', error);
  }
}

// Display songs in the playlist
function displaySongs(songs) {
  playlist = songs;
  currentSongIndex = 0; // Reset to the first song when a new search is done
  const songList = document.getElementById("song-list");
  songList.innerHTML = ""; // Clear previous search results

  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.classList.add("song-item");

    const thumbnail = document.createElement("img");
    thumbnail.src = song.snippet.thumbnails.medium.url;
    thumbnail.classList.add("thumbnail");

    const songInfo = document.createElement("div");
    songInfo.classList.add("song-info");
    songInfo.innerHTML = `
      <span class="song-title">${song.snippet.title}</span>
      <span class="song-artist">${song.snippet.channelTitle}</span>
    `;

    li.appendChild(thumbnail);
    li.appendChild(songInfo);
    li.onclick = () => loadVideo(song.id.videoId);

    songList.appendChild(li);
  });
}

// Display no results found message
function displayNoResults() {
  const songList = document.getElementById("song-list");
  songList.innerHTML = "<li>No results found. Please try another search.</li>";
}

// Load the selected video into the player
function loadVideo(videoId) {
  const playerContainer = document.getElementById("thumgnailIMG");
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;



  const thumbnailImage = document.getElementById("thumbImg");
  thumbnailImage.src = thumbnailUrl;
  thumbnailImage.classList.add("video-thumbnail");

  const existingThumbnail = document.getElementById("video-thumbnail");
  if (existingThumbnail) {
    existingThumbnail.remove();
  }

  playerContainer.appendChild(thumbnailImage || tempThumbnail);

  player.loadVideoById(videoId);
  player.playVideo(); // Automatically start the video after loading
}


// Control buttons
document.getElementById("play-btn").addEventListener("click", togglePlayPause);
document.getElementById("next-btn").addEventListener("click", playNextSong);
document.getElementById("prev-btn").addEventListener("click", playPreviousSong);
document.getElementById("shuffle-btn").addEventListener("click", toggleShuffle);
document.getElementById("repeat-btn").addEventListener("click", toggleRepeat);

document.getElementById("volume-slider").addEventListener("input", (e) => {
  const volume = e.target.value / 100;
  player.setVolume(volume * 100);
  document.getElementById("volume-percentage").textContent = `${e.target.value}%`; // Update the volume percentage
});


document.getElementById("seekbar").addEventListener("input", (e) => {
  const seekTime = player.getDuration() * (e.target.value / 100);
  player.seekTo(seekTime);
});

// Toggle play/pause
function togglePlayPause() {
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

// Play the next song
function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadVideo(playlist[currentSongIndex].id.videoId);
}

// Play the previous song
function playPreviousSong() {
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadVideo(playlist[currentSongIndex].id.videoId);
}

// Toggle shuffle
function toggleShuffle() {
  shuffle = !shuffle;
  if (shuffle) {
    playlist = shuffleArray(playlist); // Shuffle playlist
  }
  loadVideo(playlist[currentSongIndex].id.videoId); // Load the first song (or the current song) after shuffling
}


// Shuffle the playlist array
function shuffleArray(array) {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
}


// Toggle repeat mode
function toggleRepeat() {
  if (repeat === 'none') {
    repeat = 'single';
  } else if (repeat === 'single') {
    repeat = 'all';
  } else {
    repeat = 'none';
  }

  // Adjust the repeat button text based on the state
  document.getElementById("repeat-btn").innerText = `Repeat: ${repeat}`;
}

// Player state change callback
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    if (repeat === 'single') {
      player.playVideo(); // Replay the same video
    } else if (repeat === 'all') {
      playNextSong(); // Play the next song in the playlist
    } else {
      if (!shuffle || currentSongIndex === playlist.length - 1) {
        playNextSong(); // Play the next song if not on shuffle or at the end of the playlist
      }
    }
  }
}


// Handle the search button click
document.getElementById("search-btn").addEventListener("click", () => {
  const query = document.getElementById("search-bar").value;
  if (query) {
    searchMusic(query);
  }
});

// Update the seekbar position every 100ms while the video is playing
setInterval(() => {
  if (player && player.getPlayerState() === YT.PlayerState.PLAYING) {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const percentage = (currentTime / duration) * 100;
    
    // Update seekbar value
    document.getElementById("seekbar").value = percentage;
    
    // Update current time display (e.g., 1:25)
    document.getElementById("current-time").textContent = formatTime(currentTime);
    document.getElementById("total-time").textContent = formatTime(duration);
  }
}, 100);

// Format the time (MM:SS)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

searchMusic('rap music')