const express = require("express");
const Curry = require("../models/Curry");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all curries
router.get("/", async (req, res) => {
  try {
    const { available } = req.query;
    let query = {};
    
    // Filter by availability if specified
    if (available !== undefined) {
      query.available = available === 'true';
    }
    
    const curries = await Curry.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    
    res.json({ curries });
  } catch (error) {
    console.error("Get curries error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single curry by ID
router.get("/:id", async (req, res) => {
  try {
    const curry = await Curry.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!curry) {
      return res.status(404).json({ message: "Curry not found" });
    }
    
    res.json(curry);
  } catch (error) {
    console.error("Get curry error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new curry (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    
    // Check if curry with same name already exists
    const existingCurry = await Curry.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCurry) {
      return res.status(400).json({ message: "Curry with this name already exists" });
    }
    
    // Generate custom ID
    const count = await Curry.countDocuments();
    const customId = `CUR${String(count + 1).padStart(3, "0")}`;
    
    // Create new curry
    const curry = new Curry({
      customId,
      name: name.trim(),
      createdBy: req.userId,
    });
    
    await curry.save();
    
    // Populate the creator info before sending response
    await curry.populate("createdBy", "name email");
    
    res.status(201).json({
      message: "Curry created successfully",
      curry,
    });
  } catch (error) {
    console.error("Create curry error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update curry (Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, available } = req.body;
    
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    // Find the curry
    const curry = await Curry.findById(req.params.id);
    
    if (!curry) {
      return res.status(404).json({ message: "Curry not found" });
    }
    
    // Validate input if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      
      // Check if another curry with same name exists
      const existingCurry = await Curry.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingCurry) {
        return res.status(400).json({ message: "Curry with this name already exists" });
      }
      
      curry.name = name.trim();
    }
    
    if (available !== undefined) {
      curry.available = Boolean(available);
    }
    
    await curry.save();
    await curry.populate("createdBy", "name email");
    
    res.json({
      message: "Curry updated successfully",
      curry,
    });
  } catch (error) {
    console.error("Update curry error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete curry (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    // Find and delete the curry
    const curry = await Curry.findById(req.params.id);
    
    if (!curry) {
      return res.status(404).json({ message: "Curry not found" });
    }
    
    await Curry.findByIdAndDelete(req.params.id);
    
    res.json({
      message: "Curry deleted successfully",
      deletedItem: {
        id: curry._id,
        name: curry.name,
      },
    });
  } catch (error) {
    console.error("Delete curry error:", error);
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
    
    // Find the curry
    const curry = await Curry.findById(req.params.id);
    
    if (!curry) {
      return res.status(404).json({ message: "Curry not found" });
    }
    
    // Toggle availability
    curry.available = !curry.available;
    await curry.save();
    await curry.populate("createdBy", "name email");
    
    res.json({
      message: `Curry ${curry.available ? 'enabled' : 'disabled'} successfully`,
      curry,
    });
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
