import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";

const mongoUrl = process.env.MONGO_URL || "INSERT";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

// Get all available endpoints of the application.
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app); 
  res.json(endpoints);
});

const { Schema } = mongoose;



// Start the server.
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
