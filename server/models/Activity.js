const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    activityType: {
      type: String,
      enum: [
        "walking",
        "running",
        "cycling",
        "swimming",
        "gym",
        "sports",
        "home_workout",
        "other",
      ],
      required: true,
    },

    activityName: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    caloriesBurned: {
      type: Number,
      required: true,
      min: 0,
    },

    loggedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);
