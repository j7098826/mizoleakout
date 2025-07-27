let modal, iframe;
let allVideos = []; // Store all videos for filtering
let currentCategory = 'all'; // Track current category

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
  
  let visibleCount = 0;
  cards.forEach(card => {
    const title = card.querySelector(".video-title").textContent.toLowerCase();
    const isMatch = title.includes(input);
    card.classList.toggle("hidden", !isMatch);
    if (isMatch && !card.classList.contains("hidden")) visibleCount++;
  });
  
  // Show "no results" message if no videos match
  const noResults = document.getElementById("noResults");
  if (visibleCount === 0 && input.length > 0) {
    if (!noResults) {
      const message = document.createElement("div");
      message.id = "noResults";
      message.className = "col-span-full text-center text-gray-400 py-8";
      message.innerHTML = `<i class="fas fa-search text-4xl mb-4"></i><br>No videos found for "${input}"`;
      document.getElementById("videoGrid").appendChild(message);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

// Function to filter videos by category
function filterByCategory(category) {
  currentCategory = category;
  const cards = document.querySelectorAll("#videoGrid .video-card");
  
  cards.forEach(card => {
    const cardCategory = card.dataset.category;
    if (category === 'all' || cardCategory === category) {
      card.classList.remove("category-hidden");
    } else {
      card.classList.add("category-hidden");
    }
  });
  
  // Update active tab styling
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.remove('text-pink-500', 'font-semibold');
    tab.classList.add('text-white');
  });
  
  const activeTab = document.querySelector(`[data-category="${category}"]`);
  if (activeTab) {
    activeTab.classList.remove('text-white');
    activeTab.classList.add('text-pink-500', 'font-semibold');
  }
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

// Function to create video card with enhanced features
function createVideoCard(video, category) {
  const card = document.createElement("div");
  card.className = "video-card bg-gray-800 rounded overflow-hidden cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-105";
  card.dataset.category = category.toLowerCase().replace(/\s+/g, '-');
  
  card.innerHTML = `
    <div class="video-thumb relative">
      <img src="${video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}" 
           alt="${video.title}"
           class="w-full h-40 object-cover"
           onerror="this.src='https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+Thumbnail'">
      <span class="duration absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">${video.duration}</span>
      <div class="category-badge absolute top-2 left-2 bg-pink-600 text-white text-xs px-2 py-1 rounded">${category}</div>
    </div>
    <div class="video-info p-3">
      <div class="video-title text-sm font-bold mb-2 line-clamp-2 text-white leading-tight">${video.title}</div>
      <div class="video-stats text-xs text-gray-400 flex justify-between items-center">
        <span><i class="fas fa-eye mr-1"></i>${video.views} views</span>
        <span><i class="fas fa-calendar mr-1"></i>${formatDate(video.uploadDate)}</span>
      </div>
    </div>`;
  
  card.onclick = () => openModal(video.id);
  return card;
}

// Function to format date for display
function formatDate(dateString) {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// Function to create category navigation
function createCategoryNavigation(categories) {
  const navTabs = document.querySelector('.nav-tabs');
  
  // Clear existing navigation except "Home"
  navTabs.innerHTML = `
    <a href="#" class="category-tab text-pink-500 font-semibold" data-category="all" onclick="filterByCategory('all')">All Videos</a>
  `;
  
  // Add category tabs
  categories.forEach(category => {
    const tab = document.createElement('a');
    tab.href = '#';
    tab.className = 'category-tab text-white hover:text-pink-400 transition-colors';
    tab.dataset.category = category.toLowerCase().replace(/\s+/g, '-');
    tab.textContent = category;
    tab.onclick = (e) => {
      e.preventDefault();
      filterByCategory(category.toLowerCase().replace(/\s+/g, '-'));
    };
    navTabs.appendChild(tab);
  });
}

document.addEventListener('DOMContentLoaded', async function () {
  modal = document.getElementById("videoModal");
  iframe = document.getElementById("modalIframe");
  
  try {
    console.log('🎬 Loading Mizo Leakout videos...');
    const response = await fetch('videos.json');
    const data = await response.json();
    const videoGrid = document.getElementById("videoGrid");
    
    // Extract all videos and create category navigation
    const categories = data.playlists.map(p => p.name);
    createCategoryNavigation(categories);
    
    allVideos = [].concat(...data.playlists.map(p => 
      p.videos.map(v => ({...v, category: p.name}))
    ));
    
    console.log(`📊 Loaded ${allVideos.length} videos across ${categories.length} categories`);
    
    // Filter out videos with invalid IDs
    const validVideos = allVideos.filter(video => 
      video.id && 
      video.id.length >= 10 && 
      /^[a-zA-Z0-9_-]+$/.test(video.id)
    );
    
    console.log(`✅ ${validVideos.length} valid videos ready to display`);
    
    // Add loading indicator
    videoGrid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8"><i class="fas fa-spinner fa-spin text-2xl"></i><br>Loading videos...</div>';
    
    // Add videos to grid
    let loadedCount = 0;
    const batchSize = 20; // Load videos in batches for better performance
    
    const loadBatch = () => {
      const batch = validVideos.slice(loadedCount, loadedCount + batchSize);
      
      if (loadedCount === 0) {
        videoGrid.innerHTML = ''; // Clear loading indicator
      }
      
      batch.forEach(video => {
        const card = createVideoCard(video, video.category);
        videoGrid.appendChild(card);
      });
      
      loadedCount += batch.length;
      
      if (loadedCount < validVideos.length) {
        setTimeout(loadBatch, 50); // Small delay between batches
      } else {
        console.log(`🚀 All ${loadedCount} videos loaded successfully!`);
      }
    };
    
    loadBatch();
    
  } catch (error) {
    console.error('❌ Error loading videos:', error);
    const videoGrid = document.getElementById("videoGrid");
    videoGrid.innerHTML = `
      <div class="col-span-full text-center text-gray-400 py-8">
        <i class="fas fa-exclamation-triangle text-4xl mb-4 text-red-500"></i><br>
        <p class="text-lg">Error loading videos</p>
        <p class="text-sm">Please refresh the page or try again later</p>
      </div>`;
  }
  
  // Enhanced keyboard event listeners
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
    if (e.key === "Enter" && document.activeElement.id === "searchInput") {
      searchVideos();
    }
  });
  
  // Real-time search
  document.getElementById("searchInput").addEventListener("input", function (e) {
    if (e.target.value.length > 2 || e.target.value.length === 0) {
      searchVideos();
    }
  });
  
  document.getElementById("searchInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchVideos();
    }
  });
});
