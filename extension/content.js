console.log("🧐 Sudo Focus: Judge Active (DOM Freshness Mode)...");

let userClickedSubmit = false;

// 1. CAPTURE SUBMIT CLICK
// We need to know the user tried to submit, otherwise we ignore everything.
const captureSubmit = () => {
  console.log("🖱️ Submit detected. Watching for FRESH updates...");
  userClickedSubmit = true;
  // Timeout after 30s
  setTimeout(() => {
    userClickedSubmit = false;
  }, 30000);
};

document.addEventListener(
  "click",
  (e) => {
    const t = e.target;
    // Check for button text or the specific icon container inside the button
    if (
      (t.innerText && t.innerText.includes("Submit")) ||
      t.closest("button")?.innerText.includes("Submit")
    ) {
      captureSubmit();
    }
  },
  true
);

document.addEventListener(
  "keydown",
  (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") captureSubmit();
  },
  true
);

// 2. THE JUDGE (Mutation Observer)
const observer = new MutationObserver((mutations) => {
  if (!userClickedSubmit) return; // Ignore everything if user didn't submit

  for (const mutation of mutations) {
    // CHECK 1: Did the text content change? (e.g. Pending -> Accepted)
    if (mutation.type === "characterData" || mutation.type === "childList") {
      const target = mutation.target;
      const text = (target.innerText || target.textContent || "").trim();

      if (checkWin(text)) return;
    }

    // CHECK 2: Was a NEW node added that says "Accepted"? (React Re-render)
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        // Look inside the added node
        const nodeText = (node.innerText || node.textContent || "").trim();
        if (checkWin(nodeText)) return;
      });
    }
  }
});

// Helper to validate the win
const checkWin = (text) => {
  const clean = text.toLowerCase();

  // Ignore unrelated text updates
  if (!clean.includes("accepted")) return false;

  // Double check we are looking at the result label
  // (This prevents false positives from comments or descriptions)
  const resultEl = document.querySelector(
    '[data-e2e-locator="submission-result"]'
  );

  if (resultEl && resultEl.innerText.toLowerCase().includes("accepted")) {
    console.log("✅ FRESH WIN DETECTED!");

    observer.disconnect(); // Stop watching
    userClickedSubmit = false; // Reset

    const title = document.title.split("-")[0].trim() || "Unknown Problem";

    chrome.runtime.sendMessage(
      {
        action: "SOLVED_PROBLEM",
        email: "test@user.com",
        problemTitle: title,
      },
      () => {
        setTimeout(() => alert("🎉 Sudo Focus: ACCEPTED! Unlocking..."), 100);
      }
    );
    return true;
  }
  return false;
};

// Start watching strictly for changes in the subtree
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
