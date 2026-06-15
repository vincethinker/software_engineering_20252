require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingSpaceRoutes = require("./routes/bookingSpaceRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:4000"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.set("io", io);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4000"
    ]
  })
);

app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "data", "image")));

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings-space", bookingSpaceRoutes);

app.get("/", (req, res) => {
  res.send("LivrèCafé backend is running");
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`Customer API + Socket server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });