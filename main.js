// main.js - full version with modal fixes

document.addEventListener("DOMContentLoaded", function () {
  fetchVideos();
  setupEventListeners();
});

function fetchVideos() {
  fetch("videos.json")
    .then((response) => response.json())
    .then((videos) => {
      const grid = document.getElementById("videoGrid");
      const loading = document.getElementById("loadingIndicator");
      loading.style.display = "none";

      videos.forEach((video) => {
        const card = document.createElement("div");
        card.className = "video-card";
        card.innerHTML = `
          <img src="${video.thumbnail}" alt="${video.title}">
          <div class="video-info">
            <h3>${video.title}</h3>
            <p>${video.views} views</p>
          </div>
        `;
        card.addEventListener("click", () => openModal(video));
        grid.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Error loading videos:", err);
    });
}

function setupEventListeners() {
  const modal = document.getElementById("videoModal");
  const iframe = document.getElementById("modalIframe");
  const title = document.getElementById("modalVideoTitle");
  const views = document.getElementById("modalVideoViews");

  window.openModal = function (video) {
    modal.style.display = "flex";
    iframe.src = video.url;
    title.textContent = video.title;
    views.textContent = `${video.views} views`;
    history.pushState({ modalOpen: true }, "", "#video");
  };

  window.closeModal = function () {
    modal.style.display = "none";
    iframe.src = "";
    if (location.hash === "#video") {
      history.back();
    }
  };

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      window.closeModal();
    }
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      window.closeModal();
    }
  });

  window.addEventListener("popstate", function () {
    const modal = document.getElementById("videoModal");
    if (modal && modal.style.display === "flex") {
      closeModal();
    }
  });
}

function searchVideos() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const cards = document.querySelectorAll(".video-card");

  cards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = title.includes(filter) ? "block" : "none";
  });
}
