const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const sessionController = require("../controllers/sessionController");

// User
router.post("/register", userController.registerUser);
router.post("/config/update", userController.updateConfig);

// Session & Analytics
router.get("/status/:email", sessionController.getSessionStatus);
router.get("/analytics/:email", sessionController.getAnalytics); // <--- ADDED
router.post("/unlock", sessionController.unlockSession);
router.post("/lock", sessionController.lockSession);

// --- DEBUG ROUTE: CLEAN DUPLICATES ---
router.post("/debug/clean", async (req, res) => {
  try {
    const User = require("../models/User");
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.json({ msg: "User not found" });

    const originalCount = user.stats.solvedHistory.length;
    const uniqueHistory = [];
    const seen = new Set();

    // Loop through history and keep only uniques (per day)
    user.stats.solvedHistory.forEach(item => {
      const dateStr = new Date(item.solvedAt).toISOString().split('T')[0];
      const key = `${dateStr}-${item.problemTitle}`; // Unique Key: "2023-12-01-Two Sum"
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueHistory.push(item);
      }
    });

    user.stats.solvedHistory = uniqueHistory;
    // Also fix the daily counter to match reality
    const todayStr = new Date().toISOString().split('T')[0];
    user.stats.problemsSolvedToday = uniqueHistory.filter(i => 
      new Date(i.solvedAt).toISOString().split('T')[0] === todayStr
    ).length;

    await user.save();

    res.json({ 
      success: true, 
      msg: `Cleaned DB. Reduced from ${originalCount} to ${uniqueHistory.length} entries.` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;