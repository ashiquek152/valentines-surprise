// Image assets (using the filenames from the assets folder)
// Background grid images
const bgImages = [
  "assets/heart_bokeh_background_1770832082062.png",
  "assets/rose_petals_falling_1770832132568.png",
  "assets/vintage_love_letter_1770832098723.png",
  "assets/watercolor_hearts_1770832114974.png",
];

// Stack images (New generated ones + placeholder)
const stackImages = [
  "assets/memos/IMG_11.JPG",
  "assets/memos/IMG_12.JPG",
  "assets/memos/IMG_13.jpg",
  "assets/memos/IMG_15.JPG",
  "assets/memos/IMG_16.JPG",
  "assets/memos/IMG_18.jpg",
  "assets/memos/IMG_110.jpg",
  "assets/memos/IMG_111.jpg",
  "assets/memos/IMG_112.JPG",
  "assets/memos/IMG_113.JPG",
  "assets/memos/IMG_114.jpg",
  "assets/memos/IMG_115.jpg",
  "assets/memos/IMG_116.jpg",
  "assets/memos/IMG_117.jpg",
  "assets/memos/IMG_118.jpg",
  "assets/memos/IMG_119.jpg",
  "assets/memos/IMG_120.jpg",
  "assets/memos/IMG_121.jpg",
  "assets/memos/IMG_122.jpg",
];

// Shuffle/Randomize logic for grid
const gridImages = [...bgImages, ...bgImages, ...bgImages, ...bgImages];

const gridContainer = document.getElementById("backgroundGrid");
const stackContainer = document.getElementById("stack-container");
const nextBtn = document.getElementById("next-btn");

// Populate Grid
function populateGrid() {
  // Ensure we have background images, if not use placeholder colors/gradients
  if (bgImages.length === 0) {
    // fallback
  }

  gridImages.forEach((src) => {
    const div = document.createElement("div");
    div.classList.add("grid-item");
    // Fallback if file doesn't exist, but it should based on context
    div.style.backgroundImage = `url('${src}')`;
    gridContainer.appendChild(div);
  });
}

// Transitions
const views = {
  landing: document.getElementById("landing-view"),
  stack: document.getElementById("image-stack-view"),
  buildup: document.getElementById("buildup-view"),
  surprise: document.getElementById("surprise-view"),
  okay: document.getElementById("okay-view"),
};

function switchView(from, to) {
  if (views[from]) {
    views[from].classList.remove("active");
    views[from].classList.add("hidden");
  }
  if (views[to]) {
    // Small delay to allow fade out
    setTimeout(() => {
      views[to].classList.remove("hidden");
      // Add a small delay to allow display:block to apply before opacity transition
      requestAnimationFrame(() => {
        views[to].classList.add("active");
      });
    }, 300);
  }
}

// Stack Logic
let stackInteractionCount = 0;
// Dynamic requirement: Show button when all cards are swiped or after a specific amount
const REQUIRED_INTERACTIONS = stackImages.length;

function initStack() {
  // Preserve the button before clearing
  const btn = stackContainer.querySelector("#next-btn");
  stackContainer.innerHTML = ""; // Clear images
  if (btn) stackContainer.appendChild(btn);

  stackInteractionCount = 0; // Reset count
  if (nextBtn) nextBtn.classList.add("hidden"); // Ensure button is hidden

  // Preload images
  stackImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  stackImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.classList.add("stack-card");
    img.dataset.index = index;
    // Lower index = higher z-index (top)
    // Actually, HTML order: last is on top by default for static position, but we used z-index in CSS
    // CSS: nth-child(1) is z-index 4 (top). So we append in order.
    // Wait, CSS nth-child(1) is the first element.
    // So 1st element is top.

    // Add click listener only to the top element?
    // Or add to all but only handle if it's the top one.
    // Let's use a delegate or simple logic.
    img.addEventListener("click", handleStackClick);
    stackContainer.appendChild(img);
  });
}

// Flag to prevent rapid clicks/glitches
let isAnimating = false;

function handleStackClick(e) {
  if (isAnimating) return;

  const card = e.target;
  const cards = Array.from(stackContainer.querySelectorAll(".stack-card"));

  // Only allow clicking the top card
  if (cards.indexOf(card) !== 0) return;

  // Randomize direction for clicks
  const direction = Math.random() > 0.5 ? "slide-out-left" : "slide-out-right";
  swipeCardOut(card, direction);
}

function swipeCardOut(card, direction) {
  isAnimating = true;
  card.classList.add(direction);
  stackContainer.classList.add("shifting"); // Animate background cards up

  stackInteractionCount++;

  // After animation, remove card
  setTimeout(() => {
    card.remove(); // Remove instead of appendChild (stop recycling)
    stackContainer.classList.remove("shifting");

    isAnimating = false;

    if (stackInteractionCount >= REQUIRED_INTERACTIONS) {
      revealNextButton();
    }
  }, 500); // Match CSS transition/animation time
}

