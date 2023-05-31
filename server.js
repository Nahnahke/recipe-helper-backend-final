import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

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

// FILTER PROPERTIES ACCORDING TO LOCATION, PRICE, SQM, AND TYPE.
app.get("/properties", async (req, res) => {
  const { location, price, squareMeters, type } = req.query;
  const query = {};

  if (location) {
    query.city = { $regex: location, $options: "i" };
  }

  if (price) {
    query.price = { $lte: parseInt(price) };
  }

  if (squareMeters) {
    query.squareMeters = { $gte: parseInt(squareMeters) };
  }

  if (type) {
    query.category = { $regex: type, $options: "i" };
  }

  try {
    const properties = await Property.find(query);
    res.json(properties);
  } catch (e) {
    res.status(404).json({ error: "Property not found" });
  }
});

// GET A SPECIFIC PROPERTY VIA ID.
app.get("/properties/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleProperty = await Property.findById(id);
    if (singleProperty) {
      res.status(200).json(singleProperty);
    } else {
      res.status(404).json('Property not found');
    }
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// GET /properties?location=New%20York&price=100000&squareMeters=80&type=apartment
