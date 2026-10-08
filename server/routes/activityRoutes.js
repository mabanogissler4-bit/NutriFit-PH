const express = require("express");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get today's activities
router.get("/", authMiddleware, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await Activity.find({
      user: req.user.id,
      loggedAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ loggedAt: -1 });

    res.json({
      activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    res.status(500).json({
      message: "Unable to get activities.",
    });
  }
});

// Get activity history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const requestedDays = Number(req.query.days) || 7;

    const days = Math.min(
      Math.max(requestedDays, 1),
      30
    );

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const activities = await Activity.find({
      user: req.user.id,
      loggedAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ loggedAt: 1 });

    const history = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayActivities = activities.filter((activity) => {
        const activityDate = new Date(activity.loggedAt);

        return (
          activityDate >= dayStart &&
          activityDate <= dayEnd
        );
      });

      const caloriesBurned = dayActivities.reduce(
        (total, activity) =>
          total + activity.caloriesBurned,
        0
      );

      const duration = dayActivities.reduce(
        (total, activity) =>
          total + activity.duration,
        0
      );

      history.push({
        date: dayStart.toISOString().split("T")[0],
        caloriesBurned,
        duration,
        activityCount: dayActivities.length,
      });
    }

    res.json({
      days,
      history,
    });
  } catch (error) {
    console.error("Get activity history error:", error);

    res.status(500).json({
      message: "Unable to get activity history.",
    });
  }
});

// Add an activity
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      activityType,
      activityName,
      duration,
      caloriesBurned,
    } = req.body;

    if (
      !activityType ||
      !activityName ||
      !duration ||
      caloriesBurned === undefined ||
      caloriesBurned === null
    ) {
      return res.status(400).json({
        message: "Please complete all activity fields.",
      });
    }

    const durationAmount = Number(duration);
    const caloriesAmount = Number(caloriesBurned);

    if (
      Number.isNaN(durationAmount) ||
      durationAmount <= 0
    ) {
      return res.status(400).json({
        message: "Duration must be greater than 0.",
      });
    }

    if (
      Number.isNaN(caloriesAmount) ||
      caloriesAmount < 0
    ) {
      return res.status(400).json({
        message: "Calories burned cannot be negative.",
      });
    }

    const activity = await Activity.create({
      user: req.user.id,
      activityType,
      activityName,
      duration: durationAmount,
      caloriesBurned: Math.round(caloriesAmount),
      loggedAt: new Date(),
    });

    res.status(201).json({
      message: "Activity added successfully.",
      activity,
    });
  } catch (error) {
    console.error("Add activity error:", error);

    res.status(500).json({
      message: "Unable to add activity.",
    });
  }
});

// Delete an activity
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found.",
      });
    }

    res.json({
      message: "Activity deleted successfully.",
    });
  } catch (error) {
    console.error("Delete activity error:", error);

    res.status(500).json({
      message: "Unable to delete activity.",
    });
  }
});

module.exports = router;
