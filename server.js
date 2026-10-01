const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ quiet: true }); // load values from .env
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();
app.use(cors()); // allow requests from the React app
app.use(express.json()); // read JSON sent in request body
app.get("/", (req, res) => {
 res.json({ message: "API is running..." });
});
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use(notFound); // must be after all routes
app.use(errorHandler); // must be last
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
 app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
 });
});

