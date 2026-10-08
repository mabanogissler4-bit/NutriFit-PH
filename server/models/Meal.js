const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: false,
    },

    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },

    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    serving: {
      type: Number,
      required: true,
      min: 0.1,
    },

    loggedAt: {
        type: Date,
        required: true,
        default: Date.now,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Meal", mealSchema);