// Touch / Swipe Logic
let touchStartX = 0;
let touchEndX = 0;

stackContainer.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.changedTouches[0].screenX;
  },
  { passive: true },
);

stackContainer.addEventListener(
  "touchend",
  (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe(e.target);
  },
  { passive: true },
);

function handleSwipe(target) {
  if (isAnimating) return;

  // Find the actual card element if the target is internal
  const card = target.closest(".stack-card");
  if (!card) return;

  // Check if it's the top card
  const cards = Array.from(stackContainer.querySelectorAll(".stack-card"));
  if (cards.indexOf(card) !== 0) return;

  const swipeThreshold = 50; // Min distance to be considered a swipe
  if (touchEndX < touchStartX - swipeThreshold) {
    // Swiped Left
    swipeCardOut(card, "slide-out-left");
  } else if (touchEndX > touchStartX + swipeThreshold) {
    // Swiped Right
    swipeCardOut(card, "slide-out-right");
  }
}

function revealNextButton() {
  if (nextBtn) {
    nextBtn.classList.remove("hidden");
    nextBtn.style.zIndex = 20; // Bring to front

    // Hide title and subtitle in the memories view
    const stackView = document.getElementById("image-stack-view");
    if (stackView) {
      const title = stackView.querySelector(".title");
      const subtitle = stackView.querySelector(".subtitle");
      if (title) title.classList.add("hidden");
      if (subtitle) subtitle.classList.add("hidden");
    }
  }
}

// Event Listeners
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    switchView("stack", "surprise");
  });
}

// Sequence Elements
const sequenceContainer = document.getElementById("sequence-container");
const sequenceText = document.getElementById("sequence-text");
const leftTriggerBtn = document.getElementById("left-trigger-btn");
const rightTriggerBtn = document.getElementById("right-trigger-btn");
const walkingTeddy = document.getElementById("walking-teddy");
const chocolateContainer = document.getElementById("chocolate-container");

// Modified Start Button Logic
document.getElementById("start-btn").addEventListener("click", () => {
  // Hide the start button and show the sequence overlay
  document.getElementById("start-btn").classList.add("hidden");
  sequenceContainer.classList.remove("hidden");

  // Ensure left button is visible and others are reset
  leftTriggerBtn.classList.remove("hidden");
  rightTriggerBtn.classList.add("hidden");
  walkingTeddy.classList.add("hidden");
  walkingTeddy.classList.remove("teddy-walk"); // Reset animation
  chocolateContainer.innerHTML = ""; // Clear chocolates
  sequenceText.innerText = "";
  sequenceText.classList.remove("show");
  sequenceText.classList.add("hidden");
});

// Left Button Logic (Teddy Walk)
if (leftTriggerBtn) {
  leftTriggerBtn.addEventListener("click", () => {
    leftTriggerBtn.classList.add("hidden");

    // Show Text
    sequenceText.innerText = "Here is your teddy...";
    sequenceText.classList.remove("hidden");
    // Trigger reflow for animation
    void sequenceText.offsetWidth;
    sequenceText.classList.add("show");

    // Show and animate teddy
    walkingTeddy.classList.remove("hidden");
    // Trigger reflow
    void walkingTeddy.offsetWidth;
    walkingTeddy.classList.add("teddy-walk");

    // Play video
    if (walkingTeddy.play) {
      walkingTeddy.currentTime = 0;
      walkingTeddy.play().catch((e) => console.log("Video play failed", e));
    }

    // Wait for animation to finish (4s per CSS)
    setTimeout(() => {
      walkingTeddy.classList.add("hidden");
      if (walkingTeddy.pause) walkingTeddy.pause(); // Pause video

      // Fade out text
      sequenceText.classList.remove("show");
      setTimeout(() => sequenceText.classList.add("hidden"), 500);

      rightTriggerBtn.classList.remove("hidden");
    }, 4000);
  });
}

// Right Button Logic (Chocolate Rain)
if (rightTriggerBtn) {
  rightTriggerBtn.addEventListener("click", () => {
    rightTriggerBtn.classList.add("hidden");

    // Show Text
    sequenceText.innerText = "Chocolates...";
    sequenceText.classList.remove("hidden");
    void sequenceText.offsetWidth;
    sequenceText.classList.add("show");

    dropChocolates();
  });
}

