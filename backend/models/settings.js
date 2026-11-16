const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key:   { type: String, default: 'voting', unique: true },
  start: { type: Date, default: null },   // voting start (date + time)
  end:   { type: Date, default: null },   // voting end (date + time)
});

module.exports = mongoose.model('Settings', settingsSchema);