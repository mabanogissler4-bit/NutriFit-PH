const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const Food = require("../models/Food");
const foodData = require("./foodData");

const seedFoods = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI was not found. Check that .env exists in the project root."
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    await Food.deleteMany({});

    console.log("Existing food data cleared.");

    await Food.insertMany(foodData);

    console.log(`${foodData.length} foods inserted successfully.`);

    await mongoose.disconnect();

    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Food seeding error:", error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    process.exit(1);
  }
};

seedFoods();