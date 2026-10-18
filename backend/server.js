const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');

// Allow the hosted frontend (Vercel/Netlify) to call this API.
// Set FRONTEND_URL in your hosting provider's env vars once deployed,
// e.g. FRONTEND_URL=https://your-app.vercel.app
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));

app.use(bodyParser.json({ limit: '500kb' }));
// (or: app.use(express.json({ limit: '500kb' })); and drop body-parser)

const PORT = process.env.PORT || 3000;

const logRequest = (req,res,next) => {
  console.log(`[${new Date().toLocaleString()}] Request Made to : ${req.originalUrl}`);
  next();
}
app.use(logRequest);

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT,() => {
  console.log(`listning on port ${PORT}`);
});