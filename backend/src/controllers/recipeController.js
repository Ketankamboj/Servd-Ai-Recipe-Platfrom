const { Recipe, User } = require('../models');

// Helper to build populate options
const getPopulateOptions = (populate) => {
  if (!populate) return [];
  
  const populateFields = populate.split(',');
  return populateFields.map(field => {
    if (field === 'author') {
      return { path: 'author', select: 'firstName lastName email imageUrl clerkId' };
    }
    return field;
  });
};

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 25, 
      sort = '-createdAt',
      populate,
      title,
      cuisine,
      category,
      isPublic,
      author
    } = req.query;
    
    // Build filter
    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (cuisine) filter.cuisine = cuisine;
    if (category) filter.category = category;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (author) filter.author = author;
    
    let query = Recipe.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Apply population
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach(opt => {
      query = query.populate(opt);
    });
    
    const recipes = await query;
    const total = await Recipe.countDocuments(filter);
    
    res.json({
      data: recipes,
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

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipe = async (req, res) => {
  try {
    const { populate } = req.query;
    
    let query = Recipe.findById(req.params.id);
    
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach(opt => {
      query = query.populate(opt);
    });
    
    const recipe = await query;
    
    if (!recipe) {
      return res.status(404).json({ error: { message: 'Recipe not found' } });
    }
    
    res.json({ data: recipe });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Get recipe by title
// @route   GET /api/recipes/by-title/:title
// @access  Public
exports.getRecipeByTitle = async (req, res) => {
  try {
    const { populate } = req.query;
    
    let query = Recipe.findOne({ 
      title: { $regex: `^${req.params.title}$`, $options: 'i' } 
    });
    
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach(opt => {
      query = query.populate(opt);
    });
    
    const recipe = await query;
    
    if (!recipe) {
      return res.status(404).json({ error: { message: 'Recipe not found' } });
    }
    
    res.json({ data: recipe });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Create recipe
// @route   POST /api/recipes
// @access  Public
exports.createRecipe = async (req, res) => {
  try {
    const recipeData = { ...req.body };
    
    // If author is provided as clerkId, find the user
    if (recipeData.author && typeof recipeData.author === 'string' && !recipeData.author.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ clerkId: recipeData.author });
      if (user) {
        recipeData.author = user._id;
      } else {
        recipeData.author = null;
      }
    }
    
    const recipe = await Recipe.create(recipeData);
    
    // Populate author before returning
    await recipe.populate('author', 'firstName lastName email imageUrl clerkId');
    
    res.status(201).json({ data: recipe });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Public
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName email imageUrl clerkId');
    
    if (!recipe) {
      return res.status(404).json({ error: { message: 'Recipe not found' } });
    }
    
    res.json({ data: recipe });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Public
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ error: { message: 'Recipe not found' } });
    }
    
    res.json({ data: { id: req.params.id } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
