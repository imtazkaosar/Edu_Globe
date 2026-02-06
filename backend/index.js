const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const connectDB = require('./config/db');
const router = require('./routes');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: '500mb' }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    parameterLimit: 100000,
    limit: '500mb',
  })
);
app.use(express.json());
app.use(cookieParser());

// Mount main API router
app.use('/api', router);

// Establish database connection when the module is loaded.
// In serverless environments (like Vercel), this will run on cold start.
connectDB().catch((err) => {
  console.error('Failed to connect to database', err);
});

// Export the Express app for Vercel (@vercel/node) and for local server usage.
module.exports = app;
