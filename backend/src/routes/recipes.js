const express = require('express');
const router = express.Router();
const { recipeController } = require('../controllers');

// GET /api/recipes - Get all recipes
router.get('/', recipeController.getRecipes);

// GET /api/recipes/by-title/:title - Get recipe by title
router.get('/by-title/:title', recipeController.getRecipeByTitle);

// GET /api/recipes/:id - Get single recipe
router.get('/:id', recipeController.getRecipe);

// POST /api/recipes - Create recipe
router.post('/', recipeController.createRecipe);

// PUT /api/recipes/:id - Update recipe
router.put('/:id', recipeController.updateRecipe);

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;
