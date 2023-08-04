const info = document.querySelector("#info");
const exit = document.querySelector("#exit");
const product_Info = document.querySelector("#product-info");
const langSelect = document.querySelector("#lang");
const playBtn = document.querySelector("#button");

info.style.display = "none";
lang.style.display = "none";
product_Info.style.display = "none";
exit.style.display = "none";
// playBtn.style.display = "none";

let selectedLanguage = "en"; // Default language is English.
let markerDetected = false; // Flag to track if the marker is detected.

function fetchContentFile(contentFiles, selectedLanguage) {
    const contentFile = contentFiles[selectedLanguage];
    return fetch(contentFile)
        .then((response) => response.text())
        .catch((error) => {
            console.error("Error fetching content file:", error);
            return "";
        });
}

function updateProductInfo(content) {
    product_Info.innerHTML = content;
}

function fetchMarkerData() {
    return fetch("contents/content.json")
        .then((response) => response.json())
        .catch((error) => {
            console.error("Error fetching marker data:", error);
            return [];
        });
}

function handleBeforeUnload() {
    stopPlay();
    localStorage.setItem("isPlaying", isPlaying);
}

window.addEventListener("beforeunload", handleBeforeUnload);

const speech = window.speechSynthesis;

function playInfo() {
    const productInfoText = product_Info.textContent;
    if (productInfoText) {
        // const speech = window.speechSynthesis;
        if (isPlaying) {
            speech.cancel();
            isPlaying = false;
            playBtn.querySelector('span').textContent = 'Play';
            playBtn.classList.remove('playing');
        } else {
            const utterance = new SpeechSynthesisUtterance(productInfoText);
            speech.speak(utterance);
            isPlaying = true;
            playBtn.querySelector('span').textContent = 'Stop';
            playBtn.classList.add('playing');
        }
    }
}

function stopPlay() {
    const productInfoText = product_Info.textContent;
    if (productInfoText) {
        // const speech = window.speechSynthesis;
        if (isPlaying) {
            speech.cancel();
            isPlaying = false;
            playBtn.querySelector('span').textContent = 'Play';
            playBtn.classList.remove('playing');
        }
    }
}

let isPlaying = false;
playBtn.addEventListener("click", () => {
    playInfo();
});

fetchMarkerData().then((markers) => {
    const scene = document.querySelector("a-scene");

    let activeMarker = null;

    // Function to create a marker element for a given marker data
    function createMarkerElement(marker) {
        const markerEl = document.createElement("a-marker");
        markerEl.setAttribute("type", "pattern");
        markerEl.setAttribute("url", marker.patternUrl);

        const modelEl = document.createElement("a-entity");
        modelEl.setAttribute("gltf-model", marker.modelUrl);
        modelEl.setAttribute("position", "0 -2 -1");
        modelEl.setAttribute("scale", "0.5 0.5 0.5");
        modelEl.setAttribute("rotation", "-90 -90 90");

        scene.appendChild(markerEl);

        return markerEl;
    }

    function showContent(selectedLanguage, marker) {
        fetchContentFile(marker.contentFiles, selectedLanguage).then((content) => {
            updateProductInfo(content);
        });
    }

    markers.forEach((marker) => {
        const markerEl = createMarkerElement(marker);
        markerEl.addEventListener("markerFound", () => {
            if (!markerDetected) {
                markerDetected = true;
                activeMarker = marker; // Store the active marker
                info.textContent = marker.info;
                info.style.display = "block";
                langSelect.style.display = "block";
                exit.style.display = "block";
                product_Info.style.display = "block";
                playBtn.style.display = "block";
                showContent(selectedLanguage, marker); // Load content based on selected language and current marker.
            }
        });
    });

    langSelect.addEventListener("change", () => {
        selectedLanguage = langSelect.value;
        if (activeMarker) {
            showContent(selectedLanguage, activeMarker); // Load content based on selected language and current marker.
            stopPlay();
        }
    });

    exit.addEventListener("click", () => {
        if (markerDetected) {
            markerDetected = false;
            activeMarker = null; // Clear the active marker
            info.style.display = "none";
            langSelect.style.display = "none";
            product_Info.style.display = "none";
            exit.style.display = "none";
            playBtn.style.display = "none";
            stopPlay();
        }
    });
});