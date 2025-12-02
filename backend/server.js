require('dotenv').config(); // Load the .env file
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000; // Use env or default to 3000

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Connect Databases
connectDB();
connectRedis();

// 3. Mount Routes
// All routes in api.js will be prefixed with /api
app.use("/api", apiRoutes);

// 4. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Sudo Focus Server running on port ${PORT}`);
});