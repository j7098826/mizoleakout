// Video Player Application
class VideoPlayer {
  constructor() {
    this.modal = null;
    this.iframe = null;
    this.allVideos = [];
    this.videoGrid = document.getElementById('videoGrid');
    this.loadingIndicator = document.getElementById('loadingIndicator');
    
    this.init();
  }

  init() {
    this.initModal();
    this.loadVideos();
    this.setupEventListeners();
  }

  initModal() {
    this.modal = document.getElementById('videoModal');
    this.iframe = document.getElementById('modalIframe');
    
    // Close modal when clicking outside content
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
  }

  closeModal() {
    if (this.iframe) {
      this.iframe.src = '';
      this.iframe.removeAttribute('src');
    }
    this.modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  openModal(videoUrl) {
    if (!this.modal || !this.iframe) return;
    
    this.iframe.src = videoUrl;
    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  searchVideos() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.video-card');
    
    let visibleCount = 0;
    cards.forEach(card => {
      const title = card.querySelector('.video-title').textContent.toLowerCase();
      const matches = title.includes(searchTerm);
      card.classList.toggle('hidden', !matches);
      if (matches) visibleCount++;
    });
    
    this.showNoResultsMessage(visibleCount, searchTerm);
  }

  showNoResultsMessage(visibleCount, searchTerm) {
    const noResults = document.getElementById('noResults');
    
    if (visibleCount === 0 && searchTerm.length > 0) {
      if (!noResults) {
        const message = document.createElement('div');
        message.id = 'noResults';
        message.className = 'col-span-full text-center py-12';
        message.innerHTML = `
          <i class="fas fa-search text-4xl text-[#FFA500] mb-4"></i>
          <h3 class="text-xl font-bold mb-2">No videos found</h3>
          <p class="text-gray-400">Try different search terms</p>
        `;
        this.videoGrid.appendChild(message);
      }
    } else if (noResults) {
      noResults.remove();
    }
  }

  createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card bg-gray-800 rounded-lg overflow-hidden cursor-pointer border border-gray-700 hover:border-[#FFA500] transition-all duration-300';
    
    // Use YouTube thumbnail if no custom thumbnail provided
    const thumbnailUrl = video.thumbnail || 
      (video.id ? `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` : 'https://via.placeholder.com/320x180');
    
    card.innerHTML = `
      <div class="video-thumb relative aspect-video">
        <img src="${thumbnailUrl}" 
             alt="${video.title}"
             loading="lazy"
             class="w-full h-full object-cover"
             onerror="this.src='https://via.placeholder.com/320x180/374151/9CA3AF?text=Thumbnail+Missing'">
        <span class="duration absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">${video.duration || 'N/A'}</span>
      </div>
      <div class="video-info p-3">
        <h3 class="video-title text-white font-medium mb-2 line-clamp-2">${video.title}</h3>
        <div class="video-stats flex justify-between text-xs text-gray-400">
          <span><i class="fas fa-eye mr-1"></i>${video.views}</span>
          <span><i class="fas fa-calendar-alt mr-1"></i>${this.formatDate(video.uploadDate)}</span>
        </div>
      </div>
    `;
    
    // Add click handler
    card.addEventListener('click', () => {
      const videoUrl = video.id 
        ? `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1` 
        : video.url;
      this.openModal(videoUrl);
    });
    
    return card;
  }

  formatDate(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }

  async loadVideos() {
    try {
      console.log('Attempting to load videos...');
      
      // Try multiple ways to load the JSON file
      const response = await this.fetchWithFallbacks([
        './videos.json',
        'videos.json',
        '/videos.json'
      ]);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.videos) throw new Error('Invalid JSON format - missing videos array');
      
      this.allVideos = data.videos;
      console.log(`Successfully loaded ${this.allVideos.length} videos`);
      
      // Clear loading indicator
      this.loadingIndicator.remove();
      
      // Add videos to grid
      this.allVideos.forEach(video => {
        this.videoGrid.appendChild(this.createVideoCard(video));
      });
      
    } catch (error) {
      console.error('Error loading videos:', error);
      this.loadingIndicator.innerHTML = `
        <div class="text-red-500">
          <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
          <p class="text-lg font-medium">Failed to load videos</p>
          <p class="text-sm text-gray-400 mt-2">${error.message}</p>
          <p class="text-xs mt-4">Check console for details (F12)</p>
        </div>
      `;
    }
  }

  async fetchWithFallbacks(urls) {
    let lastError = null;
    
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) return response;
      } catch (error) {
        lastError = error;
        console.warn(`Failed to fetch from ${url}`, error);
      }
    }
    
    throw lastError || new Error('All fetch attempts failed');
  }

  setupEventListeners() {
    // Setup search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.searchVideos();
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
    
    // Make searchVideos available globally
    window.searchVideos = () => this.searchVideos();
    window.closeModal = () => this.closeModal();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VideoPlayer();
});
