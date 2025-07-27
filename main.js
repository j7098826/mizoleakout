let modal, iframe;

function closeModal() {
  if (iframe) iframe.src = "";
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = 'auto';
}

function openModal(videoId) {
  if (iframe && modal) {
    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&vq=hd1080`;
    modal.classList.remove("hidden");
    document.body.style.overflow = 'hidden';
  }
}

function searchVideos() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll("#videoGrid .video-card");
  cards.forEach(card => {
    const title = card.querySelector(".video-title").textContent.toLowerCase();
    card.classList.toggle("hidden", !title.includes(input));
  });
}

// Function to check if a YouTube video exists and is available
async function checkVideoAvailability(videoId) {
  try {
    // Check using YouTube oEmbed API (no API key required)
    const response = await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${videoId}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Function to check thumbnail availability
function checkThumbnailAvailability(videoId) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  });
}

// Function to create video card with error handling
function createVideoCard(video) {
  const views = video.views || Math.floor(Math.random() * (50000 - 30000) + 30000).toLocaleString();
  const card = document.createElement("div");
  card.className = "video-card bg-gray-800 rounded overflow-hidden cursor-pointer transition-all duration-300";
  
  card.innerHTML = `
    <div class="video-thumb">
      <img src="${video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}" 
           alt="${video.title}"
           onerror="this.parentElement.parentElement.style.display='none'">
      <span class="duration">${video.duration}</span>
    </div>
    <div class="video-info p-2">
      <div class="video-title text-sm font-bold mb-1 line-clamp-2">${video.title}</div>
      <div class="video-stats text-xs text-gray-400 flex justify-between">
        <span><i class="fas fa-eye"></i> ${views} views</span>
        <span><i class="fas fa-clock"></i> ${video.uploadDate || 'Recent'}</span>
      </div>
    </div>`;
  
  card.onclick = () => openModal(video.id);
  return card;
}

document.addEventListener('DOMContentLoaded', async function () {
  modal = document.getElementById("videoModal");
  iframe = document.getElementById("modalIframe");
  
  try {
    const response = await fetch('videos.json');
    const data = await response.json();
    const videoGrid = document.getElementById("videoGrid");
    const videos = [].concat(...data.playlists.map(p => p.videos));
    
    // Filter out videos with obvious placeholder IDs
    const validVideos = videos.filter(video => 
      !video.id.startsWith('ID') && 
      video.id.length >= 10 && 
      /^[a-zA-Z0-9_-]+$/.test(video.id)
    );
    
    // Add videos to grid with availability checking
    for (const video of validVideos) {
      const card = createVideoCard(video);
      videoGrid.appendChild(card);
      
      // Check availability in background and hide if not available
      checkVideoAvailability(video.id).then(isAvailable => {
        if (!isAvailable) {
          card.style.display = 'none';
        }
      });
    }
    
  } catch (error) {
    console.error('Error loading videos:', error);
    const videoGrid = document.getElementById("videoGrid");
    videoGrid.innerHTML = '<p class="text-center text-gray-400 col-span-full">Error loading videos. Please try again later.</p>';
  }
  
  // Keyboard event listeners
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
    if (e.key === "Enter" && document.activeElement.id === "searchInput") {
      searchVideos();
    }
  });
  
  document.getElementById("searchInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchVideos();
    }
  });
});
