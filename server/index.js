require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const https = require('https');
const path = require('path');
const cookieParser = require('cookie-parser');
const connection = require("./db/db.js");
const userRoute = require("./routes/userRoute.js");
const mongoose = require('mongoose');
const multer = require("multer");

// SEO-X specific routes
const seoAccountRoutes = require("./routes/seoAccountRoutes");
const blogPostRoutes = require("./routes/blogPostRoutes");
const clientRoutes = require("./routes/clientRoutes");
const backlinkRoutes = require("./routes/backlinkRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("CLIENT_URL:", process.env.CLIENT_URL);

// Database connection
connection();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS setup
const allowedOrigins = [
  "http://localhost:5174",
  "http://137.184.3.111:5174",
  "http://137.184.3.111:4000",
  "http://64.227.96.162:5174",
  "http://64.227.96.162:4000",
  "https://app.agencyoverview.io",  // Add this
  "http://app.agencyoverview.io"  ,  // Add this
  "http://localhost:4000",
];

const storage = multer.diskStorage({
  destination: "templates/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Request Origin:", origin);

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.log("CORS error: Origin not allowed");
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(
  '/generated',
  express.static(path.join(__dirname, 'generated'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.docx')) {
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
      }
    },
  })
);

// Routes
app.use("/api/user", userRoute);
app.use("/api/users", userRoute); // Add this for user management

// Debug middleware to log all requests
app.use("/api", (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.path}`);
  next();
});

// SEO-X Routes
app.use("/api/seo-accounts", seoAccountRoutes);
app.use("/api/blog-posts", blogPostRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/backlinks", backlinkRoutes);
app.use("/api/dashboard", dashboardRoutes);



// Connect to MongoDB Atlas
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
    if (err) {
      console.error('Error sending file:', err);
    }
  });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`Application Running on Port ${port}`));

module.exports = app;

