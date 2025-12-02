const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  preferences: {
    blockedSites: { type: [String], default: ['instagram.com', 'facebook.com'] },
    dailyGoal: { type: Number, default: 3 },
    rewardDuration: { type: Number, default: 30 } // <--- NEW FIELD (Minutes)
  },
  stats: {
    problemsSolvedToday: { type: Number, default: 0 },
    // NEW: We store the list of solved problems for the "Track Record"
    solvedHistory: [{
      problemTitle: String,
      solvedAt: { type: Date, default: Date.now }
    }]
  }
});

module.exports = mongoose.model('User', UserSchema);