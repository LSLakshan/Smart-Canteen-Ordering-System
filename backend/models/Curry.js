const mongoose = require("mongoose");

const currySchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate custom ID before saving
currySchema.pre("save", async function (next) {
  if (!this.customId || this.isNew) {
    try {
      const count = await this.constructor.countDocuments();
      this.customId = `CUR${String(count + 1).padStart(3, "0")}`;
    } catch (error) {
      console.error("Error generating customId:", error);
      return next(error);
    }
  }
  next();
});

// Index for faster queries
currySchema.index({ available: 1 });
currySchema.index({ createdBy: 1 });

module.exports = mongoose.model("Curry", currySchema);
