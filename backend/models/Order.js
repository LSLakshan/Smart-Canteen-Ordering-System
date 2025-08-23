const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userIndexNo: {
      type: String,
      required: true,
    },
    items: [
      {
        foodItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        mealType: {
          type: String,
          enum: ["breakfast", "lunch", "dinner"],
          required: true,
        },
      },
    ],
    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      match: /^#\d{5}$/,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "collected", "cancelled"],
      default: "pending",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ token: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
