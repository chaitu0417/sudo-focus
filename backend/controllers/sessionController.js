const User = require("../models/User");
const { redisClient } = require("../config/redis");

// Helper: Get start of day (00:00:00)
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getSecondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set to 00:00:00 tomorrow
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
};

// 1. UNLOCK SESSION
exports.unlockSession = async (req, res) => {
  try {
    const { email, problemTitle } = req.body;
    const user = await User.findOne({ email });

    // --- DUPLICATE CHECK (Keep existing logic) ---
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    
    const alreadySolvedToday = user.stats.solvedHistory.some(
      (item) => item.problemTitle === problemTitle && new Date(item.solvedAt) >= startToday
    );

    let currentSolvedCount = user.stats.solvedHistory.filter(
        item => new Date(item.solvedAt) >= startToday
    ).length;

    if (!alreadySolvedToday) {
      await User.updateOne(
        { email },
        { 
          $push: { "stats.solvedHistory": { problemTitle, solvedAt: new Date() } },
          $set: { "stats.lastSolvedDate": new Date() }
        }
      );
      currentSolvedCount += 1; // Increment local count for checking below
      console.log(`✅ New Problem Solved: ${problemTitle}`);
    } else {
      console.log(`⚠️ Duplicate: ${problemTitle}`);
    }

    // --- CHECK DAILY GOAL (THE NEW FEATURE) ---
    const dailyGoal = user.preferences.dailyGoal || 3;

    if (currentSolvedCount >= dailyGoal) {
        // TARGET MET: Unlock until midnight!
        const secondsLeft = getSecondsUntilMidnight();
        await redisClient.setEx(`session:${email}`, secondsLeft, "DAY_PASS");
        console.log(`🎉 DAY PASS GRANTED: ${email} (Goal Reached)`);
    } else {
        // TARGET NOT MET: Standard Timer
        const minutes = user.preferences.rewardDuration || 30;
        await redisClient.setEx(`session:${email}`, minutes * 60, "GRANTED");
        console.log(`🔓 Standard Unlock: ${email} (${minutes} mins)`);
    }

    res.json({ success: true, problemsSolved: currentSolvedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET SESSION STATUS (Smart Check)
// 2. GET SESSION STATUS (Strict Lock Respect)
exports.getSessionStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // A. Lazy Reset Logic
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDateStr = user.stats.lastSolvedDate 
        ? new Date(user.stats.lastSolvedDate).toISOString().split('T')[0] 
        : null;

    // B. Calculate Dynamic Count
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const solvedTodayCount = user.stats.solvedHistory.filter(
        item => new Date(item.solvedAt) >= startToday
    ).length;

    // C. Redis Check (THE AUTHORITY)
    // We ONLY check Redis. We do NOT auto-unlock based on score anymore.
    const sessionType = await redisClient.get(`session:${email}`);
    const ttl = await redisClient.ttl(`session:${email}`);

    let status = "LOCKED";
    
    // Only unlock if a valid session exists
    if (ttl > 0) {
        // If they met the goal AND have an active session, it's a Day Pass
        // If they lock manually, the session is gone, so this block is skipped.
        if (sessionType === "DAY_PASS") {
            status = "ALL_DAY_UNLOCKED";
        } else {
            status = "UNLOCKED";
        }
    }

    res.json({
      status: status, 
      timeLeft: ttl > 0 ? ttl : 0,
      stats: {
        solvedToday: solvedTodayCount,
        dailyGoal: user.preferences.dailyGoal || 3,
        history: user.stats.solvedHistory,
      },
      preferences: user.preferences,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. GET ANALYTICS (With Custom Date Range)
// 3. GET ANALYTICS (Raw Data Provider)
exports.getAnalytics = async (req, res) => {
    try {
        const { email } = req.params;
        const { range, from, to } = req.query; 
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const history = user.stats.solvedHistory;
        
        // 1. Determine Date Range
        let startDate = new Date();
        let endDate = new Date();
        
        if (from && to) {
            // Custom Range (For Log)
            startDate = new Date(from);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(to);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Preset Range (For Charts)
            const days = range === 'all' ? 3650 : parseInt(range || '7');
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);
        }

        // 2. Filter History (Keep Raw Data)
        const filteredHistory = history.filter(item => {
            const solvedDate = new Date(item.solvedAt);
            return solvedDate >= startDate && solvedDate <= endDate;
        });

        // 3. Send RAW list. Frontend will group it by Local Time.
        res.json({
            rawHistory: filteredHistory.reverse(), // Newest first
            dailyGoal: user.preferences.dailyGoal || 3
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. LOCK
exports.lockSession = async (req, res) => {
  try {
    const { email } = req.body;
    await redisClient.del(`session:${email}`);
    res.json({ success: true, status: "LOCKED" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};