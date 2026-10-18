const mongoose = require('mongoose');

// One single document ({ key: 'main' }) that holds the voting start/end time.
const votingWindowSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('VotingWindow', votingWindowSchema);