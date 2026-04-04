import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    cuisine: {
      type: String,
      enum: [
        "italian",
        "chinese",
        "mexican",
        "indian",
        "american",
        "thai",
        "japanese",
        "mediterranean",
        "french",
        "korean",
        "vietnamese",
        "spanish",
        "greek",
        "turkish",
        "moroccan",
        "brazilian",
        "caribbean",
        "middle-eastern",
        "british",
        "german",
        "portuguese",
        "other",
        null,
      ],
      default: null,
    },
    category: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack", "dessert", null],
      default: null,
    },
    ingredients: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: [],
    },
    instructions: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: [],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    prepTime: {
      type: Number,
      default: null,
    },
    cookTime: {
      type: Number,
      default: null,
    },
    servings: {
      type: Number,
      default: null,
    },
    nutrition: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    tips: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    substitutions: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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

// Index for faster queries
recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ author: 1 });
recipeSchema.index({ isPublic: 1 });

export default mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);
