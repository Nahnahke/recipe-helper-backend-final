import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Create a list of all endpoints
const listEndpoints = require('express-list-endpoints');

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());


// Schemas and models start here
const { Schema } = mongoose;

const propertySchema = new Schema({
  category: { type: String, required: true },
  squareMeters: { type: Number, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  realtor: { type: String, required: true }
}); 

const Property = mongoose.model("Property", propertySchema);
/*
// Start defining your routes here, do we need this one????
app.get("/", (req, res) => {
  res.status(200).send({
    succes: true,
    message: "OK",
    body: {
      content: "FYLL I",
      endpoints: listEndpoints(app)
    }
  });
});
*/

// GET ALL PROPERTIES
app.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (e) {
    res.status(404).json({ error: "Property not found" });
  }
});

// GET A SPECIFIC PROPERTY VIA ID.
app.get("/properties/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleProperty = await Property.findById(id)
    if (singleProperty) {
      res.status(200).json(singleProperty);
    } else {
      res.status(404).json('Property not found');
    }
    } catch (e) {
      res.status(500).json({ error: "Internal Server Error"});
    }
});

// SEARCH FOR PROPERTIES BY ADDRESS.
router.get('/properties/search', async (req, res) => {
  const { address } = req.query;
  try {
    const properties = await Property.find({ address: { $regex: address, $options: 'i' } });
    res.json(properties);
  } catch (error) {
    res.status(404).json({ error: 'Property not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

