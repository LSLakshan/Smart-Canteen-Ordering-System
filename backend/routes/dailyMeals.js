const express = require("express");
const DailyMeal = require("../models/DailyMeal");
const FoodItem = require("../models/FoodItem");
const auth = require("../middleware/auth");

const router = express.Router();

// Get daily meal for today or specific date
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    let queryDate = new Date();
    
    if (date) {
      queryDate = new Date(date);
    } else {
      // Set to start of today
      queryDate.setHours(0, 0, 0, 0);
    }
    
    // Find daily meal for the specified date
    const dailyMeal = await DailyMeal.findOne({
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
      },
      isActive: true
    })
    .populate('breakfast', 'name price available')
    .populate('lunch', 'name price available')
    .populate('dinner', 'name price available')
    .populate('createdBy', 'name email');
    
    if (!dailyMeal) {
      return res.json({
        date: queryDate,
        breakfast: [],
        lunch: [],
        dinner: [],
        exists: false
      });
    }
    
    res.json({
      ...dailyMeal.toObject(),
      exists: true
    });
  } catch (error) {
    console.error("Get daily meal error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create or update daily meal (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner } = req.body;
    
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    // Validate date
    let mealDate = new Date();
    if (date) {
      mealDate = new Date(date);
    }
    mealDate.setHours(0, 0, 0, 0);
    
    // Validate food item IDs
    const validateFoodItems = async (itemIds) => {
      if (!itemIds || itemIds.length === 0) return [];
      
      const validItems = await FoodItem.find({
        _id: { $in: itemIds },
        available: true
      });
      
      return validItems.map(item => item._id);
    };
    
    // Validate meals structure - only validate provided meals
    const validatedMeals = {};
    if (breakfast !== undefined) {
      validatedMeals.breakfast = await validateFoodItems(breakfast);
    }
    if (lunch !== undefined) {
      validatedMeals.lunch = await validateFoodItems(lunch);
    }
    if (dinner !== undefined) {
      validatedMeals.dinner = await validateFoodItems(dinner);
    }
    
    // Check if daily meal already exists for this date
    let dailyMeal = await DailyMeal.findOne({
      date: {
        $gte: mealDate,
        $lt: new Date(mealDate.getTime() + 24 * 60 * 60 * 1000)
      },
      isActive: true
    });
    
    if (dailyMeal) {
      // Update existing daily meal - only update provided meals
      if (validatedMeals.breakfast !== undefined) {
        dailyMeal.breakfast = validatedMeals.breakfast;
      }
      if (validatedMeals.lunch !== undefined) {
        dailyMeal.lunch = validatedMeals.lunch;
      }
      if (validatedMeals.dinner !== undefined) {
        dailyMeal.dinner = validatedMeals.dinner;
      }
      dailyMeal.createdBy = req.userId;
    } else {
      // Create new daily meal with default empty arrays for non-provided meals
      dailyMeal = new DailyMeal({
        date: mealDate,
        breakfast: validatedMeals.breakfast || [],
        lunch: validatedMeals.lunch || [],
        dinner: validatedMeals.dinner || [],
        createdBy: req.userId,
      });
    }
    
    await dailyMeal.save();
    
    // Populate the response
    await dailyMeal.populate('breakfast', 'name price available');
    await dailyMeal.populate('lunch', 'name price available');
    await dailyMeal.populate('dinner', 'name price available');
    await dailyMeal.populate('createdBy', 'name email');
    
    res.json({
      message: "Daily meal saved successfully",
      dailyMeal,
    });
  } catch (error) {
    console.error("Create/Update daily meal error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete daily meal (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const dailyMeal = await DailyMeal.findById(req.params.id);
    
    if (!dailyMeal) {
      return res.status(404).json({ message: "Daily meal not found" });
    }
    
    await DailyMeal.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Daily meal deleted successfully" });
  } catch (error) {
    console.error("Delete daily meal error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all daily meals with pagination (Admin only)
router.get("/history", auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const dailyMeals = await DailyMeal.find({ isActive: true })
      .populate('breakfast', 'name price')
      .populate('lunch', 'name price')
      .populate('dinner', 'name price')
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await DailyMeal.countDocuments({ isActive: true });
    
    res.json({
      dailyMeals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get daily meals history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
