const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Force Node's DNS resolver to use Google DNS directly.
// Fixes "querySrv ECONNREFUSED" on Windows when Node doesn't
// pick up the system/adapter DNS settings correctly.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/Voting';

mongoose.connect(mongoURL)
  .catch((err) => console.error('Initial MongoDB connection error:', err.message));

const db = mongoose.connection;

db.on('connected', () => {
  console.log('connected to MongoDB server');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = db;