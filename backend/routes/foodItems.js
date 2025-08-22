const express = require("express");
const FoodItem = require("../models/FoodItem");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all food items
router.get("/", async (req, res) => {
  try {
    const { available } = req.query;
    let query = {};
    
    // Filter by availability if specified
    if (available !== undefined) {
      query.available = available === 'true';
    }
    
    const foodItems = await FoodItem.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    
    res.json(foodItems);
  } catch (error) {
    console.error("Get food items error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single food item by ID
router.get("/:id", async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    res.json(foodItem);
  } catch (error) {
    console.error("Get food item error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new food item (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    const { name, price } = req.body;
    
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    // Validate input
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }
    
    if (price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }
    
    // Check if food item with same name already exists
    const existingItem = await FoodItem.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingItem) {
      return res.status(400).json({ message: "Food item with this name already exists" });
    }
    
    // Create new food item
    const foodItem = new FoodItem({
      name: name.trim(),
      price: parseFloat(price),
      createdBy: req.userId,
    });
    
    await foodItem.save();
    
    // Populate the creator info before sending response
    await foodItem.populate("createdBy", "name email");
    
    res.status(201).json({
      message: "Food item created successfully",
      foodItem,
    });
  } catch (error) {
    console.error("Create food item error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update food item (Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, price, available } = req.body;
    
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    // Find the food item
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    // Validate input if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      
      // Check if another food item with same name exists
      const existingItem = await FoodItem.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingItem) {
        return res.status(400).json({ message: "Food item with this name already exists" });
      }
      
      foodItem.name = name.trim();
    }
    
    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({ message: "Price must be greater than 0" });
      }
      foodItem.price = parseFloat(price);
    }
    
    if (available !== undefined) {
      foodItem.available = Boolean(available);
    }
    
    await foodItem.save();
    await foodItem.populate("createdBy", "name email");
    
    res.json({
      message: "Food item updated successfully",
      foodItem,
    });
  } catch (error) {
    console.error("Update food item error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete food item (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    // Find and delete the food item
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    await FoodItem.findByIdAndDelete(req.params.id);
    
    res.json({
      message: "Food item deleted successfully",
      deletedItem: {
        id: foodItem._id,
        name: foodItem.name,
      },
    });
  } catch (error) {
    console.error("Delete food item error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle availability (Admin only)
router.patch("/:id/toggle-availability", auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    // Find the food item
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    // Toggle availability
    foodItem.available = !foodItem.available;
    await foodItem.save();
    await foodItem.populate("createdBy", "name email");
    
    res.json({
      message: `Food item ${foodItem.available ? 'enabled' : 'disabled'} successfully`,
      foodItem,
    });
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
