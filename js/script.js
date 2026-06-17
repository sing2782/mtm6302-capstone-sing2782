const API_KEY = "ePwuYx9VI990tohbLd8kuFtas5UOs1psxPfSGGaj";

// ---------------- ELEMENTS ----------------
const form = document.getElementById("apod-form");
const dateInput = document.getElementById("date-input");

const apodImg = document.getElementById("apod-img");
const apodTitle = document.getElementById("apod-title");
const apodDate = document.getElementById("apod-date");
const apodExplanation = document.getElementById("apod-explanation");

const favBtn = document.getElementById("fav-btn");
const favouritesGrid = document.getElementById("favourites-grid");

const hdModal = document.getElementById("hd-modal");
const modalImg = document.getElementById("modal-img");
const closeModal = document.getElementById("close-modal");

// ---------------- STATE ----------------
let currentApod = null;

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
    loadFavourites();

    const today = new Date().toISOString().split("T")[0];
    dateInput.max = today;
});

// ---------------- FETCH APOD ----------------
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = dateInput.value;
    if (!date) return;

    try {
        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`
        );

        // 🔥 IMPORTANT: prevent JSON crash
        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Non-JSON response:", text);
            alert("NASA API returned an error. Try again later.");
            return;
        }

        if (!response.ok) {
            console.error("API error:", data);
            alert(data?.msg || "Failed to load APOD.");
            return;
        }

        currentApod = data;
        displayApod(data);

    } catch (error) {
        console.error("Network error:", error);
        alert("Network error. Please try again.");
    }
});

// ---------------- DISPLAY APOD ----------------
function displayApod(data) {
    if (!data) return;

    apodTitle.textContent = data.title || "No title";
    apodDate.textContent = data.date || "";
    apodExplanation.textContent = data.explanation || "";

    const mediaContainer = document.querySelector(".media-container");

    // remove old video if exists
    const oldVideo = document.getElementById("apod-video");
    if (oldVideo) oldVideo.remove();

    if (data.media_type === "image") {
        apodImg.style.display = "block";
        apodImg.src = data.url;
        apodImg.alt = data.title;

        modalImg.src = data.hdurl || data.url;

    } else if (data.media_type === "video") {
        apodImg.style.display = "none";

        const iframe = document.createElement("iframe");
        iframe.id = "apod-video";
        iframe.src = data.url;
        iframe.width = "100%";
        iframe.height = "400";
        iframe.allowFullscreen = true;

        mediaContainer.prepend(iframe);
    }
}

// ---------------- MODAL ----------------
apodImg.addEventListener("click", () => {
    if (modalImg.src) {
        hdModal.classList.remove("hidden");
    }
});

closeModal.addEventListener("click", () => {
    hdModal.classList.add("hidden");
});

hdModal.addEventListener("click", (e) => {
    if (e.target === hdModal) {
        hdModal.classList.add("hidden");
    }
});

// ---------------- FAVORITES ----------------
favBtn.addEventListener("click", () => {
    if (!currentApod) return;

    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

    const exists = favourites.some(f => f.date === currentApod.date);
    if (exists) {
        alert("Already in favourites.");
        return;
    }

    favourites.push(currentApod);
    localStorage.setItem("favourites", JSON.stringify(favourites));

    loadFavourites();
});

// ---------------- LOAD FAVORITES ----------------
function loadFavourites() {
    const favourites = JSON.parse(localStorage.getItem("favourites")) || [];

    favouritesGrid.innerHTML = "";

    favourites.forEach((item) => {
        const card = document.createElement("div");
        card.className = "fav-card";

        card.innerHTML = `
            <img src="${item.url}" alt="${item.title}">
            <div class="fav-card-body">
                <div>
                    <h3>${item.title}</h3>
                    <p class="fav-date">${item.date}</p>
                </div>
                <button class="btn-delete" data-date="${item.date}">
                    Remove From Gallery
                </button>
            </div>
        `;

        favouritesGrid.appendChild(card);
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            deleteFavourite(btn.dataset.date);
        });
    });
}

// ---------------- DELETE FAVORITE ----------------
function deleteFavourite(date) {
    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

    favourites = favourites.filter(item => item.date !== date);

    localStorage.setItem("favourites", JSON.stringify(favourites));

    loadFavourites();
}