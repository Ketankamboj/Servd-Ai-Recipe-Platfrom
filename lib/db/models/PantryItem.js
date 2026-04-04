import mongoose from "mongoose";

const pantryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
pantryItemSchema.index({ owner: 1, name: 1 });

export default mongoose.models.PantryItem ||
  mongoose.model("PantryItem", pantryItemSchema);
