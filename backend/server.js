require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/food-items", require("./routes/foodItems"));

app.get("/", (req, res) => {
  res.send("Server is running and connected to MongoDB!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
