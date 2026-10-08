const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    age: {
      type: Number,
      required: true,
      min: 13,
      max: 100,
    },

    sex: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },

    height: {
      type: Number,
      required: true,
      min: 100,
      max: 250,
    },

    weight: {
      type: Number,
      required: true,
      min: 30,
      max: 300,
    },

    activityLevel: {
      type: String,
      enum: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very_active",
      ],
      required: true,
    },

    goal: {
      type: String,
      enum: ["lose", "maintain", "gain"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);