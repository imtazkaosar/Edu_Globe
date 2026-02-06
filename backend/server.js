const app = require('./index');
const connectDB = require('./config/db');

require('dotenv').config();

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // Ensure database is connected before starting the HTTP server in local/dev.
    await connectDB();

    app.listen(PORT, () => {
      console.log('Connected to DB');
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

// Only start the server when running this file directly (local development),
// not when importing the app in serverless environments like Vercel.
if (require.main === module) {
  startServer();
}

