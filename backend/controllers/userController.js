const User = require("../models/User");

// Register or Login User
exports.registerUser = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
      await user.save();
      console.log(`🆕 New User Registered: ${email}`);
    } else {
      console.log(`👋 User Logged In: ${email}`);
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update User Preferences
exports.updateConfig = async (req, res) => {
  try {
    const { email, dailyGoal, blockedSites, rewardDuration } = req.body;

    let updateFields = {};
    if (dailyGoal !== undefined) updateFields["preferences.dailyGoal"] = dailyGoal;
    if (blockedSites !== undefined) updateFields["preferences.blockedSites"] = blockedSites;
    if (rewardDuration !== undefined) updateFields["preferences.rewardDuration"] = rewardDuration;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { new: true }
    );

    res.json({ success: true, preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};