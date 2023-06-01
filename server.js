import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project-properties";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

const { Schema } = mongoose;

const propertySchema = new Schema({
  _id: { type: Number, required: true },
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
// GET ALL PROPERTIES - Behövs den?
app.get("/housing", async (req, res) => {
  const { type } = req.query;

  try {
    let properties = await Property.find({}); 

    if (type) {
      properties = properties.filter((property) => {
        return property.category.toLowerCase() === type.toLowerCase();
      });
    }

    res.status(200).json({
      success: true,
      message: "Properties retrieved successfully",
      body: {
        housingData: properties,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
*/

// FILTER PROPERTIES ACCORDING TO LOCATION, PRICE RANGE, SQM RANGE, AND TYPE.
app.get("/properties", async (req, res) => {
  try {
    const { minPrice, maxPrice, minSquareMeters, maxSquareMeters, type } = req.query;

    const filters = {};

    if (minPrice && maxPrice) {
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
      filters.category = { $regex: new RegExp(type, "i") };
    }

    const properties = await Property.find(filters);

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET A SPECIFIC PROPERTY VIA ID.
app.get("/properties/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleProperty = await Property.findById(id).select("id category squareMeters description price address city realtor");
    if (singleProperty) {
      res.status(200).json(singleProperty);
    } else {
      res.status(404).json('Property not found');
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// http://localhost:8080/properties?location=Stockholm&price=10000000&squareMeters=90&type=Apartment
