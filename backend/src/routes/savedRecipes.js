const express = require('express');
const router = express.Router();
const { savedRecipeController } = require('../controllers');

// GET /api/saved-recipes - Get all saved recipes
router.get('/', savedRecipeController.getSavedRecipes);

// GET /api/saved-recipes/check - Check if recipe is saved
router.get('/check', savedRecipeController.checkSavedRecipe);

// GET /api/saved-recipes/:id - Get single saved recipe
router.get('/:id', savedRecipeController.getSavedRecipe);

// POST /api/saved-recipes - Create saved recipe
router.post('/', savedRecipeController.createSavedRecipe);

// POST /api/saved-recipes/unsave - Unsave recipe by user and recipe
router.post('/unsave', savedRecipeController.unsaveRecipe);

// DELETE /api/saved-recipes/:id - Delete saved recipe
router.delete('/:id', savedRecipeController.deleteSavedRecipe);

module.exports = router;
