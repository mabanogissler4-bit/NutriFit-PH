const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    servingSize: {
      type: Number,
      required: true,
      min: 0,
    },

    servingUnit: {
      type: String,
      required: true,
      trim: true,
    },

    calories: {
      type: Number,
      required: true,
      min: 0,
    },

    protein: {
      type: Number,
      required: true,
      min: 0,
    },

    carbohydrates: {
      type: Number,
      required: true,
      min: 0,
    },

    fat: {
      type: Number,
      required: true,
      min: 0,
    },

    isFilipino: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Food", foodSchema);