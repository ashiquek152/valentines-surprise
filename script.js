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
document.getElementById("start-btn").addEventListener("click", () => {
  switchView("landing", "stack");

  // Ensure title and subtitle are visible when starting/replaying
  const stackView = document.getElementById("image-stack-view");
  if (stackView) {
    const title = stackView.querySelector(".title");
    const subtitle = stackView.querySelector(".subtitle");
    if (title) title.classList.remove("hidden");
    if (subtitle) subtitle.classList.remove("hidden");
  }

  initStack(); // Reset stack on entry
});

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    switchView("stack", "buildup");
  });
}

document.getElementById("reveal-btn").addEventListener("click", () => {
  switchView("buildup", "surprise");
});

document.getElementById("replay-btn").addEventListener("click", () => {
  switchView("surprise", "landing");
  stackInteractionCount = 0;
  nextBtn.classList.add("hidden");

  // Reset No Button State
  if (typeof noMovesCount !== "undefined") noMovesCount = 0; // Reset moves
  if (typeof noClickCount !== "undefined") noClickCount = 0; // Reset clicks

  if (noBtn) {
    noBtn.style.display = ""; // Unhide
    if (responseButtons && noBtn.parentNode === document.body) {
      responseButtons.appendChild(noBtn); // Put back in container
    }
    // Reset inline styles from the prank
    noBtn.style.position = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.style.zIndex = "";
    noBtn.style.transition = "";
  }
  if (responseButtons) responseButtons.style.display = ""; // Unhide container
});

// Button Logic
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const feedbackEl = document.getElementById("response-feedback");
const responseButtons = document.querySelector(".response-buttons");

if (yesBtn && noBtn) {
  let noClickCount = 0;

  // Prank "No" Button Logic
  let noMovesCount = 0;
  const MAX_MOVES = 5;

  function moveNoButton() {
    if (noMovesCount >= MAX_MOVES) return;

    noMovesCount++;

    // Move button to body to escape transformed parent context
    if (noBtn.parentNode !== document.body) {
      document.body.appendChild(noBtn);
    }

    // Add safe margin to prevent edge clipping (especially on scrollviews/mobile)
    const padding = 20;
    const maxX = window.innerWidth - noBtn.offsetWidth - padding;
    const maxY = window.innerHeight - noBtn.offsetHeight - padding;

    // Ensure random coordinates are within safe bounds
    const x = Math.random() * (maxX - padding) + padding;
    const y = Math.random() * (maxY - padding) + padding;

    // Clamp values just in case
    const safeX = Math.max(padding, Math.min(x, maxX));
    const safeY = Math.max(padding, Math.min(y, maxY));

    noBtn.style.position = "fixed";
    noBtn.style.left = `${safeX}px`;
    noBtn.style.top = `${safeY}px`;
    noBtn.style.zIndex = "1000"; // Ensure it stays on top of everything
    noBtn.style.transition =
      "top 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
  }

  noBtn.addEventListener("mouseover", moveNoButton);
  noBtn.addEventListener("touchstart", (e) => {
    if (noMovesCount < MAX_MOVES) {
      e.preventDefault(); // Prevent accidental clicks on touch
      moveNoButton();
    }
  });

  noBtn.addEventListener("click", (e) => {
    if (noMovesCount < MAX_MOVES) {
      e.preventDefault();
      moveNoButton();
    } else {
      // Logic after moves are done: Drop hearts then sad ending
      noClickCount++;
      feedbackEl.innerHTML = "";

      if (noClickCount <= 3) {
        // Screen Shake
        document.body.classList.add("shake-active");
        setTimeout(() => document.body.classList.remove("shake-active"), 500);

        // Falling Hearts
        for (let i = 0; i < noClickCount; i++) {
          createFallingHeart();
        }
      } else {
        // Sad ending - Replace the letter with the message
        const loveLetter = document.querySelector(".love-letter");
        if (loveLetter) {
          loveLetter.innerHTML = `
          <p class="highlight" style="margin-top: 0">Okay, I can understand.</p>
          <p>I am Sorry 😞</p>
        `;
        }
        feedbackEl.innerHTML = ""; // Clear any hearts
        responseButtons.style.display = "none"; // Hide buttons
        noBtn.style.display = "none"; // Hide explicitly if on body
        // document.getElementById("replay-btn").classList.remove("hidden"); // Removed as requested
      }
    }
  });

  yesBtn.addEventListener("click", () => {
    // Replaced letter with Neon Message
    const loveLetter = document.querySelector(".love-letter");
    if (loveLetter) {
      loveLetter.innerHTML = `
        <p class="neon-message">Thank you<br>and<br>I love you ❤️</p>
      `;
    }

    feedbackEl.innerHTML = "";
    responseButtons.style.display = "none"; // Hide buttons
    noBtn.style.display = "none"; // Hide explicitly if on body
    // document.getElementById("replay-btn").classList.remove("hidden"); // Removed as requested

    triggerConfetti(); // Celebration!
  });
}

function createFallingHeart() {
  const heart = document.createElement("div");
  heart.classList.add("falling-heart");
  heart.textContent = "💔";
  heart.style.left = Math.random() * 80 + 10 + "vw"; // Randomize horizontal position
  heart.style.animationDuration = Math.random() * 2 + 3 + "s"; // Randomize speed: 3-5s
  document.body.appendChild(heart);

  // Cleanup
  setTimeout(() => {
    heart.remove();
  }, 2000);
}

// Confetti Effect
function triggerConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#90EE90", "#3CB371", "#ffffff"],
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#90EE90", "#3CB371", "#ffffff"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  setTimeout(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#90EE90", "#E0FFE0"],
    });
  }, 250);
}

// Initialize
populateGrid();
