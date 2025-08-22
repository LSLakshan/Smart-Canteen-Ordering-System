const mongoose = require("mongoose");

const dailyMealSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    breakfast: {
      foodItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
      }],
      curries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Curry",
      }],
    },
    lunch: {
      foodItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
      }],
      curries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Curry",
      }],
    },
    dinner: {
      foodItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
      }],
      curries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Curry",
      }],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
dailyMealSchema.index({ date: 1 });
dailyMealSchema.index({ isActive: 1 });
dailyMealSchema.index({ createdBy: 1 });

// Ensure only one active daily meal per date
dailyMealSchema.index({ date: 1, isActive: 1 }, { unique: true });

module.exports = mongoose.model("DailyMeal", dailyMealSchema);
