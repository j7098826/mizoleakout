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

document.addEventListener('DOMContentLoaded', function () {
  modal = document.getElementById("videoModal");
  iframe = document.getElementById("modalIframe");

  fetch('videos.json')
    .then(response => response.json())
    .then(data => {
      const videoGrid = document.getElementById("videoGrid");
      const videos = [].concat(...data.playlists.map(p => p.videos));

      videos.forEach(video => {
        const views = video.views || Math.floor(Math.random() * (50000 - 30000) + 30000).toLocaleString();
        const card = document.createElement("div");
        card.className = "video-card bg-gray-800 rounded overflow-hidden cursor-pointer transition-all duration-300";
        card.innerHTML = `
          <div class="video-thumb">
            <img src="${video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}" alt="${video.title}">
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
        videoGrid.appendChild(card);
      });
    });

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

