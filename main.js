class MobileVideoPlayer {
    constructor() {
        this.modal = null;
        this.iframe = null;
        this.allVideos = [];
        this.videoGrid = document.getElementById('videoGrid');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isLoading = false;
        this.currentPage = 1;
        this.videosPerPage = 10;
        
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
        // Prevent iOS bounce scroll
        document.body.addEventListener('touchmove', (e) => {
            if (e.target === document.body) {
                e.preventDefault();
            }
        }, { passive: false });

        // Optimize viewport for mobile
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }

        // Add mobile-specific classes
        document.body.classList.add('mobile-optimized');
        
        // Detect if it's a mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (this.isMobile) {
            document.body.classList.add('is-mobile');
        }
    }

    addPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        const pullThreshold = 80;
        
        const pullIndicator = document.createElement('div');
        pullIndicator.className = 'pull-to-refresh';
        pullIndicator.innerHTML = `
            <div class="pull-indicator">
                <i class="fas fa-arrow-down pull-icon"></i>
                <span class="pull-text">Pull to refresh</span>
            </div>
        `;
        pullIndicator.style.cssText = `
            position: fixed;
            top: -80px;
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(to bottom, rgba(255, 140, 0, 0.1), transparent);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 60;
            transition: transform 0.3s ease;
            color: #FF8C00;
        `;
        document.body.appendChild(pullIndicator);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 0 && window.scrollY === 0) {
                e.preventDefault();
                const pullDistance = Math.min(diff, pullThreshold);
                pullIndicator.style.transform = `translateY(${pullDistance}px)`;
                
                if (pullDistance >= pullThreshold) {
                    pullIndicator.querySelector('.pull-text').textContent = 'Release to refresh';
                    pullIndicator.querySelector('.pull-icon').style.transform = 'rotate(180deg)';
                } else {
                    pullIndicator.querySelector('.pull-text').textContent = 'Pull to refresh';
                    pullIndicator.querySelector('.pull-icon').style.transform = 'rotate(0deg)';
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (!isPulling) return;
            
            const diff = currentY - startY;
            if (diff >= pullThreshold) {
                this.refreshContent();
            }
            
            pullIndicator.style.transform = 'translateY(-80px)';
            pullIndicator.querySelector('.pull-text').textContent = 'Pull to refresh';
            pullIndicator.querySelector('.pull-icon').style.transform = 'rotate(0deg)';
            isPulling = false;
        });
    }

    refreshContent() {
        // Add refresh animation
        this.loadingIndicator.style.display = 'block';
        this.loadingIndicator.innerHTML = `
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-lg font-medium">Refreshing videos...</p>
        `;
        
        // Simulate refresh (you can replace this with actual API call)
        setTimeout(() => {
            this.loadVideos();
        }, 1000);
    }

    initModal() {
        this.modal = document.getElementById('videoModal');
        this.iframe = document.getElementById('modalIframe');
        
        // Close modal on tap outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Add swipe to close functionality
        this.setupSwipeToClose();
    }

    setupSwipeToClose() {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        this.modal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
        });

        this.modal.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 0) { // Only allow downward swipe
                const modalContent = this.modal.querySelector('.modal-content');
                modalContent.style.transform = `translateY(${diff}px)`;
                modalContent.style.opacity = Math.max(0.5, 1 - (diff / 300));
            }
        });

        this.modal.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diff = currentY - startY;
            const modalContent = this.modal.querySelector('.modal-content');
            
            if (diff > 150) { // Close if swiped down enough
                this.closeModal();
            } else {
                // Snap back
                modalContent.style.transform = 'translateY(0)';
                modalContent.style.opacity = '1';
            }
            
            isDragging = false;
        });
    }

    closeModal() {
        if (this.iframe) {
            this.iframe.src = '';
            this.iframe.removeAttribute('src');
        }
        this.modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Reset modal content position
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(0)';
        modalContent.style.opacity = '1';
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
        
        // Add haptic feedback on mobile
        if (this.isMobile && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    showNoResultsMessage(visibleCount, searchTerm) {
        const noResults = document.getElementById('noResults');
        
        if (visibleCount === 0 && searchTerm.length > 0) {
            if (!noResults) {
                const message = document.createElement('div');
                message.id = 'noResults';
                message.className = 'col-span-full text-center py-16';
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
                ? `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1` 
                : video.url;
            this.openModal(videoUrl);
            
            // Add haptic feedback
            if (this.isMobile && 'vibrate' in navigator) {
                navigator.vibrate(30);
            }
        };
        
        // Add touch feedback
        card.addEventListener('touchstart', () => {
            card.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', () => {
            card.style.transform = '';
        });
        
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
            this.isLoading = true;
            const response = await fetch('./videos.json').catch(() => fetch('videos.json'));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.videos) throw new Error('Invalid JSON format - missing videos array');
            
            this.allVideos = data.videos;
            this.loadingIndicator.style.display = 'none';
            
            // Clear existing videos
            this.videoGrid.innerHTML = '';
            
            // Add videos with staggered animation optimized for mobile
            this.allVideos.forEach((video, index) => {
                setTimeout(() => {
                    const videoCard = this.createVideoCard(video);
                    videoCard.style.opacity = '0';
                    videoCard.style.transform = 'translateY(20px)';
                    this.videoGrid.appendChild(videoCard);
                    
                    // Trigger animation
                    requestAnimationFrame(() => {
                        videoCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        videoCard.style.opacity = '1';
                        videoCard.style.transform = 'translateY(0)';
                    });
                }, index * 30); // Faster stagger for mobile
            });
            
        } catch (error) {
            console.error('Error loading videos:', error);
            this.loadingIndicator.innerHTML = `
                <div class="text-center max-w-xs mx-auto">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <h3 class="text-lg font-bold mb-2">Failed to load videos</h3>
                    <p class="text-gray-400 mb-4 text-sm">${error.message}</p>
                    <button onclick="location.reload()" 
                            class="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium">
                        Try Again
                    </button>
                </div>
            `;
        } finally {
            this.isLoading = false;
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        
        // Mobile-optimized search with longer debounce
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.searchVideos(), 500); // Longer delay for mobile
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchInput.blur(); // Hide keyboard on mobile
                this.searchVideos();
            }
        });
        
        // Global event listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
        
        // Search button with mobile optimization
        const searchBtn = document.querySelector('.search-btn');
        searchBtn.addEventListener('click', () => {
            searchInput.blur(); // Hide keyboard
            this.searchVideos();
        });
        
        // Prevent double-tap zoom on buttons
        [searchBtn, ...document.querySelectorAll('.close-btn')].forEach(btn => {
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
            });
        });
        
        // Make functions available globally
        window.searchVideos = () => this.searchVideos();
        window.closeModal = () => this.closeModal();
        
        // Add orientation change listener
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                // Recalculate layout after orientation change
                if (this.modal && !this.modal.classList.contains('hidden')) {
                    const modalContent = this.modal.querySelector('.modal-content');
                    modalContent.style.height = 'auto';
                }
            }, 500);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileVideoPlayer();
    
    // Add service worker for offline support (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
    
    // Add iOS PWA prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
    
    function showInstallPrompt() {
        const installBanner = document.createElement('div');
        installBanner.className = 'install-banner';
        installBanner.innerHTML = `
            <div class="install-content">
                <i class="fas fa-mobile-alt"></i>
                <span>Install Zo Hub for better experience</span>
                <button class="install-btn">Install</button>
                <button class="install-close">&times;</button>
            </div>
        `;
        installBanner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(45deg, #FF8C00, #FF6B00);
            border-radius: 12px;
            padding: 16px;
            color: white;
            z-index: 1000;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(installBanner);
        
        installBanner.querySelector('.install-btn').addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                    deferredPrompt = null;
                    installBanner.remove();
                });
            }
        });
        
        installBanner.querySelector('.install-close').addEventListener('click', () => {
            installBanner.remove();
        });
        
        // Auto hide after 10 seconds
        setTimeout(() => {
            if (installBanner.parentNode) {
                installBanner.remove();
            }
        }, 10000);
    }
});
