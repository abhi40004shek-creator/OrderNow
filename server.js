
"use strict";

require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`OrderNow server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start OrderNow:", error.message);
    process.exit(1);
  }
}

startServer();
