const mongoose = require('mongoose');

const savedRecipeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only save a recipe once
savedRecipeSchema.index({ user: 1, recipe: 1 }, { unique: true });

module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
