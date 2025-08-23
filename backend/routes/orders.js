const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const FoodItem = require("../models/FoodItem");
const auth = require("../middleware/auth");

const router = express.Router();

// Create a new order
router.post("/", auth, async (req, res) => {
  try {
    const { items, timeSlot, totalAmount, token, notes } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    // Validate time slot
    if (!timeSlot) {
      return res.status(400).json({
        message: "Time slot is required",
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Valid total amount is required" });
    }

    if (!token || !token.match(/^#\d{5}$/)) {
      return res.status(400).json({ message: "Valid token is required" });
    }

    // Get user information
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate items
    const validatedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      // Validate food item exists
      const foodItem = await FoodItem.findById(item.foodItemId);
      if (!foodItem) {
        return res.status(400).json({
          message: `Food item ${item.name} not found`,
        });
      }

      if (!foodItem.available) {
        return res.status(400).json({
          message: `Food item ${item.name} is not available`,
        });
      }

      // Validate meal type
      if (!["breakfast", "lunch", "dinner"].includes(item.mealType)) {
        return res.status(400).json({
          message: "Invalid meal type",
        });
      }

      // Validate quantity
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          message: "Valid quantity is required",
        });
      }

      const itemTotal = foodItem.price * item.quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        foodItemId: item.foodItemId,
        name: foodItem.name,
        price: foodItem.price,
        quantity: item.quantity,
        mealType: item.mealType,
      });
    }

    // Verify total amount matches calculation
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({
        message: "Total amount doesn't match item prices",
      });
    }

    // Check if token already exists
    const existingOrder = await Order.findOne({ token });
    if (existingOrder) {
      return res.status(400).json({
        message: "Token already exists. Please generate a new token.",
      });
    }

    // Create the order
    const order = new Order({
      userId: req.userId,
      userIndexNo: user.indexNo,
      items: validatedItems,
      timeSlot: timeSlot.trim(),
      totalAmount: calculatedTotal,
      token,
      notes: notes || "",
    });

    await order.save();

    // Populate the response
    await order.populate([
      {
        path: "userId",
        select: "name email indexNo",
      },
      {
        path: "items.foodItemId",
        select: "name category description",
      },
    ]);

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Token already exists. Please generate a new token.",
      });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId: req.userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate([
        {
          path: "items.foodItemId",
          select: "name category description",
        },
      ])
      .sort({ orderDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalOrders: total,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order by token
router.get("/token/:token", auth, async (req, res) => {
  try {
    const { token } = req.params;

    if (!token.match(/^#\d{5}$/)) {
      return res.status(400).json({ message: "Invalid token format" });
    }

    const order = await Order.findOne({ token, userId: req.userId }).populate([
      {
        path: "userId",
        select: "name email indexNo",
      },
      {
        path: "items.foodItemId",
        select: "name category description",
      },
    ]);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Get order by token error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status (for admin or user cancellation)
router.patch("/:orderId/status", auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "preparing",
      "ready",
      "collected",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is admin
    const user = await User.findById(req.userId);
    if (order.userId.toString() !== req.userId && user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Users can only cancel their own pending orders
    if (
      user.role !== "admin" &&
      (order.status !== "pending" || status !== "cancelled")
    ) {
      return res.status(403).json({
        message: "You can only cancel pending orders",
      });
    }

    order.status = status;
    await order.save();

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders (Admin only)
router.get("/admin/all", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { page = 1, limit = 20, status, mealType, date, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (mealType) query["items.mealType"] = mealType;

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.orderDate = { $gte: startDate, $lt: endDate };
    }

    if (search) {
      query.$or = [
        { token: { $regex: search, $options: "i" } },
        { userIndexNo: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .populate([
        {
          path: "userId",
          select: "name email indexNo",
        },
        {
          path: "items.foodItemId",
          select: "name category description",
        },
      ])
      .sort({ orderDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalOrders: total,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
