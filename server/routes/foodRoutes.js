const express = require("express");
const Food = require("../models/Food");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Search foods
router.get("/", authMiddleware, async (req, res) => {
  try {
    const search = req.query.search || "";

    const foods = await Food.find({
      name: {
        $regex: search,
        $options: "i",
      },
    })
      .sort({ name: 1 })
      .limit(50);

    res.json({
      foods,
    });
  } catch (error) {
    console.error("Search foods error:", error);

    res.status(500).json({
      message: "Unable to search foods.",
    });
  }
});

// Get a single food
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found.",
      });
    }

    res.json({
      food,
    });
  } catch (error) {
    console.error("Get food error:", error);

    res.status(500).json({
      message: "Unable to get food.",
    });
  }
});

module.exports = router;