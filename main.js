let modal, iframe;
let allVideos = [];

function closeModal() {
  if (iframe) iframe.src = "";
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = 'auto';
}

function openModal(videoUrl) {
  if (iframe && modal) {
    iframe.src = videoUrl;
    modal.classList.remove("hidden");
    document.body.style.overflow = 'hidden';
  }
}

function searchVideos() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll("#videoGrid .video-card");

  let visibleCount = 0;
  cards.forEach(card => {
    const title = card.querySelector(".video-title").textContent.toLowerCase();
    const matchesSearch = title.includes(input);
    card.classList.toggle("hidden", !matchesSearch);
    if (matchesSearch) visibleCount++;
  });

  const noResults = document.getElementById("noResults");
  if (visibleCount === 0 && input.length > 0) {
    if (!noResults) {
      const message = document.createElement("div");
      message.id = "noResults";
      message.className = "col-span-full text-center text-gray-400 py-8 animate-fadeIn";
      message.innerHTML = `<i class="fas fa-search text-4xl mb-4"></i><br>No videos found for "${input}"`;
      document.getElementById("videoGrid").appendChild(message);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card animate-fadeIn";

  card.innerHTML = `
    <div class="video-thumb relative">
      <img src="${video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}" 
           alt="${video.title}"
           class="w-full h-full object-cover"
           loading="lazy"
           onerror="this.src='https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+Thumbnail'">
      <span class="duration absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">${video.duration || ''}</span>
    </div>
    <div class="video-info p-3">
      <div class="video-title">${video.title}</div>
      <div class="video-stats text-xs text-gray-400 flex justify-between items-center">
        <span><i class="fas fa-eye mr-1"></i>${video.views || 'N/A'} views</span>
        <span><i class="fas fa-calendar mr-1"></i>${formatDate(video.uploadDate)}</span>
      </div>
    </div>
  `;

  card.onclick = () => {
    if (video.id) {
      openModal(`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1&autoplay=1&vq=hd1080`);
    } else if (video.url) {
      openModal(video.url);
    }
  };

  return card;
}

function formatDate(dateString) {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

document.addEventListener("DOMContentLoaded", async () => {
  modal = document.getElementById("videoModal");
  iframe = document.getElementById("modalIframe");

  try {
    const response = await fetch("videos.json");
    if (!response.ok) throw new Error("Failed to fetch videos");
    const data = await response.json();
    allVideos = data.videos;

    const videoGrid = document.getElementById("videoGrid");
    allVideos.forEach(video => {
      videoGrid.appendChild(createVideoCard(video));
    });

    // Add search input event listener
    document.getElementById("searchInput").addEventListener("input", searchVideos);
    
    // Add keyboard event listener for closing modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

  } catch (err) {
    console.error("Failed to load videos:", err);
    const videoGrid = document.getElementById("videoGrid");
    videoGrid.innerHTML = `
      <div class="col-span-full text-center text-gray-400 py-8 animate-fadeIn">
        <i class="fas fa-exclamation-triangle text-4xl mb-4 text-red-500"></i><br>
        <p class="text-lg">Error loading videos</p>
        <p class="text-sm">Please refresh the page or try again later</p>
      </div>`;
  }
});
