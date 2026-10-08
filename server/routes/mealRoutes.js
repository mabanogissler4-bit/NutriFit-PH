const express = require("express");
const Meal = require("../models/Meal");
const Food = require("../models/Food");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get today's meals
router.get("/", authMiddleware, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      user: req.user.id,
      loggedAt: {
        $gte: startOfDay,
        $lte: endOfDay,
    },
    }).sort({ loggedAt: -1 });

    res.json({
      meals,
    });
  } catch (error) {
    console.error("Get meals error:", error);

    res.status(500).json({
      message: "Server error.",
    });
  }
});

// Get meal history
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

    const meals = await Meal.find({
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

      const dayMeals = meals.filter((meal) => {
        const mealDate = new Date(meal.loggedAt);

        return (
          mealDate >= dayStart &&
          mealDate <= dayEnd
        );
      });

      const calories = dayMeals.reduce(
        (total, meal) => total + meal.calories,
        0
      );

      const protein = dayMeals.reduce(
        (total, meal) => total + meal.protein,
        0
      );

      const carbohydrates = dayMeals.reduce(
        (total, meal) => total + (meal.carbohydrates || 0),
        0
      );

      const fat = dayMeals.reduce(
        (total, meal) => total + (meal.fat || 0),
        0
      );

      history.push({
        date: dayStart.toISOString().split("T")[0],
        calories,
        protein: Number(protein.toFixed(1)),
        carbohydrates: Number(
          carbohydrates.toFixed(1)
        ),
        fat: Number(fat.toFixed(1)),
        mealCount: dayMeals.length,
      });
    }

    res.json({
      days,
      history,
    });
  } catch (error) {
    console.error("Get meal history error:", error);

    res.status(500).json({
      message: "Unable to get meal history.",
    });
  }
});

// Add a meal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      foodId,
      mealType,
      serving,
    } = req.body;

    if (!foodId || !mealType || !serving) {
      return res.status(400).json({
        message: "Please select a food, meal type, and serving.",
      });
    }

    const servingAmount = Number(serving);

    if (Number.isNaN(servingAmount) || servingAmount <= 0) {
      return res.status(400).json({
        message: "Serving must be greater than 0.",
      });
    }

    // Find the selected food in the database
    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        message: "Selected food was not found.",
      });
    }

    // Calculate nutrition based on the selected serving
    const calories = Math.round(
      food.calories * servingAmount
    );

    const protein = Number(
      (food.protein * servingAmount).toFixed(1)
    );

    const carbohydrates = Number(
      (food.carbohydrates * servingAmount).toFixed(1)
    );

    const fat = Number(
      (food.fat * servingAmount).toFixed(1)
    );

    const meal = await Meal.create({
        user: req.user.id,
        food: food._id,
        mealType,
        foodName: food.name,
        serving: servingAmount,
        loggedAt: new Date(),
        calories,
        protein,
        carbohydrates,
        fat,
    });

    res.status(201).json({
      message: "Meal added successfully.",
      meal,
    });
  } catch (error) {
    console.error("Add meal error:", error);

    res.status(500).json({
      message: "Unable to add meal.",
    });
  }
});

// Delete a meal
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meal) {
      return res.status(404).json({
        message: "Meal not found.",
      });
    }

    res.json({
      message: "Meal deleted successfully.",
    });
  } catch (error) {
    console.error("Delete meal error:", error);

    res.status(500).json({
      message: "Unable to delete meal.",
    });
  }
});

module.exports = router;