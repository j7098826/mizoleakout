class MobileVideoPlayer {
    constructor() {
        this.modal = null;
        this.iframe = null;
        this.allVideos = [];
        this.videoGrid = null;
        this.loadingIndicator = null;
        this.isLoading = false;
        this.currentPage = 1;
        this.videosPerPage = 10;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        this.init();
    }

    init() {
        this.initModal();
        this.loadVideos();
        this.setupEventListeners();
        this.setupMobileOptimizations();
        this.addPullToRefresh();
    }

    setupMobileOptimizations() {
        document.body.classList.add(this.isMobile ? 'is-mobile' : 'is-desktop');
        if (this.isMobile) {
            document.body.addEventListener('touchmove', (e) => {
                if (e.target === document.body) e.preventDefault();
            }, { passive: false });
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }
    }

    addPullToRefresh() {
        let startY = 0, currentY = 0, isPulling = false, pullThreshold = 80;
        const pullIndicator = document.createElement('div');
        pullIndicator.className = 'pull-to-refresh';
        pullIndicator.innerHTML = '<div class="pull-indicator"><i class="fas fa-arrow-down pull-icon"></i><span class="pull-text">Pull to refresh</span></div>';
        document.body.appendChild(pullIndicator);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) { startY = e.touches[0].clientY; isPulling = true; }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            if (diff > 0 && diff < pullThreshold) {
                pullIndicator.style.transform = `translateY(${diff - 80}px)`;
                pullIndicator.querySelector('.pull-icon').style.transform = `rotate(${diff * 3.6}deg)`;
            } else if (diff >= pullThreshold) {
                pullIndicator.querySelector('.pull-text').textContent = 'Release to refresh';
            }
        });

        document.addEventListener('touchend', () => {
            if (!isPulling) return;
            const diff = currentY - startY;
            if (diff >= pullThreshold) this.refreshContent();
            pullIndicator.style.transform = 'translateY(-80px)';
            pullIndicator.querySelector('.pull-text').textContent = 'Pull to refresh';
            pullIndicator.querySelector('.pull-icon').style.transform = 'rotate(0deg)';
            isPulling = false;
        });
    }

    refreshContent() {
        this.loadingIndicator.style.display = 'block';
        this.loadingIndicator.innerHTML = '<div class="loading-spinner mx-auto mb-4"></div><p class="text-lg font-medium">Refreshing videos...</p>';
        setTimeout(() => this.loadVideos(), 1000);
    }

    initModal() {
        this.modal = document.getElementById('videoModal');
        this.iframe = document.getElementById('modalIframe');
        if (this.modal && this.iframe) {
            this.modal.style.zIndex = '99999';
            this.modal.style.isolation = 'isolate';
            this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.closeModal(); });
        }
    }

    closeModal() {
        if (this.iframe) { this.iframe.src = ''; this.iframe.removeAttribute('src'); }
        if (this.modal) { this.modal.classList.add('hidden'); this.modal.style.display = 'none'; }
        document.body.style.overflow = 'auto';
    }

    openModal(videoUrl, videoData = null) {
        if (!this.modal || !this.iframe) { console.error('Modal or iframe not found'); return; }
        const enhancedUrl = videoUrl.includes('youtube.com') 
            ? `${videoUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1&showinfo=0`
            : videoUrl;
        this.iframe.src = enhancedUrl || 'about:blank';
        if (videoData) {
            document.getElementById('modalVideoTitle').textContent = videoData.title;
            document.getElementById('modalVideoViews').textContent = `${this.formatViews(videoData.views)} views • ${videoData.duration}`;
        }
        this.modal.classList.remove('hidden');
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.setupVideoControls();
    }

    formatViews(views) {
        return views >= 1000000000 ? (views / 1000000000).toFixed(1) + 'B' :
               views >= 1000000 ? (views / 1000000).toFixed(1) + 'M' :
               views >= 1000 ? (views / 1000).toFixed(1) + 'K' : views.toString();
    }

    setupVideoControls() {
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.textContent.trim().toLowerCase();
                switch(action) {
                    case 'like': btn.classList.toggle('bg-red-500'); break;
                    case 'share': this.shareVideo(); break;
                    case 'download': this.downloadVideo(); break;
                }
            });
        });
    }

    shareVideo() {
        if (navigator.share) {
            navigator.share({ title: 'Check out this video on Zo Hub', url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied to clipboard!'));
        }
    }

    downloadVideo() { alert('Download feature coming soon!'); }

    searchVideos() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) { console.error('Search input element not found'); return; }
        const searchTerm = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll('.video-card');
        let visibleCount = 0;
        cards.forEach(card => {
            const titleElement = card.querySelector('.video-title');
            if (titleElement) {
                const title = titleElement.textContent.toLowerCase();
                card.style.display = title.includes(searchTerm) ? 'block' : 'none';
                if (title.includes(searchTerm)) visibleCount++;
            }
        });
        this.showNoResultsMessage(visibleCount, searchTerm);
        if (this.isMobile && 'vibrate' in navigator) navigator.vibrate(50);
    }

    showNoResultsMessage(visibleCount, searchTerm) {
        if (!this.videoGrid) this.videoGrid = document.getElementById('videoGrid');
        const noResults = document.getElementById('noResults');
        if (visibleCount === 0 && searchTerm.length > 0) {
            if (!noResults) {
                const message = document.createElement('div');
                message.id = 'noResults';
                message.innerHTML = `
                    <div class="max-w-sm mx-auto">
                        <i class="fas fa-search text-5xl text-[#FF8C00] mb-6 opacity-60"></i>
                        <h3 class="text-xl font-bold mb-3">No videos found</h3>
                        <p class="text-gray-400 mb-4 text-sm">We couldn't find any videos matching "${searchTerm}"</p>
                        <button onclick="document.getElementById('searchInput').value=''; searchVideos();" 
                                class="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium">
                            Clear Search
                        </button>
                    </div>
                `;
                this.videoGrid.appendChild(message);
            }
        } else if (noResults) noResults.remove();
    }

    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play ${video.title}`);
        card.style.zIndex = '1';

        const thumbnailUrl = video.thumbnail || (video.id ? `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` : 'https://via.placeholder.com/320x180');
        card.innerHTML = `
            <div class="video-thumb">
                <img src="${thumbnailUrl}" alt="${video.title}" loading="lazy" class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+Thumbnail'">
                <span class="duration">${video.duration || 'N/A'}</span>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-stats">
                    <span><i class="fas fa-eye"></i>${this.formatViews(video.views)}</span>
                    <span><i class="fas fa-calendar-alt"></i>${this.formatDate(video.uploadDate)}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            const videoUrl = video.id ? `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1` : video.videoUrl;
            this.openModal(videoUrl, video);
            if (this.isMobile && 'vibrate' in navigator) navigator.vibrate(30);
        });

        return card;
    }

    formatDate(dateString) {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? 'Today' : diffDays < 7 ? `${diffDays}d ago` : diffDays < 30 ? `${Math.floor(diffDays / 7)}w ago` : diffDays < 365 ? `${Math.floor(diffDays / 30)}m ago` : `${Math.floor(diffDays / 365)}y ago`;
    }

    async loadVideos() {
        try {
            this.isLoading = true;
            if (!this.videoGrid) this.videoGrid = document.getElementById('videoGrid');
            if (!this.loadingIndicator) this.loadingIndicator = document.getElementById('loadingIndicator');

            const response = await fetch('./videos.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data.videos) throw new Error('Invalid JSON format - missing videos array');

            this.allVideos = data.videos;
            if (this.loadingIndicator) this.loadingIndicator.style.display = 'none';
            this.videoGrid.innerHTML = '';

            this.allVideos.forEach((video, index) => {
                setTimeout(() => {
                    const videoCard = this.createVideoCard(video);
                    if (videoCard) {
                        videoCard.style.opacity = '0';
                        videoCard.style.transform = 'translateY(20px)';
                        this.videoGrid.appendChild(videoCard);
                        requestAnimationFrame(() => {
                            videoCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                            videoCard.style.opacity = '1';
                            videoCard.style.transform = 'translateY(0)';
                        });
                    }
                }, index * 30);
            });

        } catch (error) {
            console.error('Error loading videos:', error);
            if (this.loadingIndicator) {
                this.loadingIndicator.innerHTML = `
                    <div class="text-center max-w-xs mx-auto">
                        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                        <h3 class="text-lg font-bold mb-2">Failed to load videos</h3>
                        <p class="text-gray-400 mb-4 text-sm">${error.message}</p>
                        <button onclick="location.reload()" class="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium">
                            Try Again
                        </button>
                    </div>
                `;
            }
        } finally {
            this.isLoading = false;
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.searchVideos(), 500);
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); searchInput.blur(); this.searchVideos(); }
            });
        }

        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => { searchInput.blur(); this.searchVideos(); });
            searchBtn.addEventListener('touchend', (e) => e.preventDefault());
        }

        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeModal(); });
        window.searchVideos = () => this.searchVideos();
        window.closeModal = () => this.closeModal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MobileVideoPlayer();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    let deferredPrompt;
    let showInstallPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (showInstallPrompt) showInstallPrompt();
    });

    showInstallPrompt = function() {
        const installBanner = document.createElement('div');
        installBanner.className = 'install-banner';
        installBanner.style.zIndex = '1500';
        installBanner.innerHTML = `
            <div class="install-content">
                <i class="fas fa-mobile-alt"></i>
                <span>Install Zo Hub for better experience</span>
                <button class="install-btn">Install</button>
                <button class="install-close">&times;</button>
            </div>
        `;
        document.body.appendChild(installBanner);

        installBanner.querySelector('.install-btn').addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => { deferredPrompt = null; installBanner.remove(); });
            }
        });

        installBanner.querySelector('.install-close').addEventListener('click', () => installBanner.remove());
        setTimeout(() => installBanner.remove(), 10000);
    };
});