// Chocolate Logic
function dropChocolates() {
  const count = 300; // Increase count to ensure full coverage
  const containerWidth = window.innerWidth;
  const pileCenter = containerWidth / 2;
  const pileSpread = containerWidth / 4;

  // Fast interval to dump them quickly
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createChocolatePiece(containerWidth);
    }, i * 20); // Faster drop rate
  }

  // Calculate total time
  const totalDropTime = count * 20;

  // After pile up, show bouquet
  setTimeout(() => {
    // Hide chocolates? Or keep them?
    // User said "After the chocolate screen show a flower boquet".
    // It's nice to keep the pile visible behind the bouquet pop-up or clear them.
    // Let's keep them but dim them via the bouquet overlay.

    // Hide "Chocolates" text
    sequenceText.classList.remove("show");
    sequenceText.classList.add("hidden");

    showBouquet();
  }, totalDropTime + 2000); // Wait for drops to settle
}

function showBouquet() {
  const bouquetContainer = document.getElementById("bouquet-container");
  if (!bouquetContainer) return;

  bouquetContainer.classList.remove("hidden");
  // Trigger reflow
  void bouquetContainer.offsetWidth;
  bouquetContainer.classList.add("visible");

  // Add click listener just once
  bouquetContainer.addEventListener("click", handleBouquetClick, {
    once: true,
  });
}

function handleBouquetClick() {
  const bouquetContainer = document.getElementById("bouquet-container");

  // Fade out sequence container
  sequenceContainer.style.transition = "opacity 1s";
  sequenceContainer.style.opacity = "0";

  setTimeout(() => {
    sequenceContainer.classList.add("hidden");
    sequenceContainer.style.opacity = "1";

    // Hide bouquet for next time
    bouquetContainer.classList.remove("visible");
    bouquetContainer.classList.add("hidden");

    // Proceed to standard flow
    switchView("landing", "stack");

    const stackView = document.getElementById("image-stack-view");
    if (stackView) {
      const title = stackView.querySelector(".title");
      const subtitle = stackView.querySelector(".subtitle");
      if (title) title.classList.remove("hidden");
      if (subtitle) subtitle.classList.remove("hidden");
    }
    initStack();
  }, 1000);
}

function createChocolatePiece(containerWidth) {
  const piece = document.createElement("div");
  piece.classList.add("chocolate-piece");

  // 1. Uniform X Position (Filling the whole width)
  // Use simple random for uniform distribution
  let finalX = Math.random() * containerWidth;

  // Constrain to screen width with padding
  const safeX = Math.max(0, Math.min(finalX, containerWidth - 50));

  piece.style.left = `${safeX}px`;
  piece.style.top = "-80px"; // Start above screen

  // Random z-index so they overlap naturally
  piece.style.zIndex = Math.floor(2000 + Math.random() * 200);

  chocolateContainer.appendChild(piece);

  // 2. Uniform Y Position (Filling bottom 40%)
  const windowHeight = window.innerHeight;
  const fillHeight = windowHeight * 0.4; // 40% of screen height

  // Random height within the fill zone (0 to fillHeight) from bottom
  // We want more randomness to prevent lines
  const randomHeightFromBottom = Math.random() * fillHeight;

  // Calculate target 'top' value
  // Top = WindowHeight - RandomHeight - PieceSize(approx 50)
  const targetTop = windowHeight - randomHeightFromBottom - 50;

  // Animate falling
  // Vary speed: Pieces falling lower take longer? Or random?
  // Let's make it random but related to distance to feel physically plausible
  const distance = targetTop + 80; // Total travel pixels
  const speed = 0.5 + Math.random() * 0.5; // px/ms factor? No, just random duration
  const duration = 1.0 + Math.random(); // 1s to 2s

  // Use a bounce effect at the end
  piece.style.transition = `top ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${duration}s linear`;

  requestAnimationFrame(() => {
    piece.style.top = `${targetTop}px`;
    // Rotate on impact (random spin)
    piece.style.transform = `rotate(${Math.random() * 720 - 360}deg)`;
  });
}

// Surprise View Buttons
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
// Replay button removed as per request
const feedbackText = document.getElementById("response-feedback");

if (yesBtn) {
  yesBtn.addEventListener("click", () => {
    // Switch to new success view instead of inline text
    switchView("surprise", "okay");

    // Confetti Loop
    const duration = 5000;
    const end = Date.now() + duration;

    (function frame() {
      // launch a few confetti from the left edge
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      // and launch a few from the right edge
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  });
}

if (noBtn) {
  // Make the button run away
  noBtn.addEventListener("mouseover", moveNoButton);
  noBtn.addEventListener("touchstart", moveNoButton); // For mobile

  noBtn.addEventListener("click", () => {
    // If they manage to click it
    if (feedbackText) {
      feedbackText.innerText = "Please... 😢";
      feedbackText.style.color = "#555";
    }
  });
}

function moveNoButton(e) {
  if (!noBtn) return;
  const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
  const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);

  noBtn.style.position = "fixed";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

// Initialize
populateGrid();
