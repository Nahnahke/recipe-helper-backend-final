import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project-properties";
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

// Define the schema for the "Property" model
const propertySchema = new Schema({
  _id: { type: Number, required: true },
  category: { type: String, required: true },
  squareMeters: { type: Number, required: true },
  unitOfArea: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    streetNumber: { type: Number, required: true },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
  },
  images: [{ type: String }],
  realtor: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  mainImg: { type: String, required: true },
  realtorImg: { type: String, required: true },
  eMail: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  headline: { type: String, required: true },
  roomNo: { type: String, required: true }
});

const Property = mongoose.model("Property", propertySchema);

// Filter properties according to location, price range, sqm range and type.
app.get("/properties", async (req, res) => {
  try {
    const { location, minPrice, maxPrice, minSquareMeters, maxSquareMeters, type } = req.query;

    const filters = {};

    if (minPrice && maxPrice) {
      // ParseInt is used to convert string values from the request query parameters into integers for comparison in the database query.
      // minPrice and maxPrice are strings representing prices, and parseInt is used to convert them into integer values for comparison in the $gte (greater than or equal to) and $lte (less than or equal to) conditions of the MongoDB query.
      filters.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    } else if (minPrice) {
      filters.price = { $gte: parseInt(minPrice) };
    } else if (maxPrice) {
      filters.price = { $lte: parseInt(maxPrice) };
    }

    if (minSquareMeters && maxSquareMeters) {
      filters.squareMeters = { $gte: parseInt(minSquareMeters), $lte: parseInt(maxSquareMeters) };
    } else if (minSquareMeters) {
      filters.squareMeters = { $gte: parseInt(minSquareMeters) };
    } else if (maxSquareMeters) {
      filters.squareMeters = { $lte: parseInt(maxSquareMeters) };
    }

    if (type) {
      filters.category = type;
    }

    if (location) {
      filters["address.city"] = { $regex: new RegExp(location, "i") }; //Regex is used for filtering according to location in this code. The "i" makes in case-insensitive.
    }

    const properties = await Property.find(filters);

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ 
      error: "Internal Server Error" 
    });
  }
});

// Get at specific property by id.
app.get("/properties/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleProperty = await Property.findById(id).select("category headline eMail phoneNumber roomNo realtorImg squareMeters unitOfArea description price currency address.street address.streetNumber address.city realtor images mainImg");
    if (singleProperty) {
      res.status(200).json(singleProperty);
    } else {
      res.status(404).json('Property not found');
    }
  } catch (error) {
    res.status(500).json({ 
      error: "Internal Server Error" 
    });
  }
});

// Start the server.
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
