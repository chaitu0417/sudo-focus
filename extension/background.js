const API_URL = "http://localhost:3000/api";
const USER_EMAIL = "test@user.com";

// 1. LISTEN FOR MESSAGES (Unlock Logic)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SOLVED_PROBLEM") {
    console.log("📩 Received Signal:", request.problemTitle);

    fetch(`${API_URL}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: request.email,
        problemTitle: request.problemTitle,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Server Replied:", data);
      })
      .catch((err) => {
        console.error("❌ SERVER ERROR:", err);
      });
  }
});

// 2. BLOCKING LOGIC (Dynamic List)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    try {
      // STEP A: Ask Backend for the LATEST Config & Status
      const res = await fetch(`${API_URL}/status/${USER_EMAIL}`);
      const data = await res.json();

      // STEP B: Get the dynamic list from the server response
      // (If server has no list, fallback to empty array)
      const blockedSites = data.preferences?.blockedSites || [];

      // STEP C: Check if current URL is in that list
      const isBlocked = blockedSites.some((site) => tab.url.includes(site));

      if (isBlocked) {
        console.log(`🚫 Site is in blocklist: ${tab.url}`);

        // STEP D: If it IS blocked, check if user is LOCKED
        if (data.status === "LOCKED") {
          console.log("🔒 Access Denied. Redirecting...");
          chrome.tabs.update(tabId, {
            url: "https://leetcode.com/problemset/all/",
          });
        } else {
          console.log("🔓 Access Granted (Timer Active)");
        }
      }
    } catch (err) {
      console.log("Server unreachable or error checking status", err);
    }
  }
});
