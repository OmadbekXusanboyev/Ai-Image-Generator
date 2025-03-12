const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const gridGallery = document.querySelector(".gallery-grid");
const modelSelect = document.querySelector("#model-select");
const countSelect = document.querySelector("#count-select");
const ratioSelect = document.querySelector("#ratio-select");

// API_KEY ni to‘g‘ri ishlatish
const API_KEY = window.API_KEY; // Endi config.js dan oladi

const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
})();

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);

  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);

  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

  return { width: calculatedWidth, height: calculatedHeight };
};

const updateImageCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`);
  if (!imgCard) return;

  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img src="${imgUrl}" class="result-img">
              <div class="img-overlay">
                <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                  <i class="fa-solid fa-download"></i>
                </a>
              </div>`;
};

const generateImages = async (
  selectModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  const apiURL = `https://router.huggingface.co/hf-inference/models/${selectModel}`;
  const { width, height } = getImageDimensions(aspectRatio);

  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch(apiURL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`, // API_KEY endi config.js dan olinyapti
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
          options: { wait_for_model: true, user_cache: false },
        }),
      });

      if (!response.ok) throw new Error((await response.json())?.error);

      const result = await response.blob();
      updateImageCard(i, URL.createObjectURL(result));
    } catch (error) {
      console.log(error);
    }
  });

  await Promise.allSettled(imagePromises);
};

const createImageCards = (selectModel, imageCount, aspectRatio, promptText) => {
  gridGallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
              <div class="status-container">
                <div class="spinner"></div>
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p class="status-text">Generating...</p>
              </div>
            </div>`;
  }

  generateImages(selectModel, imageCount, aspectRatio, promptText);
};

const handleFormSubmit = (e) => {
  e.preventDefault();

  const selectModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  createImageCards(selectModel, imageCount, aspectRatio, promptText);
};

promptBtn.addEventListener("click", () => {
  const Prompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = Prompt;
  promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
