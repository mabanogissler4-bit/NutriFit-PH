const express = require("express");
const Profile = require("../models/Profile");
const authMiddleware = require("../middleware/authMiddleware");
const calculateCalories = require("../utils/calorieCalculator");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found.",
      });
    }

    const nutrition = calculateCalories(profile);

    res.json({
      profile,
      nutrition,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Server error.",
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      age,
      sex,
      height,
      weight,
      activityLevel,
      goal,
    } = req.body;

    if (
      !age ||
      !sex ||
      !height ||
      !weight ||
      !activityLevel ||
      !goal
    ) {
      return res.status(400).json({
        message: "Please complete all profile fields.",
      });
    }

    const profile = await Profile.findOneAndUpdate(
      {
        user: req.user.id,
      },
      {
        user: req.user.id,
        age,
        sex,
        height,
        weight,
        activityLevel,
        goal,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Profile saved successfully.",
      profile,
    });
  } catch (error) {
    console.error("Save profile error:", error);

    res.status(500).json({
      message: "Server error. Please try again.",
    });
  }
});

module.exports = router;