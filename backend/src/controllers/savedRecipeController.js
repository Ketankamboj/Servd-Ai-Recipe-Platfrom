const { SavedRecipe, User, Recipe } = require('../models');

// Helper to build populate options
const getPopulateOptions = (populate) => {
  if (!populate) return [];
  
  const populateFields = populate.split(',');
  return populateFields.map(field => {
    if (field === 'user') {
      return { path: 'user', select: 'firstName lastName email imageUrl clerkId' };
    }
    if (field === 'recipe') {
      return { path: 'recipe' };
    }
    return field;
  });
};

// @desc    Get all saved recipes
// @route   GET /api/saved-recipes
// @access  Public
exports.getSavedRecipes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      sort = '-savedAt',
      populate,
      user,
      clerkId,
      recipe
    } = req.query;
    
    // Build filter
    const filter = {};
    
    // If clerkId is provided, find the user first
    if (clerkId) {
      const userDoc = await User.findOne({ clerkId });
      if (userDoc) {
        filter.user = userDoc._id;
      } else {
        // No user found, return empty array
        return res.json({
          data: [],
          meta: {
            pagination: {
              page: 1,
              pageSize: parseInt(limit),
              pageCount: 0,
              total: 0
            }
          }
        });
      }
    } else if (user) {
      filter.user = user;
    }
    
    if (recipe) filter.recipe = recipe;
    
    let query = SavedRecipe.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Apply population
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach(opt => {
      query = query.populate(opt);
    });
    
    const savedRecipes = await query;
    const total = await SavedRecipe.countDocuments(filter);
    
    res.json({
      data: savedRecipes,
      meta: {
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(limit),
          pageCount: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Get single saved recipe
// @route   GET /api/saved-recipes/:id
// @access  Public
exports.getSavedRecipe = async (req, res) => {
  try {
    const { populate } = req.query;
    
    let query = SavedRecipe.findById(req.params.id);
    
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach(opt => {
      query = query.populate(opt);
    });
    
    const savedRecipe = await query;
    
    if (!savedRecipe) {
      return res.status(404).json({ error: { message: 'Saved recipe not found' } });
    }
    
    res.json({ data: savedRecipe });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Check if recipe is saved by user
// @route   GET /api/saved-recipes/check
// @access  Public
exports.checkSavedRecipe = async (req, res) => {
  try {
    const { clerkId, recipeId } = req.query;
    
    if (!clerkId || !recipeId) {
      return res.status(400).json({ error: { message: 'clerkId and recipeId are required' } });
    }
    
    const userDoc = await User.findOne({ clerkId });
    if (!userDoc) {
      return res.json({ data: null, saved: false });
    }
    
    const savedRecipe = await SavedRecipe.findOne({
      user: userDoc._id,
      recipe: recipeId
    });
    
    res.json({ 
      data: savedRecipe, 
      saved: !!savedRecipe 
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Create saved recipe
// @route   POST /api/saved-recipes
// @access  Public
exports.createSavedRecipe = async (req, res) => {
  try {
    const savedRecipeData = { ...req.body };
    
    // If user is provided as clerkId, find the user
    if (savedRecipeData.user && typeof savedRecipeData.user === 'string' && !savedRecipeData.user.match(/^[0-9a-fA-F]{24}$/)) {
      const userDoc = await User.findOne({ clerkId: savedRecipeData.user });
      if (userDoc) {
        savedRecipeData.user = userDoc._id;
      } else {
        return res.status(400).json({ error: { message: 'User not found' } });
      }
    }
    
    // Check if already saved
    const existing = await SavedRecipe.findOne({
      user: savedRecipeData.user,
      recipe: savedRecipeData.recipe
    });
    
    if (existing) {
      return res.json({ data: existing, message: 'Recipe already saved' });
    }
    
    const savedRecipe = await SavedRecipe.create(savedRecipeData);
    
    // Populate before returning
    await savedRecipe.populate([
      { path: 'user', select: 'firstName lastName email imageUrl clerkId' },
      { path: 'recipe' }
    ]);
    
    res.status(201).json({ data: savedRecipe });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// @desc    Delete saved recipe
// @route   DELETE /api/saved-recipes/:id
// @access  Public
exports.deleteSavedRecipe = async (req, res) => {
  try {
    const savedRecipe = await SavedRecipe.findByIdAndDelete(req.params.id);
    
    if (!savedRecipe) {
      return res.status(404).json({ error: { message: 'Saved recipe not found' } });
    }
    
    res.json({ data: { id: req.params.id } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Delete saved recipe by user and recipe
// @route   DELETE /api/saved-recipes/unsave
// @access  Public
exports.unsaveRecipe = async (req, res) => {
  try {
    const { clerkId, recipeId } = req.body;
    
    if (!clerkId || !recipeId) {
      return res.status(400).json({ error: { message: 'clerkId and recipeId are required' } });
    }
    
    const userDoc = await User.findOne({ clerkId });
    if (!userDoc) {
      return res.status(400).json({ error: { message: 'User not found' } });
    }
    
    const savedRecipe = await SavedRecipe.findOneAndDelete({
      user: userDoc._id,
      recipe: recipeId
    });
    
    if (!savedRecipe) {
      return res.status(404).json({ error: { message: 'Saved recipe not found' } });
    }
    
    res.json({ data: { id: savedRecipe._id } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
