const express = require('express');
const router = express.Router();

const userRoutes = require('./users');
const recipeRoutes = require('./recipes');
const pantryItemRoutes = require('./pantryItems');
const savedRecipeRoutes = require('./savedRecipes');

// Mount routes
router.use('/users', userRoutes);
router.use('/recipes', recipeRoutes);
router.use('/pantry-items', pantryItemRoutes);
router.use('/saved-recipes', savedRecipeRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
