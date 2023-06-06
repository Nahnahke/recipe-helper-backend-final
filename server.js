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

app.get("/", (req, res) => {
  const endpoints = listEndpoints(app); 
  res.json(endpoints);
});

const { Schema } = mongoose;

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
  longitude: { type: Number, required: true }
});

// Like should be last. 

const Property = mongoose.model("Property", propertySchema);

// FILTER PROPERTIES ACCORDING TO LOCATION, PRICE RANGE, SQM RANGE, AND TYPE.
app.get("/properties", async (req, res) => {
  try {
    const { location, minPrice, maxPrice, minSquareMeters, maxSquareMeters, type } = req.query;

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

    if (location) {
      filters["address.city"] = { $regex: new RegExp(location, "i") };
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
    const singleProperty = await Property.findById(id).select("category squareMeters unitOfArea description price currency address.city realtor");
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



/* Databasstrukturen för ändringar (DO NOT DELETE!!!!!!):

[
  {
    "_id": 123098,
    "category": "Apartment",
    "squareMeters": 90,
    "description": "Beautiful apartment",
    "price": 10000000,
    "address": {
      "street": "Styrmansgatan",
      "streetNumber": "1",
      "postalCode": "114 54",
      "city": "Stockholm"
    },
    "realtor": "Johanna Leonsson",
    "latitude": 59.33205084980061,
    "longitude": 18.084713755375606,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg",
      "https://example.com/image5.jpg"
    ]
  },
  {
    "_id": 123456,
    "category": "Apartment",
    "squareMeters": 55,
    "description": "Stunning apartment",
    "price": 5000000,
    "address": {
      "street": "Styrmansgatan",
      "streetNumber": "2",
      "postalCode": "114 54",
      "city": "Stockholm"
    },
    "realtor": "Sammy Olsson",
    "latitude": 59.33216306656657,
    "longitude": 18.085126924688886,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg",
      "https://example.com/image5.jpg"
    ]
  },
  {
    "_id": 123454,
    "category": "Apartment",
    "squareMeters": 120,
    "description": "Amazing apartment",
    "price": 500000000,
    "address": {
      "street": "Styrmansgatan",
      "streetNumber": "3",
      "postalCode": "114 54",
      "city": "Stockholm"
    },
    "realtor": "Hannah Ek",
    "latitude": 59.332178049411375,
    "longitude": 18.084815955375625,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg",
      "https://example.com/image5.jpg"
    ]
  },
  {
    "_id": 123456,
    "category": "House",
    "squareMeters": 350,
    "description": "Amazing house",
    "price": 5000000000,
    "address": {
      "street": "Styrmansgatan",
      "streetNumber": "4",
      "postalCode": "114 54",
      "city": "Stockholm"
    },
    "realtor": "Hannah Ek",
    "latitude": 59.33226352150261,
    "longitude": 18.08524512468886,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg",
      "https://example.com/image5.jpg"
    ]
  },
  {
  "_id": 123789,
  "category": "House",
  "squareMeters": 500,
  "description": "Fantastic house",
  "price": 2500000000,
  "address": {
    "street": "Gustav Adolfs Gata 3",
    "postalCode": "252 68",
    "city": "Helsingborg"
  },
  "realtor": "Johanna Leonsson",
  "latitude": "56.0400802655563",
  "longitude": "12.705866497489993",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg",
    "https://example.com/image4.jpg",
    "https://example.com/image5.jpg"
    ]
},
  {
    "_id": 123543,
    "category": "Vacation Home",
    "squareMeters": 120,
    "description": "Lovely vacation home",
    "price": 30000000,
    "address": {
      "street": "Övre Eneborgsgatan 3",
      "postalCode": "252 48",
      "city": "Helsingborg"
    },
    "realtor": "Sammy Olsson",
    "latitude": "56.04175676139079",
    "longitude": "12.70636279749006",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg",
      "https://example.com/image5.jpg"
    ]
  },
  {
    "_id": 123123,
    "category": "Vacation Home",
    "squareMeters": 230,
    "description": "Leisureful vacation home",
    "price": 1200000,
    "address": {
      "street": "Köpingevägen 8",
      "postalCode": "252 47",
      "city": "Helsingborg"
    },
    "realtor": "Hannah Ek",
    "latitude": "56.04829861208089",
    "longitude": "12.710735698602658",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg",
      "https://example.com/image5.jpg"
    ]
  },
  {
    "_id": 123876,
    "category": "Vacation Home",
    "squareMeters": 20,
    "description": "Compact house",
    "price": 200000,
    "address": {
      "street": "Irisgatan 5",
      "postalCode": "215 65",
      "city": "Malmö"
    },
    "realtor": "Johanna Leonsson",
    "latitude": "55.573240919055436",
    "longitude": "12.997388412803689",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg",
      "https://example.com/image5.jpg"
    ]
  },
  {
    "_id": 123664,
    "category": "Vacation Home",
    "squareMeters": 600,
    "description": "Grand vacation home",
    "price": 1200000000,
    "address": {
      "street": "Konsultgatan 12",
      "postalCode": "252 48",
      "city": "Malmö"
    },
    "realtor": "Hannah Ek",
    "latitude": "55.577668290255254",
    "longitude": "12.989842110953004",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg",
      "https://example.com/image5.jpg"
    ]
  }
]

*/