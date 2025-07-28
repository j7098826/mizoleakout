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
                message.className = 'col-span-full text-center py-16';
                message.innerHTML = `
                    <div class="max-w-md mx-auto">
                        <i class="fas fa-search text-6xl text-[#FF8C00] mb-6 opacity-60"></i>
                        <h3 class="text-2xl font-bold mb-3">No videos found</h3>
                        <p class="text-gray-400 mb-4">We couldn't find any videos matching "${searchTerm}"</p>
                        <button onclick="document.getElementById('searchInput').value=''; searchVideos();" 
                                class="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300">
                            Clear Search
                        </button>
                    </div>
                `;
                this.videoGrid.appendChild(message);
            }
        } else if (noResults) {
            noResults.remove();
        }
    }

    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play ${video.title}`);
        
        const thumbnailUrl = video.thumbnail || 
            (video.id ? `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` : 'https://via.placeholder.com/320x180');
        
        card.innerHTML = `
            <div class="video-thumb">
                <img src="${thumbnailUrl}" 
                     alt="${video.title}"
                     loading="lazy"
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+Thumbnail'">
                <span class="duration text-white">${video.duration || 'N/A'}</span>
            </div>
            <div class="video-info p-3">
                <h3 class="video-title text-white font-medium mb-2 line-clamp-2">${video.title}</h3>
                <div class="video-stats flex justify-between text-xs text-gray-400">
                    <span><i class="fas fa-eye mr-1"></i>${video.views}</span>
                    <span><i class="fas fa-calendar-alt mr-1"></i>${this.formatDate(video.uploadDate)}</span>
                </div>
            </div>
        `;
        
        const playVideo = () => {
            const videoUrl = video.id 
                ? `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1` 
                : video.url;
            this.openModal(videoUrl);
        };
        
        card.addEventListener('click', playVideo);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playVideo();
            }
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
            const response = await fetch('./videos.json').catch(() => fetch('videos.json'));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.videos) throw new Error('Invalid JSON format - missing videos array');
            
            this.allVideos = data.videos;
            this.loadingIndicator.remove();
            
            this.allVideos.forEach((video, index) => {
                setTimeout(() => {
                    this.videoGrid.appendChild(this.createVideoCard(video));
                }, index * 50); // Staggered loading animation
            });
            
        } catch (error) {
            console.error('Error loading videos:', error);
            this.loadingIndicator.innerHTML = `
                <div class="text-center max-w-md mx-auto">
                    <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Failed to load videos</h3>
                    <p class="text-gray-400 mb-4">${error.message}</p>
                    <button onclick="location.reload()" 
                            class="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        
        // Enhanced search functionality
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.searchVideos(), 300);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.searchVideos();
            }
        });
        
        // Global event listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
        
        // Search button animation
        const searchBtn = document.querySelector('.search-btn');
        searchBtn.addEventListener('click', () => {
            this.searchVideos();
        });
        
        // Make functions available globally
        window.searchVideos = () => this.searchVideos();
        window.closeModal = () => this.closeModal();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoPlayer();
});
